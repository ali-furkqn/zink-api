import * as os from "os";
import * as cluster from "cluster";
import { Logger } from "../logger";
import Container from "typedi";
import { Config } from "../../config";

export class Cluster {
    static clusterize(func: () => unknown): void {
        const logger = Container.get(Logger);
        const workers: { worker: cluster.Worker; port: number }[] = [];
        const numCores = os.cpus().length;
        if (cluster.isMaster) {
            const port = (): number => {
                const p = Math.floor(Config.PORT + Math.random() * 999);
                if (workers.some((w) => w.port === p)) return port();
                else return p;
            };
            for (let i = 0; i < numCores; i++) {
                const p = port();
                const worker = cluster.fork({ PORT: p });
                workers.push({ worker, port: p });
                worker.on("message", console.log);
            }
            cluster.on("exit", (worker, code, signal) => {
                logger.log(
                    "debug",
                    `Worker {${worker.process.pid}} died with code: {${code}} and signal: {${signal}}`,
                );
                logger.log("debug", "Starting a new worker");
                const p = port();
                const newWorker = cluster.fork({ PORT: p });
                workers.push({ worker, port: p });
                newWorker.on("message", console.log);
            });
        } else func();
    }
}
