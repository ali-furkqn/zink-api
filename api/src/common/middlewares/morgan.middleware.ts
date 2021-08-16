import { Injectable, Logger, NestMiddleware } from "@nestjs/common"
import * as morgan from "morgan"
import { AppConfigService } from "@/config/config.service"
import { IncomingMessage, ServerResponse } from "http"

@Injectable()
export class MorganMiddleware implements NestMiddleware {
    constructor(
        private readonly config: AppConfigService,
    ) {}

    use(
        req: IncomingMessage,
        res: ServerResponse,
        next: (err: Error) => void,
    ): void {
        morgan(this.config.app.env === "development" ? "dev" : "combined", {
            stream: {
                write: w => Logger.log(w, "Request"),
            },
        })(req, res, next)
    }
}
