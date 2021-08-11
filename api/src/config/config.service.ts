import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class AppConfigService {
    constructor(private configService: ConfigService) {}

    get app(): Zink.AppConfiguration {
        return this.configService.get("app")
    }

    get db(): Zink.DBConfiguration {
        return this.configService.get("db")
    }

    get firebase(): Zink.FBConfiguration {
        return this.configService.get("fb")
    }

    get mail(): Zink.MailConfiguration {
        return this.configService.get("mail")
    }
}
