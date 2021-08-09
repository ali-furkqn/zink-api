import { Service } from "typedi";
import * as cache from "memory-cache";
import { MatchService } from "../game/match.service";
import { Inject } from "../common/decorators";
import { GatewayErrorException } from "../common/exceptions";
import { MESSAGES } from "../common/constants";

@Service()
export class PoolService {
    constructor(
        @Inject(() => MatchService) private matchService: MatchService,
    ) {}
    public async joinPool(
        user: Zink.User,
        type: Zink.Match.MatchType,
    ): Promise<Zink.Response> {
        const pool: { id: string; type: Zink.Match.MatchType }[] =
            cache.get("pool") || [];
        if (pool.some((u) => u.id === user.id))
            throw new GatewayErrorException(400, MESSAGES.ALREADY_JOIN);
        const matchUser = pool.find((u) => u.type === type);
        if (matchUser) {
            const match = await this.matchService.create(
                type,
                matchUser.id,
                user.id,
            );
            cache.del("pool");
            cache.put(
                "pool",
                pool.filter(({ id }) => id != matchUser.id || id != user.id),
            );
            return {
                event: "join.pool",
                message: { code: 1 << 1, match },
            };
        }
        pool.push({ id: user.id, type });
        cache.del("pool");
        cache.put("pool", pool);
        return {
            event: "join.pool",
            message: { code: 1 << 0 },
        };
    }

    public leavePool(user: Zink.User): Zink.Response {
        const pool: { id: string; type: number }[] = cache.get("pool");
        const newPool = pool.filter(({ id }) => user.id !== id);
        if (pool.length === newPool.length)
            throw new GatewayErrorException(400, "User Not Found");
        cache.del("pool");
        cache.put("pool", newPool);
        return {
            event: "leave.pool",
            message: "User lefted the pool",
        };
    }
}
