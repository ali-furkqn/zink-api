import { registerAs } from "@nestjs/config"

export const MailConfiguration = registerAs("mail", () => ({
    senderMail: "noreply@zinkapp.co",
    sgKey: process.env.SG_KEY,
}))
