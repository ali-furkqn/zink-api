import { Service } from "typedi";
import { promisify } from "util";

/**
 * @todo Will Redesign as Atomic
 */
@Service()
export class MatchAtomService {
    private pool: { [matchID: string]: Zink.Match.Area } = {};

    private insFreezeObj<T>(obj: T): T {
        return Object.freeze(this.insObj(obj));
    }

    private insObj<T>(obj: T): T {
        return Object.assign({}, obj);
    }

    public sleep = promisify(setTimeout);

    public add(data: Zink.Match.Area, id?: string): Zink.Match.Area {
        const existing = this.pool[id || data.id];
        if (existing) throw new Error(`Already has Match ${id || data.id}`);
        this.pool[id] = data;
        return this.insFreezeObj(this.pool[id]);
    }

    public delete(id: string): Zink.Match.Area {
        const existing = this.pool[id];
        if (!existing) throw new Error(`${id} Match Not Found`);
        delete this.pool[id];
        return this.insFreezeObj(existing);
    }

    public terminate(id: string, socket: SocketIO.Socket): void {
        const match = this.get(id, { ref: true });
        match.users.forEach((u) =>
            socket.in(u.socketID).leave(`match.${match.id}`, () => {
                socket.in(u.socketID).emit("end.match", {
                    status: false,
                    message: "The Game Ended",
                });
            }),
        );
        if (match.timeout) this.destroyTimeout(id);
        this.delete(id);
    }

    public get(
        id: string,
        opts?: Partial<{ ref: boolean; freeze: boolean }>,
    ): Zink.Match.Area {
        const match = this.pool[id];
        if (!match) throw new Error(`${id} Match Not Found`);
        if (opts.ref) return match;
        else
            return opts.freeze === false
                ? this.insObj(match)
                : this.insFreezeObj(match);
    }

    public get cache(): Zink.Match.Area[] {
        const cache = this.insFreezeObj(this.pool);
        return Object.entries(cache).map((m) => m[1]);
    }

    public setTimeout(id: string, callback: () => void, t?: number): void {
        if (!this.pool[id]) return;
        if (this.pool[id].timeout)
            throw new Error("Already has timeout with this id");
        this.pool[id].timeout = setTimeout(() => {
            callback();
            delete this.pool[id].timeout;
        }, t || 15000);
    }

    public getTimeout(id: string): NodeJS.Timeout {
        const match = this.pool[id];
        if (!match) throw new Error(`${id} Match Not Found`);
        if (!match.timeout) throw new Error(`${id} Match Timeout Not Found`);
        return Object.freeze(Object.assign({}, match.timeout));
    }

    public destroyTimeout(id: string): void {
        const match = this.pool[id];
        if (!match) throw new Error(`${id} Match Not Found`);
        if (!match.timeout) throw new Error(`${id} Match Timeout Not Found`);
        clearTimeout(match.timeout);
        delete this.pool[id].timeout;
    }
}
