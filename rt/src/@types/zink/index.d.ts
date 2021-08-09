/* eslint-disable @typescript-eslint/no-explicit-any */
import http from "http";

export {};

declare global {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    namespace Zink {
        namespace Match {
            interface User extends Zink.User {
                ready: boolean;
                socketID: string;
            }

            type MatchType = "duel" | "catch" | "fast-finger" | "math";

            interface Area {
                id: string;
                status: boolean;
                type: MatchType;
                users: (User & { points: number })[];
                winner: User;
                sequence: IRound<RoundAnswer>[];
                timeout?: NodeJS.Timeout;
                difficulty?: number;
            }
            interface IRound<T extends RoundAnswer> {
                id: string;
                isFinish: boolean;
                winner?: User;
                type: MatchType;
                answer: T;
                replies: Partial<
                    T & { id: string; time?: [number, number]; isTrue: boolean }
                >[];
                createdAt: [number, number];
            }
            type RoundAnswer = number | string | Rounds.ICatch | Rounds.IQuest;
            namespace Rounds {
                interface ICatch {
                    location: number[];
                    deltaV: number[];
                }
                interface IQuest {
                    description: string;
                    choices: string[];
                    answer: string;
                }
            }
            interface Request extends Zink.Request {
                match: Area;
            }
        }
        interface Request {
            user: User;
            socket: SocketIO.Socket;
            data: any;
        }

        interface Response {
            event?: string;
            room?: string;
            message?: any;
            noResponse?: boolean;
        }

        interface ClientErrorRequest {
            code: number;
            message: string;
        }

        interface User {
            id: string;
            tag: string;
            gems: number;
            xp: number;
            coins: number;
            discriminator: number;
            username: string;
            email: string;
            createdAt: number;
            updateAt: number;
        }
        export abstract class Gateway {
            onConnection?(socket: SocketIO.Socket): void;

            onDisconnect?(socket: SocketIO.Socket): void;

            didDisconnect?(socket: SocketIO.Socket): void;

            [propName: string]: any | Promise<any>;
        }
        export abstract class Module {
            constructor(io: SocketIO.Server);
            [propName: string]: any;
            register?: (...imports) => void;
        }
        interface IModule {
            imports?: any[];
            gateways?: any[];
            providers?: any[];
            exports?: any[];
        }
        export abstract class Service {
            [propName: string]: any;
        }
        export class Adapter {
            public label: string;
            public create(
                app: http.Server,
                options?: ServerConfig,
            ): SocketIO.Server;
            public gatewayHandler(
                io: SocketIO.Server,
                gateway: {
                    target: any;
                    path: string;
                    events: { key: string; eventName: string }[];
                },
            ): void;
            [propName: string]: any;
        }
        interface ServerConfig extends SocketIO.ServerOptions {
            namespace?: string;
            server?: SocketIO.Server;
            isCluster?: boolean;
        }
    }
}
