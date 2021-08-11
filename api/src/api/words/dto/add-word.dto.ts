import { Optional } from "@nestjs/common"
import {
    IsAlpha,
    Length,
    IsNumber,
    IsNotEmpty,
    Max,
    IsUUID,
} from "class-validator"
import { Transform } from "class-transformer"

export abstract class AddWordDto {
    @Optional()
    @IsUUID(4)
    id?: string

    @IsNotEmpty()
    @IsAlpha()
    @Length(3, 64)
    word: string

    @Max(1)
    @IsNumber()
    @Transform(v => (typeof v === "string" ? parseInt(v) : v))
    @Optional()
    difficulty?: number
}
