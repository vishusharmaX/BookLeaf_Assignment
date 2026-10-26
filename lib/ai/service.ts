import {
  AIClassificationResult,
  AIClassificationSchema,
  AIDraftResult,
  AIDraftSchema,
  TicketContextForAI,
} from "./types";
import { buildClassificationPrompt, buildDraftReplyPrompt } from "./prompts";
import { CATEGORIES, PRIORITIES, TicketCategory, TicketPriority } from "./knowledgeBase";

/**
 * Intelligent Rule-Based Classification Engine
 * Serves as an instant, zero-cost, resilient baseline and fallback
 * calibrated directly against the BookLeaf assignment dataset & sample queries.
 */
function classifyRuleBased(context: TicketContextForAI): AIClassificationResult {
  const text = `${context.subject} ${context.description}`.toLowerCase();

  // 1. ISBN & Metadata
  if (
    text.includes("isbn") ||
    text.includes("barcode") ||
    text.includes("imprint") ||
    text.includes("wrong book") ||
    text.includes("duplicate isbn")
  ) {
    const isCritical = text.includes("duplicate") || text.includes("mismatch") || text.includes("wrong");
    return {
      category: "ISBN & Metadata Issues",
      priority: isCritical ? "High" : "Medium",
      reasoning: "Query relates to ISBN identification or catalog metadata integrity.",
      suggestedNextStep: "Cross-reference registered ISBN with Bowker/BookLeaf imprint records and escalate to production team if duplicate.",
    };
  }

  // 2. Royalty & Payments
  if (
    text.includes("royalty") ||
    text.includes("payment") ||
    text.includes("payout") ||
    text.includes("bank") ||
    text.includes("quarter") ||
    text.includes("net profit") ||
    text.includes("earning") ||
    text.includes("money") ||
    text.includes("₹") ||
    text.includes("rs")
  ) {
    const isProlonged =
      text.includes("month") ||
      text.includes("overdue") ||
      text.includes("haven't received") ||
      text.includes("never received") ||
      text.includes("missing");
    return {
      category: "Royalty & Payments",
      priority: isProlonged ? "High" : "Medium",
      reasoning: "Query regards royalty balance, payout schedule, or bank transfer disbursement.",
      suggestedNextStep: "Check author's linked bank details and verify if accumulated royalties cross the ₹1,000 payout threshold.",
    };
  }

  // 3. Printing & Quality
  if (
    text.includes("print") ||
    text.includes("quality") ||
    text.includes("defective") ||
    text.includes("binding") ||
    text.includes("blurry") ||
    text.includes("misaligned") ||
    text.includes("damaged") ||
    text.includes("copies") ||
    text.includes("cover smudge")
  ) {
    const isSevere = text.includes("terrible") || text.includes("ruined") || text.includes("defective");
    return {
      category: "Printing & Quality",
      priority: isSevere ? "High" : "Medium",
      reasoning: "Author reports physical copy defects, print anomalies, or author copy delivery issues.",
      suggestedNextStep: "Request photographic evidence of defects to arrange an expedited free reprint with Delhi in-house printing.",
    };
  }

  // 4. Distribution & Availability
  if (
    text.includes("amazon") ||
    text.includes("flipkart") ||
    text.includes("unavailable") ||
    text.includes("out of stock") ||
    text.includes("listing") ||
    text.includes("store") ||
    text.includes("distribution")
  ) {
    return {
      category: "Distribution & Availability",
      priority: text.includes("unavailable") || text.includes("out of stock") ? "High" : "Medium",
      reasoning: "Inquiry regarding book availability or inventory sync across retail channels.",
      suggestedNextStep: "Trigger a distributor inventory re-sync with Amazon/Flipkart within 24-48 hours.",
    };
  }

  // 5. Book Status & Production Updates
  if (
    text.includes("typesetting") ||
    text.includes("cover design") ||
    text.includes("proof") ||
    text.includes("proofreading") ||
    text.includes("stage") ||
    text.includes("in production") ||
    text.includes("when will it be") ||
    text.includes("timeline") ||
    text.includes("delay")
  ) {
    return {
      category: "Book Status & Production Updates",
      priority: text.includes("delay") || text.includes("weeks") ? "Medium" : "Low",
      reasoning: "Author seeking status update on manuscript progress through production pipeline.",
      suggestedNextStep: "Check current production milestone stage and communicate realistic next review milestone.",
    };
  }

  // 6. Default to General Inquiry
  return {
    category: "General Inquiry",
    priority: "Low",
    reasoning: "General administrative or informational author query.",
    suggestedNextStep: "Review author details and provide guidance as per BookLeaf support guidelines.",
  };
}

