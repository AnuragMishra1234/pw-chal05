# Celebration & Event Planner

> Universal Generative AI-Powered Event Planning & Lifecycle Management Platform

[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/next.js-14%2B-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 1. Product Overview

**Celebration & Event Planner** is an intelligent web application designed to help individuals, families, student organizers, community leaders, and business coordinators plan, budget, organize, and execute events.

### Core Architectural Principle
> **ONE UNIVERSAL DASHBOARD + ONE SHARED PLANNING ENGINE + CONFIGURABLE EVENT TEMPLATES**

Rather than creating separate siloed apps for weddings, hackathons, and corporate conferences, the platform uses a single unified dashboard and shared planning engine. Specialized modules and workflows adapt dynamically based on declarative, versioned event templates.

### Supported Event Types
1. **Wedding & Anniversary (`wedding`):** Guests, vendors, catering, ceremony milestones, attire, and decor.
2. **Birthday & Private Celebration (`birthday`):** Guest list, themes, cake/refreshments, entertainment, and party timeline.
3. **College Hackathon (`college_hackathon`):** Registrations, teams, mentors, judges, tracks, equipment, sponsors, and prizes.
4. **Community Event (`community_event`):** Volunteers, outreach, municipal permits, safety gear, logistics, and impact tracking.
5. **Corporate Conference (`corporate_conference`):** Speakers, tracks, sponsors, AV production, attendees, and executive catering.
6. **Custom Event (`custom`):** Open-ended natural language event description mapped to adaptive planning modules.

---

## 2. Current Implementation Status

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 0** | **Project Initialization & Master Blueprint** | **COMPLETED** |
| **Phase 1** | **Foundation, UI Shell, and Event Model** | **COMPLETED** |
| **Phase 2** | **Backend, Database, and Event Management** | **COMPLETED** |
| **Phase 3** | **GenAI Planning Engine & Adaptive Templates** | **COMPLETED** |
| **Phase 4** | **Integration, Testing, Security, & Deployment** | Documented & Ready for Implementation |

---

## 3. Prerequisites

- **Node.js:** `>= 20.0.0` (Tested on `v22.23.1`)
- **Package Manager:** `npm >= 10.0.0` (npm workspaces enabled)
- **Database:** MongoDB 7.0+ (Local instance or MongoDB Atlas URI for Phase 2+)
- **GenAI Provider:** Google Gemini API Key or Groq API Key (For Phase 3+)

---

## 4. Project Structure

```
celebration-event-planner/
├── apps/
│   ├── web/                    # Next.js App Router, React 18, Tailwind CSS
│   └── api/                    # Node.js, Express, TypeScript REST API
├── packages/
│   └── shared/                 # Shared TypeScript interfaces & Zod validation schemas
├── templates/                  # Canonical versioned event template JSON configurations
│   ├── wedding.json
│   ├── birthday.json
│   ├── college_hackathon.json
│   ├── community_event.json
│   └── corporate_conference.json
├── docs/                       # Architecture diagrams & design notes
├── WHOLE-PROJECT.md            # Master Project Blueprint & Specification
├── PHASE-0-INITIALIZATION.md   # Phase 0 setup and initialization report
├── PHASE-1-FOUNDATION.md       # Phase 1 UI shell and event model specification
├── PHASE-2-BACKEND-DATABASE.md # Phase 2 REST API and MongoDB specification
├── PHASE-3-GENAI-ENGINE.md     # Phase 3 GenAI adapter and calculation engines
├── PHASE-4-INTEGRATION-DEPLOYMENT.md # Phase 4 E2E flows, security, and deployment
├── ARCHITECTURE.md             # Detailed architectural trade-offs & data flows
├── API-SPECIFICATION.md        # REST API endpoints, schemas, and error contracts
├── DATA-MODEL.md               # MongoDB schemas, money rules, and indexing strategy
├── TESTING-STRATEGY.md         # Unit, API, AI-mocking, and E2E test plan
├── README.md                   # This onboarding and run guide
├── .env.example                # Sanitized configuration template
└── .gitignore                  # Git exclusions for dependencies, builds, and secrets
```

---

## 5. Installation & Run Instructions

### 5.1 Installation
Clone the repository and install all workspace dependencies from the root:
```bash
npm install
```

### 5.2 Environment Setup
Copy the template environment file:
```bash
cp .env.example .env
```
Configure your database URI and API keys when reaching the corresponding phases.

### 5.3 Building All Applications
```bash
npm run build
```

### 5.4 Running Development Servers
- **Run all workspaces simultaneously:**
  ```bash
  npm run dev
  ```
- **Run Backend API only (`http://localhost:8000`):**
  ```bash
  npm run dev:api
  ```
- **Run Web Frontend only (`http://localhost:3000`):**
  ```bash
  npm run dev:web
  ```

### 5.5 Type Checking
Run strict TypeScript verification across all packages:
```bash
npm run typecheck
```

---

## 6. Testing

Run tests across all workspaces:
```bash
npm test
```
- Shared Unit Tests: `npm run test -w packages/shared`
- API Tests: `npm run test -w apps/api`

---

## 7. Deployment Overview

- **Frontend (`apps/web`):** Deployable to **Vercel** with automatic SSR and CDN asset distribution.
- **Backend (`apps/api`):** Deployable to **Render**, **Railway**, or **AWS ECS** as a containerized Node.js service.
- **Persistence:** Hosted **MongoDB Atlas** cluster with TLS encryption and IP whitelist.
- **Secrets Management:** Environment variables configured in host dashboards. **Zero secrets are committed to git.**

---

## 8. Current Phase Status & Phase 3 Preparation

1. **Phase 1 Frontend & Universal Dashboard:** Completed and verified (11 routes prerendered/dynamic).
2. **Phase 2 Backend & Database:** Completed and verified (Express REST API under `/api/v1`, Mongoose schemas, in-memory repository fallback for zero-config dev/test, and 19 passing integration tests).
3. **Phase 3 GenAI Engine (Upcoming):** Live LLM generation (Gemini / Groq), prompt composition with few-shot examples, JSON-mode repair, streaming plan generation, and revision diffing will be implemented in Phase 3.

