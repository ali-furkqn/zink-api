import { Service } from "typedi";
import { v4 as uuidv4 } from "uuid";
import { interval } from "rxjs";
import { Inject } from "../common/decorators";
import { api } from "../common/api";
import { MatchAtomService } from "./match-atomic.service";

@Service()
export class GameService {
    constructor(
        @Inject(() => MatchAtomService)
        private matchAtomService: MatchAtomService,
    ) {}

    private randomNumber(i: number): number {
        return Math.floor(Math.random() * i);
    }

    async nextRound(matchID: string, socket: SocketIO.Socket): Promise<void> {
        const state = this.matchAtomService.get(matchID, { ref: true });
        switch (state.type) {
            case "catch": {
                const round = await this.createRound(
                    state.type,
                    state.difficulty,
                );
                state.difficulty += 1 / this.randomNumber(10) + 0.05;
                const index = state.sequence.push({
                    ...round,
                    replies: [],
                });
                socket.emit("match.data", round.answer.location);
                const CatchStateInterval = interval(1000 / 30);
                const CatchState = CatchStateInterval.subscribe(() => {
                    if (state.sequence[index].isFinish) {
                        state.sequence[index].answer = round.answer;
                        return CatchState.unsubscribe();
                    }
                    round.answer.location = round.answer.location.map(
                        (v, i) => v + round.answer.deltaV[i],
                    );
                    socket.emit("match.data.move", round.answer.deltaV);
                });
                break;
            }
            case "duel": {
                const round = await this.createRound(
                    state.type,
                    state.difficulty,
                );
                state.sequence.push({ ...round, replies: [] });
                await this.matchAtomService.sleep(round.answer);
                socket.emit("match.data", true);
                break;
            }
            case "fast-finger": {
                const round = await this.createRound(
                    state.type,
                    state.difficulty,
                );
                state.sequence.push({ ...round, replies: [] });
                socket.emit("match.data", round.answer);
                break;
            }
        }
        state.difficulty += Math.random() * 0.1 + 0.05;
    }

    createRound(
        type: "catch",
        difficulty: number,
    ): Promise<Zink.Match.IRound<Zink.Match.Rounds.ICatch>>;
    createRound(
        type: "duel",
        difficulty: number,
    ): Promise<Zink.Match.IRound<number>>;
    createRound(
        type: "fast-finger",
        difficulty: number,
    ): Promise<Zink.Match.IRound<string>>;
    async createRound(
        type: Zink.Match.MatchType,
        difficulty: number,
    ): Promise<Zink.Match.IRound<Zink.Match.RoundAnswer>> {
        let answer: Zink.Match.RoundAnswer;
        switch (type) {
            case "catch":
                answer = {
                    deltaV: [
                        difficulty * (this.randomNumber(6) - 2.5) * 5,
                        difficulty * (this.randomNumber(6) - 2.5) * 5,
                    ],
                    location: [this.randomNumber(256), this.randomNumber(384)],
                };
                break;
            case "duel":
                answer = this.randomNumber(4000) + 2000;
                break;
            case "fast-finger":
                answer = (await api.get("/words", { params: { difficulty } }))
                    .data;
                break;
        }
        return {
            id: uuidv4(),
            type,
            answer,
            createdAt: process.hrtime(),
            isFinish: false,
            replies: [],
        };
    }
}
