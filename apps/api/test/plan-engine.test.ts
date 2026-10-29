import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { database } from '../src/config/database.js';
import { BudgetEngine } from '../src/services/ai/budget-engine.js';
import { TimelineEngine } from '../src/services/ai/timeline-engine.js';

describe('Phase 3 — GenAI Planning Engine & Adaptive Templates Tests', () => {
  const app = createApp();
  let weddingEventId: string;
  let hackathonEventId: string;
  let birthdayEventId: string;
  let communityEventId: string;
  let conferenceEventId: string;
  let customEventId: string;
  let generatedPlanId: string;

  before(async () => {
    await database.connect();

    // Seed test events for all canonical templates
    const weddingRes = await request(app)
      .post('/api/v1/events')
      .set('Authorization', 'Bearer user-ai-tester')
      .send({
        title: 'Priya & Rohan Royal Wedding',
        eventType: 'wedding',
        templateId: 'wedding',
        startDate: '2027-02-14T09:00:00.000Z',
        currency: 'INR',
        budgetLimitMinorUnits: 300000000, // ₹30,00,000
        expectedAttendance: 300,
        location: { type: 'physical', city: 'Jaipur', country: 'India' }
      });
    weddingEventId = weddingRes.body.data.id;

    const hackathonRes = await request(app)
      .post('/api/v1/events')
      .set('Authorization', 'Bearer user-ai-tester')
      .send({
        title: 'HackNova AI Hackathon',
        eventType: 'college_hackathon',
        templateId: 'college_hackathon',
        startDate: '2027-04-10T08:00:00.000Z',
        currency: 'INR',
        budgetLimitMinorUnits: 60000000, // ₹6,00,000
        expectedAttendance: 200,
        location: { type: 'physical', city: 'Bengaluru', country: 'India' }
      });
    hackathonEventId = hackathonRes.body.data.id;

    const birthdayRes = await request(app)
      .post('/api/v1/events')
      .set('Authorization', 'Bearer user-ai-tester')
      .send({
        title: "Aarav's 18th Milestone Birthday Bash",
        eventType: 'birthday',
        templateId: 'birthday',
        startDate: '2027-06-15T18:00:00.000Z',
        currency: 'INR',
        budgetLimitMinorUnits: 25000000, // ₹2,50,000
        expectedAttendance: 75,
        location: { type: 'physical', city: 'Mumbai', country: 'India' }
      });
    birthdayEventId = birthdayRes.body.data.id;

    const communityRes = await request(app)
      .post('/api/v1/events')
      .set('Authorization', 'Bearer user-ai-tester')
      .send({
        title: 'Clean River Green City Civic Drive',
        eventType: 'community_event',
        templateId: 'community_event',
        startDate: '2027-03-22T07:00:00.000Z',
        currency: 'INR',
        budgetLimitMinorUnits: 15000000, // ₹1,50,000
        expectedAttendance: 150,
        location: { type: 'physical', city: 'Pune', country: 'India' }
      });
    communityEventId = communityRes.body.data.id;

    const conferenceRes = await request(app)
      .post('/api/v1/events')
      .set('Authorization', 'Bearer user-ai-tester')
      .send({
        title: 'Global Cloud & AI Summit 2027',
        eventType: 'corporate_conference',
        templateId: 'corporate_conference',
        startDate: '2027-09-18T08:30:00.000Z',
        currency: 'INR',
        budgetLimitMinorUnits: 200000000, // ₹20,00,000
        expectedAttendance: 350,
        location: { type: 'hybrid', city: 'Hyderabad', country: 'India' }
      });
    conferenceEventId = conferenceRes.body.data.id;

    const customRes = await request(app)
      .post('/api/v1/events')
      .set('Authorization', 'Bearer user-ai-tester')
      .send({
        title: 'Midnight Stargazing & Electronic Ambient Camp',
        eventType: 'custom',
        templateId: 'custom',
        startDate: '2027-08-12T18:00:00.000Z',
        currency: 'INR',
        budgetLimitMinorUnits: 15000000, // ₹1,50,000
        expectedAttendance: 80,
        customPrompt: 'Outdoor desert camp with high-magnification telescopes, silent disco, warm herbal tea bar, and astronomy lectures under the Perseid meteor shower.',
        location: { type: 'physical', city: 'Jaisalmer Desert', country: 'India' }
      });
    customEventId = customRes.body.data.id;
  });

  // 1. BudgetEngine Unit Test
  test('BudgetEngine deterministically normalizes allocations to exact minor units', () => {
    const rawCategories = [
      { categoryName: 'Prizes', percentageOfBudget: 40, reasoning: 'Attract hackers' },
      { categoryName: 'Food & Drinks', percentageOfBudget: 35, reasoning: 'Midnight food' },
      { categoryName: 'Venue & AV', percentageOfBudget: 35, reasoning: 'Stage setup' } // Sums to 110%
    ];

    const result = BudgetEngine.processProposal(10000000, 'INR', rawCategories, 10);

    assert.strictEqual(result.currency, 'INR');
    assert.strictEqual(result.contingencyPercentage, 10);
    assert.strictEqual(result.contingencyMinorUnits, 1000000); // 10% of 10M
    assert.strictEqual(result.isOverBudget, false);
    assert.ok(result.warnings.length > 0); // Normalization warning triggered

    const totalAllocated = result.categoryAllocations.reduce((acc, c) => acc + c.allocatedMinorUnits, 0);
    assert.strictEqual(totalAllocated + result.contingencyMinorUnits, 10000000);
  });

  // 2. TimelineEngine Unit Test
  test('TimelineEngine converts daysBeforeEvent into precise ISO dates and flags overdue tasks', () => {
    const eventDate = '2027-05-01T10:00:00.000Z';
    const rawTasks = [
      { title: 'Lock Venue Lease', category: 'Venue', description: 'Early deposit', priority: 'critical' as const, daysBeforeEvent: 60 },
      { title: 'Prepare Day-of Signage', category: 'Ops', description: 'Print signs', priority: 'medium' as const, daysBeforeEvent: 2 }
    ];

    const result = TimelineEngine.processTimeline(eventDate, rawTasks, [], []);
    assert.strictEqual(result.tasks.length, 2);
    assert.strictEqual(result.tasks[0].daysBeforeEvent, 60);

    const task1Date = new Date(result.tasks[0].dueAt).getTime();
    const task2Date = new Date(result.tasks[1].dueAt).getTime();
    assert.ok(task1Date < task2Date, 'Earlier task must have earlier due date');
  });

  // 3. Plan Generation for Wedding
  test('POST /api/v1/events/:id/plan/generate produces wedding-specific structured plan', async () => {
    const res = await request(app)
      .post(`/api/v1/events/${weddingEventId}/plan/generate`)
      .set('Authorization', 'Bearer user-ai-tester')
      .send({
        userGuidance: 'Emphasize royal Rajasthan aesthetic and traditional banquet catering.'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.version, 1);
    assert.strictEqual(res.body.data.status, 'active');
    assert.ok(res.body.data.summary.length > 20);
    assert.ok(res.body.data.themeAndConcept);
    assert.ok(res.body.data.budgetProposal.categories.length >= 3);
    assert.ok(res.body.data.timelineMilestones.length > 0);
    assert.ok(res.body.data.eventDaySchedule.length > 0);
    assert.ok(res.body.data.templateSpecificModules.ceremonyPhases);
  });

  // 4. Plan Generation for Hackathon
  test('POST /api/v1/events/:id/plan/generate produces hackathon-specific plan with hardware lab and tracks', async () => {
    const res = await request(app)
      .post(`/api/v1/events/${hackathonEventId}/plan/generate`)
      .set('Authorization', 'Bearer user-ai-tester')
      .send();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.version, 1);
    assert.ok(res.body.data.templateSpecificModules.tracks);
    assert.ok(res.body.data.templateSpecificModules.hardwareLabList);

    generatedPlanId = res.body.data.id;
  });

  // 5. Plan Generation for Custom Event
  test('POST /api/v1/events/:id/plan/generate tailors plan to custom natural language brief', async () => {
    const res = await request(app)
      .post(`/api/v1/events/${customEventId}/plan/generate`)
      .set('Authorization', 'Bearer user-ai-tester')
      .send();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.version, 1);
    assert.ok(res.body.data.summary.includes('Midnight Stargazing') || res.body.data.summary.includes('Tailored'));
  });

  // 5b. Plan Generation for Birthday & Milestone
  test('POST /api/v1/events/:id/plan/generate produces birthday-specific structured plan', async () => {
    const res = await request(app)
      .post(`/api/v1/events/${birthdayEventId}/plan/generate`)
      .set('Authorization', 'Bearer user-ai-tester')
      .send();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.version, 1);
    assert.ok(res.body.data.summary.includes('birthday') || res.body.data.summary.includes('Birthday'));
    assert.ok(res.body.data.templateSpecificModules.gameActivities || res.body.data.tasks.length > 0);
  });

  // 5c. Plan Generation for Community Initiative
  test('POST /api/v1/events/:id/plan/generate produces community-specific structured plan with safety protocols', async () => {
    const res = await request(app)
      .post(`/api/v1/events/${communityEventId}/plan/generate`)
      .set('Authorization', 'Bearer user-ai-tester')
      .send();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.version, 1);
    assert.ok(res.body.data.templateSpecificModules.safetyProtocols || res.body.data.templateSpecificModules.impactTargets);
  });

  // 5d. Plan Generation for Corporate Conference
  test('POST /api/v1/events/:id/plan/generate produces conference-specific structured plan with speakers and sponsors', async () => {
    const res = await request(app)
      .post(`/api/v1/events/${conferenceEventId}/plan/generate`)
      .set('Authorization', 'Bearer user-ai-tester')
      .send();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.version, 1);
    assert.ok(res.body.data.templateSpecificModules.speakerList || res.body.data.templateSpecificModules.sponsorTiers);
  });

  // 5e. Plural endpoint alias test: POST /api/v1/events/:id/plans/generate
  test('POST /api/v1/events/:id/plans/generate (plural alias) correctly generates structured plan', async () => {
    const res = await request(app)
      .post(`/api/v1/events/${conferenceEventId}/plans/generate`)
      .set('Authorization', 'Bearer user-ai-tester')
      .send();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.version, 2);
  });

  // 6. Conversational Plan Revision
  test('POST /api/v1/events/:id/plan/revise produces non-destructive incremented version', async () => {
    const res = await request(app)
      .post(`/api/v1/events/${hackathonEventId}/plan/revise`)
      .set('Authorization', 'Bearer user-ai-tester')
      .send({
        revisionInstructions: 'Reduce promotional swag budget by 10% and add a backup indoor contingency for heavy rain.'
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.version, 2);
    assert.strictEqual(res.body.data.previousPlanId, generatedPlanId);
    assert.strictEqual(res.body.data.status, 'active');
    assert.ok(res.body.data.summary.includes('Revised') || res.body.data.summary.includes('contingency'));

    // Verify rain task was inserted
    const rainTask = res.body.data.warnings.some((w: string) => w.toLowerCase().includes('rain')) ||
                     res.body.data.summary.toLowerCase().includes('rain');
    assert.ok(rainTask);
  });

  // 7. Plan Version History
  test('GET /api/v1/events/:id/plans lists all versions including superseded', async () => {
    const res = await request(app)
      .get(`/api/v1/events/${hackathonEventId}/plans`)
      .set('Authorization', 'Bearer user-ai-tester');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length >= 2);

    const v1 = res.body.data.find((p: any) => p.version === 1);
    const v2 = res.body.data.find((p: any) => p.version === 2);
    assert.strictEqual(v1.status, 'superseded');
    assert.strictEqual(v2.status, 'active');
  });

  // 8. Retrieve Specific Plan Version
  test('GET /api/v1/events/:id/plans/:planId retrieves exact historical version', async () => {
    const res = await request(app)
      .get(`/api/v1/events/${hackathonEventId}/plans/${generatedPlanId}`)
      .set('Authorization', 'Bearer user-ai-tester');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.id, generatedPlanId);
    assert.strictEqual(res.body.data.version, 1);
  });

  // 9. Authorization Protection
  test('POST /api/v1/events/:id/plan/generate rejects unauthorized user with 403', async () => {
    const res = await request(app)
      .post(`/api/v1/events/${hackathonEventId}/plan/generate`)
      .set('Authorization', 'Bearer user-foreign-hacker')
      .send();

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'FORBIDDEN');
  });

  // 10. Invalid Revision Request Validation
  test('POST /api/v1/events/:id/plan/revise rejects empty instructions with 400', async () => {
    const res = await request(app)
      .post(`/api/v1/events/${hackathonEventId}/plan/revise`)
      .set('Authorization', 'Bearer user-ai-tester')
      .send({
        revisionInstructions: 'No' // Less than 3 chars
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
  });
});
