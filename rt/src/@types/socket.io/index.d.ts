export {};

declare global {
    namespace SocketIO {
        export interface Socket {
            user?: Zink.User;
            token?: string;
            match?: Zink.Match.Area;
        }
    }
}
