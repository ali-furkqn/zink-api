import { registerAs } from "@nestjs/config"

export const FBConfiguration = registerAs("fb", () => ({
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    databaseURL: process.env.FB_DB_URL,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    messagingSenderId: process.env.FB_MSG_SENDER_ID,
    appId: process.env.FB_APP_ID,
    measurementId: process.env.FB_MSRMT_ID,
}))
