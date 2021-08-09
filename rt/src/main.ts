import * as http from "http";
import Container from "typedi";
import { ServerFactory } from "./common/app";
import { SocketAdapter } from "./common/adapters";
import { Logger } from "./common/logger";
import { Config } from "./config";
import { AppModule } from "./module";

async function main() {
    const logger = Container.get(Logger);
    const app = http.createServer((req, res) => {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.write(`Cannot ${req.method.toUpperCase()} ${req.url}`);
        res.end();
    });
    ServerFactory.create(app, AppModule, SocketAdapter);

    await app.listen(Config.PORT, () => {
        logger.log("start", `Application started at ${Config.PORT}`);
    });
}

main();
