import {
    Entity,
    PrimaryColumn,
    ObjectID,
    ObjectIdColumn,
    Column,
} from "typeorm";
import { Exclude } from "class-transformer";

@Entity()
export class WordEntity {
    @PrimaryColumn({ unique: true })
    id: string;

    @Exclude()
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({ unique: true })
    value: string;

    @Column()
    difficulty: number;
}
