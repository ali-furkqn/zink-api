export const Event = (eventName: string) => {
    return (target: unknown, propertyKey: string): void => {
        if (!Reflect.hasMetadata("events", target.constructor))
            Reflect.defineMetadata("events", [], target.constructor);

        const events = Reflect.getMetadata("events", target.constructor);
        events.push({
            key: propertyKey,
            eventName,
        });
        Reflect.defineMetadata("events", events, target.constructor);
    };
};
