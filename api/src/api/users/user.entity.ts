import {
    Entity,
    Column,
    ObjectIdColumn,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm"
import { Exclude, Expose } from "class-transformer"
import { ObjectID } from "mongodb"

@Entity({ schema: "User" })
export class UserEntity {
    @PrimaryColumn({ type: "string", nullable: false, unique: true })
    id: string

    @Exclude()
    @ObjectIdColumn()
    _id: ObjectID

    @Expose()
    get tag(): string {
        return `${this.username}#${this.discriminator}`
    }

    @Column({ nullable: false })
    avatar: string

    @Column({ nullable: false })
    flags: number

    @Column({ nullable: false })
    discriminator: number

    @Column({ default: 100 })
    coins = 100

    @Column({ default: 5 })
    gems = 5

    @Column({ default: 0 })
    xp = 0

    @Column({ length: 32 })
    username: string

    @Exclude()
    @Column({ unique: true })
    email: string

    @Exclude()
    @Column()
    password: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updateAt: Date

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial)
    }
}
