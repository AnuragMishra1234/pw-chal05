# Phase 4: Integration, Testing, Security, and Deployment

**Phase Status:** Ready for Implementation  
**Estimated Complexity:** High (Comprehensive Hardening, E2E Verification, & Production Deployment)  
**Deliverables:** Integrated production application, end-to-end user flows, security hardening report, WCAG accessibility audit, automated test execution, and deployment to Vercel/Render.

---

## 1. Overview & Objectives

**Phase 4** transforms the application into a coherent, reliable, secure, and production-deployable product. All mock data is removed from real production paths, all services are fully wired, end-to-end journeys are verified, and the platform is prepared for public demonstration across three canonical event scenarios:
1. **Wedding & Anniversary**
2. **College Hackathon**
3. **Community Cleanup**

---

## 2. End-to-End Integration Checklist

- [ ] **Complete Creation to Execution Flow:**
  - Create Event Wizard -> Template Selection -> AI Plan Generation -> Plan Inspection -> Task Assignment & Status Updates -> Budget Breakdown -> Expense Ledger Logging -> AI Plan Revision -> Persistent Storage across browser sessions.
- [ ] **Mock Data Purge:**
  - Ensure zero residual mock data is loaded when connecting to live backend endpoints.
- [ ] **Error & Reconnect Resilience:**
  - Seamless handling of temporary network drops, backend restarts, and database reconnection retries with user-friendly retry banners.
- [ ] **Data-Driven Dynamic Modules:**
  - Verify that only the relevant modules appear for each event type (e.g., Hackathon shows Registrations & Mentors; Wedding shows Guest Seating & Caterers).

---

## 3. Security & Privacy Audit

### 3.1 Security Review Checklist
1. **Zero Secret Leakage:**
   - Provider API keys (`GEMINI_API_KEY`, `GROQ_API_KEY`) and database URIs (`MONGODB_URI`) exist only in server-side process environments.
   - Audit all client bundles (`apps/web/.next`) to ensure zero `NEXT_PUBLIC_` prefixes on secrets.
2. **CORS & Origin Restrictions:**
   - In production, the Express API strictly permits requests originating from the configured `FRONTEND_ORIGIN` (e.g. `https://celebration-planner.vercel.app`).
3. **Helmet & Security Headers:**
   - Backend utilizes `helmet` to set Content Security Policy (CSP), X-Frame-Options (`DENY`), and Strict-Transport-Security (HSTS).
4. **Input Sanitization & Injection Prevention:**
   - Zod runtime validation strips un-whitelisted attributes.
   - LLM prompt synthesis escapes user input to prevent prompt injection and model jailbreaks.
5. **Event-Level Authorization:**
   - Every API request validates that the caller owns or has member access to the referenced event ID.
6. **Rate Limiting:**
   - AI generation endpoint `/plans/generate` is rate-limited to 5 requests per minute per IP/user to prevent denial of service and API quota exhaustion.

---

## 4. Accessibility (WCAG 2.1 AA) Audit

