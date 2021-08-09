import { Event, Gateway } from "../common/decorators";
import { MatchService } from "./match.service";

@Gateway("/game")
export class GameGateway implements Zink.Gateway {
    constructor(private matchService: MatchService) {}

    @Event("iam.ready")
    async iamReady(ctx: Zink.Match.Request): Promise<Zink.Response> {
        return await this.matchService.iamReadyForMatch(ctx);
    }

    @Event("match.action")
    async createAction(ctx: Zink.Match.Request): Promise<Zink.Response> {
        return this.matchService.action(
            ctx.match.id,
            ctx.user.id,
            ctx.socket.to(`match.${ctx.match.id}`),
            ctx.data,
        );
    }
}
