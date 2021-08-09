import { Service } from "typedi";
import { Inject } from "../common/decorators";
import { v4 as uuidv4 } from "uuid";
import { api } from "../common/api";
import { GatewayErrorException } from "../common/exceptions";
import { GameService } from "./game.service";
import { MatchAtomService } from "./match-atomic.service";

@Service()
export class MatchService {
    constructor(
        @Inject(() => GameService) private gameService: GameService,
        @Inject(() => MatchAtomService)
        private matchAtomService: MatchAtomService,
    ) {}

    async create(
        type: Zink.Match.MatchType,
        ...ids: string[]
    ): Promise<Zink.Match.Area> {
        try {
            const id = uuidv4();
            const match: Zink.Match.Area = (
                await api.put("/matches", { id, type, users: ids })
            ).data;
            Object.assign(match, {
                users: match.users.map((u) =>
                    Object.assign(u, { ready: true }),
                ),
            });
            this.matchAtomService.add(match);
            this.matchAtomService.setTimeout(match.id, () => {
                this.matchAtomService.delete(match.id);
            });
            return match;
        } catch (e) {
            console.log(e);
            throw new GatewayErrorException(400, e.response.data);
        }
    }

    async iamReadyForMatch(ctx: Zink.Match.Request): Promise<Zink.Response> {
        const match = this.matchAtomService.get(ctx.match.id, { ref: true });
        match.users.map((u) =>
            u.id === ctx.user.id
                ? Object.assign(u, { socketID: ctx.socket.id, ready: true })
                : u,
        );
        if (match.users.every((u) => u.ready)) {
            // Emit Next Round
            return {
                room: `match.${match.id}`,
                event: "match.started",
                message: true,
            };
            // await this.gameService.gameHandler(match.id, socket);
            // return this.finishMatch(match.id, socket);
        }
        return {
            room: `match.${match.id}`,
            event: "waiting.match",
            message: {
                ready: match.users.filter((u) => u.ready),
                notReady: match.users.filter((u) => !u.ready),
            },
        };
    }

    action(
        matchID: string,
        userID: string,
        socket: SocketIO.Socket,
        reply: string,
    ): Zink.Response;
    action(
        matchID: string,
        userID: string,
        socket: SocketIO.Socket,
        reply: number,
    ): Zink.Response;
    action(
        matchID: string,
        userID: string,
        socket: SocketIO.Socket,
        reply: Zink.Match.Rounds.ICatch,
    ): Zink.Response;
    action(
        matchID: string,
        userID: string,
        socket: SocketIO.Socket,
        reply: Zink.Match.Rounds.IQuest,
    ): Zink.Response;
    action(
        matchID: string,
        userID: string,
        socket: SocketIO.Socket,
        reply: Zink.Match.RoundAnswer,
    ): Zink.Response {
        const match = this.matchAtomService.get(matchID, { ref: true });
        const user = match.users[match.users.findIndex((u) => u.id === userID)];
        const round = match.sequence[match.sequence.length - 1];

        if (round.replies.some((u) => u.id === userID)) return;
        const cond = ((): boolean => {
            switch (round.type) {
                case "catch": {
                    if (!Array.isArray(reply)) return false;
                    return reply.every(
                        (c, i) =>
                            c > round.answer[i] - 10 &&
                            c < round.answer[i] + 10,
                    );
                }
                case "duel": {
                    return reply > round.answer;
                }
                case "fast-finger": {
                    return reply === round.answer;
                }
                case "math": {
                    return reply === round.answer;
                }
            }
        })();

        const time = process.hrtime(round.createdAt);
        round.replies.push({ id: userID, time, isTrue: cond }, reply);
        // Response Handler
        if (cond) {
            // Terminate Round
            const sortUsers = match.users.sort((a, b) => a.points - b.points);
            const dP = sortUsers[0].points - sortUsers[1].points;
            const dR = 10 - match.sequence.length;
            if (dP > dR) {
                this.matchAtomService.terminate(matchID, socket);
                return {
                    room: `match.${matchID}`,
                    event: "finish",
                    message: {
                        status: "FINISH-WINNER",
                        winner: sortUsers[0],
                        rounds: match.sequence,
                    },
                };
            }
            if (dP === dR && dR === 0) {
                this.matchAtomService.terminate(matchID, socket);
                return {
                    room: `match.${matchID}`,
                    event: "finish",
                    message: {
                        status: "FINISH-DRAW",
                        winners: sortUsers.map(
                            (u) => u.points === sortUsers[0].points,
                        ),
                        rounds: match.sequence,
                    },
                };
            }
            user.points++;
            round.winner = user;
            round.isFinish = true;
            setTimeout(async () => {
                this.gameService.nextRound(matchID, socket);
            }, 5000);
            return {
                room: `match.${matchID}`,
                event: "round.finish",
                message: {
                    status: "WINNER",
                    winner: user,
                    time,
                    replies: round.replies,
                },
            };
        } else if (round.replies.length === match.users.length) {
            // Terminate Round
            round.isFinish = true;
            setTimeout(async () => {
                this.gameService.nextRound(matchID, socket);
            }, 5000);
            return {
                room: `match.${matchID}`,
                event: "round.finish",
                message: {
                    status: "FAIL",
                    message: "This Round nobody won",
                    replies: round.replies,
                },
            };
        } else {
            // Continue
            return {
                room: `match.${matchID}`,
                event: "round.answer",
                message: {
                    roundID: round.id,
                    reply: {
                        userID,
                        isTrue: cond,
                        // data: reply,
                    },
                },
            };
        }
    }
}
