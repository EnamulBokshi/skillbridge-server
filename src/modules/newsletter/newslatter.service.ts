import path from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";
import transporter from "../../lib/nodeMailerTransport.js";
import { prisma } from "../../lib/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const THANK_YOU_TEMPLATE_PATH = path.join(
	__dirname,
	"../../templates/newsletterThankYouEmail.ejs",
);

type SubscribeNewsletterPayload = {
	name: string;
	email: string;
};

type SendBulkNewsletterPayload = {
	emails: string[];
	subject: string;
	message: string;
};

const sendNewsletterThankYouEmail = async (payload: SubscribeNewsletterPayload) => {
	const html = await ejs.renderFile(THANK_YOU_TEMPLATE_PATH, {
		name: payload.name,
		appUrl: process.env.APP_URL,
		supportEmail: process.env.APP_USER || "support@skillbridge.com",
	});

	await transporter.sendMail({
		from: `"${process.env.USER_NAME || "SkillBridge"}" <${process.env.APP_USER}>`,
		to: payload.email,
		subject: "Thanks for joining SkillBridge newsletter",
		html,
	});
};

const subscribeNewsletter = async (payload: SubscribeNewsletterPayload) => {
	const existing = await prisma.newsletter.findUnique({
		where: { email: payload.email },
	});

	if (!existing) {
		const subscriber = await prisma.newsletter.create({
			data: {
				name: payload.name,
				email: payload.email,
			},
		});

		try {
			await sendNewsletterThankYouEmail(payload);
		} catch (emailError) {
			console.error("Newsletter welcome email failed:", emailError);
		}

		return { subscriber, action: "created" as const };
	}

	if (existing.isDeleted) {
		throw new Error("This email is not eligible for newsletter subscription");
	}

	if (existing.isSubscribed) {
		throw new Error("Email is already subscribed to newsletter");
	}

	const subscriber = await prisma.newsletter.update({
		where: { email: payload.email },
		data: {
			name: payload.name,
			isSubscribed: true,
			unsubscribedAt: null,
			isDeleted: false,
			isDeletedAt: null,
		},
	});

	try {
		await sendNewsletterThankYouEmail(payload);
	} catch (emailError) {
		console.error("Newsletter welcome email failed:", emailError);
	}

	return { subscriber, action: "resubscribed" as const };
};

const unsubscribeNewsletter = async (email: string) => {
	const subscriber = await prisma.newsletter.findUnique({
		where: { email },
	});

	if (!subscriber || subscriber.isDeleted) {
		throw new Error("Subscriber not found");
	}

	if (!subscriber.isSubscribed) {
		return subscriber;
	}

	return await prisma.newsletter.update({
		where: { email },
		data: {
			isSubscribed: false,
			unsubscribedAt: new Date(),
		},
	});
};

const sendBulkNewsletterEmail = async (payload: SendBulkNewsletterPayload) => {
	const subscribers = await prisma.newsletter.findMany({
		where: {
			email: { in: payload.emails },
			isSubscribed: true,
			isDeleted: false,
		},
		select: {
			email: true,
			name: true,
		},
	});

	const validRecipientEmails = subscribers.map((subscriber) => subscriber.email);
	const validEmailSet = new Set(validRecipientEmails);
	const invalidOrUnsubscribed = payload.emails.filter(
		(email) => !validEmailSet.has(email),
	);

	if (validRecipientEmails.length === 0) {
		return {
			totalRequested: payload.emails.length,
			sentCount: 0,
			failedCount: 0,
			invalidOrUnsubscribed,
			failedRecipients: [] as string[],
		};
	}

	const htmlMessage = payload.message
		.split("\n")
		.map((line) => line.trim())
		.join("<br/>");

	const mailResults = await Promise.allSettled(
		subscribers.map((subscriber) =>
			transporter.sendMail({
				from: `"${process.env.USER_NAME || "SkillBridge"}" <${process.env.APP_USER}>`,
				to: subscriber.email,
				subject: payload.subject,
				html: `<p>Hi ${subscriber.name},</p><p>${htmlMessage}</p>`,
			}),
		),
	);

	const failedRecipients = subscribers
		.filter((_, index) => mailResults[index]?.status === "rejected")
		.map((subscriber) => subscriber.email);

	return {
		totalRequested: payload.emails.length,
		sentCount: validRecipientEmails.length - failedRecipients.length,
		failedCount: failedRecipients.length,
		invalidOrUnsubscribed,
		failedRecipients,
	};
};

export const newsletterService = {
	subscribeNewsletter,
	unsubscribeNewsletter,
	sendBulkNewsletterEmail,
};
