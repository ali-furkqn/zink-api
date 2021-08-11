import {
    IsEmail,
    IsNotEmpty,
    MaxLength,
    MinLength,
    IsOptional,
} from "class-validator"

export abstract class PatchUserDto {
    @IsNotEmpty()
    @MaxLength(32)
    @MinLength(3)
    username: string

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @MaxLength(32)
    @MinLength(6)
    password: string

    @IsOptional()
    @MaxLength(32)
    @MinLength(6)
    newPassword: string
}
