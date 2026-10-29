# Celebration & Event Planner — System Architecture

**Document Version:** 1.0.0  
**Target Environment:** Node.js 20+, Next.js 14+ App Router, Express, MongoDB Atlas, Cloud LLMs (Gemini / Groq)

---

## 1. High-Level System Architecture

The **Celebration & Event Planner** is architected as a **Modular Monolith** organized within an npm workspace monorepo. This balances simplicity of deployment and developer velocity with clean boundary isolation between the client presentation layer, server application logic, persistent database, and third-party AI inference providers.

```mermaid
flowchart TB
    subgraph ClientLayer["Frontend Client (Next.js 14+ App Router)"]
        UIApp["React 18 / Tailwind Components"]
        ClientState["React Query / SWR / Local State"]
        SharedClient["@celebration/shared (Schemas & Types)"]
    end

    subgraph APILayer["Backend API Gateway (Express REST API)"]
        HTTPRouter["Express Router (/api/v1)"]
        AuthGuards["Authentication & Ownership Guards"]
        ZodValidator["Zod Input Validation Middleware"]
        
        subgraph DomainServices["Domain Service Layer"]
            EventMgr["Event Service"]
            TemplateReg["Template Registry"]
            PlanningOrch["Planning Orchestrator"]
            BudgetCalc["Deterministic Budget Engine"]
            TimelineCalc["Timeline & Milestone Engine"]
            TaskMgr["Task Service"]
        end
        
        RepoLayer["Data Access Repository Layer"]
        SharedServer["@celebration/shared (Schemas & Types)"]
    end

    subgraph DataLayer["Persistence Layer"]
        MongoDB[("MongoDB Atlas")]
    end

    subgraph ExternalServices["External Intelligence"]
        AIAdapter["GenAI Provider Adapter"]
        GeminiAPI["Google Gemini API"]
        GroqAPI["Groq Cloud API"]
    end

    UIApp -->|HTTPS / JSON REST| HTTPRouter
    HTTPRouter --> AuthGuards --> ZodValidator
    ZodValidator --> DomainServices
    DomainServices --> RepoLayer --> MongoDB
    PlanningOrch --> AIAdapter
    AIAdapter -->|Server-side Secret| GeminiAPI
    AIAdapter -->|Server-side Secret| GroqAPI
    AIAdapter -->|Raw Model Output| PlanningOrch
    PlanningOrch --> BudgetCalc
    PlanningOrch --> TimelineCalc
```

---

## 2. Component Responsibilities & Boundaries

### 2.1 Presentation Layer (`apps/web`)
- **Technology:** Next.js 14+ App Router, React 18, Tailwind CSS, Lucide icons, Recharts.
- **Responsibilities:**
  - Rendering responsive, accessible user interfaces across desktop, tablet, and mobile.
  - Client-side navigation, form step wizard, and dynamic module card rendering based on active event templates.
  - Interactive task management (status transitions, priority filtering) and expense entry.
  - Handling loading skeletons, empty states, and user-facing error banners.
  - **Boundary Rule:** No direct database connections; no direct AI provider calls; zero storage of API keys or server secrets.

### 2.2 Shared Domain Package (`packages/shared`)
- **Technology:** TypeScript, Zod.
- **Responsibilities:**
  - Canonical type definitions for `Event`, `Plan`, `Task`, `Budget`, `Expense`, and `Template`.
  - Shared Zod validation schemas for request bodies, query parameters, and AI output payloads.
  - Shared domain constants (supported currencies, module IDs, task statuses).
  - **Boundary Rule:** Contains no runtime dependencies on Node.js or browser DOM APIs; usable anywhere.

### 2.3 Backend API Layer (`apps/api`)
- **Technology:** Node.js, Express, TypeScript, Mongoose/MongoDB Driver.
- **Responsibilities:**
  - Exposing versioned REST API endpoints (`/api/v1/*`).
  - Request validation and sanitization using Zod.
  - Enforcing authentication and event-level ownership guards.
  - Executing business logic in pure domain services.
  - Securely orchestrating AI calls and parsing structured JSON.
  - Performing deterministic budget calculations and date arithmetic.
  - **Boundary Rule:** Owns all communication with MongoDB and external AI providers.

### 2.4 Data Persistence Layer (MongoDB)
- **Technology:** MongoDB Atlas / Local MongoDB.
- **Responsibilities:**
  - Persistent document storage across collections: `users`, `events`, `plans`, `tasks`, `budgets`, `expenses`, `modules`.
  - Enforcing document integrity and query performance via strategic indexes.
  - Maintaining versioned history of AI-generated plans.

