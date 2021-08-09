import { ValidationOptions, registerDecorator } from "class-validator";

export const IsMatchType = (options?: ValidationOptions) => {
    return (object: unknown, propertyName: string): void => {
        registerDecorator({
            name: "isMatchType",
            target: object.constructor,
            propertyName,
            options,
            validator: {
                validate(value: unknown): boolean {
                    if (typeof value !== "string") return false;
                    return ["duel", "catch", "fast-finger", "math"].includes(
                        value,
                    );
                },
            },
        });
    };
};
