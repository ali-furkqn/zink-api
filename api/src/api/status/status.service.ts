import { Injectable, Inject, CACHE_MANAGER } from "@nestjs/common"
import * as os from "os"
import { Cache } from "cache-manager"

@Injectable()
export class StatusService {
    constructor(
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) {}

    async getInfo(): Promise<Zink.Response> {
        const reqTime = await this.cacheManager.get<[number, number]>(
            "request.time",
        )
        const time = process.hrtime(reqTime)
        return {
            region: "eu",
            platform: os.platform(),
            arch: os.arch(),
            cpus: os.cpus(),
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                usage: 1 - os.freemem() / os.totalmem(),
            },
            var: time[0] * 10 ** 9 + time[1],
            uptime: os.uptime(),
        }
    }

    async pingPong() {
        const reqTime = await this.cacheManager.get<[number, number]>(
            "request.time",
        )
        const time = process.hrtime(reqTime)

        return { pong: time[0] * 10 ** 9 + time[1] }
    }
}
