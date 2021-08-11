import { registerAs } from "@nestjs/config"

export const DBConfiguration = registerAs("db", () => ({
    uri: process.env.DB_URI,
}))
