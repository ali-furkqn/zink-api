import { Controller, Body, Post, Get, UseGuards, Query } from "@nestjs/common"
import { RateLimit } from "nestjs-rate-limit"
import { User } from "@/api/users/user.decorator"
import { AuthService } from "./auth.service"
import { AuthGuard } from "./auth.guard"
import { AuthorizeDto, VerifyDto, SignupDto } from "./dto"

@Controller("/auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @RateLimit({ points: 3, duration: 5 * 60 })
    @Post("/signup")
    async signup(@Body() userBody: SignupDto): Promise<Zink.Response> {
        return await this.authService.signup(userBody)
    }

    @RateLimit({ points: 500, duration: 24 * 60 * 60 })
    @Post("/authorize")
    async authorize(@Body() authBody: AuthorizeDto): Promise<Zink.Response> {
        return await this.authService.authorize(authBody)
    }

    @Post("/token/refresh")
    async refreshToken(
        @Body("refresh_token") token: string,
    ): Promise<Zink.Response> {
        return await this.authService.refreshToken(token)
    }

    @UseGuards(AuthGuard)
    @Get("/whoami")
    whoami(@User() user: Zink.RequestUser): Zink.RequestUser {
        return user
    }

    @Get("/verify")
    async verify(@Query() query: VerifyDto): Promise<Zink.Response> {
        return await this.authService.verify(query.type, query.code)
    }
}
