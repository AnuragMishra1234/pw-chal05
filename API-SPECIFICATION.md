# Celebration & Event Planner — REST API Specification

**API Version:** `v1`  
**Base URL:** `/api/v1`  
**Protocol:** HTTPS / JSON REST

---

## 1. General Conventions & Envelope Standards

### 1.1 Request Headers
- `Content-Type: application/json` (Required for `POST`, `PATCH`, `PUT`)
- `Accept: application/json`
- `Authorization: Bearer <jwt_or_session_token>` (Required for all protected routes)

### 1.2 Response Envelope
All API responses adhere to a consistent JSON envelope structure:

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-27T18:00:00.000Z",
    "version": "v1"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request body failed schema validation.",
    "details": [
      {
        "field": "budgetLimitMinorUnits",
        "issue": "Expected positive integer minor units"
      }
    ],
    "timestamp": "2026-10-27T18:00:00.000Z"
  }
}
```

### 1.3 Standard Error Codes
- `BAD_REQUEST` (`400`): Malformed syntax or missing query parameters.
- `VALIDATION_ERROR` (`400`): Payload failed Zod schema verification.
- `UNAUTHORIZED` (`401`): Missing or expired authentication token.
- `FORBIDDEN` (`403`): Caller does not have permission to access or modify this event.
- `RESOURCE_NOT_FOUND` (`404`): Event, task, or resource ID does not exist.
- `RATE_LIMIT_EXCEEDED` (`429`): Too many requests, especially on AI generation routes.
- `AI_PROVIDER_ERROR` (`502`): Downstream LLM provider failure or timeout.
- `INTERNAL_SERVER_ERROR` (`500`): Unhandled exception in server logic.

---

## 2. API Endpoints Catalog

### 2.1 System & Health

#### `GET /api/v1/health`
Checks API and database status.
- **Auth:** None
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptimeSeconds": 1420.5,
    "database": "connected",
    "version": "1.0.0"
  }
}
```

---

### 2.2 Templates

#### `GET /api/v1/templates`
Retrieves all active versioned event templates.
- **Auth:** None / Optional
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "wedding",
      "version": "1.0.0",
      "name": "Wedding & Anniversary",
      "description": "Sacred ceremonies and elegant social receptions.",
      "defaultModules": ["overview", "budget", "timeline", "tasks", "guests", "vendors", "catering"]
    },
    {
      "id": "college_hackathon",
      "version": "1.0.0",
      "name": "College Hackathon",
      "description": "Fast-paced student technical competitions and project showcases.",
      "defaultModules": ["overview", "budget", "timeline", "tasks", "registrations", "teams", "judges", "equipment"]
    }
  ]
}
```

#### `GET /api/v1/templates/:templateId`
Retrieves full details and custom field definitions for a specific template.
- **Auth:** None / Optional
- **Response `200 OK`:** Returns full template configuration.

---

### 2.3 Events

#### `GET /api/v1/events`
Lists all events owned by or shared with the authenticated user.
- **Auth:** Bearer Token
- **Query Params:** `status`, `eventType`, `page`, `limit`
- **Response `200 OK`:** Returns array of `EventSummary` objects.

#### `POST /api/v1/events`
Creates a new event entity.
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "title": "HackSummit 2027",
  "eventType": "college_hackathon",
  "templateId": "college_hackathon",
  "templateVersion": "1.0.0",
  "description": "Annual inter-collegiate AI hackathon.",
  "startDate": "2027-03-20T09:00:00Z",
  "endDate": "2027-03-21T18:00:00Z",
  "timezone": "Asia/Kolkata",
  "currency": "INR",
  "budgetLimitMinorUnits": 80000000,
  "expectedAttendance": 300,
  "location": {
    "type": "physical",
    "address": "Campus Tech Pavilion",
    "city": "Bengaluru",
    "country": "India"
  },
  "preferences": {
    "focusTrack": "Artificial Intelligence",
    "cateringType": "24h buffet"
  }
}
```
- **Response `201 Created`:** Returns created `EventDetails` with generated `id`.

#### `GET /api/v1/events/:id`
Retrieves full details for an event.
- **Auth:** Bearer Token (Ownership verified)

