import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WordEntity } from "./words.entity";
import { UsersModule } from "../users/user.module";
import { WordController } from "./words.controller";
import { WordService } from "./words.service";

@Module({
    imports: [TypeOrmModule.forFeature([WordEntity]), UsersModule],
    controllers: [WordController],
    providers: [WordService],
    exports: [TypeOrmModule],
})
export class WordModule {}
