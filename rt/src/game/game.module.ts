import { MatchService } from "./match.service";
import { GameGateway } from "./game.gateway";
import { Module } from "../common/decorators";
import { GameService } from "./game.service";
import Container from "typedi";
import { GameGuard } from "./game.guard";

@Module({
    gateways: [GameGateway],
    providers: [GameService, MatchService],
    exports: [GameService],
})
export class GameModule implements Zink.Module {
    constructor(io: SocketIO.Server) {
        const Guard = Container.get(GameGuard);
        io.use(Guard.gate);
    }
}