---

## 3. Data Flow & AI Orchestration Flow

### 3.1 AI Plan Generation Data Flow
```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant API as Express Router (/plans/generate)
    participant Auth as Ownership Guard
    participant Orch as Planning Orchestrator
    participant Adapter as AI Provider Adapter
    participant LLM as External Model (Gemini/Groq)
    participant Calc as Deterministic Calculators
    participant DB as MongoDB Repository

    User->>API: POST /api/v1/events/:id/plans/generate
    API->>Auth: Verify user session & event ownership
    Auth-->>API: Authorized
    API->>Orch: generatePlan(eventId, options)
    Orch->>DB: Fetch Event Record & Template Configuration
    DB-->>Orch: Event data & Template rules
    Orch->>Orch: Construct prompt with constraints & strict JSON schema
    Orch->>Adapter: callModel(prompt, schema)
    Adapter->>LLM: Secure HTTPS API call with server key
    LLM-->>Adapter: Raw JSON text response
    Adapter-->>Orch: Raw text payload
    Orch->>Orch: Parse & validate via Zod (RawAIPlanSchema)
    alt Validation Failure
        Orch->>Adapter: Perform bounded repair request (max 1)
        Adapter->>LLM: Repair prompt
        LLM-->>Adapter: Repaired JSON
        Adapter-->>Orch: Repaired JSON
    end
    Orch->>Calc: Compute integer minor-unit budget & calendar due dates
    Calc-->>Orch: Computed allocations & verified task milestones
    Orch->>DB: Save new plan version & persist generated tasks
    DB-->>Orch: Saved plan record
    Orch-->>API: Clean DTO response
    API-->>User: 201 Created (Normalized Plan)
```

---

## 4. Key Design Decisions & Trade-Offs

### 4.1 Decision: Single Universal Dashboard vs. Multi-App Architecture
- **Choice:** One universal dashboard adapting via configurable event templates.
- **Rationale:** Building separate apps for weddings, hackathons, and corporate events leads to code duplication, fractured maintenance, and architectural bloat. A single adaptive dashboard provides maximum reusability while dynamically surfacing relevant modules.
- **Trade-off:** The frontend UI must handle conditional rendering of modules cleanly based on template metadata.

### 4.2 Decision: Deterministic Code vs. LLM Calculations
- **Choice:** Application code calculates all financial totals, minor-unit conversions, and calendar date offsets.
- **Rationale:** Large Language Models are probabilistic and prone to arithmetic hallucinations, rounding errors, and impossible date math (e.g., February 31st or past deadlines).
- **Trade-off:** The planning orchestrator must parse model percentages and apply deterministic algorithms to produce trustworthy numbers.

### 4.3 Decision: Integer Minor Units for Monetary Values
- **Choice:** All budgets and expenses are stored as 64-bit integer minor units (e.g. cents, pence, paise).
- **Rationale:** Floating-point numbers introduce IEEE-754 precision errors (e.g. `0.1 + 0.2 = 0.30000000000000004`). Integer arithmetic guarantees financial exactness.
- **Trade-off:** Requires explicit conversion utilities when rendering display strings in the UI.

### 4.4 Decision: Monolith vs. Microservices
- **Choice:** Modular Monolith in an npm workspace.
- **Rationale:** Microservices introduce distributed complexity, network latency, and deployment friction that are counter-productive for this project. A modular monolith provides clear module boundaries and can be split later if scaling necessitates it.

---

## 5. Deployment Architecture

```mermaid
flowchart LR
    Browser["End User Browser"] -->|HTTPS| Vercel["Vercel CDN / Edge (apps/web)"]
    Vercel -->|API Requests| Render["Render / Node.js Service (apps/api)"]
    Render -->|Encrypted TLS| Atlas[("MongoDB Atlas Database")]
    Render -->|Outbound HTTPS| AI["Gemini / Groq AI APIs"]
```

- **Frontend:** Deployed to Vercel with automatic edge caching, SSR, and asset optimization.
- **Backend:** Deployed as a containerized Node.js service on Render or Railway with automatic health checks.
- **Database:** Hosted on MongoDB Atlas with IP access lists and encrypted storage.
- **AI Services:** Consumed via official HTTPS REST/SDK channels with server-side environment variables.
