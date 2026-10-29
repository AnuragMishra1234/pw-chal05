# Phase 4 Implementation Plan: Final Integration, Production Hardening, Testing & Deployment

**Project:** Celebration & Event Planner  
**Role:** Senior Full-Stack Engineer, DevOps Engineer, Application Security Reviewer & QA Lead  
**Status:** Approved & Active  
**Baseline Test Status:** 52 / 52 Passing (16 Shared, 36 API) | 0 Typecheck Errors | 0 Build Errors  

---

## 1. Objectives & Executive Scope

Phase 4 brings the Celebration & Event Planner platform to full production readiness. We build upon the verified foundation from Phases 1, 2, 3, and 3.x without rebuilding or discarding working code. All components (frontend, API, database persistence, multi-tenant isolation, AI planning engine) are integrated, hardened against security vulnerabilities and denial-of-service, verified through end-to-end user journeys, and configured for production deployment on Render (Backend API) and Vercel (Frontend Client) with MongoDB Atlas.

---

## 2. Pre-Flight Baseline Audit Summary

| Component | Status | Details |
| :--- | :---: | :--- |
| **Shared Package (`packages/shared`)** | **PASS** | 16/16 tests passing. Zod contracts, minor-unit money arithmetic, and template registry intact. |
| **API Server (`apps/api`)** | **PASS** | 36/36 tests passing. 100% of endpoints verified against API specification. |
| **Frontend Client (`apps/web`)** | **PASS** | Next.js 14 production build succeeds with 11 static/dynamic pages compiled. |
| **Git Working Tree** | **PASS** | Branch `main`, clean working tree, no untracked or dangling files. |
| **Templates** | **PASS** | All 6 canonical templates verified (`wedding`, `birthday`, `college_hackathon`, `community_event`, `corporate_conference`, `custom`). |

---

## 3. Targeted Implementation Tasks

### Task 1: Production Environment Configuration & Fail-Fast Hardening
- **Target Files:** `apps/api/src/config/env.ts`, `apps/api/src/config/database.ts`, `apps/api/src/index.ts`
- **Actions:**
  - Enhance `envSchema` with a refined superRefine or validation step:
    - In `NODE_ENV === 'production'`:
      - `MONGODB_URI` must be non-empty and start with `mongodb://` or `mongodb+srv://`.
      - `SESSION_SECRET` must not match development defaults.
      - If `LLM_PROVIDER === 'gemini'`, `GEMINI_API_KEY` must be configured.
      - If `LLM_PROVIDER === 'groq'`, `GROQ_API_KEY` must be configured.
      - If `LLM_PROVIDER === 'mock'`, require explicit developer flag `ALLOW_MOCK_IN_PRODUCTION=true`, otherwise reject.
  - In `database.ts`: If `NODE_ENV === 'production'` and connection fails, throw a fatal error immediately instead of falling back to in-memory store.
  - In `index.ts`: Assert that `database.getState() === 'connected'` before starting the Express listener when running in production.

### Task 2: Multi-Tenancy & Authorization Hardening
- **Target Files:** `apps/api/src/middleware/authorization.middleware.ts`, `apps/api/src/middleware/auth.middleware.ts`
- **Actions:**
  - Remove the legacy `usr-organizer-default` bypass in `requireEventAccess`.
  - Non-admin users can ONLY read, update, delete, or generate plans for events where `event.ownerId === currentUser.id`.
  - Ensure all nested sub-resources (tasks, budgets, expenses, plans) inherit this strict event-level tenant isolation and return `403 FORBIDDEN` when crossed.
  - Support authorization token extraction from `localStorage` in `apps/web/src/lib/api-client.ts` to allow testing multiple user identities.

### Task 3: API Security, Rate Limiting & Production Middleware
- **Target Files:** `apps/api/src/middleware/rate-limiter.middleware.ts`, `apps/api/src/middleware/security-headers.middleware.ts`, `apps/api/src/app.ts`
- **Actions:**
  - Implement a zero-dependency in-memory sliding-window rate limiter:
    - **AI Endpoints (`/api/v1/events/:id/plan/generate`, `/revise`):** 5 requests per 60 seconds per IP/user. Returns `429 Too Many Requests` with `Retry-After` header and clean error JSON envelope.
    - **General API Endpoints:** 100 requests per 60 seconds per IP.
  - Implement security headers middleware applying:
    - `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';`
    - `X-Frame-Options: DENY`
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
    - `X-XSS-Protection: 0`
  - Set Express JSON body parser limit to `1mb`: `express.json({ limit: '1mb' })`.
  - Verify error handling middleware preserves secret sanitization and never leaks server stack traces.

