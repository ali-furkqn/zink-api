import { CacheModule, Module } from "@nestjs/common"
import { UsersModule } from "@/api/users/user.module"
import { AuthModule } from "@/auth/auth.module"
import { StatusController } from "./status.controller"
import { StatusService } from "./status.service"

@Module({
    imports: [CacheModule.register(), UsersModule, AuthModule],
    controllers: [StatusController],
    providers: [StatusService],
    exports: [],
})
export class StatusModule {}
