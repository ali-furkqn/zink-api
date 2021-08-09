const fs = require("fs");
const logger = require("../shared/logger");
const getSecrets = require("./get").default;

const isProd = process.env.NODE_ENV === "production";

if (!isProd) require("dotenv").config();

const mode = process.argv[2] || "process";

const shouldWrite = mode.split("-").includes("write");
const shouldProcess = mode.split("-").includes("process");

const { TOKEN, APP_NAME, KEY, BASE_URL } = process.env;

let didErr = false;

(async () => {
    try {
        if (!(BASE_URL && APP_NAME && KEY))
            throw new Error("Missing environments: BASE_URL, APP_NAME or KEY ");

        const secrets = await getSecrets(BASE_URL, APP_NAME, KEY, TOKEN);

        if (shouldWrite) {
            const parserSecret = (() => {
                let r = [];
                for (const k in secrets) {
                    r.push(`${k}=${secrets[k]}`);
                }
                return r.join("\n");
            })();
            fs.writeFileSync("./.env", parserSecret, { encoding: "utf-8" });
            console.log("Secrets written to .env file");
        }
        if (shouldProcess) {
            for (const k in secrets) {
                process.env[k] = secrets[k];
            }
            console.log("Secrets added process");
        }
    } catch (e) {
        didErr = true;
        logger.error(e.toString());
    }
})();

if (didErr) {
    process.exit(1);
}
