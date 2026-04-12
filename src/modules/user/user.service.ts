import { prisma } from "../../lib/prisma.js";
import { UserUpdateInput } from "../../generated/prisma/models.js";
import transporter from "../../lib/nodeMailerTransport.js";
import { randomUUID } from "node:crypto";
import { auth } from "../../lib/auth.js";
import {
    generateEmailVerificationOtp,
    getEmailVerificationIdentifier,
    getEmailVerificationOtpExpiryDate,
    hashEmailVerificationOtp,
} from "../../lib/emailVerificationOtp.js";

const RESEND_COOLDOWN_SECONDS = 60;

export class UserServiceError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
    }
}

const normalizeServiceError = (
    error: unknown,
    fallbackMessage: string,
    fallbackStatus = 400,
) => {
    if (error instanceof UserServiceError) {
        throw error;
    }

    const maybeError = error as { message?: string; status?: number; statusCode?: number };
    throw new UserServiceError(
        maybeError.statusCode || maybeError.status || fallbackStatus,
        maybeError.message || fallbackMessage,
    );
};

const getUserById = async(userId: string) => {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: {
            student: {
                select: {
                    id: true,
                    lastName: true,
                    firstName: true
                }
            },
            tutorProfile: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            }
        }
        
    })
}

const updateUser = async(userId: string, data:UserUpdateInput) => {
    const payload: UserUpdateInput = { }
    if(data.email) payload.email = data.email;
    if(data.name) payload.name = data.name;
    if(data.image) payload.image = data.image;
    if(data.emailVerified) payload.emailVerified = data.emailVerified;
    

    return await prisma.user.update({
        where: { id: userId },
        data: payload,
    })
}

const deleteUser = async(userId: string) => {
    return await prisma.user.delete({
        where: { id: userId },
    })
}

const verifyEmailWithOtp = async (email: string, otp: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, email: true, emailVerified: true },
    });

    if (!existingUser) {
        throw new UserServiceError(404, "User not found");
    }

    if (existingUser.emailVerified) {
        return {
            email: existingUser.email,
            emailVerified: true,
        };
    }

    const identifier = getEmailVerificationIdentifier(normalizedEmail);
    const verification = await prisma.verification.findFirst({
        where: {
            identifier,
            expiresAt: {
                gt: new Date(),
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (!verification) {
        throw new UserServiceError(400, "OTP not found or expired. Please request a new OTP.");
    }

    const hashedOtp = hashEmailVerificationOtp(normalizedEmail, otp);
    if (verification.value !== hashedOtp) {
        throw new UserServiceError(400, "Invalid OTP. Please try again.");
    }

    const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: true },
            select: { email: true, emailVerified: true },
        }),
        prisma.verification.deleteMany({
            where: { identifier },
        }),
    ]);

    return updatedUser;
};

const resendEmailVerificationOtp = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { email: true, name: true, emailVerified: true },
    });

    if (!existingUser) {
        throw new UserServiceError(404, "User not found");
    }

    if (existingUser.emailVerified) {
        throw new UserServiceError(409, "Email is already verified");
    }

    const identifier = getEmailVerificationIdentifier(normalizedEmail);
    const latestOtpRecord = await prisma.verification.findFirst({
        where: { identifier },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            createdAt: true,
        },
    });

    if (latestOtpRecord) {
        const elapsedSeconds = Math.floor((Date.now() - latestOtpRecord.createdAt.getTime()) / 1000);
        if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
            throw new UserServiceError(
                429,
                `Please wait ${RESEND_COOLDOWN_SECONDS - elapsedSeconds}s before requesting another OTP.`,
            );
        }
    }

    const otp = generateEmailVerificationOtp();
    const hashedOtp = hashEmailVerificationOtp(normalizedEmail, otp);
    const expiresAt = getEmailVerificationOtpExpiryDate();

    await prisma.$transaction([
        prisma.verification.deleteMany({
            where: { identifier },
        }),
        prisma.verification.create({
            data: {
                id: randomUUID(),
                identifier,
                value: hashedOtp,
                expiresAt,
            },
        }),
    ]);

    await transporter.sendMail({
        from: `" ${process.env.USER_NAME} " <${process.env.APP_USER}>`,
        to: normalizedEmail,
        subject: "Your SkillBridge verification OTP",
        html: `
            <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.5;">
                <h2 style="margin-bottom: 8px;">Verify your SkillBridge email</h2>
                <p>Hello ${existingUser.name},</p>
                <p>Use this OTP to verify your email address:</p>
                <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #2563eb;">${otp}</p>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you did not request this code, you can safely ignore this email.</p>
            </div>
        `,
    });

    return {
        email: normalizedEmail,
        otpSent: true,
    };
};

const forgotPassword = async (
    email: string,
    redirectTo: string | undefined,
    headers: Record<string, unknown>,
) => {
    try {
        await auth.api.requestPasswordReset({
            body: {
                email,
                ...(redirectTo ? { redirectTo } : {}),
            },
            headers: headers as any,
        });
       
        return {
            email,
            requested: true,
        };
    } catch (error) {
        normalizeServiceError(error, "Failed to request password reset");
    }
};

const resetPasswordWithToken = async (
    token: string,
    newPassword: string,
    
    headers: Record<string, unknown>,
) => {
    try {
        
       const result =  await auth.api.resetPassword({
            body: {
                token,
                newPassword,
            },
            headers: headers as any,
        });

        
        return {
            passwordReset: true,
        };
    } catch (error) {
        normalizeServiceError(error, "Failed to reset password");
    }
};

const changePassword = async (
    currentPassword: string,
    newPassword: string,
    revokeOtherSessions: boolean | undefined,
    headers: Record<string, unknown>,
) => {
    try {
        await auth.api.changePassword({
            body: {
                currentPassword,
                newPassword,
                revokeOtherSessions,
            },
            headers: headers as any,
        });

        return {
            passwordChanged: true,
        };
    } catch (error) {
        normalizeServiceError(error, "Failed to change password", 401);
    }
};

export const userService =  {
    getUserById,
    updateUser,
    deleteUser,
    verifyEmailWithOtp,
    resendEmailVerificationOtp,
    forgotPassword,
    resetPasswordWithToken,
    changePassword,
};