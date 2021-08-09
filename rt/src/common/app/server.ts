import "reflect-metadata";
import * as http from "http";
import { Container } from "typedi";
import { Logger } from "../logger";
import { Module } from "./module";
import { EVENTS, COMMON } from "../constants";

export class ServerFactory {
    static create(
        app: http.Server,
        mod: typeof Zink.Module,
        adapter: typeof Zink.Adapter,
        config?: Zink.ServerConfig,
    ): SocketIO.Server {
        const logger = Container.get(Logger);
        Container.set(COMMON.ADAPTER, new adapter());
        const adapterInstance = Container.get<Zink.Adapter>(COMMON.ADAPTER);
        logger.log("start", `Starting ${adapterInstance.label} Application`);
        const io = adapterInstance.create(app, config);
        io.on(EVENTS.CONNECTION, (socket: SocketIO.Socket) =>
            socket.on(EVENTS.PING, () => socket.emit(EVENTS.PONG, true)),
        );
        Module.Handler(mod, adapterInstance, io);
        logger.log("start", "Application successfully started");
        return io;
    }
}
