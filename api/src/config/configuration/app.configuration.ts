import { registerAs } from "@nestjs/config"

export const AppConfiguration = registerAs("app", () => ({
    port: parseInt(process.env.PORT) || 3000,
    rootPath: process.env.ROOT_PATH,
    uuidNamespace: process.env.UUID_NAMESPACE || "dev-uuid-namespace",
    env: process.env.NODE_ENV || "development",
    jwtSecret: process.env.JWT_SECRET || "dev-secret",
}))
