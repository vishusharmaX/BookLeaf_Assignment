# BookLeaf Author Support Portal — REST API Reference

The BookLeaf Support Portal provides a comprehensive RESTful API for both Author and Operations Admin interactions. All endpoints enforce strict role-based access control, session validation, and Zod input validation.

---

## Authentication & Authorization

All private endpoints require an authenticated HTTP-only session cookie named `bookleaf_session` (signed JWT via `jose`).

| Role | Permissions |
|---|---|
| `AUTHOR` | Read own books, read/create own tickets, submit public replies to own tickets. |
| `ADMIN` | Read all books and tickets, override classifications and priorities, assign tickets, create internal notes, post official replies. |

---

## Endpoints Summary

### Authentication

#### `POST /api/auth/login`
Authenticate with email and password. Sets an HTTP-only session cookie.

- **Request Body:**
```json
{
  "email": "priya.sharma@email.com",
  "password": "AuthorPassword123!"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "user": {
    "id": "cl...",
    "name": "Priya Sharma",
    "email": "priya.sharma@email.com",
    "role": "AUTHOR",
    "authorId": "cl..."
  }
}
```
- **Error `401 Unauthorized`:**
```json
{
  "error": "Invalid email or password."
}
```

#### `POST /api/auth/logout`
Clears the session cookie.
- **Response `200 OK`:**
```json
{ "success": true, "message": "Logged out successfully" }
```

#### `GET /api/auth/me`
Retrieves the currently authenticated user's profile and author details.
- **Response `200 OK`:**
```json
{
  "authenticated": true,
  "user": {
    "id": "cl...",
    "name": "Priya Sharma",
    "email": "priya.sharma@email.com",
    "role": "AUTHOR",
    "authorProfile": {
      "id": "cl...",
      "externalAuthorId": "AUTH001",
      "phone": "+91-98765-43210",
      "city": "Mumbai",
      "joinedDate": "2023-03-15T00:00:00.000Z"
    }
  }
}
```

---

### Books

#### `GET /api/books`
Lists all books belonging to the authenticated author.
- **Query Parameters:**
  - `search` (optional): Filter by book title or ISBN.
  - `status` (optional): Filter by publication status (e.g. `Published & Live`, `In Production - Cover Design`).
  - `sortBy` (optional): `date` | `title` | `sold` | `royalty`.
  - `sortOrder` (optional): `asc` | `desc`.
- **Response `200 OK`:**
```json
{
  "books": [
    {
      "id": "cl...",
      "externalBookId": "BK001",
      "title": "Whispers of the Ganges",
      "isbn": "978-93-5XXXX-01-1",
      "genre": "Literary Fiction",
      "publicationDate": "2023-06-20T00:00:00.000Z",
      "status": "Published & Live",
      "mrp": 399,
      "authorRoyaltyPerCopy": 35,
      "totalCopiesSold": 342,
      "totalRoyaltyEarned": 11970,
      "royaltyPaid": 8400,
      "royaltyPending": 3570,
      "lastRoyaltyPayoutDate": "2025-10-15T00:00:00.000Z",
      "printPartner": "In-House",
      "availableOnList": ["Amazon India", "Flipkart", "BookLeaf Store"]
    }
  ]
}
```

#### `GET /api/books/:id`
Retrieves full metadata, commercial figures, and related support tickets for a specific book. Authors may only view their own books.
- **Response `200 OK`:**
```json
{
  "book": {
    "id": "cl...",
    "externalBookId": "BK001",
    "title": "Whispers of the Ganges",
    "tickets": [
      {
        "id": "cl...",
        "ticketNumber": "BL-1001",
        "subject": "Quarterly royalty query for Q3 payout",
        "status": "In Progress"
      }
    ]
  }
}
```

---

### Support Tickets

#### `GET /api/tickets`
- When called by an **Author**: Returns their own submitted tickets. Supports `?status=Open`.
- When called by an **Admin**: Returns the paginated queue across all authors. Supports:
  - `status`: `Open` | `In Progress` | `Resolved` | `Closed`
  - `category`: The 6 approved categories
  - `priority`: `Critical` | `High` | `Medium` | `Low`
  - `search`: Query text across ticket ID, author name, author email, subject, description
  - `page` (default `1`), `pageSize` (default `20`)
- **Admin Response `200 OK`:**
```json
{
  "tickets": [...],
  "pagination": {
    "totalCount": 4,
    "page": 1,
    "pageSize": 15,
    "totalPages": 1
  }
}
```

#### `POST /api/tickets`
Creates a new support query for the authenticated author. Automatically initiates AI categorization and priority scoring in the background.
- **Request Body:**
```json
{
  "bookId": "cl...", // Or null for General / Account Level
  "subject": "Quarterly royalty payout query",
  "description": "My dashboard displays ₹3,570 pending royalty. When will this be disbursed?",
  "attachmentUrl": null
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "ticket": {
    "id": "cl...",
    "ticketNumber": "BL-1004",
    "subject": "Quarterly royalty payout query",
    "category": "Royalty & Payments",
    "priority": "Medium",
    "classificationReason": "Query regards royalty balance, payout schedule, or bank transfer disbursement.",
    "suggestedNextStep": "Check author's linked bank details and verify threshold.",
    "status": "Open"
  }
}
```

#### `GET /api/tickets/:id`
Retrieves ticket conversation history and metadata.
- If called by an **Author**: Only returns public messages; strictly excludes internal notes and audit logs.
- If called by an **Admin**: Returns full operational workspace, including internal notes and audit logs.

#### `PATCH /api/tickets/:id` (Admin Only)
Overrides classification, priority, status, or assigned administrator.
- **Request Body:**
```json
{
  "status": "In Progress",
  "priority": "High",
  "category": "Royalty & Payments",
  "assignedAdminId": "cl..."
}
```

#### `POST /api/tickets/:id/messages`
Posts a response to the ticket conversation.
- If posted by an Author: Appends message to the thread.
- If posted by an Admin: Appends message and automatically advances ticket status from `Open` to `In Progress`. Emits real-time event to author.
- **Request Body:**
```json
{
  "body": "Your royalty payment has been scheduled for disbursement on next Monday."
}
```

#### `POST /api/tickets/:id/notes` (Admin Only)
Adds a private internal note for operations team members. Strictly prohibited from emitting to public streams or author views.
- **Request Body:**
```json
{
  "body": "Bank account verified with HDFC branch. Batch reference #8812."
}
```

#### `POST /api/tickets/:id/ai-draft` (Admin Only)
Generates an AI response draft based on the ticket description, recent message history, and the BookLeaf Knowledge Base policies.
- **Response `200 OK`:**
```json
{
  "success": true,
  "draft": {
    "draftReply": "Dear Priya Sharma,\n\nThank you for reaching out to BookLeaf Publishing...",
    "internalSummary": "Royalty query for Priya Sharma. Verified 80/20 policy.",
    "suggestedAction": "Check author dashboard bank account linkage.",
    "requiresEscalation": false
  }
}
```

#### `GET /api/tickets/:id/stream` (Real-Time SSE)
Server-Sent Events endpoint providing live public conversation messages and status updates. Automatically enforces room authorization based on the user's session.
- **Stream Format:**
```
data: {"type": "CONNECTED", "ticketId": "cl...", "timestamp": "..."}

data: {"type": "NEW_MESSAGE", "ticketId": "cl...", "data": {"message": {...}, "ticketStatus": "In Progress"}}

data: {"type": "STATUS_CHANGE", "ticketId": "cl...", "data": {"status": "Resolved"}}
```
