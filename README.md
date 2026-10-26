# BookLeaf Author Support & Communication Portal

A full-stack, enterprise-grade publishing SaaS application built for **BookLeaf Publishing**. The platform provides dual interfaces:
1. **Author Portal** — Enables authors to manage their published titles and works in production, monitor quarterly royalties, submit support queries, and communicate in real time with the publishing team.
2. **Operations Admin Portal** — Equips the BookLeaf team with an intelligent command center featuring AI-assisted ticket triage, category classification across the 6 approved publishing categories, automated priority scoring, response drafting based on BookLeaf corporate policies, and real-time messaging.

---

## Live Demo & Verified Reviewer Accounts

The application includes pre-configured, one-click demo logins on the sign-in page:

| Role | Account Name | Email | Password | Context |
|---|---|---|---|---|
| **Author (High Earner)** | Priya Sharma (`AUTH001`) | `priya.sharma@email.com` | `AuthorPassword123!` | 2 published books, ₹3,570 pending royalty |
| **Author (Production Edge)** | Sneha Kulkarni (`AUTH007`) | `sneha.kulkarni@email.com` | `AuthorPassword123!` | 3 books, including *Midnight in Mysore* in Cover Design |
| **Author (Pending Payout)** | Ananya Reddy (`AUTH003`) | `ananya.reddy@email.com` | `AuthorPassword123!` | 1 book, zero previous payouts, ₹2,546 pending |
| **Operations Admin** | BookLeaf Operations | `admin@bookleafpublishing.in` | `AdminPassword123!` | Full admin queue, AI classification override, AI drafts |
| **Operations Lead** | Vikas Sharma | `vikas.ops@bookleafpublishing.in` | `AdminPassword123!` | Operations lead account for assignment testing |

> **Evaluator Tip:** On the login page (`/login`), click any demo account card to sign in with a single click. In the top-right profile menu, use the **Quick Reviewer Switch** to alternate between authors and admin instantly without re-authenticating.

---

## Core Features Implemented

### 1. Author Experience
- **Author Overview Dashboard**: Accurately calculates metrics directly from database records:
  - Total Books, Published Titles, Titles in Production.
  - Total Copies Sold across retail channels (Amazon India, Flipkart, BookLeaf Store).
  - Total Royalties Earned, Disbursed, and Pending.
  - Active Support Ticket indicators.
- **My Books Catalogue**:
  - Full metadata: Title, ISBN, Genre, Publication Date, MRP, Royalty/Copy, Lifetime Units Sold, Total Royalties, Print Partner, Distribution Channels.
  - Explicit handling of edge cases: books in production display `"In Production"` with no fabricated dates or MRPs.
  - Interactive **Book Details Modal** showing platform distribution availability and related historical queries.
  - Real-time search by title or ISBN, status filtering, and multi-field sorting.
- **Submit Support Query**:
  - Book selector dropdown populated strictly with the authenticated author's books, plus a `"General / Account Level"` option.
  - Server-side book ownership enforcement (authors cannot submit queries for books they do not own).
  - Optional file attachment UI with drag-and-drop preview.
  - Immediate persistence with non-blocking AI triage.
- **My Tickets & Real-Time Conversation**:
  - Chronological ticket list with status indicators (`Open`, `In Progress`, `Resolved`, `Closed`).
  - Real-time conversation view using **Server-Sent Events (SSE)**. Admin replies and status changes appear live without page refreshes.
  - Strict privacy: author views explicitly exclude internal team notes.

### 2. Operations Admin Experience
- **Command Center Dashboard**:
  - Real-time operational metrics: Awaiting Action, High & Critical, In Progress, Resolved.
  - **Oldest Unresolved Tickets** queue with aging indicators to prevent SLA breaches.
  - AI Category distribution breakdown.
