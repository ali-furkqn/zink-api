import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { AssetsService } from "./assets.service";
import { UsersModule } from "src/api";
import { AssetsController } from "./assets.controller";

@Module({
    imports: [forwardRef(() => UsersModule), HttpModule],
    controllers: [AssetsController],
    providers: [AssetsService],
    exports: [AssetsService],
})
export class AssetsModule {
    constructor() {
        global.XMLHttpRequest = require("xhr2");
        global.WebSocket = require("ws");
    }
}
