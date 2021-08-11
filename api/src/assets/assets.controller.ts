import {
    Controller,
    Get,
    Param,
    Post,
    Delete,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    Res,
} from "@nestjs/common"
import { FileInterceptor } from "@webundsoehne/nest-fastify-file-upload"
import { AssetsService } from "./assets.service"
import { AuthGuard } from "src/auth/auth.guard"
import { Flag } from "src/auth/flag.service"
import { Flags } from "src/auth/flag.decorator"
import { FastifyReply } from "fastify"

@Controller("assets")
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) {}

    @Get(":type/:id/:name")
    async getAssetsPub(
        @Param("type") type: string,
        @Param("id") id: string,
        @Param("name") name: string,
        @Res() res: FastifyReply,
    ): Promise<void> {
        const [data, contentType] = await this.assetsService.get(type, id, name)
        res.header("Content-Type", contentType)
        res.send(data)
    }

    @Flags(Flag.DEV)
    @UseGuards(AuthGuard)
    @Get("dev/:id/:name")
    async getAssetsDev(
        @Param("id") id: string,
        @Param("name") name: string,
        @Res() res: FastifyReply,
    ): Promise<void> {
        const [data, contentType] = await this.assetsService.get(
            "dev",
            id,
            name,
        )
        res.header("Content-Type", contentType)
        res.send(data)
    }

    @Flags(Flag.DEV)
    @UseGuards(AuthGuard)
    @Post("/:type")
    @UseInterceptors(FileInterceptor("file"))
    async upAssets(
        @Param("type") type: string,
        @UploadedFile("file") file: Zink.AssetsUpFile,
    ): Promise<Zink.Response> {
        return await this.assetsService.upload(file, type)
    }

    @Flags(Flag.DEV)
    @UseGuards(AuthGuard)
    @Delete("/:type/:id/:name")
    async delPubAssets(
        @Param("type") type: string,
        @Param("id") id: string,
        @Param("name") name: string,
    ): Promise<Zink.Response> {
        return await this.assetsService.delete(`${type}/${id}/${name}`)
    }
}
