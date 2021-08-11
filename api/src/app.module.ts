import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
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

@Module({
    imports: [
        RateLimiterModule.forRoot({
            points: 32,
            duration: 5,
            keyPrefix: "global",
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
