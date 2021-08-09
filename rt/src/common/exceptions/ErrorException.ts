import { EXCEPTION } from "../constants/exceptions";

export class GatewayErrorException {
    desc: string;
    code: number;
    type: symbol;
    constructor(code: number, desc = "") {
        this.desc = desc;
        this.type = EXCEPTION.TYPE;
        this.code = code;
    }
}
