import {
    Injectable,
    HttpException,
    HttpStatus,
    ForbiddenException,
    NotFoundException,
    BadRequestException,
    Logger,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { plainToClass } from "class-transformer"
import { MongoRepository } from "typeorm"
import { v4 as uuidv4 } from "uuid"
import { FlagService, Flag } from "@/auth/flag.service"
import { UserEntity } from "@/api/users/user.entity"
import { MatchEntity } from "./match.entity"
import { CreateMatchDTO } from "./dto"

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(MatchEntity)
        private readonly matchRepository: MongoRepository<MatchEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: MongoRepository<UserEntity>,
        private readonly flagService: FlagService,
    ) {}

    async createMatch({
        id,
        type,
        status,
        users,
    }: CreateMatchDTO): Promise<Zink.Response> {
        if (id)
            if ((await this.matchRepository.count({ id })) !== 0)
                throw new HttpException(
                    `${id} Invalid Match ID`,
                    HttpStatus.BAD_REQUEST,
                )
        const uid = id || uuidv4()
        const usersData = await Promise.all(
            users.map(async id => {
                const user = await this.userRepository.findOne({ id })
                if (!user)
                    throw new BadRequestException(`${id} Invalid User ID`)
                else return plainToClass(UserEntity, user)
            }),
        )

        const match = await this.matchRepository.create({
            id: uid,
            type,
            status: status || true,
            users,
        })
        await this.matchRepository.save(match)

        Logger.log(
            `Created Match {"${id}", ${type.toUpperCase()}, [${users.join(
                ",",
            )}]}`,
            "Match Service",
        )

        return {
            message: "Successfully Created Match",
            status,
            id,
            type,
            users: usersData,
            sequence: Array(10).fill(type),
        }
    }

    async deleteMatch(id: string): Promise<Zink.Response> {
        const match = await this.matchRepository.deleteOne({ id })
        if (match.result.ok !== 1)
            throw new NotFoundException("Match Not Found")

        Logger.log(`Deleted {${id}} Match`, "Match Service")

        return { message: "Deleted successfully match" }
    }

    async getMatch({
        id,
        user,
    }: {
        id: string
        user: Zink.RequestUser
    }): Promise<Zink.Response> {
        const match = await this.matchRepository.findOne({ id })
        if (
            !match.users.some(id => id === user.id) ||
            !this.flagService.isMatchFlag(Flag.CREATE_MATCH, user.flags)
        )
            throw new ForbiddenException()

        const users = await match.users.map(
            async id => await this.userRepository.findOne({ id }),
        )

        return Object.assign({}, match, { users })
    }
}
