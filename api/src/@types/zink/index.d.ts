export {};

declare global {
    namespace Zink {
        type TConfig = {
            NODE_ENV: string;
            port: number;
            mongodbURI: string;
            secret: string;
            rootPath: string;
            isProd: boolean;
            flyioToken: string;
            sgKey: string;
            mail: string;
            UUID_NAMESPACE;
            Firebase: {
                apiKey: string;
                authDomain: string;
                databaseURL: string;
                projectId: string;
                storageBucket: string;
                messagingSenderId: string;
                appId: string;
                measurementId: string;
            };
        };

        type MatchTypes = "duel" | "catch" | "fast-finger" | "math";

        interface MatchEntity {
            id: string;
            type: MatchTypes;
            status: boolean;
            winner: { id: string };
            users: Array<{
                id: number;
            }>;
        }

        interface IToken {
            id: string;
            email: string;
            flags: number;
        }

        interface Response {
            message?: string;
            [propName: string]: any;
        }

        interface RequestUser extends IToken {
            iat: number;
            exp: number;
        }

        interface AssetsUpFile {
            fieldname: string;
            originalname: string;
            encoding: string;
            buffer: Buffer;
        }
    }
}
