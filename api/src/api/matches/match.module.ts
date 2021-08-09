import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MatchController } from "./match.controller";
import { MatchService } from "./match.service";
import { UserEntity } from "../users/user.entity";
import { MatchEntity } from "../matches/match.entity";
import { UsersModule } from "../users/user.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([MatchEntity, UserEntity]),
        forwardRef(() => UsersModule),
    ],
    controllers: [MatchController],
    providers: [MatchService],
    exports: [TypeOrmModule],
})
export class MatchModule {}
