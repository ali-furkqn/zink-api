import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import * as sgMail from "@sendgrid/mail";
import Config from "./config";
import { RateLimiterModule, RateLimiterGuard } from "nestjs-rate-limit";
import { ApiModule } from "./api/api.module";
import { AssetsModule } from "./assets/assets.module";
import { AuthModule } from "./auth/auth.module";

@Module({
    imports: [
        RateLimiterModule.forRoot({
            points: 32,
            duration: 5,
            keyPrefix: "global",
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            load: [Config],
        }),
        TypeOrmModule.forRoot({
            type: "mongodb",
            url: process.env.MONGODB_URI,
            synchronize: true,
            logger: "debug",
            useUnifiedTopology: true,
            useNewUrlParser: true,
            autoLoadEntities: true,
        }),
        ApiModule,
        AuthModule,
        AssetsModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: RateLimiterGuard,
        },
    ],
})
export class AppModule {
    constructor() {
        sgMail.setApiKey(Config().sgKey);
    }
}
