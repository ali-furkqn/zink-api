import { Module, forwardRef, CacheModule } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "@/auth/auth.module"
import { AssetsModule } from "@/assets/assets.module"
import { UserController } from "./user.controller"
import { UsersService } from "./user.service"
import { UserEntity } from "./user.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        CacheModule.register(),
        forwardRef(() => AuthModule),
        AssetsModule,
    ],
    controllers: [UserController],
    providers: [UsersService],
    exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
