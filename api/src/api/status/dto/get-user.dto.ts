import { IsNumber, IsUUID, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export abstract class GetUserDto {
    @IsNumber()
    @Transform(v => Number(v))
    @IsOptional()
    begin?: number;

    @IsNumber()
    @Transform(v => Number(v))
    @IsOptional()
    length?: number;

    @IsUUID(5)
    @IsOptional()
    id?: string;
}
