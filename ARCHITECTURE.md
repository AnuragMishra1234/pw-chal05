# Celebration & Event Planner — System Architecture

**Document Version:** 2.0.0 (Phase 4 Certified)  
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
        SecurityHeaders["Security Headers Middleware (CSP, HSTS, DENY)"]
        RateLimiter["Sliding Window Rate Limiter (AI: 5/min, General: 100/min)"]
        HTTPRouter["Express Router (/api/v1)"]
        AuthGuards["Authentication & Ownership Guards"]
        ZodValidator["Zod Input Validation Middleware"]
        
        subgraph DomainServices["Domain Service Layer"]
            EventMgr["Event Service"]
            TemplateReg["Template Registry"]
            PlanningOrch["Planning Orchestrator (Concurrency Locked)"]
            BudgetCalc["Deterministic Budget Engine"]
            TimelineCalc["Timeline & Milestone Engine"]
            TaskMgr["Task Service"]
        end
        
        RepoLayer["Data Access Repository Layer (Hybrid Atlas / In-Memory)"]
        SharedServer["@celebration/shared (Schemas & Types)"]
    end

    subgraph DataLayer["Persistence Layer"]
        MongoDB[("MongoDB Atlas Database")]
    end

    subgraph ExternalServices["External Intelligence"]
        AIAdapter["GenAI Provider Adapter (with Bounded Retries)"]
        GeminiAPI["Google Gemini API (1.5 Flash/Pro)"]
        GroqAPI["Groq Cloud API (Llama 3.3 70B)"]
    end

    UIApp -->|HTTPS / JSON REST| SecurityHeaders
    SecurityHeaders --> RateLimiter
    RateLimiter --> HTTPRouter
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

## 2. Shared Type & Contract System

The `@celebration/shared` package serves as the single source of truth for TypeScript interfaces, Zod runtime validation schemas, domain types, and template definitions. Both the frontend Next.js application and the backend Express API consume this shared contract library.

```mermaid
flowchart LR
    Shared["@celebration/shared<br/>(Schemas, Types, Templates, Arithmetic)"]
    Shared -->|Client Types & Validation| Web["apps/web (Next.js Client)"]
    Shared -->|Request Parsing & Business Rules| API["apps/api (Express Backend)"]
```

---

## 3. GenAI Plan Generation Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User as Event Organizer
    participant API as Express API (/plan/generate)
    participant Rate as Rate Limiter (5 req/min)
    participant Auth as Ownership Guard
    participant Orch as Planning Orchestrator
    participant Adapter as AI Provider Adapter
    participant LLM as Gemini / Groq Cloud API
    participant Calc as Budget & Timeline Engines
    participant DB as MongoDB Repository

    User->>API: POST /api/v1/events/:id/plan/generate
    API->>Rate: Check 5 req/min quota
    Rate-->>API: Quota OK
    API->>Auth: Validate user owns event
    Auth-->>API: Authorized
    API->>Orch: generatePlan(eventId, options)
    Note over Orch: Acquire event concurrency lock
    Orch->>DB: Fetch Event Record & Template Configuration
    DB-->>Orch: Event data & Template rules
    Orch->>Orch: Construct prompt with constraints & strict JSON schema
    Orch->>Adapter: callModel(prompt, schema)
    Adapter->>LLM: Secure HTTPS API call with server key (Bounded retries)
    LLM-->>Adapter: Raw JSON text response
    Adapter-->>Orch: Raw text payload
    Orch->>Orch: Parse & validate via Zod (RawAIPlanSchema)
    Orch->>Calc: Compute integer minor-unit budget & calendar due dates
    Calc-->>Orch: Computed allocations & verified task milestones
    Orch->>DB: Save new plan version & persist generated tasks
    DB-->>Orch: Saved plan record
    Note over Orch: Release event concurrency lock
    Orch-->>API: Clean DTO response
    API-->>User: 201 Created (Normalized Plan)
```

---

## 4. Key Design Decisions & Trade-Offs

### 4.1 Decision: Single Universal Dashboard vs. Multi-App Architecture
- **Choice:** One universal dashboard adapting via configurable event templates.
- **Rationale:** Building separate apps for weddings, hackathons, and corporate events leads to code duplication, fractured maintenance, and architectural bloat. A single adaptive dashboard provides maximum reusability while dynamically surfacing relevant modules.

### 4.2 Decision: Deterministic Code vs. LLM Calculations
- **Choice:** Application code calculates all financial totals, minor-unit conversions, and calendar date offsets.
- **Rationale:** Large Language Models are probabilistic and prone to arithmetic hallucinations, rounding errors, and impossible date math.
- **Trade-off:** The planning orchestrator parses model percentages and applies deterministic algorithms to produce trustworthy numbers.

### 4.3 Decision: Integer Minor Units for Monetary Values
- **Choice:** All budgets and expenses are stored as 64-bit integer minor units (e.g. cents, paise).
- **Rationale:** Floating-point numbers introduce IEEE-754 precision errors (`0.1 + 0.2 = 0.30000000000000004`). Integer arithmetic guarantees financial exactness.

### 4.4 Decision: Monolith vs. Microservices
- **Choice:** Modular Monolith in an npm workspace.
- **Rationale:** Microservices introduce distributed complexity, network latency, and deployment friction that are counter-productive for this project.

---

## 5. Production Security & Resilience Architecture (Phase 4)

### 5.1 Strict Multi-Tenancy & Authorization
- Every event mutation and nested resource (tasks, budgets, expenses, plans) validates `event.ownerId === currentUser.id`.
- Cross-user attempts are immediately rejected with `403 FORBIDDEN`.
- Admins (`role: 'admin'`) retain multi-tenant support access.

### 5.2 Sliding Window Rate Limiting
- **GenAI Endpoints:** 5 requests per minute per client IP/user ID. Returns `429 Too Many Requests` with `Retry-After` header.
- **General Endpoints:** 100 requests per minute per client IP.

### 5.3 Concurrency Control
- `PlanningOrchestrator` maintains an active event lock set. Simultaneous duplicate generation calls for the same event reject with `409 Conflict`, preventing database races.

### 5.4 Production Fail-Fast Validation
- In `NODE_ENV=production`, server boot strictly asserts `MONGODB_URI`, `SESSION_SECRET`, and provider credentials. Silent fallback to in-memory store is prohibited in production.

### 5.5 Transient Error Resilience
- Gemini and Groq adapters implement bounded exponential backoff retries (max 2 retries) for transient HTTP 429 and 503 errors.

---

## 6. Deployment Architecture

```mermaid
flowchart LR
    Browser["End User Browser"] -->|HTTPS| Vercel["Vercel CDN / Edge (apps/web)"]
    Vercel -->|API Requests| Render["Render / Node.js Service (apps/api)"]
    Render -->|Encrypted TLS| Atlas[("MongoDB Atlas Database")]
    Render -->|Outbound HTTPS| AI["Gemini / Groq AI APIs"]
```

- **Frontend:** Deployed to Vercel with automatic edge caching, SSR, and asset optimization.
- **Backend:** Deployed as a containerized Node.js service on Render with automatic health checks (`render.yaml`).
- **Database:** Hosted on MongoDB Atlas with IP access lists and encrypted storage.
- **AI Services:** Consumed via official HTTPS REST/SDK channels with server-side environment variables.
