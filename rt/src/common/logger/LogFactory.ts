import * as moment from "moment";
import * as chalk from "chalk";
import Container from "typedi";
import { COMMON } from "../constants";

export interface LOG_CONFIG {
    displayDate?: boolean;
    displayBadge?: boolean;
    typeDate?: string;
    type: string;
    typeColor: string;
    badge: string;
    duration?: number;
}

const DEF_LOG_CONFIG: LOG_CONFIG = {
    displayDate: true,
    displayBadge: true,
    typeDate: moment.HTML5_FMT.DATETIME_LOCAL,
    typeColor: "cyan",
    type: "success",
    badge: "",
    duration: 0,
};

export class LogFactory {
    private config = DEF_LOG_CONFIG;
    constructor(config: LOG_CONFIG) {
        Object.assign(this.config, config);
    }
    log(...msg: unknown[]): void {
        const res: unknown[] = [
            chalk.greenBright(
                `[ Flyx${
                    ` - ${Container.get<Zink.Adapter>(COMMON.ADAPTER).label}` ||
                    ""
                } ] ${chalk.yellow(process.pid)}`,
            ),
        ];
        if (this.config.displayDate)
            res.push(chalk.grey(`[${moment().format(this.config.typeDate)}]`));
        if (this.config.displayBadge)
            res.push(chalk[this.config.typeColor](this.config.badge));
        res.push(chalk.underline[this.config.typeColor](this.config.type));
        res.push(...msg);
        res.push(chalk.yellow(`+ ${this.config.duration}ms`));
        console[`${this.config.type === "error" ? "error" : "log"}`](
            res.join(" "),
        );
    }
}