### Task 4: AI Provider Hardening & Concurrency Control
- **Target Files:** `apps/api/src/services/ai/planning-orchestrator.ts`, `apps/api/src/services/ai/gemini.adapter.ts`, `apps/api/src/services/ai/groq.adapter.ts`, `apps/api/src/services/ai/adapter.factory.ts`
- **Actions:**
  - In `PlanningOrchestrator`: Implement an active lock map (`activeEventLocks`) keyed by `eventId`. If a generation or revision request arrives while one is already actively running for the same event, reject with `409 Conflict` (or return lock error).
  - In `GeminiProviderAdapter` & `GroqProviderAdapter`: Add bounded transient error retry logic (max 2 retries with exponential backoff on HTTP 429/503).
  - In `AIProviderFactory`: Throw descriptive configuration errors if a real provider is selected without its required API key.

### Task 5: Production Deployment Configuration
- **Target Files:** `render.yaml`, `apps/web/vercel.json`, `apps/api/.env.example`, `.env.example`, `README.md`
- **Actions:**
  - Create `render.yaml` for Render Infrastructure as Code:
    - Service name: `celebration-api`
    - Environment: `node`
    - Build command: `npm install && npm run build:shared && npm run build:api`
    - Start command: `node apps/api/dist/index.js`
    - Health check path: `/api/v1/health`
    - Environment variable declarations: `NODE_ENV`, `PORT`, `MONGODB_URI`, `FRONTEND_ORIGIN`, `LLM_PROVIDER`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `SESSION_SECRET`.
  - Create `apps/web/vercel.json` for Next.js frontend deployment:
    - Build command: `npm run build:shared && npm run build:web`
    - Framework preset: `nextjs`
    - Security headers and cache-control configuration.
  - Document complete step-by-step MongoDB Atlas setup, Render deployment, and Vercel setup.

### Task 6: Comprehensive Automated End-to-End Verification (Journeys 1 to 5)
- **Target File:** `apps/api/test/phase4-production.test.ts`
- **Actions:**
  - Test **User Journey 1 (Wedding & Anniversary E2E):** Create event -> AI plan generation -> Verify 8 budget categories, tasks, milestones -> Apply revision -> Verify user tasks preserved and budget updated.
  - Test **User Journey 2 (Corporate Conference E2E):** Create event -> AI plan generation -> Add custom task and quotation expense -> Recalculate variance and persist changes.
  - Test **User Journey 3 (Custom Event E2E):** Natural language brief -> Tailored plan generation without template contamination.
  - Test **User Journey 4 (Multi-Tenant Isolation):** User A creates event -> User B attempts access -> Assert `403 FORBIDDEN` across GET, PATCH, DELETE, and Plan Generation endpoints.
  - Test **User Journey 5 (AI Reliability & Security):**
    - Rate limiting triggers `429 Too Many Requests` after quota exceeded.
    - Duplicate concurrent plan generation triggers lock rejection.
    - Missing production environment variables trigger validation failure.

### Task 7: Full Test Suite, Typecheck & Production Build Verification
- Execute `npm test` across all workspaces.
- Execute `npm run typecheck` across all workspaces.
- Execute `npm run build` across all workspaces.

### Task 8: Deliverables & Final Documentation
- Author `PHASE-4-VERIFICATION-REPORT.md`.
- Update `README.md`, `ARCHITECTURE.md`, `API-SPECIFICATION.md`, `DATA-MODEL.md`, `TESTING-STRATEGY.md`, `.env.example`, `apps/api/.env.example`.

---

## 4. Acceptance Criteria Checklist

- [x] Pre-flight inspection completed and documented.
- [ ] Fail-fast validation prevents running in production without `MONGODB_URI` and required secrets.
- [ ] No silent in-memory fallback in production.
- [ ] Non-admin users cannot access or mutate events owned by other users (`403 Forbidden`).
- [ ] Rate limiting enforces 5 req/min on AI plan generation and 100 req/min on general routes.
- [ ] Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) active on all responses.
- [ ] 1MB payload body limit enforced.
- [ ] AI orchestrator locks duplicate concurrent generation requests on the same event.
- [ ] Gemini and Groq adapters implement bounded retries on transient errors.
- [ ] Automated tests cover User Journeys 1 through 5, security, rate limiting, and tenant isolation.
- [ ] `render.yaml` and `vercel.json` configured and verified.
- [ ] Zero TypeScript errors, zero build failures, 100% test pass rate.
- [ ] Final verification report authored and master documentation updated.
