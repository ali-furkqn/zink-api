import {
    CacheModule,
    MiddlewareConsumer,
    Module,
    NestModule,
} from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { TypeOrmModule } from "@nestjs/typeorm"
import { RateLimiterModule, RateLimiterGuard } from "nestjs-rate-limit"
// Modules
import { ApiModule } from "@/api/api.module"
import { AssetsModule } from "@/assets/assets.module"
import { AuthModule } from "@/auth/auth.module"
import { AppConfigModule } from "@/config/config.module"
// Middlewares
import { MorganMiddleware } from "@/common/middlewares/morgan.middleware"
import { TimeMiddleware } from "@/common/middlewares/time.middleware"
// Configurations
import { DBConfiguration } from "./config/configuration/db.configuration"
import { AppConfiguration } from "./config/configuration/app.configuration"

@Module({
    imports: [
        RateLimiterModule.forRoot({
            points: 32,
            duration: 5,
            keyPrefix: "global",
        }),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                type: "mongodb",
                url: DBConfiguration().uri,
                synchronize: AppConfiguration().env === "development",
                logger: "simple-console",
                useUnifiedTopology: true,
                useNewUrlParser: true,
                autoLoadEntities: true,
            }),
        }),
        CacheModule.register(),
        AppConfigModule,
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
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(MorganMiddleware, TimeMiddleware).forRoutes("/(.*)")
    }
}
