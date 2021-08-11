import { Module, forwardRef } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "@/auth/auth.module"
import { UserEntity } from "@/api/users/user.entity"
import { MatchController } from "./match.controller"
import { MatchService } from "./match.service"
import { MatchEntity } from "./match.entity"

@Module({
    imports: [TypeOrmModule.forFeature([MatchEntity, UserEntity]), AuthModule],
    controllers: [MatchController],
    providers: [MatchService],
    exports: [TypeOrmModule],
})
export class MatchModule {}
