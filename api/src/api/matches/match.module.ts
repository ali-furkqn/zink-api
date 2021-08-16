import { Module, CacheModule } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "@/auth/auth.module"
import { UserEntity } from "@/api/users/user.entity"
import { UsersModule } from "@/api/users/user.module"
import { MatchController } from "./match.controller"
import { MatchService } from "./match.service"
import { MatchEntity } from "./match.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([MatchEntity, UserEntity]),
        AuthModule,
        UsersModule,
        CacheModule.register(),
        AuthModule,
    ],
    controllers: [MatchController],
    providers: [MatchService],
    exports: [TypeOrmModule],
})
export class MatchModule {}
