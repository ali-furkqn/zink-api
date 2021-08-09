import {
    Controller,
    Get,
    ClassSerializerInterceptor,
    UseInterceptors,
    UseGuards,
    Param,
    Post,
    Patch,
    Body,
    Header,
    UploadedFile,
} from "@nestjs/common";
import { UsersService } from "./user.service";
import { User } from "./user.decorator";
import { AuthGuard } from "../../auth/auth.guard";
import { PatchUserDto } from "./dto";
import { RateLimit } from "nestjs-rate-limit";
import { FileInterceptor } from "@webundsoehne/nest-fastify-file-upload";

@Controller("/users")
export class UserController {
    constructor(private userService: UsersService) {}

    @Get("/@me")
    @UseGuards(AuthGuard)
    async getMyData(@User() user: Zink.RequestUser): Promise<Zink.Response> {
        return await this.userService.getUserData(user);
    }

    @RateLimit({ points: 5, duration: 5 * 60 })
    @Patch("/@me")
    @UseGuards(AuthGuard)
    async editMyData(
        @User() user: Zink.RequestUser,
        @Body() patch: PatchUserDto,
    ): Promise<any> {
        return await this.userService.editUser({ user, patch });
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get("/id/:id")
    @UseGuards(AuthGuard)
    async getUserData(@Param("id") id: string): Promise<Zink.Response> {
        return await this.userService.getUserData({ id });
    }

    @Header("Content-Type", "image/webp; application/json")
    @Get(["/@me/avatar", "/id/:id/avatar/:avatar"])
    async getMyAvatar(
        @User() user: Zink.IToken,
        @Param("id") id: string,
        @Param("avatar") avatar?: string,
    ): Promise<Buffer> {
        return await this.userService.getAvatar(id || user.id, avatar);
    }

    @Post("/@me/avatar")
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor("file"))
    async postMyAvatar(
        @User() user: Zink.IToken,
        @UploadedFile("file") file: Zink.AssetsUpFile,
    ): Promise<any> {
        console.log(user.id);
        return await this.userService.uploadAvatar(user.id, file);
    }
}
