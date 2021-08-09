import { Container } from "typedi";
import { Logger } from "../logger";

export class Module {
    static Handler(
        mod: typeof Zink.Module,
        adapter: Zink.Adapter,
        io: SocketIO.Server,
    ): void {
        const logger = Container.get(Logger);
        const Mod: Zink.IModule = {
            imports: Reflect.getMetadata("imports", mod) || [],
            gateways: Reflect.getMetadata("gateways", mod) || [],
            providers: Reflect.getMetadata("providers", mod) || [],
        };
        logger.log("success", `Mapped {${mod.name}} Module`);
        Mod.gateways.forEach((g) => {
            const path: string = Reflect.getMetadata("path", g);
            const events: {
                key: string;
                eventName: string;
            }[] = Reflect.getMetadata("events", g);
            adapter.gatewayHandler(io, { events, path, target: g });
            logger.log("success", `Added ${g.name} Gateway {${path}}`);
            events.forEach((e) =>
                logger.log("success", `Mapped {${path}/${e.eventName}} route`),
            );
        });
        Mod.imports.forEach((i) => Module.Handler(i, adapter, io));
    }
}