- **Ticket Queue Management**:
  - Filter by Status (`Open`, `In Progress`, `Resolved`, `Closed`).
  - Filter by AI Category (the 6 required categories).
  - Filter by Priority (`Critical`, `High`, `Medium`, `Low`).
  - Search by ticket reference, author name, email, or subject.
  - Server-side pagination with active filter indicators.
- **Admin Ticket Workspace**:
  - Author and book information panels with lifetime commercial statistics.
  - **AI Intelligence Card**:
    - AI-predicted category and priority.
    - Full admin override capabilities.
    - AI reasoning explanation and suggested next action.
    - One-click `"Re-run AI Analysis"`.
  - **AI Response Drafting Assistant**:
    - Generates drafts grounded in the centralized BookLeaf Knowledge Base (80/20 split, 45-day quarterly payout cycle, ₹1,000 threshold, 5–7 day reprint timeline, 24–48 hr distribution re-sync).
    - Editable draft composer: admins review and customize before sending. AI drafts are **never** dispatched automatically.
  - **Internal Team Notes**:
    - Private operational notes visible exclusively to administrators.
    - Strictly omitted from author streams, public queries, and public events.
  - **Audit Trail Log**:
    - Chronological log of status transitions, priority overrides, and assignments.

---

## Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Route Handlers).
- **Language**: TypeScript with strict type checking (`tsc --noEmit` clean).
- **Database & ORM**: PostgreSQL-ready schema with [Prisma ORM](https://www.prisma.io/). Powered by SQLite for zero-configuration, instant local evaluation, with a supplied `docker-compose.yml` for PostgreSQL.
- **Authentication**: JWT-based session management using `jose` with secure, HttpOnly, SameSite cookies and bcrypt password hashing.
- **Styling & UI**: Tailwind CSS, Lucide React icons, bespoke editorial design system with responsive layouts and accessible color contrasts.
- **Real-Time Engine**: HTTP/2 Server-Sent Events (SSE) stream `/api/tickets/[id]/stream` with authorized channel pub-sub.
- **AI Integration**: Modular multi-provider service supporting OpenAI (`gpt-4o-mini`), Google Gemini, and a built-in deterministic BookLeaf Knowledge Engine fallback.
- **Validation**: Zod schema validation across all inputs and API boundaries.
- **Testing**: Vitest for unit, service, security, and data consistency tests.

---

## Directory Structure

```
d:/Coding/BookLeaf_Assignment/
├── app/
│   ├── (author)/                 # Author portal layout & pages
│   │   ├── author/dashboard/     # Overview & commercial stats
│   │   ├── author/books/         # Catalog & book modal
│   │   └── author/tickets/       # Ticket listing, new ticket, conversation
│   ├── admin/                    # Admin operations portal
│   │   ├── dashboard/            # Operations KPIs & SLA alerts
│   │   └── tickets/              # Ticket queue & detail workspace
│   ├── api/                      # REST API endpoints
│   │   ├── auth/                 # Login, logout, session status
│   │   ├── books/                # Book catalog & details
│   │   └── tickets/              # Tickets, messages, notes, AI routes, SSE stream
│   ├── globals.css               # Editorial design tokens
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Root redirection logic
│   └── login/page.tsx            # Sign-in & demo account cards
├── components/
│   ├── ui/                       # Badge, Button, Input primitives
│   ├── layout/                   # Navbar, AuthorSidebar, AdminSidebar
│   └── books/                    # BookDetailsModal
├── lib/
│   ├── auth/                     # JWT signing, cookie verification, guards
│   ├── db/                       # Prisma client singleton
│   ├── ai/                       # Knowledge base, prompts, types, multi-provider service
│   ├── realtime/                 # Event bus for SSE streaming
│   └── validation/               # Zod input schemas
├── services/                     # Business logic & repository layer
│   ├── books/                    # Book statistics & query service
│   ├── tickets/                  # Ticket creation, reply, note, override service
│   └── admin/                    # Dashboard analytics service
├── prisma/
│   ├── schema.prisma             # Relational data models & indexes
│   └── seed.ts                   # Idempotent seed script (10 authors, 18 books)
├── tests/
│   └── unit/                     # Automated business logic & security tests
├── docs/
│   ├── approach.md               # 1-page technical approach writeup
│   └── api.md                    # REST API specification
├── bookleaf_sample_data.json     # Exact assignment sample dataset
└── docker-compose.yml            # Local PostgreSQL container config
```

---

## Getting Started Locally

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node `v24.14.1`).
- npm `10+`.

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Copy the example environment configuration:
```bash
cp .env.example .env
```
Default `.env` configuration:
```ini
DATABASE_URL="file:./dev.db"
AUTH_SECRET="bookleaf-secure-production-auth-secret-key-32chars"
AI_PROVIDER="rule_engine"
AI_API_KEY=""
AI_MODEL="gpt-4o-mini"
APP_URL="http://localhost:3000"
```
*(Optional)* If you wish to use live OpenAI or Gemini models, set `AI_PROVIDER="openai"` and paste your `AI_API_KEY`. If left blank, the application automatically runs the built-in BookLeaf Knowledge Engine with zero external dependencies.

