import { SetMetadata } from "@nestjs/common";

export const Flags = (...flags: Flag[]): any =>
    SetMetadata(
        "flags",
        flags.reduce((acc, cur) => acc | cur),
    );

export enum Flag {
    PASSIVE_USER = 1 << 0,
    ACTIVE_USER = 1 << 1,
    CREATE_MATCH = 1 << 2,
    CREATE_USER = 1 << 3,
    DEV = 1 << 4,
}