- [ ] **Keyboard Navigation:** Full application keyboard navigable (Tab, Shift+Tab, Enter, Escape, Arrow keys).
- [ ] **Focus Visibility:** Clear 2px focus ring (`focus-visible:ring-indigo-500`) on all buttons, links, inputs, and cards.
- [ ] **Semantic HTML:** Page landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`) and appropriate heading hierarchy (`<h1>` to `<h4>`).
- [ ] **Form Accessible Names:** Every input has a linked `<label>` or explicit `aria-label`.
- [ ] **Color Independence:** Statuses (e.g. `completed`, `blocked`, `high-priority`) utilize both color and text/icon indicators.
- [ ] **Chart Accessibility:** Recharts visual components provide accessible text tables and screen-reader summaries (`aria-describedby`).
- [ ] **Responsive Design:** 100% usable on mobile viewports (375px), tablets (768px), and desktop (1280px+).

---

## 5. Comprehensive Testing Requirements

### 5.1 Unit Tests
- `BudgetEngine`: Minor-unit arithmetic, allocation percentages, overrun detection.
- `TimelineEngine`: Date offsets, past-due date detection, milestone sequencing.
- `TemplateRegistry`: Template resolution, custom field schema validation.
- `ZodSchemas`: Verification of event, plan, task, and expense data contracts.

### 5.2 API Integration Tests
- Event CRUD operations (`POST`, `GET`, `PATCH`, `DELETE`).
- Task creation and status updates.
- Expense ledger arithmetic and balance tracking.
- Error handling for invalid IDs and malformed request bodies.

### 5.3 AI Engine Tests (Mocked Provider)
- Valid structured JSON generation.
- Malformed JSON handling with bounded repair recovery.
- Provider timeout simulation.
- Plan revision merge testing (verifying user-completed tasks are preserved).

### 5.4 End-to-End User Journey Tests
- **E2E-1:** Create Wedding Event -> Generate Plan -> Verify Guest & Catering modules appear -> Log quotation expense.
- **E2E-2:** Create College Hackathon -> Generate Plan -> Verify Mentors & Tracks modules appear -> Mark task complete.
- **E2E-3:** Create Community Event -> Generate Plan -> Verify Volunteer module appears -> Request revision to add 50 volunteers.

---

## 6. Demonstration Scenarios

### Demo Scenario A: Wedding & Anniversary
- **Inputs:** 150 guests, $35,000 budget, June 14, 2027, Napa Valley, "Rustic Elegance with farm-to-table dining".
- **AI Plan Output:** 8 budget categories, photography & catering focus, 12 preparation tasks, wedding-day minute-by-minute schedule.
- **Interactive Action:** Add a verified caterer quote ($12,000) and observe budget variance; request AI revision to add photo booth contingency.

### Demo Scenario B: College Hackathon
- **Inputs:** 300 participants, ₹8,00,000 budget, 36 hours, Campus Innovation Hub, "AI for Social Good".
- **AI Plan Output:** Registrations, judging rubric, mentor roster, lab hardware safety tasks, sponsor tier recommendations.
- **Interactive Action:** Shift event date by 2 weeks; observe automatic recalculation of milestone deadlines.

### Demo Scenario C: Community Cleanup
- **Inputs:** 80 volunteers, $2,500 budget, Riverside Park, "River Basin Waste & Recycling Drive".
- **AI Plan Output:** Municipal permit checklist, safety gear requisitions, volunteer hydration stations, environmental impact scorecard.
- **Interactive Action:** Mark safety briefing task as "Completed"; verify status persistence after browser refresh.

---

## 7. Production Deployment Guide

### 7.1 Backend API Deployment (Render / Railway)
1. Link GitHub repository and set Root Directory to `apps/api`.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm run start`
4. Configure Environment Variables in Render Dashboard:
   - `PORT=8000`
   - `NODE_ENV=production`
   - `MONGODB_URI=<mongodb_atlas_connection_string>`
   - `LLM_PROVIDER=gemini` (or `groq`)
   - `GEMINI_API_KEY=<server_api_key>`
   - `FRONTEND_ORIGIN=https://<your-vercel-app>.vercel.app`

### 7.2 Frontend Client Deployment (Vercel)
1. Import repository into Vercel and select Root Directory as `apps/web`.
2. Framework Preset: Next.js.
3. Build Command: `npm run build`
4. Configure Environment Variables in Vercel:
   - `NEXT_PUBLIC_API_BASE_URL=https://<your-api-domain>.onrender.com/api/v1`

---

## 8. Final Definition of Done (DoD)

The project is certified complete only when:
1. Both `web` and `api` compile cleanly with zero TypeScript errors.
2. Complete end-to-end user journeys function across all 3 demo scenarios.
3. Real MongoDB persistence functions without data corruption.
4. AI generates tailored plans via server adapter; provider errors fail safely.
5. Budget and timeline arithmetic are strictly verified by application code.
6. Secrets are 100% isolated on the server; zero credential leaks.
7. Automated tests run and results are truthfully recorded.
8. Setup and deployment instructions in `README.md` are verified and complete.
