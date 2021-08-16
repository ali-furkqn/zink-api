import { registerAs } from "@nestjs/config"

export const VaultConfiguration = registerAs("vault", () => ({
    addr: process.env.VAULT_ADDR,
    token: process.env.VAULT_TOKEN,
    path: process.env.VAULT_PATH,
}))
