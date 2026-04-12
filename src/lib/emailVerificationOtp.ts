import { createHash, randomInt } from "node:crypto";

const OTP_LENGTH = 6;
const DEFAULT_OTP_TTL_MINUTES = 10;

export const getEmailVerificationIdentifier = (email: string): string => {
  return `email-verification:${email.toLowerCase()}`;
};

export const generateEmailVerificationOtp = (): string => {
  return randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
};

export const getEmailVerificationOtpExpiryDate = (): Date => {
  const ttlMinutes = Number(process.env.EMAIL_OTP_TTL_MINUTES ?? DEFAULT_OTP_TTL_MINUTES);
  const safeTtl = Number.isFinite(ttlMinutes) && ttlMinutes > 0 ? ttlMinutes : DEFAULT_OTP_TTL_MINUTES;

  return new Date(Date.now() + safeTtl * 60 * 1000);
};

export const hashEmailVerificationOtp = (email: string, otp: string): string => {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.APP_PASS || "skillbridge-email-otp";
  return createHash("sha256").update(`${email.toLowerCase()}:${otp}:${secret}`).digest("hex");
};
