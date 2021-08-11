import {
    CACHE_MANAGER,
    Inject,
    Injectable,
    NestMiddleware,
} from "@nestjs/common"
import { Cache } from "cache-manager"

@Injectable()
export class TimeMiddleware implements NestMiddleware {
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    async use(
        _req: unknown,
        _res: unknown,
        next: (e?: Error) => void,
    ): Promise<void> {
        await this.cacheManager.del("request.time")
        await this.cacheManager.set("request.time", process.hrtime())
        next()
    }
}
