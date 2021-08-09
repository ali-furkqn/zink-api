import { Service } from "typedi";
import { LogFactory } from "./LogFactory";

type TYPE =
    | "success"
    | "error"
    | "warn"
    | "awaiting"
    | "start"
    | "pause"
    | "complete"
    | "note"
    | "debug";

const TYPES = [
        "success",
        "error",
        "warn",
        "awaiting",
        "start",
        "pause",
        "complete",
        "note",
        "debug",
    ],
    TYPE_COLORS = [
        "greenBright",
        "redBright",
        "yellow",
        "blue",
        "green",
        "yellowBright",
        "cyan",
        "blue",
        "magenta",
    ],
    TYPE_BADGE = {
        emojis: ["🎉", "🚨", "⚠️", "⌛", "🏁", "✋", "👌", "📝", "🐛"],
        unix: ["✔", "X", "⚠", "...", "➤", "■", "¤", "●", ""],
    };

@Service()
export class Logger {
    private atLastLog = Date.now();
    constructor() {
        TYPES.forEach((t, i) => {
            this[t] = new LogFactory({
                displayBadge: true,
                displayDate: true,
                badge: TYPE_BADGE.unix[i],
                type: t,
                typeColor: TYPE_COLORS[i],
            }).log;
        });
    }

    log(type: TYPE, ...msg: unknown[]): void {
        const time = Date.now();
        if (
            process.env.NODE_ENV === "test" &&
            !(type === "error" || type === "warn")
        )
            return;
        const i = TYPES.findIndex((t) => t === type);
        new LogFactory({
            displayBadge: true,
            displayDate: true,
            badge: TYPE_BADGE.unix[i],
            type,
            typeColor: TYPE_COLORS[i],
            duration: time - this.atLastLog,
        }).log(...msg);
        this.atLastLog = time;
    }
}
