import * as http from "http";
import { ServerFactory } from "../app";
import * as socket from "socket.io-client";

export class TestingServerFactory {
    private app: http.Server;
    private io: SocketIO.Server;
    private clients: SocketIOClient.Socket[];
    private port: number;

    public create(
        Module: typeof Zink.Module,
        Adapter: typeof Zink.Adapter,
        config?: {
            client?: {
                instance?: number;
                namespace?: string;
                options?:
                    | ((index: number) => SocketIOClient.ConnectOpts)
                    | SocketIOClient.ConnectOpts;
            };
        },
    ): [SocketIO.Server, SocketIOClient.Socket[], number] {
        this.port = Math.floor(Math.random() * 55536) + 10000;
        this.app = http.createServer();
        this.io = ServerFactory.create(this.app, Module, Adapter);
        if (config && config.client)
            this.clients = this.clientClusterFactory(
                config.client.instance,
                config.client.namespace,
                config.client.options,
            );
        else this.clients = this.clientClusterFactory();
        this.app.listen(this.port);
        return [this.io, this.clients, this.port];
    }
    public close(done?: () => void): void {
        this.app.close();
        this.io.close();
        this.clients.forEach((client) => client.close());
        if (done) done();
    }

    private clientClusterFactory(
        instance?: number,
        namespace?: string,
        options?:
            | ((index: number) => SocketIOClient.ConnectOpts)
            | SocketIOClient.ConnectOpts,
    ): SocketIOClient.Socket[] {
        const cluster: SocketIOClient.Socket[] = [];
        if (typeof options === "function")
            for (let i = 0; i < instance; i++) {
                const opts = options(i);
                cluster.push(
                    socket(
                        `http://localhost:${this.port}${namespace || ""}`,
                        opts,
                    ),
                );
            }
        if (typeof options === "object")
            for (let i = 0; i < instance; i++)
                cluster.push(
                    socket(
                        `http://localhost:${this.port}${namespace || ""}`,
                        options,
                    ),
                );
        if (!options)
            for (let i = 0; i < (instance || 1); i++)
                cluster.push(
                    socket(`http://localhost:${this.port}${namespace || ""}`),
                );
        return cluster;
    }
}
