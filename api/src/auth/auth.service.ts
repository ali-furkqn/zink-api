import {
    Injectable,
    Inject,
    forwardRef,
    NotFoundException,
    ConflictException,
    Logger,
    BadRequestException,
    CACHE_MANAGER,
} from "@nestjs/common"
import { v4 as uuidv4 } from "uuid"
import { Cache } from "cache-manager"
import * as marked from "marked"
import * as Jwt from "jsonwebtoken"
import * as sgMail from "@sendgrid/mail"
import { UsersService } from "@/api/users/user.service"
import { AppConfigService } from "@/config/config.service"
import { AuthorizeDto, SignupDto } from "./dto"

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private userService: UsersService,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        private readonly appConfigService: AppConfigService,
    ) {}

    generateToken = (
        payload: Zink.IToken,
    ): { access_token: string; refresh_token: string; expires_in: number } => ({
        access_token: Jwt.sign(payload, this.appConfigService.app.jwtSecret, {
            algorithm: "HS512",
            expiresIn: "1d",
        }),
        refresh_token: Jwt.sign(payload, this.appConfigService.app.jwtSecret, {
            algorithm: "HS512",
            expiresIn: "30d",
        }),
        expires_in: 60 * 60 * 1000,
    })

    async refreshToken(
        token: string,
    ): Promise<{
        access_token: string
        refresh_token: string
        expires_in: number
    }> {
        try {
            const payload = (await Jwt.verify(
                token,
                this.appConfigService.app.jwtSecret,
            )) as Zink.IToken

            delete payload["exp"]
            delete payload["iat"]

            return this.generateToken(payload)
        } catch (e) {
            throw new BadRequestException("Invalid token")
        }
    }

    async signup(userBody: SignupDto): Promise<Zink.Response> {
        const isUnique = await this.userService.isUnique({
            email: userBody.email,
        })
        if (!isUnique)
            throw new ConflictException("This email is already using")

        const code = uuidv4()
        const timeout = 24 * 3600 * 1000

        await this.cacheManager.set(`email.${code}`, userBody, timeout)
        await sgMail.send({
            from: this.appConfigService.mail.senderMail,
            to: userBody.email,
            subject: "Verify Your Email Address",
            html: await marked(`
            # Thanks for SignUp for Zink
            Hello *${userBody.username}*,
            We're happy you're here. Let's get your email address verified!
            [Click to Verify Email](https://zinkapp.co/auth/verify?code=${code}&type=email
        `),
        })

        Logger.log(`Signup Request {${userBody.username}}`, "Auth Service")

        return {
            message: "Check your e-mail",
            timeout,
        }
    }

    async verify(type: string, code: string): Promise<Zink.Response> {
        if (type === "email") {
            const data: SignupDto = await this.cacheManager.get(
                `${type}.${code}`,
            )
            if (!data) throw new NotFoundException()

            const {
                access_token,
                refresh_token,
                expires_in,
            } = await this.userService.createUser(data)

            await this.cacheManager.del(`${type}.${code}`)

            Logger.log(`Verified User {${data.username}} now!`, "Auth Service")

            return {
                message: "Successfully Verified Account",
                access_token,
                refresh_token,
                expires_in,
            }
        }
        throw new BadRequestException("type is invalid")
    }

    async authorize({
        email,
        password,
    }: AuthorizeDto): Promise<
        Zink.Response & { access_token: string; expires_in: number }
    > {
        // Checks the  user's presence
        const [err, user] = await this.userService.isCorrectPassword({
            email,
            password,
        })
        if (err) throw err

        // If user is existence, It generates the token
        const payload = {
            id: user.id,
            flags: user.flags,
            email: user.email,
        }
        const { access_token, expires_in, refresh_token } = this.generateToken(
            payload,
        )

        return {
            message: "Successfully Authorized",
            access_token,
            refresh_token,
            expires_in,
        }
    }
}
