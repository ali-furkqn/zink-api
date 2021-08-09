import { EXCEPTION } from "../constants/exceptions";

export class GatewayException {
    event: string;
    desc: string;
    type: symbol;
    constructor(eventName: string, desc: string) {
        this.event = eventName;
        this.type = EXCEPTION.TYPE;
        this.desc = desc;
    }
}
