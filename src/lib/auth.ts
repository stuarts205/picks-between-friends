import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail } from "@/lib/sendEmail";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,

    // <-- this is required for reset in v1.4.18
    async sendResetPassword({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `
          <p>Hello ${user.name || "user"},</p>
          <p>Click the link below to reset your password:</p>
          <a href="${url}" style="
            display:inline-block;
            padding:10px 20px;
            background-color:#4285f4;
            color:#fff;
            border-radius:4px;
            text-decoration:none;
          ">Reset Password</a>
          <p>If you didn't request this, ignore this email.</p>
        `,
      });
    },
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
});
