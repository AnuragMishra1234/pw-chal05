# Celebration & Event Planner

> Universal Generative AI-Powered Event Planning & Lifecycle Management Platform

[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/next.js-14%2B-black.svg)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/express-4.19-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-7.0%2B-green.svg)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/tests-73%2F73%20passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 1. Product Overview

**Celebration & Event Planner** is an intelligent web application designed to help individuals, families, student organizers, community leaders, and business coordinators plan, budget, organize, and execute events.

### Core Architectural Principle
> **ONE UNIVERSAL DASHBOARD + ONE SHARED PLANNING ENGINE + CONFIGURABLE EVENT TEMPLATES**

Rather than creating separate siloed applications for weddings, hackathons, and corporate conferences, the platform uses a single unified dashboard and shared planning engine. Specialized modules and workflows adapt dynamically based on declarative, versioned event templates.

### Supported Event Types
1. **Wedding & Anniversary (`wedding`):** Ceremonies, banquet catering, guest hospitality, photo shot lists, attire, and vendor contracts.
2. **Birthday & Private Celebration (`birthday`):** Guest lists, themes, milestone cakes, entertainment, party games, and photo booths.
3. **College Hackathon (`college_hackathon`):** Registrations, technical tracks, mentors, hardware labs, 24h catering, and judging rubrics.
4. **Community Event (`community_event`):** Volunteer mobilization, municipal permits, safety gear, logistics, and environmental impact targets.
5. **Corporate Conference (`corporate_conference`):** Parallel presentation tracks, keynote VIPs, sponsor tiers, live streaming, and executive catering.
6. **Custom Event (`custom`):** Open-ended natural language event description mapped to bespoke planning modules without template contamination.

---

## 2. Implementation Status & Phase Certification

| Phase | Description | Status | Verification Summary |
| :--- | :--- | :---: | :--- |
| **Phase 0** | **Project Initialization & Master Blueprint** | **COMPLETED** | Monorepo structure, workspace manifests, shared package, canonical templates. |
| **Phase 1** | **Foundation, Universal Dashboard & Event Model** | **COMPLETED** | Next.js 14 App Router, responsive dashboard, multi-step creation wizard, event catalog. |
| **Phase 2** | **Backend, Database & Event Management API** | **COMPLETED** | Express REST API (`/api/v1`), Mongoose models, persistence layer, task & budget sub-resources. |
| **Phase 3** | **GenAI Planning Engine & Adaptive Templates** | **COMPLETED** | Gemini/Groq/Mock adapters, prompt synthesizer, deterministic budget & timeline engines, plan revision. |
| **Phase 3.x**| **Complete Audit & Verification** | **COMPLETED** | Independent stabilization audit, dangling route removal, baseline test expansion. |
| **Phase 4** | **Final Integration, Hardening & Deployment** | **COMPLETED** | Rate limiting, security headers, multi-tenant isolation, fail-fast env validation, E2E test suite (73/73 passing), Render/Vercel/Atlas deploy config. |

---

## 3. Technology Stack

- **Monorepo:** npm Workspaces (`packages/shared`, `apps/api`, `apps/web`)
- **Backend API:** Node.js 20+, Express 4.19, TypeScript 5.4 (NodeNext ESM)
- **Database:** MongoDB 7.0+ (Mongoose 9.11) with automatic in-memory fallback for local development & testing
- **Frontend Client:** Next.js 14.2 (App Router), React 18, Tailwind CSS 3.4, Lucide Icons
- **Data Validation & Contracts:** Zod 3.23 (shared across client and server)
- **AI Planning Engine:** Multi-provider adapter architecture supporting Google Gemini (1.5 Flash/Pro), Groq (Llama 3.3 70B), and deterministic Mock provider

---

## 4. Security & Production Hardening Features

- **Strict Multi-Tenant Isolation:** All event mutations, reads, tasks, budgets, expenses, and AI plan generations require ownership validation. Cross-tenant access is rejected with `403 Forbidden`.
- **Fail-Fast Environment Validation:** In `NODE_ENV=production`, server startup validates required secrets (`MONGODB_URI`, `SESSION_SECRET`, provider API keys) and aborts if missing.
- **No Silent Fallback in Production:** Prevents accidental ephemeral storage; production requires verified MongoDB Atlas connection.
- **Sliding-Window Rate Limiting:**
  - AI Plan Generation/Revision (`/api/v1/events/:id/plan/generate`, `/revise`): Enforces **5 requests per minute** per client, responding with `429 Too Many Requests` and standard `Retry-After` header.
  - General API Routes: Enforces **100 requests per minute** per client.
- **Security Headers:** Automated middleware applies `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Strict-Transport-Security`.
- **Payload Size Control:** 1MB ceiling enforced on all incoming JSON request bodies (`express.json({ limit: '1mb' })`).
- **Sanitized Errors:** Error envelopes never leak internal stack traces or database connection details to clients.
- **Concurrency Locks:** Prevents race conditions from duplicate simultaneous plan generation requests on the same event with `409 Conflict`.
- **Deterministic Minor-Unit Arithmetic:** 100% of financial calculations use 64-bit integer minor units (paise/cents), completely eliminating floating-point errors.

---

## 5. Prerequisites & Environment Setup

### 5.1 Prerequisites
- **Node.js:** `>= 20.0.0` (Tested on Node.js 22)
- **Package Manager:** `npm >= 10.0.0`
- **Database (Optional for Dev):** MongoDB Atlas connection string (in-memory store automatically runs for dev/test if omitted)
- **AI Keys (Optional for Dev):** Google Gemini API Key or Groq API Key (mock provider runs deterministically if omitted)

