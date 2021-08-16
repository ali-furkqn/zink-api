import { VaultConfiguration } from "@/config/configuration/vault.configuration"
import { Logger } from "@nestjs/common"
import axios from "axios"

export async function registerVault(): Promise<void> {
    const vaultConf = VaultConfiguration()
    if (Object.values(vaultConf).some(val => !val)) return

    const url = [vaultConf.addr, "v1", vaultConf.path].join("/")

    try {
        const { data } = await axios
            .get(url, {
                headers: {
                    "X-Vault-Token": vaultConf.token,
                },
            })

        const secrets = data.data.data

        Logger.debug(`${Object.keys(secrets).length} secrets loaded from vault`, "Vault Register")

        for(const key in secrets) {
            process.env[key] = secrets[key]
        }
    } catch (err) {
        Logger.error(err, null, "Vault Service")
    }
}