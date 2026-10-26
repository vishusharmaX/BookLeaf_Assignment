/**
 * BookLeaf Publishing Knowledge Base
 * Centralized, version-controlled policy and operational guidelines.
 */

export const BOOKLEAF_KNOWLEDGE_BASE = {
  company: {
    name: "BookLeaf Publishing",
    description: "A premier self-publishing company processing 1,200+ books monthly across a catalog of 22,000+ titles in India and the US.",
    packages: [
      { name: "Standard Free", description: "Zero upfront cost publishing package." },
      { name: "Bestseller Breakthrough", description: "Premium paid package with marketing and distribution add-ons." },
    ],
    services: [
      "Cover Design",
      "Typesetting & Formatting",
      "ISBN Assignment & Registration",
      "Printing & Binding",
      "Multi-channel Distribution",
      "Royalty Accounting & Payouts",
    ],
    facilities: "In-house printing facility and warehouse located in Delhi.",
    printPartners: ["In-House (Delhi)", "Repro India", "Epitome Books"],
  },

  royaltyPolicy: {
    split: "80% of net profit to Author, 20% to BookLeaf.",
    netProfitFormula: "MRP minus printing cost, platform commission (Amazon/Flipkart), and shipping charges.",
    calculationCycle: "Royalties are calculated quarterly.",
    payoutTimeline: "Paid within 45 days of the quarter ending.",
    minimumPayoutThreshold: 1000, // ₹1,000
    belowThresholdRule: "Accumulated royalties below ₹1,000 roll over automatically to the subsequent quarter.",
    disbursementMethod: "Direct bank transfer to the verified bank account linked in the author dashboard.",
    breakdownAccess: "Authors can view detailed line-by-line royalty breakdowns by platform in their author portal.",
  },

  isbnPolicy: {
    assignment: "Every book published through BookLeaf receives a unique ISBN assigned under the BookLeaf publisher imprint.",
    independentImprint: "Authors desiring their own imprint must independently procure their own ISBN.",
    errorHandling: "Any reported ISBN mismatch, duplicate, or wrong book link is treated as a Critical/High-priority incident and escalated to the production team immediately with a 48-hour resolution timeline.",
  },

  printingAndQuality: {
    turnaround: "Standard print turnaround is 5–7 business days from order confirmation.",
    fulfillment: "In-house printing handles most orders; Repro India and Epitome Books handle overflow or specialized formats.",
    qualityDefects: "Verified printing-quality defects (misprints, binding issues, color shifts, cut errors) qualify for an expedited FREE reprint.",
    verificationRequirement: "The author must provide clear photographs of the defective copies for verification.",
    reprintTimeline: "Reprint dispatched within 5–7 business days after photo verification.",
  },

  distributionAndAvailability: {
    channels: ["Amazon India", "Flipkart", "Amazon US", "Amazon UK", "BookLeaf Store"],
    goLiveTimeline: "New listings typically go live within 7–10 business days after publication is complete.",
    outOfStockSync: "If a published book shows as 'Currently Unavailable' or out of stock, it indicates a distributor stock sync issue. Operations triggers a re-sync within 24–48 hours.",
  },

  productionStages: [
    "Manuscript Received",
    "Editing (if opted)",
    "Cover Design",
    "Typesetting",
    "Proofreading",
    "ISBN Assignment",
    "Printing",
    "Distribution Setup",
    "Published & Live",
  ],
  productionDelays: "Delays typically occur during Cover Design (waiting for author feedback/approval) or Proofreading (author revision rounds).",

  communicationTone: {
    mindset: "Authors are creative partners, not support tickets to be dismissed.",
    empathy: "Always acknowledge the author's creative effort, frustration, and concern before offering solutions.",
    specificity: "Cite actual numbers, dates, statuses, and policy calculations rather than vague assurances.",
    ownership: "If a delay or mistake is on BookLeaf's side (e.g. late royalty, metadata glitch), take direct responsibility without corporate deflection.",
    commitments: "Provide clear investigation timelines (e.g., 'Our production team will resolve this within 48 hours') rather than open-ended promises.",
    nextStep: "Always conclude every communication with an explicit next step for either BookLeaf or the author.",
  },

  accuracyRules: [
    "NEVER invent or fabricate next payout dates without verifying the applicable quarter schedule.",
    "NEVER claim a payment, reprint, or platform re-sync has already been executed unless verified in the operational records.",
    "For unresolved issues, draft a concrete next investigation step with a 24-48 hour window.",
  ],
};

export const CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
] as const;

export type TicketCategory = (typeof CATEGORIES)[number];

export const PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;
export type TicketPriority = (typeof PRIORITIES)[number];

export const TICKET_STATUSES = ["Open", "In Progress", "Resolved", "Closed"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];