/**
 * Intelligent Rule-Based Response Drafter
 * Employs BookLeaf tone guidelines and specific policy logic.
 */
function draftRuleBased(
  context: TicketContextForAI,
  category: TicketCategory,
  priority: TicketPriority
): AIDraftResult {
  const authorName = context.authorName || "Author";
  const bookTitle = context.bookTitle ? `"${context.bookTitle}"` : "your book";

  if (category === "Royalty & Payments") {
    return {
      draftReply: `Dear ${authorName},

Thank you for reaching out to BookLeaf Publishing regarding your royalty account. We completely understand the importance of timely and transparent royalty disbursements.

At BookLeaf, royalties follow an 80/20 net profit split (80% to the author, 20% to BookLeaf), where net profit is calculated as the book's MRP minus print cost, retail platform commission, and shipping. Royalties are calculated quarterly and disbursed within 45 days of each quarter ending, subject to the minimum threshold of ₹1,000. Any balance below ₹1,000 automatically rolls over into the subsequent quarter.

We are currently reviewing your linked bank transfer records. We will confirm your payout status and provide a comprehensive platform breakdown within the next 24 to 48 hours.

Warm regards,
Author Relations Team
BookLeaf Publishing`,
      internalSummary: `Royalty query for ${authorName}. Verified 80/20 calculation policy and 45-day quarterly payout schedule.`,
      suggestedAction: "Check author dashboard bank account linkage and confirm pending payout balance.",
      requiresEscalation: priority === "High" || priority === "Critical",
    };
  }

  if (category === "ISBN & Metadata Issues") {
    return {
      draftReply: `Dear ${authorName},

Thank you for bringing this ISBN matter to our attention. We take catalog accuracy and identifier integrity very seriously, as an accurate ISBN is crucial for your book's distribution and sales tracking.

All BookLeaf titles receive a unique ISBN registered under the BookLeaf publisher imprint. We have flagged this ticket for immediate priority review with our production and cataloging team. We are verifying the metadata links across our distribution feeds to resolve any discrepancies.

Our production team is actively investigating, and we will update you with a verified status within 48 hours.

Warm regards,
Cataloging & Production Support
BookLeaf Publishing`,
      internalSummary: `Escalated ISBN query for ${bookTitle}. Immediate catalog verification needed.`,
      suggestedAction: "Check Bowker/Nielsen ISBN registry and verify retail feed data for mismatches.",
      requiresEscalation: true,
    };
  }

  if (category === "Printing & Quality") {
    return {
      draftReply: `Dear ${authorName},

We are genuinely sorry to hear that your author copies did not arrive in the pristine condition you and your readers deserve. We take great pride in our printing standards, and we sincerely apologize for this frustration.

Under BookLeaf's quality guarantee, any verified printing or binding defect qualifies for an expedited free reprint from our Delhi printing facility. To help us process this promptly with our print quality assurance team, could you please reply to this ticket with 2–3 clear photos showing the defects (such as misaligned margins, binding issues, or color inconsistencies)?

Once received and verified, we will arrange a complimentary reprint dispatched within 5 to 7 business days.

Warm regards,
Print Quality Assurance
BookLeaf Publishing`,
      internalSummary: `Print quality issue reported for ${bookTitle}. Free reprint procedure initiated.`,
      suggestedAction: "Await defect photos from author, then trigger free replacement reprint order.",
      requiresEscalation: false,
    };
  }

  if (category === "Distribution & Availability") {
    return {
      draftReply: `Dear ${authorName},

Thank you for contacting us regarding the retail availability of ${bookTitle}.

When a published book temporarily displays as "Currently Unavailable" or out of stock on channels like Amazon India or Flipkart, it typically indicates a distributor inventory stock synchronization delay rather than an actual discontinuation.

Our distribution team is initiating a catalogue re-sync with our retail partners today. Platform updates typically reflect live within 24 to 48 hours. We will monitor the retail listing until availability is fully restored.

Warm regards,
Distribution Support
BookLeaf Publishing`,
      internalSummary: `Stock sync delay for ${bookTitle}. Retail re-sync initiated.`,
      suggestedAction: "Trigger retail distribution feed refresh for Amazon and Flipkart.",
      requiresEscalation: false,
    };
  }

  if (category === "Book Status & Production Updates") {
    return {
      draftReply: `Dear ${authorName},

Thank you for checking in on the production progress of ${bookTitle}. We know how exciting it is to see your manuscript transform into a published book.

Our production workflow follows structured editorial stages: Manuscript Review -> Typesetting -> Proofreading -> ISBN Assignment -> Printing -> Distribution. At each milestone, we ensure your book meets high publication standards.

We have contacted the production coordinator handling your manuscript to get an exact milestone status and estimated proof delivery date. We will provide you with a concrete timeline update within 24 to 48 hours.

Warm regards,
Editorial Production Team
BookLeaf Publishing`,
      internalSummary: `Production status query for ${bookTitle}. Coordinating with editorial desk.`,
      suggestedAction: "Check project manager milestone tracker and communicate concrete proof date.",
      requiresEscalation: false,
    };
  }

  // General Inquiry default
  return {
    draftReply: `Dear ${authorName},

Thank you for reaching out to BookLeaf Publishing. We are delighted to assist you with your inquiry regarding ${bookTitle}.

We are reviewing your request in detail and aligning with our operations team to ensure you receive the most accurate guidance. We will provide a comprehensive response within 24 business hours.

If you have any additional details or files to share in the meantime, please feel free to reply directly to this thread.

Warm regards,
Author Support Team
BookLeaf Publishing`,
    internalSummary: `General author inquiry for ${authorName}.`,
    suggestedAction: "Review query details and respond with relevant documentation.",
    requiresEscalation: false,
  };
}

