import { Module } from "@nestjs/common"
import { RouterModule } from "nest-router"
import { UsersModule, StatusModule, MatchModule, WordModule } from "./"

@Module({
    imports: [
        RouterModule.forRoutes([
            {
                path: "/api/",
                module: ApiModule,
                children: [StatusModule, UsersModule, MatchModule, WordModule],
            },
        ]),
        UsersModule,
        StatusModule,
        MatchModule,
        WordModule,
    ],
})
export class ApiModule {}
