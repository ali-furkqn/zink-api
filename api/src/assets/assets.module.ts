import { CacheModule, forwardRef, HttpModule, Module } from "@nestjs/common"
import { AssetsService } from "./assets.service"
import { UsersModule } from "src/api"
import { AssetsController } from "./assets.controller"
import { AuthModule } from "@/auth/auth.module"

@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => AuthModule),
        HttpModule,
        CacheModule.register(),
    ],
    controllers: [AssetsController],
    providers: [AssetsService],
    exports: [AssetsService],
})
export class AssetsModule {
    constructor() {
        // It should preload them for Firebase
        global.XMLHttpRequest = require("xhr2")
        global.WebSocket = require("ws")
    }
}
