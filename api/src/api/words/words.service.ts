import {
    Injectable,
    BadRequestException,
    NotFoundException,
    Logger,
} from "@nestjs/common";
import { MongoRepository } from "typeorm";
import { WordEntity } from "./words.entity";
import { AddWordDto } from "./dto/add-word.dto";
import { v4 as uuidv4 } from "uuid";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class WordService {
    constructor(
        @InjectRepository(WordEntity)
        private readonly wordRepository: MongoRepository<WordEntity>,
    ) {}

    async add({ id, word, difficulty }: AddWordDto): Promise<Zink.Response> {
        const wordEntity = this.wordRepository.create({
            id: id || uuidv4(),
            value: word,
            difficulty: difficulty || word.length / 64,
        });
        await this.wordRepository.save(wordEntity);
        Logger.log(`Added {${id}} Word`, "Word Service");
        return { message: "Successfully added word", word: wordEntity };
    }

    async getAll(skip = 0, take = 16): Promise<WordEntity[]> {
        return await this.wordRepository.find({ skip, take });
    }

    async getID(id: string): Promise<WordEntity> {
        return await this.wordRepository.findOne({ id });
    }

    async getRandom(difficulty?: number): Promise<WordEntity> {
        if (!(difficulty < 1 && difficulty > 0))
            throw new BadRequestException("Invalid Difficulty Query");
        const allWords = await this.wordRepository.find();
        const words = allWords.filter(
            w =>
                difficulty > w.difficulty - 0.2 &&
                difficulty < w.difficulty + 0.2,
        );
        if (words.length === 0)
            return allWords[Math.floor(Math.random() * words.length)];
        else return words[Math.floor(Math.random() * words.length)];
    }

    async del(id: string): Promise<Zink.Response> {
        await this.wordRepository.deleteOne({ id });
        const match = await this.wordRepository.deleteOne({ id });
        if (match.result.ok !== 1)
            throw new NotFoundException("Word Not Found");
        Logger.log(`Deleted {${id}} Match`, "Word Service");
        return { message: "Deleted successfully word" };
    }
}
