export {}

declare global {
    namespace Zink {
        type MatchTypes = "duel" | "catch" | "fast-finger" | "math"

        interface MatchEntity {
            id: string
            type: MatchTypes
            status: boolean
            winner: { id: string }
            users: Array<{
                id: number
            }>
        }

        interface IToken {
            id: string
            email: string
            flags: number
        }

        interface Response {
            message?: string
            [propName: string]: any
        }

        interface RequestUser extends IToken {
            iat: number
            exp: number
        }

        interface AssetsUpFile {
            fieldname: string
            originalname: string
            encoding: string
            buffer: Buffer
        }

        interface AppConfiguration {
            port: number
            rootPath: string
            uuidNamespace: string
            env: string
            jwtSecret: string
        }

        interface DBConfiguration {
            uri: string
        }

        interface FBConfiguration {
            apiKey: string
            authDomain: string
            databaseURL: string
            projectId: string
            storageBucket: string
            messagingSenderId: string
            appId: string
            measurementId: string
        }

        interface MailConfiguration {
            senderMail: string
            sgKey: string
        }

        interface VaultConfiguration {
            addr: string
            token: string
            path: string
        }
    }
}
