import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../api/users/user.module";
import { UserEntity } from "../api/users/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        forwardRef(() => UsersModule),
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [TypeOrmModule, AuthService],
})
export class AuthModule {}
