import { IsEmail, IsNotEmpty, IsUUID } from "class-validator";
import { Optional } from "@nestjs/common";

export abstract class GetUserDto {
    @IsUUID(5)
    @IsNotEmpty()
    id: string;

    @IsEmail()
    @Optional()
    email?: string;
}
