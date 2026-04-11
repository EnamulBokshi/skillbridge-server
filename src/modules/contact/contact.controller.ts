import { Request, Response } from "express";
import { ContactStatus } from "../../generated/prisma/enums.js";
import { UserRole } from "../../constants/userRole.js";
import { errorResponse } from "../../helpers/errorResponse.js";
import { successResponse } from "../../helpers/successResponse.js";
import { contactService } from "./contact.service.js";

const parseQueryNumber = (value: unknown, fallback: number): number => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

const parseStatus = (value: unknown): ContactStatus | undefined => {
  if (typeof value !== "string") return undefined;
  const upper = value.toUpperCase();
  if (upper === "NEW") return ContactStatus.NEW;
  if (upper === "IN_REVIEW") return ContactStatus.IN_REVIEW;
  if (upper === "REPLIED") return ContactStatus.REPLIED;
  if (upper === "CLOSED") return ContactStatus.CLOSED;
  return undefined;
};

const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    const payload = {
      name,
      email,
      subject,
      message,
      ...(req.user?.id ? { userId: req.user.id } : {}),
    };

    const created = await contactService.createContact(payload);

    try {
      await contactService.sendThankYouEmail({ name, email });
    } catch (emailError) {
      console.error("Contact thank-you email failed:", emailError);
    }

    return successResponse(
      res,
      201,
      created,
      "Contact form submitted successfully",
    );
  } catch (error) {
    console.error("Error creating contact:", error);
    return errorResponse(res, 500, error, "Failed to submit contact form");
  }
};

const getContacts = async (req: Request, res: Response) => {
  try {
    const page = parseQueryNumber(req.query.page, 1);
    const limit = parseQueryNumber(req.query.limit, 10);
    const status = parseStatus(req.query.status);
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    const query = {
      page,
      limit,
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
    };

    const result = await contactService.getContacts(query);

    return successResponse(res, 200, result, "Contacts fetched successfully");
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return errorResponse(res, 500, error, "Failed to fetch contacts");
  }
};

const getMyContacts = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return errorResponse(res, 401, null, "Unauthorized access");
    }

    const page = parseQueryNumber(req.query.page, 1);
    const limit = parseQueryNumber(req.query.limit, 10);

    const result = await contactService.getUserContacts(req.user.id, page, limit);
    return successResponse(res, 200, result, "Your contacts fetched successfully");
  } catch (error) {
    console.error("Error fetching user contacts:", error);
    return errorResponse(res, 500, error, "Failed to fetch your contacts");
  }
};

const getContactById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return errorResponse(res, 400, null, "Contact ID is required");

    const contact = await contactService.getContactById(id);
    if (!contact) return errorResponse(res, 404, null, "Contact not found");

    const isAdmin = req.user?.role === UserRole.ADMIN;
    const isOwner = !!req.user?.id && contact.userId === req.user.id;

    if (!isAdmin && !isOwner) {
      return errorResponse(res, 403, null, "Forbidden");
    }

    return successResponse(res, 200, contact, "Contact fetched successfully");
  } catch (error) {
    console.error("Error fetching contact:", error);
    return errorResponse(res, 500, error, "Failed to fetch contact");
  }
};

const updateContactStatus = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return errorResponse(res, 400, null, "Contact ID is required");

    const status = parseStatus(req.body.status);
    if (!status) {
      return errorResponse(
        res,
        400,
        null,
        "Status must be one of NEW, IN_REVIEW, REPLIED, CLOSED",
      );
    }

    const existing = await contactService.getContactById(id);
    if (!existing) return errorResponse(res, 404, null, "Contact not found");

    if (existing.status === ContactStatus.CLOSED) {
      return errorResponse(
        res,
        409,
        null,
        "Closed contact cannot be moved to another status",
      );
    }

    if (existing.status === ContactStatus.REPLIED && status === ContactStatus.NEW) {
      return errorResponse(
        res,
        409,
        null,
        "Replied contact cannot be moved back to NEW",
      );
    }

    const updated = await contactService.updateContactStatus(id, status);
    return successResponse(res, 200, updated, "Contact status updated successfully");
  } catch (error) {
    console.error("Error updating contact status:", error);
    return errorResponse(res, 500, error, "Failed to update contact status");
  }
};

const replyToContact = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return errorResponse(res, 400, null, "Contact ID is required");

    const existing = await contactService.getContactById(id);
    if (!existing) return errorResponse(res, 404, null, "Contact not found");

    if (existing.status === ContactStatus.CLOSED) {
      return errorResponse(res, 409, null, "Cannot reply to a closed contact");
    }

    if (!existing.email) {
      return errorResponse(res, 400, null, "Contact email is missing");
    }

    const updated = await contactService.replyToContact({
      id,
      reply: req.body.reply,
      repliedById: req.user!.id,
    });

    try {
      await contactService.sendAdminReplyEmail({
        name: existing.name,
        email: existing.email,
        subject: existing.subject,
        originalMessage: existing.message,
        adminReply: req.body.reply,
      });
    } catch (mailError) {
      console.error("Admin reply email send failed:", mailError);
    }

    return successResponse(res, 200, updated, "Reply sent successfully");
  } catch (error) {
    console.error("Error replying to contact:", error);
    return errorResponse(res, 500, error, "Failed to reply to contact");
  }
};

export const contactController = {
  createContact,
  getContacts,
  getMyContacts,
  getContactById,
  updateContactStatus,
  replyToContact,
};
