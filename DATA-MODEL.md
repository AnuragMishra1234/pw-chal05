# Celebration & Event Planner — Data Model & Storage Specifications

**Document Version:** 1.0.0  
**Database Technology:** MongoDB 7.0+ (Mongoose ODM / Native Node.js Driver)  
**Schema Governance:** Shared Zod Schemas (`@celebration/shared`) + MongoDB Validation Rules

---

## 1. Domain Entities & Storage Principles

### 1.1 Strict Money & Currency Rules
1. **Integer Minor Units:** All monetary values (budgets, estimates, quotes, expenses) must **never** be stored as floating-point decimals. They are stored as 64-bit integer minor units (e.g., USD `$100.50` is stored as `10050` cents; INR `₹5,000` is stored as `500000` paise).
2. **Explicit Currency Pairing:** Every monetary field or subdocument must carry an explicit ISO 4217 currency code (e.g., `'USD'`, `'EUR'`, `'INR'`). Cross-currency aggregation requires explicit conversion rules.
3. **No Zero Defaults for Unknowns:** An unknown or unquoted cost must be represented as `null` or marked with `estimateStatus: "unverified_estimate"`. It must **never** be silently treated as `0`.

### 1.2 Timestamps & Timezones
1. **UTC Storage:** All dates and timestamps are persisted in MongoDB as UTC `ISODate` objects.
2. **Timezone Preservation:** The root `events` collection stores the event's canonical IANA timezone (e.g. `'America/Los_Angeles'`, `'Asia/Kolkata'`). All relative UI displays, countdowns, and day-of-event schedules are rendered in the event's configured timezone.

---

## 2. Collection Schemas

### 2.1 `users` Collection
Stores user credentials, profile information, and roles.
```json
{
  "_id": { "$oid": "65f1a001..." },
  "email": "organizer@example.com",
  "name": "Jane Organizer",
  "passwordHash": "$2b$12$...",
  "role": "organizer",
  "createdAt": { "$date": "2026-10-27T18:00:00.000Z" },
  "updatedAt": { "$date": "2026-10-27T18:00:00.000Z" }
}
```

### 2.2 `events` Collection
The aggregate root representing an individual event project.
```json
{
  "_id": { "$oid": "65f1a002..." },
  "ownerId": { "$oid": "65f1a001..." },
  "title": "Riverside Community River Clean-Up",
  "eventType": "community_event",
  "templateId": "community_event",
  "templateVersion": "1.0.0",
  "description": "Annual civic riverbed cleanup and ecology awareness rally.",
  "startDate": { "$date": "2027-04-22T08:00:00.000Z" },
  "endDate": { "$date": "2027-04-22T16:00:00.000Z" },
  "timezone": "America/New_York",
  "location": {
    "type": "physical",
    "address": "Riverside Park Pier 4",
    "city": "Albany",
    "country": "USA"
  },
  "currency": "USD",
  "budgetLimitMinorUnits": { "$numberLong": "350000" },
  "expectedAttendance": 120,
  "preferences": {
    "safetyFirstAidRequirement": true,
    "wasteDisposalMunicipalContract": true
  },
  "customPrompt": null,
  "activeModules": [
    "overview",
    "budget",
    "timeline",
    "tasks",
    "volunteers",
    "outreach",
    "equipment",
    "impact_tracking"
  ],
  "status": "active",
  "currentPlanId": { "$oid": "65f1a003..." },
  "createdAt": { "$date": "2026-10-27T18:00:00.000Z" },
  "updatedAt": { "$date": "2026-10-27T18:00:00.000Z" }
}
```

