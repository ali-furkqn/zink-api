import { IsUUID, IsNumber, IsBoolean } from "class-validator";
import { Optional } from "@nestjs/common";
import { Transform } from "class-transformer";

export abstract class GetMatchDto {
    @IsUUID(5)
    @Optional()
    id?: string;

    @IsNumber()
    @Transform(v => Number(v))
    @Optional()
    begin: number;

    @IsNumber()
    @Transform(v => Number(v))
    @Optional()
    length: number;

    @IsBoolean()
    @Transform(v => Boolean(v))
    @Optional()
    status: boolean;
}
