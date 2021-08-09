const isProd = process.env.NODE_ENV === "production";

export const init = async () => {
    if (!isProd) await (await import("dotenv")).config();

    const impSecret = [
        "MONGODB_URI",
        "SG_KEY",
        "FB_API_KEY",
        "FB_AUTH_DOMAIN",
        "FB_DB_URL",
        "FB_PROJECT_ID",
        "FB_STORAGE_BUCKET",
        "FB_MSG_SENDER_ID",
        "FB_APP_ID",
        "FB_MSRMT_ID",
        "UUID_NAMESPACE",
        "SECRET_KEY",
        "FLYIO_TOKEN",
    ];

    const envKeys = Object.keys(process.env);

    if (impSecret.every(s => envKeys.includes(s))) return;

    let { TOKEN, APP_NAME, KEY, BASE_URL } = process.env;

    if (!TOKEN || !APP_NAME || !KEY || !BASE_URL) {
        [BASE_URL, APP_NAME, KEY, TOKEN] = process.argv.splice(2);
    }

    const getSecrets = (await import("@/scripts/secrets/get")).default;

    const secrets = await getSecrets(BASE_URL, APP_NAME, KEY, TOKEN);

    for (const k in secrets) {
        process.env[k] = secrets[k];
    }

    if (!isProd) {
        const fs = await import("fs");
        const parserSecret = (() => {
            let r = [];
            for (const k in secrets) {
                r.push(`${k}=${secrets[k]}`);
            }
            return r.join("\r\n");
        })();
        fs.writeFileSync("./.env", parserSecret, {
            encoding: "utf-8",
        });
    }
};

export default (): Zink.TConfig => ({
    port: parseInt(process.env.PORT) || parseInt(process.argv[2]) || 3000,
    NODE_ENV: process.env.NODE_ENV || "development",
    mongodbURI: process.env.MONGODB_URI,
    secret: process.env.SECRET_KEY || "test",
    rootPath: process.env.ROOT_PATH,
    flyioToken: process.env.FLYIO_TOKEN,
    isProd,
    sgKey: process.env.SG_KEY,
    mail: "noreply@zinkapp.co",
    UUID_NAMESPACE: process.env.UUID_NAMESPACE,
    Firebase: {
        apiKey: process.env.FB_API_KEY,
        authDomain: process.env.FB_AUTH_DOMAIN,
        databaseURL: process.env.FB_DB_URL,
        projectId: process.env.FB_PROJECT_ID,
        storageBucket: process.env.FB_STORAGE_BUCKET,
        messagingSenderId: process.env.FB_MSG_SENDER_ID,
        appId: process.env.FB_APP_ID,
        measurementId: process.env.FB_MSRMT_ID,
    },
});
