import {
    Controller,
    Get,
    Put,
    Delete,
    Body,
    Query,
    Param,
    UseGuards,
} from "@nestjs/common";
import { AddWordDto } from "./dto/add-word.dto";
import { WordService } from "./words.service";
import { WordEntity } from "./words.entity";
import { AuthGuard } from "../../auth/auth.guard";
import { Flag, Flags } from "../../auth/flag.decorator";

@Controller("words")
export class WordController {
    constructor(private wordService: WordService) {}

    @Get("/id/:id")
    async getWord(@Param("id") id: string): Promise<WordEntity> {
        return await this.wordService.getID(id);
    }

    @Get()
    async getRandomWord(
        @Query("difficulty") difficulty?: number,
    ): Promise<WordEntity> {
        return await this.wordService.getRandom(difficulty);
    }

    @Flags(Flag.DEV)
    @UseGuards(AuthGuard)
    @Get("/all")
    async getAllWord(
        @Query("begin") begin?: number,
        @Query("length") length?: number,
    ): Promise<WordEntity[]> {
        return await this.wordService.getAll(begin, length);
    }

    @Flags(Flag.DEV)
    @UseGuards(AuthGuard)
    @Put()
    async addWord(@Body() wordBody: AddWordDto): Promise<Zink.Response> {
        return this.wordService.add(wordBody);
    }

    @Flags(Flag.DEV)
    @UseGuards(AuthGuard)
    @Delete("/id/:id")
    async delWord(@Param("id") id: string): Promise<WordEntity> {
        return await this.wordService.getID(id);
    }
}
