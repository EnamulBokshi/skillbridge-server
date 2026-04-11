import path from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";
import transporter from "../../lib/nodeMailerTransport.js";
import { prisma } from "../../lib/prisma.js";
import { ContactStatus } from "../../generated/prisma/enums.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const THANK_YOU_TEMPLATE_PATH = path.join(
  __dirname,
  "../../templates/thankYouEmail.ejs",
);
const FEEDBACK_REPLY_TEMPLATE_PATH = path.join(
  __dirname,
  "../../templates/feedbackReplyEmail.ejs",
);

type CreateContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string | undefined;
};

const createContact = async (payload: CreateContactPayload) => {
  return await prisma.contact.create({
    data: {
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
      ...(payload.userId ? { userId: payload.userId } : {}),
    },
  });
};

const getContacts = async (query: {
  page?: number;
  limit?: number;
  status?: ContactStatus;
  search?: string;
}) => {
  const page = Math.max(query.page || 1, 1);
  const limit = Math.min(Math.max(query.limit || 10, 1), 50);
  const skip = (page - 1) * limit;

  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { email: { contains: query.search, mode: "insensitive" as const } },
            { subject: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ createdAt: "desc" }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        repliedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.contact.count({ where }),
  ]);

  return {
    contacts,
    pagination: {
      page,
      limit,
      totalRecords: total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getContactById = async (id: string) => {
  return await prisma.contact.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      repliedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

const getUserContacts = async (userId: string, page = 1, limit = 10) => {
  const safePage = Math.max(page, 1);
  const safeLimit = Math.min(Math.max(limit, 1), 30);
  const skip = (safePage - 1) * safeLimit;

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where: { userId },
      skip,
      take: safeLimit,
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.contact.count({ where: { userId } }),
  ]);

  return {
    contacts,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalRecords: total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

const updateContactStatus = async (id: string, status: ContactStatus) => {
  return await prisma.contact.update({
    where: { id },
    data: { status },
  });
};

const replyToContact = async (params: {
  id: string;
  reply: string;
  repliedById: string;
}) => {
  return await prisma.contact.update({
    where: { id: params.id },
    data: {
      adminReply: params.reply,
      status: ContactStatus.REPLIED,
      repliedAt: new Date(),
      repliedById: params.repliedById,
    },
  });
};

const sendThankYouEmail = async (payload: {
  name: string;
  email: string;
}) => {
  const html = await ejs.renderFile(THANK_YOU_TEMPLATE_PATH, {
    user: { name: payload.name },
    appUrl: process.env.APP_URL,
    dashboardUrl: process.env.APP_URL,
    sessionsUrl: process.env.APP_URL,
    supportEmail: process.env.APP_USER || "support@skillbridge.com",
  });

  await transporter.sendMail({
    from: `"${process.env.USER_NAME || "SkillBridge"}" <${process.env.APP_USER}>`,
    to: payload.email,
    subject: "Thanks for contacting SkillBridge",
    html,
  });
};

const sendAdminReplyEmail = async (payload: {
  name: string;
  email: string;
  subject: string;
  originalMessage: string;
  adminReply: string;
}) => {
  const html = await ejs.renderFile(FEEDBACK_REPLY_TEMPLATE_PATH, {
    name: payload.name,
    subject: payload.subject,
    originalMessage: payload.originalMessage,
    adminReply: payload.adminReply,
    supportEmail: process.env.APP_USER || "support@skillbridge.com",
    appUrl: process.env.APP_URL,
  });

  await transporter.sendMail({
    from: `"${process.env.USER_NAME || "SkillBridge Support"}" <${process.env.APP_USER}>`,
    to: payload.email,
    subject: `Re: ${payload.subject}`,
    html,
  });
};

export const contactService = {
  createContact,
  getContacts,
  getContactById,
  getUserContacts,
  updateContactStatus,
  replyToContact,
  sendThankYouEmail,
  sendAdminReplyEmail,
};
