import { IsUUID } from "class-validator"

export abstract class DeleteMatchDTO {
    @IsUUID(4)
    id: string
}
