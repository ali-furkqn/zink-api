import { IsNotEmpty, IsUUID } from "class-validator"

export abstract class VerifyDto {
    @IsNotEmpty()
    type: string

    @IsNotEmpty()
    @IsUUID(4)
    code: string
}
