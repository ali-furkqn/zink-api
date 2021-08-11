import { Injectable } from "@nestjs/common"

export enum Flag {
    PASSIVE_USER = 1 << 0,
    ACTIVE_USER = 1 << 1,
    CREATE_MATCH = 1 << 2,
    CREATE_USER = 1 << 3,
    DEV = 1 << 4,
}

@Injectable()
export class FlagService {
    types = {
        PASSIVE_USER: 1 << 0,
        ACTIVE_USER: 1 << 1,
        CREATE_MATCH: 1 << 2,
        CREATE_USER: 1 << 3,
        DEV: 1 << 4,
    }

    isMatchFlag(srcFlag: number, flag: number): boolean {
        return srcFlag == (srcFlag & flag) || flag == (flag & this.types.DEV)
    }
}
