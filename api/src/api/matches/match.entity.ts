import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ObjectIdColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm"
import { ObjectID } from "mongodb"
import { Exclude } from "class-transformer"

@Entity({ schema: "Match" })
export class MatchEntity {
    @PrimaryGeneratedColumn()
    id: string

    @Exclude()
    @ObjectIdColumn()
    _id!: ObjectID

    @Column()
    type: Zink.MatchTypes

    @Column()
    status: boolean

    @Column()
    users: string[]

    @Column()
    winner: { id: string }

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updateAt: Date
}
