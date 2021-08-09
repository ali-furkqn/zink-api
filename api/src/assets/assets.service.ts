import "@firebase/storage";
import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as firebase from "firebase";
import { v4 as uuidV4 } from "uuid";
import * as path from "path";
import * as mime from "mime-types";
import * as sharp from "sharp";
import got from "got";

@Injectable()
export class AssetsService {
    private readonly FirebaseInstance = firebase.initializeApp(
        this.configService.get("Firebase"),
    );
    private readonly StorageInstance = this.FirebaseInstance.storage();
    private readonly FirebaseStorage = this.StorageInstance.ref();

    constructor(private readonly configService: ConfigService) {}

    async upload(
        file: Zink.AssetsUpFile,
        type?: string,
        vanityName?: string,
    ): Promise<Zink.Response & { path: string }> {
        if (!file) throw new BadRequestException("file should not be empty");
        const id = vanityName || uuidV4();

        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);

        const buff = file.buffer;

        const storagePath = `assets/${type || "public"}/${id}/${name}${ext}`;

        const fileRef = this.FirebaseStorage.child(storagePath);
        await fileRef.put(buff, {
            contentEncoding: file.encoding,
            contentType: mime.lookup(ext) || "text/plain; charset=utf-8",
        });

        Logger.log(`Uploaded New File { ${storagePath} }`, "Assets");
        return { message: "Successfully Uploaded Image", path: storagePath };
    }

    async get(
        rootPath: string,
        id: string,
        name: string,
    ): Promise<[Buffer, string]> {
        const ref = this.FirebaseStorage.child(
            `assets/${rootPath}/${id}/${name}`,
        );
        try {
            const { contentType } = await ref.getMetadata();
            const fileURI: string = await ref.getDownloadURL();
            const data = await got(fileURI);
            return [data.rawBody, contentType];
        } catch (e) {
            throw new NotFoundException("File Not Found");
        }
    }

    async compileImage(img: Buffer, size = 512): Promise<Buffer> {
        return await sharp(img)
            .resize(size, size)
            .webp({ quality: 70, lossless: true })
            .toBuffer();
    }

    async delete(path: string): Promise<Zink.Response> {
        const ref = this.FirebaseStorage.child(`assets/${path}`);
        try {
            await ref.delete();
            Logger.log(`Deleted File { assets/${path} }`, "Assets");
            return { message: "Successfully Deleted File" };
        } catch (e) {
            throw new NotFoundException("File Not Found");
        }
    }
}