### 5.2 Environment Setup
Copy the environment template:
```bash
cp .env.example .env
```
Key configuration parameters:
```env
# Backend API (apps/api)
PORT=8000
NODE_ENV=development
MONGODB_URI=
FRONTEND_ORIGIN=http://localhost:3000
SESSION_SECRET=dev-session-secret-celebration-key-12345
LLM_PROVIDER=mock
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Frontend Client (apps/web)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 6. Installation, Build & Development

### 6.1 Install Dependencies
```bash
npm install
```

### 6.2 Run Development Servers
- **Run all workspaces simultaneously (Frontend + API):**
  ```bash
  npm run dev:all
  ```
- **Run Backend API only (`http://localhost:8000`):**
  ```bash
  npm run dev:api
  ```
- **Run Frontend Client only (`http://localhost:3000`):**
  ```bash
  npm run dev:web
  ```

### 6.3 Typecheck
Verify strict TypeScript compilation across all workspaces:
```bash
npm run typecheck
```

### 6.4 Build for Production
Build all packages and applications:
```bash
npm run build
```

---

## 7. Automated Test Suite

Run the complete automated test suite across all workspaces:
```bash
npm test
```

### Test Suite Summary:
- **Total Tests:** **73 / 73 PASSING** (0 Failures, 0 Skipped)
  - `packages/shared`: 16 tests (Zod validation schemas, minor-unit financial arithmetic, template registry).
  - `apps/api` (REST Integration): 22 tests (Health, templates, event CRUD, task management, expense ledger, statistics).
  - `apps/api` (GenAI Engine): 14 tests (BudgetEngine, TimelineEngine, multi-template plan synthesis, plan revision, version history).
  - `apps/api` (Phase 4 Production Hardening & E2E): 21 tests (User Journeys 1–5, cross-user tenant isolation, rate limiting, security headers, concurrency locks, fail-fast env validation).

---

## 8. Production Deployment Guide

### 8.1 Backend API Deployment (Render)
The repository includes a ready-to-deploy [`render.yaml`](render.yaml) Blueprint:
1. Push repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com/), click **New +** -> **Blueprint** and connect the repository.
3. Configure the following environment variables in the Render Service settings:
   - `NODE_ENV`: `production`
   - `PORT`: `8000`
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/celebration?retryWrites=true&w=majority`
   - `FRONTEND_ORIGIN`: `https://your-celebration-frontend.vercel.app`
   - `SESSION_SECRET`: `<strong-random-32-char-key>`
   - `LLM_PROVIDER`: `gemini` (or `groq`)
   - `GEMINI_API_KEY`: `<your_gemini_server_api_key>`
   - `LLM_TIMEOUT_MS`: `25000`
4. Health check endpoint: `/api/v1/health`

### 8.2 Frontend Client Deployment (Vercel)
The repository includes [`apps/web/vercel.json`](apps/web/vercel.json):
1. In [Vercel Dashboard](https://vercel.com/), click **Add New** -> **Project** and import the repository.
2. Set **Root Directory** to `apps/web`.
3. Set **Framework Preset** to Next.js.
4. Set Build Command to: `npm run build:shared && npm run build:web`.
5. Add Environment Variable:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://your-celebration-api.onrender.com/api/v1`
6. Click **Deploy**.

### 8.3 MongoDB Atlas Setup
1. Create a free M0 cluster on [MongoDB Atlas](https://cloud.mongodb.com/).
2. Under **Database Access**, create a user with `readWriteAnyDatabase` privileges.
3. Under **Network Access**, add Render's outbound IP or `0.0.0.0/0` with secure user/password.
4. Copy the connection string into the `MONGODB_URI` environment variable.

---

## 9. Monorepo Structure

```
celebration-event-planner/
├── apps/
│   ├── api/                    # Express REST API & GenAI planning orchestrator
│   │   ├── src/
│   │   │   ├── config/         # Environment schema, MongoDB connection manager
│   │   │   ├── controllers/    # Event, task, budget, expense, plan controllers
│   │   │   ├── middleware/     # Auth, authorization, rate-limiting, security headers
│   │   │   ├── models/         # Mongoose persistence schemas
│   │   │   ├── repositories/   # Hybrid Mongo / In-Memory repositories
│   │   │   ├── routes/         # Express API routers
│   │   │   └── services/       # AI adapters, PromptSynthesizer, Budget/Timeline engines
│   │   └── test/               # Comprehensive automated test suites (57 tests)
│   └── web/                    # Next.js 14 App Router frontend client
│       ├── src/
│       │   ├── app/            # Routes: /dashboard, /events, /tasks, /reports, /settings
│       │   ├── components/     # AppShell, CreateEventWizard, Badge, Card, Modal
│       │   └── lib/            # Type-safe API client adapter
│       └── vercel.json         # Vercel deployment configuration
├── packages/
│   └── shared/                 # Shared TypeScript types, Zod schemas, Money & Date utilities
│       ├── src/
│       │   ├── schemas/        # Event, Task, Expense, Plan Zod schemas
│       │   ├── templates/      # Canonical template registry loader
│       │   ├── types/          # Domain entity type declarations
│       │   └── utils/          # Minor-unit money & date calculation functions
│       └── test/               # Shared logic unit tests (16 tests)
├── templates/                  # Canonical declarative JSON templates (6 event categories)
├── render.yaml                 # Render Infrastructure-as-Code Blueprint
├── PHASE-4-IMPLEMENTATION-PLAN.md
├── PHASE-4-VERIFICATION-REPORT.md
└── README.md                   # System guide and documentation
```

---

## 10. License

MIT License. Designed and engineered for production reliability, security, and extensibility.
