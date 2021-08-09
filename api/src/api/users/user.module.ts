import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./user.controller";
import { UsersService } from "./user.service";
import { AuthModule } from "../../auth/auth.module";
import { UserEntity } from "./user.entity";
import { AssetsModule } from "src/assets/assets.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        forwardRef(() => AuthModule),
        AssetsModule,
    ],
    controllers: [UserController],
    providers: [UsersService],
    exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
