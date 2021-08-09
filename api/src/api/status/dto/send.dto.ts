import { IsString, IsNotEmpty, IsUUID, MaxLength } from "class-validator";

export abstract class SendDTO {
    @IsNotEmpty()
    @IsString()
    type: "email" | "notification";

    @IsUUID(5)
    id: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(512)
    message: string;
}
