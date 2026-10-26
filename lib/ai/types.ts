import { z } from "zod";
import { CATEGORIES, PRIORITIES } from "./knowledgeBase";

export const AIClassificationSchema = z.object({
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES),
  reasoning: z.string().min(5),
  suggestedNextStep: z.string().min(5),
});

export type AIClassificationResult = z.infer<typeof AIClassificationSchema>;

export const AIDraftSchema = z.object({
  draftReply: z.string().min(20),
  internalSummary: z.string().min(5),
  suggestedAction: z.string().min(5),
  requiresEscalation: z.boolean(),
});

export type AIDraftResult = z.infer<typeof AIDraftSchema>;

export interface TicketContextForAI {
  ticketNumber?: string;
  subject: string;
  description: string;
  bookTitle?: string | null;
  bookStatus?: string | null;
  bookIsbn?: string | null;
  authorName?: string;
  previousMessages?: Array<{
    senderRole: "AUTHOR" | "ADMIN";
    senderName: string;
    body: string;
    createdAt: string | Date;
  }>;
}