### 3. Database Migration & Idempotent Seeding
Push the database schema and populate all 10 authors, 18 books, and initial tickets:
```bash
# Push Prisma schema
npx prisma db push

# Run idempotent seed script
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Quality Assurance

Run the automated test suite covering database counts, edge cases, author dashboard calculations, AI classification accuracy, prompt compliance, and authorization security:
```bash
npm test
```

### Test Coverage Highlights:
- **Sample Dataset Integrity**: Confirms 10 authors and 18 books imported.
- **Edge Case Correctness**: Verifies null publication dates, null MRPs, zero payouts, pending royalties, and production stages.
- **Metric Verification**: Validates arithmetic totals for lifetime royalties and copies sold.
- **AI Classification**: Verifies categorization across the 6 approved BookLeaf categories.
- **Security & Authorization**: Verifies that authors cannot raise tickets for books they do not own, and cannot view or create internal team notes.

---

## AI Architecture & Cost Awareness

### 1. Six Approved Categories
The AI classification engine classifies incoming queries into:
1. `Royalty & Payments`
2. `ISBN & Metadata Issues`
3. `Printing & Quality`
4. `Distribution & Availability`
5. `Book Status & Production Updates`
6. `General Inquiry`

### 2. Four Priority Scores
Tickets receive one of four priority scores: `Critical`, `High`, `Medium`, `Low`.

### 3. Token & Cost Optimization
- **Targeted Context Injection**: Only the relevant policy sections from the Knowledge Base are sent to the LLM.
- **Bounded History**: Draft generation limits previous message context to the 3 most recent entries, avoiding unnecessary token bloat.
- **Strict Temperature Settings**: Classification uses temperature `0.1` for deterministic categorization; response drafting uses `0.3` for professional, empathetic phrasing.
- **Zero-Wait Ticket Creation**: Ticket records are committed to the database before initiating AI processing, preventing author submission lag if the AI provider experiences latency.

---

## Production Deployment

### Option A: Managed PostgreSQL + Vercel / Railway / Render
1. Set `provider = "postgresql"` in `prisma/schema.prisma`.
2. Configure `DATABASE_URL` with your managed PostgreSQL connection string (e.g., Neon, Supabase, Railway).
3. Set `AUTH_SECRET` and `APP_URL`.
4. Deploy the build using `npm run build && npm run start`.

### Option B: Docker Compose (Local PostgreSQL)
```bash
docker-compose up -d
```
Update `DATABASE_URL` in `.env`:
```ini
DATABASE_URL="postgresql://postgres:password123@localhost:5432/bookleaf_db?schema=public"
```
Run migrations and seed:
```bash
npx prisma db push
npm run db:seed
npm run dev
```

---

## Submission Compliance Note

Per the assignment confidentiality guidelines, this technical implementation has been prepared with clean git progression, thorough automated testing, and comprehensive documentation for review.
