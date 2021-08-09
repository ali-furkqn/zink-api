import { PoolGateway } from "./pool.gateaway";
import { PoolService } from "./pool.service";
import { Module } from "../common/decorators";
import { GameModule } from "../game/game.module";

@Module({
    imports: [GameModule],
    gateways: [PoolGateway],
    providers: [PoolService],
})
export class PoolModule {}