/**
 * Main AI Classification Entrypoint
 */
export async function classifyTicket(context: TicketContextForAI): Promise<AIClassificationResult> {
  const apiKey = process.env.AI_API_KEY;
  const provider = (process.env.AI_PROVIDER || "rule_engine").toLowerCase();

  // If external provider is requested and key exists, attempt LLM call with structured output
  if (apiKey && provider === "openai") {
    try {
      const prompt = buildClassificationPrompt(context);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 300,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const validated = AIClassificationSchema.safeParse(parsed);
          if (validated.success) {
            return validated.data;
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ AI classification provider error, falling back to rule engine:", err);
    }
  }

  // High-accuracy fallback rule engine
  return classifyRuleBased(context);
}

/**
 * Main AI Draft Generation Entrypoint
 */
export async function generateDraftReply(
  context: TicketContextForAI,
  category: TicketCategory,
  priority: TicketPriority
): Promise<AIDraftResult> {
  const apiKey = process.env.AI_API_KEY;
  const provider = (process.env.AI_PROVIDER || "rule_engine").toLowerCase();

  if (apiKey && provider === "openai") {
    try {
      const prompt = buildDraftReplyPrompt(context, category, priority);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 600,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const validated = AIDraftSchema.safeParse(parsed);
          if (validated.success) {
            return validated.data;
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ AI draft provider error, falling back to knowledge engine:", err);
    }
  }

  // Resilient rule-based knowledge drafter
  return draftRuleBased(context, category, priority);
}
