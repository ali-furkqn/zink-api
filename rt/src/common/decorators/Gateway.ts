import { Container } from "typedi";

export const Gateway = (namespace: string) => {
    return (target: unknown): void => {
        Container.set({
            id: "Gateways",
            value: target,
            multiple: true,
        });
        Reflect.defineMetadata("path", namespace, target);
        if (!Reflect.hasMetadata("events", target))
            Reflect.defineMetadata("events", [], target);
    };
};
