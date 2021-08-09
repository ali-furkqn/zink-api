import Container from "typedi";
/**
 * Inject Provider on Gateway
 */
export const Provider = () => {
    return (
        target: ObjectConstructor,
        propertyName: string,
        index?: number,
    ): void => {
        const providers: typeof Zink.Service[] = Container.get(
            `${target.name}.providers`,
        );
        const provider: Zink.Service = providers.find(
            (s) => target.constructor[propertyName] instanceof s,
        );
        if (!provider)
            throw new Error(
                `(${propertyName} ?) Provider index[${index}] didn't inject on ${target.name}`,
            );
        Container.registerHandler({
            object: target,
            propertyName,
            index,
            value: () => Container.get(provider),
        });
    };
};
