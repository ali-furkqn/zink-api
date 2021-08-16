import { CacheModule, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersModule } from "@/api/users/user.module"
import { AuthModule } from "@/auth/auth.module"
import { WordEntity } from "./words.entity"
import { WordController } from "./words.controller"
import { WordService } from "./words.service"

@Module({
    imports: [
        TypeOrmModule.forFeature([WordEntity]),
        UsersModule,
        CacheModule.register(),
        AuthModule,
    ],
    controllers: [WordController],
    providers: [WordService],
    exports: [TypeOrmModule],
})
export class WordModule {}
