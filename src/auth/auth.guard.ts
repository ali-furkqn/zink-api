import {
    Injectable,
    CanActivate,
    ExecutionContext,
    Inject,
    forwardRef,
    HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import * as jwt from "jsonwebtoken";
import * as cache from "memory-cache";
import Config from "../config";
import { UsersService } from "../users/user.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private userService: UsersService,
        private reflector: Reflector,
    ) {}

    errHandler(message: string, res: { [prop: string]: any }): void {
        res.status(HttpStatus.UNAUTHORIZED).send({
            err: { message },
        });
    }

    succHandler(
        req: { [prop: string]: any },
        data: { [prop: string]: any },
    ): void {
        req.user = { ...data };
    }

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const flags = this.reflector.get<number>("flags", ctx.getHandler());
        const [req, res] = [
            ctx.switchToHttp().getRequest(),
            ctx.switchToHttp().getResponse(),
        ];
        let token: string =
            req.query["access_token"] ||
            req.headers["authorization"] ||
            req.headers["x-access-token"];

        if (!token)
            return res
                .status(401)
                .send({ err: { message: "Unauthorized Request" } });
        token = token.startsWith("Bearer")
            ? token.match(/[^Bearer]\S+/g)[0].trim()
            : token;
        await jwt.verify(
            token,
            Config().secret,
            async (err, decoded: Zink.IToken) => {
                if (err) return this.errHandler("Invalid Token", res);
                if (cache.get(decoded.id) === false)
                    return this.errHandler(
                        "Unauthorized Request: User Not Found",
                        res,
                    );
                else if (cache.get(decoded.id) === true)
                    this.succHandler(req, decoded);
                else {
                    const [isExist, user] = await this.userService.isExist(
                        decoded.id,
                    );
                    cache.put(
                        decoded.id,
                        isExist && user.email === decoded.email ? true : false,
                        24 * 60 * 60 * 1000,
                    );
                    if (!isExist || user.email !== decoded.email)
                        return this.errHandler(
                            "Unauthorized Request: User Not Found",
                            res,
                        );
                    cache.put(decoded.id, true, 24 * 60 * 60 * 1000);
                    this.succHandler(req, decoded);
                }
            },
        );
        if (flags) return this.userService.matchFlags(flags, req.user.flags);
        return true;
    }
}
