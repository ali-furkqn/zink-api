import { Module, forwardRef, CacheModule } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersModule } from "@/api/users/user.module"
import { UserEntity } from "@/api/users/user.entity"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { FlagService } from "./flag.service"

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        CacheModule.register(),
        forwardRef(() => UsersModule),
    ],
    controllers: [AuthController],
    providers: [AuthService, FlagService],
    exports: [TypeOrmModule, AuthService, FlagService],
})
export class AuthModule {}
