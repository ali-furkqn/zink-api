import { IsEmail, IsNotEmpty, MinLength, MaxLength } from "class-validator"

export abstract class CreateUserDto {
    @MaxLength(32)
    @MinLength(3)
    @IsNotEmpty()
    username: string

    @IsEmail()
    @IsNotEmpty()
    email: string

    @MaxLength(32)
    @MinLength(6)
    @IsNotEmpty()
    password: string
}
