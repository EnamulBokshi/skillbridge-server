import { config } from "dotenv";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import transporter from "./nodeMailerTransport.js";
import { randomUUID } from "node:crypto";
import {
  generateEmailVerificationOtp,
  getEmailVerificationIdentifier,
  getEmailVerificationOtpExpiryDate,
  hashEmailVerificationOtp,
} from "./emailVerificationOtp.js";

const isProduction = process.env.NODE_ENV === "production";
const publicAppUrl =
  process.env.PROD_APP_URL || process.env.APP_URL || "http://localhost:3000";

const trustedOrigins = [
  process.env.APP_URL,
  process.env.PROD_APP_URL,
  publicAppUrl,
  "http://localhost:3000",
  "http://localhost:5000",
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  // Keep auth callbacks/session origin aligned with the public client URL.
  baseURL: process.env.BETTER_AUTH_URL || publicAppUrl,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins,
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
      isAssociate: {
        type: "boolean",
        defaultValue: false,
        required: false,
      },
    },
    image: {
      defaultValue:
        process.env.DEFAULT_AVATAR_URL ||
        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      // Do not await to reduce timing-attack surface.
      void transporter
        .sendMail({
          from: `" ${process.env.USER_NAME} " <${process.env.APP_USER}>`,
          to: user.email,
          subject: "Reset your SkillBridge password",
          html: `
            <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.5;">
              <h2 style="margin-bottom: 8px;">Password reset request</h2>
              <p>Hello ${user.name},</p>
              <p>Click the button below to reset your password.</p>
              <p style="margin: 20px 0;">
                <a href="${url}" style="background:#2563eb;color:#fff;padding:12px 22px;text-decoration:none;border-radius:6px;display:inline-block;">
                  Reset Password
                </a>
              </p>
              <p>If the button does not work, use this link:</p>
              <p style="word-break:break-all;">${url}</p>
              <p>If you did not request this, you can safely ignore this email.</p>
            </div>
          `,
        })
        .catch((error) => {
          console.error("Failed to send reset password email", error);
        });
    },
    onPasswordReset: async ({ user }, request) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      console.log("Attempting to send verification email....!!");
      try {
        const otp = generateEmailVerificationOtp();
        const identifier = getEmailVerificationIdentifier(user.email);
        const hashedOtp = hashEmailVerificationOtp(user.email, otp);
        const expiresAt = getEmailVerificationOtpExpiryDate();

        await prisma.verification.deleteMany({
          where: { identifier },
        });

        await prisma.verification.create({
          data: {
            id: randomUUID(),
            identifier,
            value: hashedOtp,
            expiresAt,
          },
        });

        const info = await transporter.sendMail({
          from: `" ${process.env.USER_NAME} " <${process.env.APP_USER}>`,
          to: user.email,
          subject: "Your SkillBridge verification OTP",
          html: `
                
                <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification OTP</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .header {
      background-color: #2563eb;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }
    .content h2 {
      margin-top: 0;
      font-size: 20px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .verify-button {
      background-color: #2563eb;
      color: #ffffff;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: bold;
      display: inline-block;
    }
    .verify-button:hover {
      background-color: #1e4fd8;
    }
    .footer {
      background-color: #f4f6f8;
      text-align: center;
      padding: 15px;
      font-size: 12px;
      color: #666666;
    }
    .link {
      word-break: break-all;
      color: #2563eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Email Verification OTP</h1>
    </div>

    <div class="content">
      <h2>Hello ${user.name}</h2>
      <p>
        Thank you for registering with us. Use the OTP below to verify your
        email address.
      </p>

      <div class="button-container">
        <span class="verify-button">${otp}</span>
      </div>

      <p>
        This OTP will expire in 10 minutes. If you did not create an account,
        you can safely ignore this email.
      </p>

      <p>
        Regards,<br />
        <strong>SkillBridge</strong>
      </p>
    </div>

    <div class="footer">
      © 2025 SkillBridge. All rights reserved.
    </div>
  </div>
</body>
</html>

                
                `,
        });
        console.log("Verification email sent successfully");
        console.log("info: ", info);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  session: {
    sessionToken: {
      attributes: {
        secure: isProduction,
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
      },
    },
    cookieCache: {
      enabled: true,
      
      maxAge: 5 * 60, // 5 minutes
    },
    
  },

  advanced: {
    cookiePrefix: "better-auth",

    useSecureCookies: process.env.NODE_ENV === "production",

    crossSubDomainCookies: {
      enabled: false,
    },
    defaultCookieAttributes: {
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    },
    disableCSRFCheck: true, // Allow requests without Origin header (Postman, mobile apps, etc.)
  },
});
