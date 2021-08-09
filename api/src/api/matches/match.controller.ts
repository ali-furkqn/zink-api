import {
    Controller,
    Put,
    Get,
    Param,
    UseGuards,
    Delete,
    Body,
    UseInterceptors,
    ClassSerializerInterceptor,
} from "@nestjs/common";
import { AuthGuard } from "../../auth/auth.guard";
import { MatchService } from "./match.service";
import { Flags, Flag } from "../../auth/flag.decorator";
import { User } from "../users/user.decorator";
import { CreateMatchDTO, DeleteMatchDTO, GetMatchDto } from "./dto";

@Controller("/matches")
export class MatchController {
    constructor(private matchService: MatchService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @Get("/:id")
    @UseGuards(AuthGuard)
    async getMatch(
        @Param() params: GetMatchDto,
        @User() user: Zink.RequestUser,
    ): Promise<Zink.Response> {
        return this.matchService.getMatch({ id: params.id, user });
    }

    @Flags(Flag.CREATE_MATCH)
    @Put(["/:id", "/"])
    @UseGuards(AuthGuard)
    async createMatch(
        @Body() body: CreateMatchDTO,
        @Param("id") paramID?: string,
    ): Promise<Zink.Response> {
        return await this.matchService.createMatch(
            paramID
                ? Object.assign({}, body, { id: paramID || body.id })
                : body,
        );
    }

    @Flags(Flag.CREATE_MATCH)
    @Delete("/:id")
    @UseGuards(AuthGuard)
    async deleteMatch(@Param() params: DeleteMatchDTO): Promise<Zink.Response> {
        return await this.matchService.deleteMatch(params.id);
    }
}
