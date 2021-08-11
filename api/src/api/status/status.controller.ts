import { Controller, Get, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@/auth/auth.guard"
import { Flags } from "@/auth/flag.decorator"
import { Flag } from "@/auth/flag.service"
import { StatusService } from "./status.service"

@Controller("status")
export class StatusController {
    constructor(private statusService: StatusService) {}

    @Flags(Flag.DEV)
    @UseGuards(AuthGuard)
    @Get("system")
    getSystemInfo(): Zink.Response {
        return this.statusService.getInfo()
    }

    @Get(["ping", "/"])
    async pingPong(): Promise<Zink.Response> {
        return await this.pingPong()
    }
}
