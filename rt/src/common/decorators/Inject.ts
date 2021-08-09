import { Container } from "typedi";
/**
 * Inject Imports on Provider
 */
export const Inject = (prov?: () => unknown) => {
    return (
        target: ObjectConstructor,
        propertyName: string,
        index?: number,
    ): void => {
        if (!prov) {
            const imports: Zink.IModule[] = Reflect.getMetadata(
                "imports",
                target,
            );
            if (!imports) throw new Error(`${target.name} hasn't Provider`);
            const provider: Zink.Service = imports.find(({ providers }) =>
                providers.find(
                    (p) => target.constructor[propertyName] instanceof p,
                ),
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
        } else
            Container.registerHandler({
                object: target,
                propertyName,
                index,
                value: () => Container.get(prov()),
            });
    };
};
