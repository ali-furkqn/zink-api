import { IsEmail, MinLength, MaxLength, IsNotEmpty } from "class-validator"

export abstract class SignupDto {
    @MaxLength(32)
    @MinLength(3)
    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    @IsEmail()
    email: string

    @MaxLength(32)
    @MinLength(6)
    password: string
}
