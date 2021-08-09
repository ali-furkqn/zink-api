import { Gateway, Event } from "../common/decorators";
import { PoolService } from "./pool.service";

@Gateway("/pool")
export class PoolGateway implements Zink.Gateway {
    constructor(private poolService: PoolService) {}

    @Event("join.pool")
    async joinPool(ctx: Zink.Request): Promise<Zink.Response> {
        return await this.poolService.joinPool(ctx.user, ctx.data.type);
    }

    @Event("leave.pool")
    async leavePool(ctx: Zink.Request): Promise<Zink.Response> {
        return await this.poolService.leavePool(ctx.user);
    }
}
