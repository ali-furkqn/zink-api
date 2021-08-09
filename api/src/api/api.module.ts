import { Module } from "@nestjs/common";
import { RouterModule } from "nest-router";
import { UsersModule, StatusModule, MatchModule } from "./";
import { WordModule } from "./words/words.module";

@Module({
    imports: [
        RouterModule.forRoutes([
            {
                path: "/api/v1",
                module: ApiModule,
                children: [StatusModule, UsersModule, MatchModule],
            },
        ]),
        UsersModule,
        StatusModule,
        MatchModule,
        WordModule,
    ],
})
export class ApiModule {}
