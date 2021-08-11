import {
    Injectable,
    CanActivate,
    ExecutionContext,
    Inject,
    forwardRef,
    Logger,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import * as jwt from "jsonwebtoken"
import { AppConfigService } from "@/config/config.service"
import { UsersService } from "@/api/users/user.service"
import { Cache } from "cache-manager"
import { CACHE_MANAGER } from "@nestjs/common"
import { FlagService } from "./flag.service"

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private userService: UsersService,
        private appConfigService: AppConfigService,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        private flagService: FlagService,
        private reflector: Reflector,
    ) {}

    succHandler(
        req: { [prop: string]: any },
        data: { [prop: string]: any },
    ): void {
        req.user = data
    }

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const flags = this.reflector.get<number>("flags", ctx.getHandler())
        const req = ctx.switchToHttp().getRequest()

        let token: string =
            req.query["access_token"] || req.headers["authorization"]

        if (!token) return false
        token = token.startsWith("Bearer")
            ? token.match(/[^Bearer]\S+/g)[0].trim()
            : token

        try {
            const decoded = (await jwt.verify(
                token,
                this.appConfigService.app.jwtSecret,
            )) as Zink.IToken

            const cacheUser = await this.cacheManager.get(`user.${decoded.id}`)

            if (cacheUser !== null) {
                if (!cacheUser) return false

                this.succHandler(req, decoded)
            } else {
                const [isExist, user] = await this.userService.isExist(
                    decoded.id,
                )

                if (!isExist || user.email !== decoded.email) return false
                await this.cacheManager.set(decoded.id, true, 60 * 60 * 1000)

                this.succHandler(req, decoded)
            }
        } catch (e) {
            Logger.log(`Error occured { ${e} } `, "AuthGuard")
            return false
        }

        if (flags) return this.flagService.isMatchFlag(flags, req.user.flags)
        return true
    }
}
