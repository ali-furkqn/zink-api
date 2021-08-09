import { IsEmail, IsNotEmpty, MinLength, MaxLength } from "class-validator";

export abstract class AuthorizeDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MaxLength(32)
    @MinLength(6)
    password: string;
}
