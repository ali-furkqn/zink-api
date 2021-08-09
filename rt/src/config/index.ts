import fs from "fs";

const isProd = process.env.NODE_ENV === "production";
if (isProd) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const env = require("dotenv").parse(fs.readFileSync("prod.env"));
    for (const k in env) {
        process.env[k] = env[k];
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
} else require("dotenv").config();

export const Config = {
    PORT: Number(process.env.PORT) || Number(process.argv[2]) || 3000,
    SECRET_KEY: process.env.SECRET_KEY || "test",
    isProd: process.env.NODE_ENV === "production",
    API_URL: process.env.API_URL || "https://zink.alifurkan.codes/api/v1",
    SYSTEM_TOKEN: process.env.TOKEN,
    TESTERS: [process.env.TESTER0_TOKEN, process.env.TESTER1_TOKEN],
};
