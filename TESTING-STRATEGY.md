# Celebration & Event Planner — Testing Strategy & Verification Protocol

**Version:** 1.0.0  
**Test Frameworks:** Vitest / Jest (Unit & Service Tests), Supertest (API Integration Tests), Playwright (E2E User Journeys)  
**Rule:** Never report a test as passed unless it was actually configured and executed.

---

## 1. Testing Philosophy & Test Pyramid

The platform adopts a multi-tier testing strategy ensuring deterministic arithmetic correctness, reliable API contracts, resilient GenAI failure recovery, and accessible user journeys:

```
        / \
       /   \      E2E Tests (Playwright: 3 Canonical Journeys)
      /     \
     /-------\    API Integration Tests (Supertest + In-Memory / Test DB)
    /         \
   /-----------\  AI Mock & Schema Validation Tests
  /             \
 /---------------\ Unit Tests (Budget Engine, Timeline Engine, Zod Schemas)
```

---

## 2. Unit Testing Suite

Targeting core domain logic in `packages/shared` and `apps/api/src/services`:

### 2.1 Deterministic Budget Engine (`BudgetEngine.test.ts`)
- **TC-B1: Minor-Unit Exactness:** Verify that `$15,000.75` converts to `1500075` minor units without IEEE-754 precision artifacts.
- **TC-B2: Proportional Allocation:** Given total budget `1000000` (10,000 USD) and categories with weights `[40%, 30%, 20%, 10%]`, verify allocations sum to exactly `1000000`.
- **TC-B3: Overrun Detection:** When category allocations sum to `115%`, verify engine normalizes proportions and emits an explicit warning.
- **TC-B4: Unknown Cost Handling:** Verify unestimated items are never coerced to zero.

### 2.2 Timeline & Milestone Engine (`TimelineEngine.test.ts`)
- **TC-T1: Relative Date Calculation:** Given an event date of `2027-06-15`, verify a task with `daysBeforeEvent: 30` computes `2027-05-16T00:00:00Z`.
- **TC-T2: Past Due Warning:** Verify tasks whose calculated due date precedes the current date trigger an explicit `isPastDueOnCreation: true` flag.
- **TC-T3: Leap Year Arithmetic:** Verify correct date offsets across leap years (e.g. 2028).

### 2.3 Template Registry (`TemplateRegistry.test.ts`)
- **TC-R1: Canonical Templates Exist:** Verify `wedding`, `birthday`, `college_hackathon`, `community_event`, and `corporate_conference` load valid JSON configurations.
- **TC-R2: Schema Compliance:** All templates satisfy `EventTemplateSchema`.

---

## 3. GenAI Provider Mocking Suite (`AIAdapter.test.ts`)

LLM responses are non-deterministic and incur costs; tests mock the provider adapter layer using deterministic fixtures.

### 3.1 Mock Scenarios
1. **Valid JSON Generation:** Adapter returns standard structured JSON matching `RawAIPlanSchema`. Verify successful parsing, calculation, and persistence.
2. **Markdown-Wrapped Output:** Adapter returns ````json { ... } ````. Verify markdown regex parser cleanly strips fences.
3. **Malformed JSON String:** Adapter returns unparseable string (e.g. truncated syntax). Verify 1 bounded repair retry is attempted, failing gracefully if unrecoverable.
4. **Missing Required Fields:** Adapter returns payload without `assumptions` or `budgetProposal`. Verify Zod schema rejects payload without crashing server.
5. **Simulated Timeout:** Adapter throws `ETIMEDOUT` after 20 seconds. Verify orchestrator captures error and returns `502 AI_PROVIDER_ERROR` without corrupting previous plan versions.

---

## 4. API Integration Testing Suite (Supertest)

Mounted against Express app instance with ephemeral test MongoDB database.

### 4.1 Route Test Matrix
- **`GET /api/v1/health`:** Returns 200 and healthy status.
- **`GET /api/v1/templates`:** Returns array of all 5 templates.
- **`POST /api/v1/events`:**
  - Valid payload -> `201 Created` with generated ID.
  - Invalid payload (negative budget, empty title) -> `400 Bad Request` with field error array.
- **`GET /api/v1/events/:id`:**
  - Authenticated owner -> `200 OK`.
  - Non-owner user -> `403 Forbidden`.
  - Non-existent ID -> `404 Not Found`.
- **`POST /api/v1/events/:id/tasks`:** Adds task and links to event.
- **`PATCH /api/v1/events/:id/tasks/:taskId`:** Updates task status to `completed`.
- **`POST /api/v1/events/:id/expenses`:** Records expense and verifies budget balance updates.

---

## 5. Security & Accessibility Audits

### 5.1 Security Automation
- **Credential Leak Scanner:** Script scanning all source files, git commits, and compiled frontend bundles for regex matching API key patterns (`AIza...`, `gsk_...`).
- **CORS Verifier:** Verify requests with unauthorized `Origin` headers are blocked by Express.

### 5.2 Accessibility Verification
- **Automated Axe-core:** Run `@axe-core/playwright` across `/`, `/dashboard`, `/events/new`, and `/events/[id]`. Zero critical or serious accessibility violations permitted.
- **Keyboard Trapping:** Verify modal dialogs trap tab focus and close on `Escape`.

---

## 6. Commands to Execute Configured Tests

When test suites are configured, execute:

- **Run Shared Package Unit Tests:**
  ```bash
  npm run test -w packages/shared
  ```
- **Run API Integration Tests:**
  ```bash
  npm run test -w apps/api
  ```
- **Run Type Checks Across All Workspaces:**
  ```bash
  npm run typecheck
  ```
- **Run Full Verification Pipeline:**
  ```bash
  npm test
  ```
