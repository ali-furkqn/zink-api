import { Optional } from "@nestjs/common"
import {
    IsUUID,
    IsNotEmpty,
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsBoolean,
} from "class-validator"
import { IsMatchType } from "../is-type.decorator"

export abstract class CreateMatchDTO {
    @IsUUID(4)
    @Optional()
    id?: string

    @IsBoolean()
    @Optional()
    status?: boolean

    @IsMatchType()
    @IsNotEmpty()
    type: Zink.MatchTypes

    @ArrayMaxSize(6)
    @ArrayMinSize(2)
    @IsArray()
    @IsNotEmpty()
    users: string[]
}
