import { IsUUID } from "class-validator"

export abstract class GetMatchDto {
    @IsUUID(4)
    id: string
}
