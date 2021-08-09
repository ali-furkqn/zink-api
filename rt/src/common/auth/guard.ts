import IO from "socket.io";
import { api } from "../api";
import { MESSAGES } from "../constants";

export const AuthGuard = async (
    socket: IO.Socket,
    next: (err?: unknown) => void,
): Promise<void> => {
    const { access_token } = socket.handshake.query;
    if (!access_token) next(new Error(MESSAGES.UNAUTHORIZATION));
    try {
        const user: Zink.User = (
            await api.get("/users/@me", {
                headers: {
                    authorization: access_token,
                },
            })
        ).data;
        if (!user) return next(new Error(MESSAGES.UNAUTHORIZATION));
        socket.user = user;
        socket.token = access_token;
        next();
    } catch (e) {
        next(new Error(MESSAGES.UNAUTHORIZATION));
    }
};
