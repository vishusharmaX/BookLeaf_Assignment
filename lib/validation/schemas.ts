import { z } from "zod";
import { CATEGORIES, PRIORITIES, TICKET_STATUSES } from "@/lib/ai/knowledgeBase";

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const CreateTicketSchema = z.object({
  bookId: z.string().nullable().optional(),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters.")
    .max(150, "Subject cannot exceed 150 characters."),
  description: z
    .string()
    .min(15, "Please provide more details (at least 15 characters).")
    .max(3000, "Description cannot exceed 3,000 characters."),
  attachmentUrl: z.string().url().nullable().optional(),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;

export const CreateMessageSchema = z.object({
  body: z.string().min(2, "Reply cannot be empty.").max(4000, "Message cannot exceed 4,000 characters."),
});

export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;

export const CreateNoteSchema = z.object({
  body: z.string().min(2, "Note cannot be empty.").max(2000, "Note cannot exceed 2,000 characters."),
});

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;

export const UpdateTicketSchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  category: z.enum(CATEGORIES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  assignedAdminId: z.string().nullable().optional(),
});

export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;

export const AssignTicketSchema = z.object({
  adminId: z.string().nullable(),
});

export type AssignTicketInput = z.infer<typeof AssignTicketSchema>;
