import { NestFactory } from "@nestjs/core";
import * as morgan from "morgan";
import * as cache from "memory-cache";
import * as helmet from "fastify-helmet";
import * as multer from "fastify-multer";
import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { ValidationPipe } from "@nestjs/common";
import Config, { init as configInit } from "./config";

async function bootstrap() {
    const { AppModule } = await import("./app.module");

    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
    );

    app.getHttpAdapter()
        .getInstance()
        .register(helmet)
        .register(multer.contentParser);

    app.use(async (req, res, next) => {
        cache.del("req.time");
        cache.put("req.time", process.hrtime(), 5000);
        await next();
    });
    app.enableCors();
    app.use(morgan(Config().isProd ? "common" : "dev"));
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );
    await app.listen(Config().port, "0.0.0.0");
}

(async () => {
    await configInit();
    await bootstrap();
})();
