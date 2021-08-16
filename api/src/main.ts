import { NestFactory } from "@nestjs/core"
import { ConfigService } from "@nestjs/config"
import * as helmet from "fastify-helmet"
import * as multer from "fastify-multer"
import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify"
import { ValidationPipe } from "@nestjs/common"
import { registerVault } from "@/common/helpers/register-vault"
import { AppModule } from "./app.module"

async function bootstrap() {
    await registerVault()

    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
    )
    
    const configService = app.get(ConfigService)
    const port = configService.get("app.port") || 3000

    app.getHttpAdapter()
        .getInstance()
        .register(helmet)
        .register(multer.contentParser)
    app.enableCors()
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    )

    await app.listen(port, "0.0.0.0")
}

bootstrap()
