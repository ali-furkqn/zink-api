import {
    Injectable,
    Inject,
    forwardRef,
    HttpException,
    HttpStatus,
    NotFoundException,
    ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { v5 as uuidv5, v4 as uuidv4 } from "uuid";
import { MongoRepository } from "typeorm";
import * as cache from "memory-cache";
import * as argon2 from "argon2";
import { AuthService } from "src/auth/auth.service";
import { AssetsService } from "src/assets/assets.service";
import { UserEntity } from "./user.entity";
import { PatchUserDto, GetUserDto, CreateUserDto } from "./dto";

const Flags = {
    PASSIVE_USER: 1 << 0,
    ACTIVE_USER: 1 << 1,
    CREATE_MATCH: 1 << 2,
    CREATE_USER: 1 << 3,
    DEV: 1 << 4,
};

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: MongoRepository<UserEntity>,
        @Inject(forwardRef(() => AuthService))
        private authService: AuthService,
        private configService: ConfigService,
        private assetsService: AssetsService,
    ) {}

    async isCorrectPassword({
        email,
        password,
    }: {
        email: string;
        password: string;
    }): Promise<[HttpException | null, UserEntity?]> {
        const user = await this.userRepository.findOne({ email });
        if (!user) return [new NotFoundException("User not found")];
        const verify = await argon2.verify(user.password, password);
        if (!verify)
            return [
                new HttpException(
                    "Incorrect Password",
                    HttpStatus.UNAUTHORIZED,
                ),
            ];
        return [null, user];
    }

    async isUnique({ email }: { email: string }): Promise<boolean> {
        const matchUsers = await this.userRepository.count({ email });
        const cacheCond = cache
            .keys()
            .some(k => k.startsWith("email.") && cache.get(k).email === email);
        return matchUsers === 0 && !cacheCond;
    }

    async isExist(id: string): Promise<[boolean, UserEntity]> {
        const user = await this.userRepository.findOne({ id });
        return [user instanceof UserEntity, user];
    }

    matchFlags(flag: number, userFlag: number): boolean {
        if (flag == (flag & userFlag)) {
            return true;
        }
        if (userFlag == (userFlag & Flags.DEV)) {
        }
        return false;
    }

    async genDiscriminator(username: string): Promise<number> {
        const gen = () => {
            let res = 0;
            for (let i = 0; i < 4; i++) {
                res += Math.floor(Math.random() * 10) * 10 ** i;
            }
            return res;
        };
        const uniqueDiscriminator = async (
            username: string,
        ): Promise<number> => {
            const discriminator = gen();
            const isExist: boolean =
                (await this.userRepository.count({
                    username,
                    discriminator,
                })) !== 0;
            if (isExist) {
                return await uniqueDiscriminator(username);
            } else {
                return discriminator;
            }
        };
        return await uniqueDiscriminator(username);
    }

    //
    // User CRUDs
    //

    /**
     * User Create
     * Just need give username, email and password
     */
    async createUser({
        username,
        email,
        password,
    }: CreateUserDto): Promise<
        Zink.Response & {
            access_token: string;
            refresh_token: string;
            expires_in: number;
        }
    > {
        const hash = await argon2.hash(password);
        const id = uuidv5(
            email,
            this.configService.get<string>("UUID_NAMESPACE"),
        );
        const {
            access_token,
            expires_in,
            refresh_token,
        } = this.authService.generateToken({
            flags: Flags.ACTIVE_USER,
            email,
            id,
        });
        const discriminator = await this.genDiscriminator(username);
        const user = this.userRepository.create({
            id,
            username,
            discriminator,
            flags: Flags.ACTIVE_USER,
            email,
            password: hash,
            coins: 100,
            gems: 5,
        });

        try {
            await this.userRepository.save(user);
            return {
                message: "Successfully Signup",
                access_token,
                refresh_token,
                expires_in,
            };
        } catch (e) {
            throw new ConflictException({ email }, "Duplicated User");
        }
    }

    async getUsers(): Promise<UserEntity[]> {
        const users = await this.userRepository.find();
        return users;
    }

    async getUserData({
        id,
        email,
    }: GetUserDto): Promise<Zink.Response & UserEntity> {
        const [isExist, user] = await this.isExist(id);
        if (!isExist)
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        if (email && user.email !== email)
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        return Object.assign(user, { _id: undefined, password: undefined });
    }

    /**
     * Edit User
     *
     * @deprecated it's not recommended to use
     * @todo add email Validation
     * @todo new email validation
     */
    async editUser({
        user,
        patch,
    }: {
        user: Zink.RequestUser;
        patch: PatchUserDto;
    }): Promise<Zink.Response | { access_token: string; expires_in: number }> {
        const [err, oUser] = await this.isCorrectPassword({
            email: user.email,
            password: patch.password,
        });
        if (err) return err;
        Object.assign(oUser, patch);
        await this.userRepository.updateOne({ id: user.id }, oUser);
        const { access_token, expires_in } = this.authService.generateToken({
            id: oUser.id,
            email: oUser.email,
            flags: oUser.flags,
        });
        return {
            message: "Successfully Patched User",
            access_token,
            expires_in,
        };
    }

    async uploadAvatar(
        id: string,
        file: Zink.AssetsUpFile,
    ): Promise<Zink.Response> {
        const user = await this.getUserData({ id });
        if (user.avatar)
            await this.assetsService.delete(
                `avatars/${id}/${user.avatar}.webp`,
            );

        const avatar = uuidv4();
        await this.userRepository.updateOne(
            { id: user.id },
            { $set: { avatar } },
        );

        const compileImg = await this.assetsService.compileImage(file.buffer);

        const uploadedData = await this.assetsService.upload(
            {
                ...file,
                buffer: compileImg,
                originalname: `${avatar}.webp`,
            },
            "avatars",
            id,
        );
        return {
            message: uploadedData.message,
            path: `users/id/${id}/avatar/${avatar}`,
        };
    }

    async getAvatar(id: string, avatar?: string): Promise<Buffer> {
        try {
            let avatarID = avatar;
            if (!avatarID) {
                const user = await this.getUserData({ id });
                avatarID = user.avatar;
            }
            console.log("dsadsaads");

            const [data] = await this.assetsService.get(
                "avatars",
                id,
                avatarID + ".webp",
            );

            return data;
        } catch (e) {
            throw new NotFoundException("Avatar Not found");
        }
    }
}
