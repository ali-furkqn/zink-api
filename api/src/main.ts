import { NestFactory } from "@nestjs/core"
import * as helmet from "fastify-helmet"
import * as multer from "fastify-multer"
import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify"
import { ValidationPipe } from "@nestjs/common"
import { AppModule } from "./app.module"
import { ConfigService } from "@nestjs/config"

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
    )
    const configService = app.get(ConfigService)
    const port = configService.get("PORT")

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
