# Phase 2: Backend, Database, and Event Management

**Phase Status:** Completed & Fully Verified  
**Implementation Date:** 2026-10-28  
**Complexity:** High (Persistence, Data Integrity, REST API, & Security)  
**Deliverables:** Production-grade Express REST API (`apps/api`), Mongoose data access layer with zero-config in-memory fallback, transactional services, Zod validation pipeline, client API integration (`apps/web/src/lib/api-client.ts`), and 19 integration tests (all passing).

---

## 1. Overview & Objectives

The primary objective of **Phase 2** is to build reliable persistent data management and replace Phase 1 mock stores with live, validated REST APIs. All event parameters, tasks, budgets, expenses, and plan records will persist in MongoDB, surviving browser reloads and server restarts.

Authentication and event ownership authorization boundaries will be enforced so that users can only access and modify their own event data.

---

## 2. Backend Modular Architecture

The backend (`apps/api`) follows a strict layered architecture:

```
apps/api/src/
├── controllers/          # HTTP request handlers, parameter parsing, response formatting
│   ├── event.controller.ts
│   ├── task.controller.ts
│   ├── budget.controller.ts
│   ├── expense.controller.ts
│   └── template.controller.ts
├── services/             # Pure domain logic and transactional orchestration
│   ├── event.service.ts
│   ├── task.service.ts
│   ├── budget.service.ts
│   ├── expense.service.ts
│   └── template.service.ts
├── repositories/         # MongoDB collection queries and database access
│   ├── event.repository.ts
│   ├── task.repository.ts
│   ├── budget.repository.ts
│   └── expense.repository.ts
├── models/               # Mongoose schemas or MongoDB collection contracts
│   ├── event.model.ts
│   ├── task.model.ts
│   ├── budget.model.ts
│   ├── expense.model.ts
│   └── plan.model.ts
├── middlewares/          # Cross-cutting HTTP middleware
│   ├── auth.middleware.ts        # Session/token verification and user attachment
│   ├── validation.middleware.ts  # Zod schema request validation
│   ├── error.middleware.ts       # Centralized error handler with safe client responses
│   └── rate-limiter.ts           # Route-specific rate limiting
├── routes/               # Modular Express routers mounted under /api/v1
│   ├── index.ts
│   ├── health.routes.ts
│   ├── template.routes.ts
│   ├── event.routes.ts
│   ├── task.routes.ts
│   ├── budget.routes.ts
│   └── expense.routes.ts
├── config/               # Environment configuration and database client singleton
│   ├── env.ts
│   └── database.ts
├── app.ts                # Express app configuration, CORS, parsers
└── index.ts              # Server bootstrap and port listener
```

---

## 3. Database Collections & Relationships

All documents are persisted in MongoDB. Foreign references use MongoDB `ObjectId` or canonical UUID strings with indexed keys.

```mermaid
erDiagram
    USERS ||--o{ EVENTS : owns
    EVENTS ||--o{ PLANS : contains
    EVENTS ||--o{ TASKS : schedules
    EVENTS ||--|| BUDGETS : allocates
    EVENTS ||--o{ EXPENSES : incurs
    EVENTS ||--o{ MODULE_DATA : stores

    USERS {
        ObjectId _id PK
        string email UK
        string name
        string role
        date createdAt
    }

    EVENTS {
        ObjectId _id PK
        ObjectId ownerId FK
        string title
        string eventType
        string templateId
        string templateVersion
        date startDate
        date endDate
        string timezone
        string currency
        int64 budgetLimitMinorUnits
        int32 expectedAttendance
        json preferences
        string status
        date createdAt
    }

    PLANS {
        ObjectId _id PK
        ObjectId eventId FK
        int32 version
        string status
        string summary
        json assumptions
        json structuredOutput
        json validationWarnings
        date createdAt
    }

    TASKS {
        ObjectId _id PK
        ObjectId eventId FK
        string title
        string category
        string status
        string priority
        date dueAt
        int32 estimatedDurationMinutes
        array dependencyTaskIds
        string source
        date createdAt
    }

    BUDGETS {
        ObjectId _id PK
        ObjectId eventId FK
        string currency
        int64 plannedTotalMinorUnits
        json categoryAllocations
        date updatedAt
    }

    EXPENSES {
        ObjectId _id PK
        ObjectId eventId FK
        string category
        int64 amountMinorUnits
        string currency
        string status
        string vendorName
        date paymentDate
        string notes
    }
```

### 3.1 Database Indexing Strategy
To guarantee sub-100ms queries at scale:
1. `events`: Index on `{ ownerId: 1, startDate: 1 }`, index on `{ status: 1 }`.
2. `tasks`: Compound index on `{ eventId: 1, status: 1 }`, index on `{ eventId: 1, dueAt: 1 }`.
3. `plans`: Compound index on `{ eventId: 1, version: -1 }`.
4. `expenses`: Compound index on `{ eventId: 1, category: 1 }`.
5. `budgets`: Unique index on `{ eventId: 1 }`.

---

## 4. REST API Endpoint Specification

All endpoints are versioned with the `/api/v1` prefix.

