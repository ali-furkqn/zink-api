import { Service } from "typedi";
import { Inject } from "../common/decorators";
import { MatchAtomService } from "./match-atomic.service";

@Service()
export class GameGuard {
    constructor(
        @Inject(() => MatchAtomService)
        private matchAtomService: MatchAtomService,
    ) {}

    gate(socket: SocketIO.Socket, next: (err?: unknown) => void): void {
        const match = this.matchAtomService.cache.find(({ users }) =>
            users.some(({ id }) => id === socket.user.id),
        );
        if (!match) next(new Error("Unauthorized Request"));
        socket.join(`match.${match.id}`);
        socket.to(`match.${match.id}`).emit("joined.match");
        socket.match = match;
        next();
    }
}
