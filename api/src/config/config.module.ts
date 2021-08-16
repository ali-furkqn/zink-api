import { ConfigModule } from "@nestjs/config"
import { Global, Module } from "@nestjs/common"

// Configurations
import { AppConfiguration } from "./configuration/app.configuration"
import { DBConfiguration } from "./configuration/db.configuration"
import { FBConfiguration } from "./configuration/fb.configuration"
import { MailConfiguration } from "./configuration/mail.configuration"
import { VaultConfiguration } from "./configuration/vault.configuration"
// Services
import { AppConfigService } from "./config.service"

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            load: [
                AppConfiguration,
                DBConfiguration,
                FBConfiguration,
                MailConfiguration,
                VaultConfiguration,
            ],
        }),
    ],
    providers: [AppConfigService],
    exports: [AppConfigService],
})
export class AppConfigModule {}