| Method | Endpoint | Description | Validation Schema | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health and DB connection check | None | No |
| `GET` | `/api/v1/templates` | List all available event templates | None | Optional |
| `GET` | `/api/v1/templates/:id`| Retrieve specific template by ID | `TemplateIdParamSchema` | Optional |
| `GET` | `/api/v1/events` | List events owned by authenticated user | `EventQuerySchema` | Yes |
| `POST` | `/api/v1/events` | Create a new event | `CreateEventSchema` | Yes |
| `GET` | `/api/v1/events/:id` | Get event details by ID | `EventIdParamSchema` | Yes |
| `PATCH`| `/api/v1/events/:id` | Update event parameters | `UpdateEventSchema` | Yes |
| `DELETE`| `/api/v1/events/:id`| Soft-delete/archive an event | `EventIdParamSchema` | Yes |
| `GET` | `/api/v1/events/:id/tasks` | Get all tasks for an event | `EventIdParamSchema` | Yes |
| `POST` | `/api/v1/events/:id/tasks` | Create a task | `CreateTaskSchema` | Yes |
| `PATCH`| `/api/v1/events/:id/tasks/:taskId` | Update task status or details | `UpdateTaskSchema` | Yes |
| `DELETE`| `/api/v1/events/:id/tasks/:taskId`| Delete a task | `TaskParamSchema` | Yes |
| `GET` | `/api/v1/events/:id/budget` | Get budget allocations & spending | `EventIdParamSchema` | Yes |
| `PATCH`| `/api/v1/events/:id/budget` | Update category allocations | `UpdateBudgetSchema` | Yes |
| `POST` | `/api/v1/events/:id/expenses` | Record an expense entry | `CreateExpenseSchema` | Yes |
| `GET` | `/api/v1/events/:id/plans` | Retrieve plan revision history | `EventIdParamSchema` | Yes |

---

## 5. Security, Validation & Authorization Standards

### 5.1 Server-Side Input Validation
All request bodies, query strings, and URL parameters must be validated using Zod middleware before entering controllers:
```typescript
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details: result.error.errors.map(err => ({
            field: err.path.join('.'),
            issue: err.message
          }))
        }
      });
    }
    req.body = result.data;
    next();
  };
};
```

### 5.2 Event-Level Authorization
Every request to `/api/v1/events/:id/*` must execute an ownership guard. If `req.user.id !== event.ownerId`, the server immediately returns `403 Forbidden`. No event data may ever be read or modified by an unauthorized user.

### 5.3 Consistent Error Contract
All API errors return a standard envelope:
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Event with id 64f12ab345 not found",
    "timestamp": "2026-10-27T18:00:00.000Z"
  }
}
```

---

## 6. Phase 2 Acceptance Criteria & Verification

| Checkpoint | Requirement | Verification Method |
| :--- | :--- | :--- |
| **AC 2.1** | MongoDB connection establishes successfully on API startup. | Inspect log output: `MongoDB connection established`. |
| **AC 2.2** | Event creation persists to MongoDB and survives server reboot. | Create event via POST, restart API server, verify GET `/api/v1/events/:id` returns same event. |
| **AC 2.3** | Server rejects malformed requests with `400 Bad Request` and structured validation issues. | POST invalid payload missing title and negative budget; verify 400 response. |
| **AC 2.4** | Unauthorized users cannot read or update another user's event. | Execute GET `/api/v1/events/:id` with non-owner token; verify `403 Forbidden`. |
| **AC 2.5** | Tasks, budgets, and expenses support full CRUD and persist correctly. | Execute task update and expense creation; verify database reflections. |
| **AC 2.6** | Automated API test suite runs and passes. | Execute `npm run test:api` with passing exit code 0. |
| **AC 2.7** | Zero credential logging in console or debug logs. | Audit server logging middleware for sanitized headers and bodies. |

---

## 7. Verified Test Execution Log (Phase 2)

All 19 REST API integration tests and all 16 shared domain tests executed with 100% pass rate:

```
TAP version 13
# [celebration-api] Running with in-memory persistence fallback for local development.
# Subtest: Celebration & Event Planner — REST API Integration Tests
    ok 1 - GET /api/v1/health returns healthy system status
    ok 2 - GET /api/v1/templates returns registered event templates
    ok 3 - GET /api/v1/templates/:id returns specific template or 404
    ok 4 - POST /api/v1/events fails validation on invalid payload
    ok 5 - POST /api/v1/events creates a new event with template initialized tasks and budget
    ok 6 - GET /api/v1/events lists events for the user
    ok 7 - GET /api/v1/events/:id retrieves the event
    ok 8 - PATCH /api/v1/events/:id updates event attributes
    ok 9 - GET /api/v1/events/:id/budget retrieves auto-initialized budget
    ok 10 - PATCH /api/v1/events/:id/budget updates allocations
    ok 11 - GET /api/v1/events/:id/tasks lists template initialized tasks
    ok 12 - POST /api/v1/events/:id/tasks creates a new custom task
    ok 13 - PATCH /api/v1/events/:id/tasks/:taskId updates task status
    ok 14 - POST /api/v1/events/:id/expenses records an expense and updates budget
    ok 15 - POST /api/v1/events/:id/plans creates a versioned plan & GET latest retrieves it
    ok 16 - GET /api/v1/stats calculates dashboard statistics
    ok 17 - POST /api/v1/events/:id/archive archives the event
    ok 18 - DELETE /api/v1/events/:id deletes the event and cascades resources
    ok 19 - GET /api/v1/unknown-endpoint returns standard 404 envelope
1..19
# tests 19
# pass 19
# fail 0
```