#### `PATCH /api/v1/events/:id`
Updates mutable event fields.
- **Auth:** Bearer Token (Ownership verified)

#### `DELETE /api/v1/events/:id`
Soft-deletes/archives an event.
- **Auth:** Bearer Token (Ownership verified)

---

### 2.4 Tasks

#### `GET /api/v1/events/:id/tasks`
Lists all tasks associated with the event.
- **Auth:** Bearer Token (Ownership verified)
- **Response `200 OK`:** Array of `Task` objects.

#### `POST /api/v1/events/:id/tasks`
Creates a manual task.
- **Auth:** Bearer Token (Ownership verified)
- **Request Body:**
```json
{
  "title": "Secure Campus Wi-Fi Credentials for Guests",
  "category": "Equipment & Network",
  "priority": "high",
  "dueAt": "2027-03-10T12:00:00Z",
  "estimatedDurationMinutes": 60,
  "source": "user"
}
```

#### `PATCH /api/v1/events/:id/tasks/:taskId`
Updates status, priority, or assignee for a task.
- **Auth:** Bearer Token (Ownership verified)
- **Request Body:**
```json
{
  "status": "completed"
}
```

#### `DELETE /api/v1/events/:id/tasks/:taskId`
Deletes a task.
- **Auth:** Bearer Token (Ownership verified)

---

### 2.5 Budgets & Expenses

#### `GET /api/v1/events/:id/budget`
Retrieves budget limits, category allocations, and total spending summary.
- **Auth:** Bearer Token (Ownership verified)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "currency": "INR",
    "totalLimitMinorUnits": 80000000,
    "totalAllocatedMinorUnits": 76000000,
    "actualSpentMinorUnits": 12500000,
    "contingencyMinorUnits": 4000000,
    "categories": [
      {
        "name": "Food & Catering",
        "allocatedMinorUnits": 32000000,
        "actualSpentMinorUnits": 5000000,
        "status": "on_track"
      }
    ]
  }
}
```

#### `POST /api/v1/events/:id/expenses`
Records an expense ledger item.
- **Auth:** Bearer Token (Ownership verified)
- **Request Body:**
```json
{
  "category": "Food & Catering",
  "amountMinorUnits": 5000000,
  "currency": "INR",
  "status": "actual",
  "vendorName": "Campus Dining Services",
  "paymentDate": "2027-02-15T00:00:00Z",
  "notes": "50% advance deposit for 24h catering"
}
```

---

### 2.6 GenAI Planning Engine (Phase 3)

#### `POST /api/v1/events/:id/plans/generate`
Generates a structured AI plan using the configured server provider.
- **Auth:** Bearer Token (Ownership verified)
- **Rate Limit:** 5 requests per minute
- **Request Body:**
```json
{
  "userGuidance": "Emphasize mentor recruitment and high-speed fiber internet provisioning."
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "planId": "65b98a01",
    "version": 1,
    "summary": "Structured 36-hour collegiate AI hackathon plan.",
    "assumptions": [
      "Access to primary auditorium and 3 breakout rooms confirmed",
      "Overnight security provided by university police"
    ],
    "warnings": [
      "High power draw for 100+ GPU workstations requires dedicated phase line"
    ],
    "budget": {
      "currency": "INR",
      "plannedTotalMinorUnits": 80000000,
      "categories": [
        {
          "name": "Prizes & Grants",
          "plannedMinorUnits": 24000000,
          "percentage": 30
        }
      ]
    },
    "generatedTaskCount": 18,
    "generatedMilestoneCount": 6,
    "activeModules": ["registrations", "teams", "judges", "equipment"]
  }
}
```

#### `POST /api/v1/events/:id/plans/:planId/revise`
Submits natural-language adjustments to regenerate specific aspects while preserving user tasks.
- **Auth:** Bearer Token (Ownership verified)
- **Request Body:**
```json
{
  "revisionInstructions": "Reduce the total prize pool by 20% and allocate the difference to guest keynote travel."
}
```
- **Response `200 OK`:** Returns new plan version (`version: 2`) referencing previous version.
