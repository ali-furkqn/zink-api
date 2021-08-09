import { Container } from "typedi";
import * as IO from "socket.io";
import * as http from "http";
import { Logger } from "../logger";
import { GatewayErrorException, GatewayException } from "../exceptions";
import { EVENTS } from "../constants";
import { AuthGuard } from "../auth/guard";

export class SocketAdapter implements Zink.Adapter {
    private logger: Logger = Container.get(Logger);
    public label = "Socket.io";
    public create(
        app: http.Server,
        options?: Zink.ServerConfig,
    ): SocketIO.Server {
        if (!options) return IO(app);
        const { server, ...opts } = options;

        return server || IO(app, opts);
    }
    public gatewayHandler(
        io: SocketIO.Server,
        gateway: {
            target: unknown;
            path: string;
            events: {
                key: string;
                eventName: string;
            }[];
        },
    ): void {
        const ga: Zink.Gateway = Container.get(gateway.target);
        const nsp = io.of(gateway.path);
        nsp.use(AuthGuard);
        nsp.on(EVENTS.CONNECTION, (socket) => {
            socket.on(EVENTS.DISCONNECTION, () =>
                typeof ga.onDisconnect === "function"
                    ? ga.onDisconnect(socket)
                    : null,
            );
            socket.on(EVENTS.PONG, () => socket.emit(EVENTS.PONG, true));
            this.eventsHandler(socket, gateway.events, ga);
        });
    }

    public eventsHandler(
        socket: SocketIO.Socket,
        events: { key: string; eventName: string }[],
        gateway: Zink.Gateway,
    ): void {
        events.forEach(({ eventName, key }) => {
            socket.on(eventName, async (data) => {
                const t = process.hrtime();
                try {
                    const params = {
                        user: socket.user,
                        socket,
                        data,
                    };
                    const response = await gateway[key](params);
                    if (!response || response.noResponse) return;
                    if (!response.event)
                        throw new Error("Response Event Not Found");
                    if (!response.message)
                        throw new Error("Response Message Not Found");
                    const time = process.hrtime(t);
                    this.logger.log(
                        "debug",
                        `Request ${eventName} -> Response {${
                            response.event
                        }} in ${time[0] + time[1] / 10 ** 9}ms`,
                    );
                    if (response.room)
                        return socket
                            .to(response.room)
                            .emit(response.event, response.message);
                    return socket.emit(response.event, response.message);
                } catch (e) {
                    const time = process.hrtime(t);
                    if (e instanceof GatewayErrorException) {
                        this.logger.log(
                            "debug",
                            `Request ${eventName} -> Response {${
                                EVENTS.ERROR
                            }} in ${time[0] + time[1] / 10 ** 9}ms`,
                        );
                        socket.error({ code: e.code, desc: e.desc });
                    } else if (e instanceof GatewayException) {
                        this.logger.log(
                            "debug",
                            `Request ${eventName} -> Response ${e.event} in ${
                                time[0] + time[1] / 10 ** 9
                            }ms`,
                        );
                        socket.emit(e.event, e.desc);
                    } else this.logger.log("error", e);
                }
            });
        });
    }
}