### 2.3 `plans` Collection
Contains versioned AI-generated plans. Revised plans are saved as new documents.
```json
{
  "_id": { "$oid": "65f1a003..." },
  "eventId": { "$oid": "65f1a002..." },
  "version": 1,
  "status": "active",
  "previousPlanId": null,
  "summary": "1-day comprehensive civic riverbed cleanup involving 120 volunteers across 3 zones.",
  "themeAndConcept": {
    "themeName": "Restore Our Waterway",
    "description": "Civic environmental stewardship and youth engagement."
  },
  "assumptions": [
    "Municipal park authority grants waste disposal container access by 07:00 AM.",
    "First aid station staffed by local EMT volunteer."
  ],
  "warnings": [
    "High river tide scheduled for 02:00 PM requires clearing lower embankment by 01:30 PM."
  ],
  "budgetProposal": {
    "suggestedContingencyPercentage": 10,
    "categories": [
      {
        "categoryName": "Safety & PPE Gear",
        "percentageOfBudget": 35,
        "reasoning": "High-durability puncture-proof gloves, fluorescent vests, and trash grabbers."
      },
      {
        "categoryName": "Volunteer Refreshments",
        "percentageOfBudget": 30,
        "reasoning": "Hydration coolers, healthy boxed lunches, and sunscreen."
      },
      {
        "categoryName": "Waste Hauling & Bags",
        "percentageOfBudget": 25,
        "reasoning": "Commercial contractor dumpster rental and heavy-duty bio bags."
      }
    ]
  },
  "timelineMilestones": [
    {
      "milestoneName": "Municipal Permit Approval",
      "daysBeforeEvent": 30,
      "description": "Confirm signed permit with City Parks department."
    }
  ],
  "eventDaySchedule": [
    {
      "timeOffsetHours": 0.0,
      "activityTitle": "Volunteer Check-In & Safety Briefing",
      "locationOrZone": "Pier 4 Tent",
      "leadRole": "Lead Safety Coordinator"
    }
  ],
  "providerMetadata": {
    "provider": "gemini",
    "model": "gemini-1.5-flash",
    "tokensUsed": 1280
  },
  "createdAt": { "$date": "2026-10-27T18:05:00.000Z" }
}
```

### 2.4 `tasks` Collection
Individual actionable task documents.
```json
{
  "_id": { "$oid": "65f1a004..." },
  "eventId": { "$oid": "65f1a002..." },
  "planId": { "$oid": "65f1a003..." },
  "title": "Order Heavy-Duty Puncture Proof Gloves",
  "category": "Safety & Equipment",
  "description": "Procure 150 pairs of nitrile-coated safety gloves in mixed sizes.",
  "status": "pending",
  "priority": "high",
  "dueAt": { "$date": "2027-04-08T00:00:00.000Z" },
  "estimatedDurationMinutes": 45,
  "dependencyTaskIds": [],
  "assignee": {
    "name": "Alex Volunteer Lead",
    "email": "alex@example.com"
  },
  "source": "ai",
  "createdAt": { "$date": "2026-10-27T18:05:00.000Z" },
  "updatedAt": { "$date": "2026-10-27T18:05:00.000Z" }
}
```

### 2.5 `budgets` Collection
Tracks total budget caps and deterministic category allocations.
```json
{
  "_id": { "$oid": "65f1a005..." },
  "eventId": { "$oid": "65f1a002..." },
  "currency": "USD",
  "totalLimitMinorUnits": { "$numberLong": "350000" },
  "allocatedMinorUnits": { "$numberLong": "315000" },
  "contingencyMinorUnits": { "$numberLong": "35000" },
  "categoryAllocations": [
    {
      "category": "Safety & PPE Gear",
      "allocatedMinorUnits": { "$numberLong": "122500" },
      "percentage": 35.0
    },
    {
      "category": "Volunteer Refreshments",
      "allocatedMinorUnits": { "$numberLong": "105000" },
      "percentage": 30.0
    },
    {
      "category": "Waste Hauling & Bags",
      "allocatedMinorUnits": { "$numberLong": "87500" },
      "percentage": 25.0
    }
  ],
  "updatedAt": { "$date": "2026-10-27T18:05:00.000Z" }
}
```

### 2.6 `expenses` Collection
Ledger entries tracking actual or quoted financial transactions.
```json
{
  "_id": { "$oid": "65f1a006..." },
  "eventId": { "$oid": "65f1a002..." },
  "category": "Safety & PPE Gear",
  "amountMinorUnits": { "$numberLong": "118000" },
  "currency": "USD",
  "status": "actual",
  "vendorName": "Industrial Safety Supply Co.",
  "paymentDate": { "$date": "2027-04-10T14:30:00.000Z" },
  "notes": "Invoice #4928 - Gloves and 120 safety vests with delivery",
  "receiptUrl": null,
  "createdAt": { "$date": "2026-10-27T18:10:00.000Z" }
}
```

---

## 3. Database Indexes

| Collection | Index Fields | Purpose |
| :--- | :--- | :--- |
| `events` | `{ ownerId: 1, startDate: -1 }` | Fast retrieval of user's event list sorted by date. |
| `events` | `{ status: 1 }` | Filter active vs archived events. |
| `plans` | `{ eventId: 1, version: -1 }` | Fetch latest plan version for an event instantly. |
| `tasks` | `{ eventId: 1, status: 1 }` | Kanban board filtering by status. |
| `tasks` | `{ eventId: 1, dueAt: 1 }` | Timeline and calendar deadline sorting. |
| `budgets` | `{ eventId: 1 }` (Unique) | Enforces 1:1 relationship between event and budget. |
| `expenses` | `{ eventId: 1, category: 1 }` | Category spending aggregation and variance checks. |
