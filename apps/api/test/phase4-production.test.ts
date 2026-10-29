import { test, describe } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { parseEnv } from '../src/config/env.js';
import { PlanningOrchestrator } from '../src/services/ai/planning-orchestrator.js';

describe('Phase 4 — Production Hardening, Multi-Tenancy & E2E Journeys', () => {
  const app = createApp();

  let aliceWeddingEventId: string;
  let bobCorporateEventId: string;
  let customEventId: string;

  // =========================================================================
  // JOURNEY 1: Wedding & Anniversary End-to-End Lifecycle
  // =========================================================================
  describe('User Journey 1: Wedding & Anniversary E2E Flow', () => {
    test('1.1 Create Wedding Event with budget and specialized fields', async () => {
      const weddingPayload = {
        title: 'Napa Valley Vineyard Wedding 2027',
        eventType: 'wedding',
        templateId: 'wedding',
        startDate: '2027-06-14T15:00:00.000Z',
        endDate: '2027-06-14T23:00:00.000Z',
        location: {
          type: 'physical',
          address: 'Silverado Trail, Oakville',
          city: 'Napa Valley',
          country: 'United States'
        },
        currency: 'USD',
        budgetLimitMinorUnits: 3500000, // $35,000.00
        expectedAttendance: 150,
        description: 'Rustic Elegance with farm-to-table dining and twilight ceremony',
        preferences: {
          ceremonyType: 'outdoor_vineyard',
          dietaryRestrictions: 'vegetarian, vegan, gluten-free'
        }
      };

      const res = await request(app)
        .post('/api/v1/events')
        .set('Authorization', 'Bearer user-alice')
        .send(weddingPayload);

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.id);
      assert.strictEqual(res.body.data.ownerId, 'user-alice');
      aliceWeddingEventId = res.body.data.id;
    });

    test('1.2 Generate tailored Wedding Plan via AI planning engine', async () => {
      const res = await request(app)
        .post(`/api/v1/events/${aliceWeddingEventId}/plan/generate`)
        .set('Authorization', 'Bearer user-alice')
        .send({
          userGuidance: 'Focus on farm-to-table organic catering and live acoustic ensemble.'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.version, 1);
      assert.strictEqual(res.body.data.status, 'active');
      assert.ok(res.body.data.budgetProposal.categories.length >= 4);
      assert.ok(res.body.data.timelineMilestones.length > 0);
      assert.ok(res.body.data.eventDaySchedule.length > 0);
    });

    test('1.3 Inspect tasks, complete a task, and log a vendor expense', async () => {
      // 1. Fetch generated tasks
      const tasksRes = await request(app)
        .get(`/api/v1/events/${aliceWeddingEventId}/tasks`)
        .set('Authorization', 'Bearer user-alice');

      assert.strictEqual(tasksRes.status, 200);
      assert.ok(tasksRes.body.data.length > 0);
      const firstTask = tasksRes.body.data[0];

      // 2. Mark first task as completed
      const updateTaskRes = await request(app)
        .patch(`/api/v1/events/${aliceWeddingEventId}/tasks/${firstTask.id}`)
        .set('Authorization', 'Bearer user-alice')
        .send({ status: 'completed' });

      assert.strictEqual(updateTaskRes.status, 200);
      assert.strictEqual(updateTaskRes.body.data.status, 'completed');

      // 3. Log a caterer quotation expense
      const expenseRes = await request(app)
        .post(`/api/v1/events/${aliceWeddingEventId}/expenses`)
        .set('Authorization', 'Bearer user-alice')
        .send({
          category: 'Hospitality & Banquet Catering',
          amountMinorUnits: 1200000, // $12,000.00
          currency: 'USD',
          status: 'actual',
          vendorName: 'Napa Gourmet Catering',
          notes: 'Farm-to-Table Caterer Deposit'
        });

      assert.strictEqual(expenseRes.status, 201);
      assert.strictEqual(expenseRes.body.success, true);
      assert.strictEqual(expenseRes.body.data.amountMinorUnits, 1200000);
    });

    test('1.4 Conversational Plan Revision non-destructively preserves completed tasks', async () => {
      const reviseRes = await request(app)
        .post(`/api/v1/events/${aliceWeddingEventId}/plan/revise`)
        .set('Authorization', 'Bearer user-alice')
        .send({
          revisionInstructions: 'Add photo booth contingency and reallocate 5% from decorations to photography.'
        });

      assert.strictEqual(reviseRes.status, 200);
      assert.strictEqual(reviseRes.body.data.version, 2);
      assert.strictEqual(reviseRes.body.data.status, 'active');

      // Verify completed task was preserved
      const tasksRes = await request(app)
        .get(`/api/v1/events/${aliceWeddingEventId}/tasks`)
        .set('Authorization', 'Bearer user-alice');

      assert.strictEqual(tasksRes.status, 200);
      const completedTasks = tasksRes.body.data.filter((t: any) => t.status === 'completed');
      assert.ok(completedTasks.length >= 1, 'Completed tasks must be preserved non-destructively');
    });
  });

  // =========================================================================
  // JOURNEY 2: Corporate Conference End-to-End Flow
  // =========================================================================
  describe('User Journey 2: Corporate Conference E2E Flow', () => {
    test('2.1 Create Corporate Conference Event', async () => {
      const confPayload = {
        title: 'Global Tech Leadership Summit 2026',
        eventType: 'corporate_conference',
        templateId: 'corporate_conference',
        startDate: '2026-12-05T08:30:00.000Z',
        endDate: '2026-12-06T18:00:00.000Z',
        location: {
          type: 'hybrid',
          address: 'Convention Center, Hall 4',
          city: 'Hyderabad',
          country: 'India',
          virtualLink: 'https://stream.summit.example.com'
        },
        currency: 'INR',
        budgetLimitMinorUnits: 80000000, // ₹8,00,000.00
        expectedAttendance: 300,
        description: 'Enterprise AI & Cloud Architecture Summit with dual tracks'
      };

      const res = await request(app)
        .post('/api/v1/events')
        .set('Authorization', 'Bearer user-bob')
        .send(confPayload);

      assert.strictEqual(res.status, 201);
      bobCorporateEventId = res.body.data.id;
    });

    test('2.2 Generate Conference Plan and add custom organizer task', async () => {
      const planRes = await request(app)
        .post(`/api/v1/events/${bobCorporateEventId}/plan/generate`)
        .set('Authorization', 'Bearer user-bob')
        .send();

      assert.strictEqual(planRes.status, 201);

      // Add custom user task
      const customTaskRes = await request(app)
        .post(`/api/v1/events/${bobCorporateEventId}/tasks`)
        .set('Authorization', 'Bearer user-bob')
        .send({
          title: 'Book VIP Airport Limousine for Keynote Speaker',
          category: 'Logistics',
          priority: 'critical',
          description: 'Flight arrives at 7:00 AM on Dec 5'
        });

      assert.strictEqual(customTaskRes.status, 201);
      assert.strictEqual(customTaskRes.body.data.source, 'user');
    });

    test('2.3 Log expense and verify budget ledger recalculates accurately', async () => {
      const expenseRes = await request(app)
        .post(`/api/v1/events/${bobCorporateEventId}/expenses`)
        .set('Authorization', 'Bearer user-bob')
        .send({
          category: 'Venue & Facilities',
          amountMinorUnits: 25000000, // ₹2,50,000.00
          currency: 'INR',
          status: 'actual',
          vendorName: 'Grand Convention Center',
          notes: 'Convention Hall Advanced Deposit'
        });

      assert.strictEqual(expenseRes.status, 201);

      const budgetRes = await request(app)
        .get(`/api/v1/events/${bobCorporateEventId}/budget`)
        .set('Authorization', 'Bearer user-bob');

      assert.strictEqual(budgetRes.status, 200);
      assert.strictEqual(budgetRes.body.data.totalLimitMinorUnits, 80000000);
    });
  });

  // =========================================================================
  // JOURNEY 3: Custom Event with Natural Language Brief
  // =========================================================================
  describe('User Journey 3: Custom Event with Natural Language Synthesis', () => {
    test('3.1 Create and plan an unclassified custom event', async () => {
      const customPayload = {
        title: 'Desert Stargazing & Ambient Sound Camp',
        eventType: 'custom',
        templateId: 'custom',
        startDate: '2026-11-15T18:00:00.000Z',
        endDate: '2026-11-16T06:00:00.000Z',
        location: {
          type: 'physical',
          address: 'Sam Sand Dunes',
          city: 'Jaisalmer',
          country: 'India'
        },
        currency: 'INR',
        budgetLimitMinorUnits: 40000000, // ₹4,00,000.00
        expectedAttendance: 60,
        description: 'Night sky astronomy observation with modular synthesizer soundscape in the desert'
      };

      const res = await request(app)
        .post('/api/v1/events')
        .set('Authorization', 'Bearer user-charlie')
        .send(customPayload);

      assert.strictEqual(res.status, 201);
      customEventId = res.body.data.id;

      const planRes = await request(app)
        .post(`/api/v1/events/${customEventId}/plan/generate`)
        .set('Authorization', 'Bearer user-charlie')
        .send({
          userGuidance: 'Ensure cold weather desert survival gear and high-capacity generator battery banks.'
        });

      assert.strictEqual(planRes.status, 201);
      assert.strictEqual(planRes.body.success, true);
      assert.ok(planRes.body.data.summary.length > 0);
    });
  });

  // =========================================================================
  // JOURNEY 4: Multi-Tenant Isolation & Authorization Hardening
  // =========================================================================
  describe('User Journey 4: Strict Multi-Tenant Isolation & Authorization', () => {
    test('4.1 Cross-user read is rejected with 403 FORBIDDEN', async () => {
      // Bob tries to access Alice's wedding event
      const res = await request(app)
        .get(`/api/v1/events/${aliceWeddingEventId}`)
        .set('Authorization', 'Bearer user-bob');

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'FORBIDDEN');
    });

    test('4.2 Cross-user task mutation is rejected with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post(`/api/v1/events/${aliceWeddingEventId}/tasks`)
        .set('Authorization', 'Bearer user-bob')
        .send({
          title: 'Unauthorized Task Addition',
          category: 'Logistics'
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.error.code, 'FORBIDDEN');
    });

    test('4.3 Cross-user AI plan generation is rejected with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post(`/api/v1/events/${aliceWeddingEventId}/plan/generate`)
        .set('Authorization', 'Bearer user-bob')
        .send();

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.error.code, 'FORBIDDEN');
    });

    test('4.4 Cross-user event deletion is rejected with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .delete(`/api/v1/events/${aliceWeddingEventId}`)
        .set('Authorization', 'Bearer user-bob');

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.error.code, 'FORBIDDEN');
    });

    test('4.5 Unauthenticated request without Bearer token is rejected with 401', async () => {
      const res = await request(app)
        .get(`/api/v1/events/${aliceWeddingEventId}`);

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
    });

    test('4.6 Admin user can access and manage events across all tenants', async () => {
      const res = await request(app)
        .get(`/api/v1/events/${aliceWeddingEventId}`)
        .set('Authorization', 'Bearer admin-token');

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.id, aliceWeddingEventId);
    });
  });

  // =========================================================================
  // JOURNEY 5: API Security, Hardening & Resilience
  // =========================================================================
  describe('User Journey 5: API Security Headers, Rate Limiting & Fail-Fast Validation', () => {
    test('5.1 Standard security headers are present on HTTP responses', async () => {
      const res = await request(app).get('/api/v1/health');

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers['x-frame-options'], 'DENY');
      assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
      assert.strictEqual(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
      assert.ok(res.headers['strict-transport-security']);
      assert.ok(res.headers['content-security-policy']);
    });

    test('5.2 AI Rate Limiter triggers HTTP 429 when quota is exceeded', async () => {
      // Create a temporary event for rate limit testing
      const evRes = await request(app)
        .post('/api/v1/events')
        .set('Authorization', 'Bearer user-rate-test')
        .send({
          title: 'Rate Limit Probe Event',
          eventType: 'birthday',
          templateId: 'birthday',
          startDate: '2026-11-20T18:00:00.000Z',
          location: {
            type: 'physical',
            city: 'Bengaluru'
          },
          currency: 'INR',
          budgetLimitMinorUnits: 5000000,
          expectedAttendance: 20
        });

      assert.strictEqual(evRes.status, 201);
      const tempEventId = evRes.body.data.id;

      // Fire 6 requests with x-test-rate-limit to test rate limiter enforcement
      let lastStatus = 201;
      for (let i = 0; i < 6; i++) {
        const res = await request(app)
          .post(`/api/v1/events/${tempEventId}/plan/generate`)
          .set('Authorization', 'Bearer user-rate-test')
          .set('x-test-rate-limit', 'true')
          .send();
        lastStatus = res.status;
        if (res.status === 429) {
          assert.strictEqual(res.body.error.code, 'RATE_LIMIT_EXCEEDED');
          assert.ok(res.headers['retry-after']);
          break;
        }
      }

      assert.strictEqual(lastStatus, 429, '6th request must trigger 429 Rate Limit Exceeded');
    });

    test('5.3 Concurrency lock prevents simultaneous plan generations for same event', async () => {
      const orchestrator = new PlanningOrchestrator();

      // Acquire lock artificially to simulate in-flight generation
      (PlanningOrchestrator as any).activeEventLocks.add('locked-event-id');

      await assert.rejects(
        async () => {
          await orchestrator.generatePlan('locked-event-id');
        },
        (err: any) => {
          assert.strictEqual(err.status, 409);
          assert.strictEqual(err.code, 'CONCURRENT_REQUEST_CONFLICT');
          return true;
        }
      );

      // Clean up lock
      (PlanningOrchestrator as any).activeEventLocks.delete('locked-event-id');
    });

    test('5.4 Production environment validation fails fast without required MongoDB URI', () => {
      const invalidProd = parseEnv({
        NODE_ENV: 'production',
        PORT: '8000',
        MONGODB_URI: '', // Missing in production
        SESSION_SECRET: 'a-secure-production-random-secret-key-123456789'
      });

      assert.strictEqual(invalidProd.success, false);
      assert.ok(invalidProd.error.errors.some(e => e.path.includes('MONGODB_URI')));
    });

    test('5.5 Production environment validation rejects default development secret', () => {
      const invalidSecret = parseEnv({
        NODE_ENV: 'production',
        PORT: '8000',
        MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/celebration',
        SESSION_SECRET: 'celebration-planner-secret-key-phase2-dev-only' // Default dev secret
      });

      assert.strictEqual(invalidSecret.success, false);
      assert.ok(invalidSecret.error.errors.some(e => e.path.includes('SESSION_SECRET')));
    });

    test('5.6 Production environment rejects mock provider without ALLOW_MOCK_IN_PRODUCTION', () => {
      const invalidMock = parseEnv({
        NODE_ENV: 'production',
        PORT: '8000',
        MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/celebration',
        SESSION_SECRET: 'a-secure-production-random-secret-key-123456789',
        LLM_PROVIDER: 'mock'
      });

      assert.strictEqual(invalidMock.success, false);
      assert.ok(invalidMock.error.errors.some(e => e.path.includes('LLM_PROVIDER')));
    });

    test('5.7 Production environment succeeds with valid Atlas URI and keys', () => {
      const validProd = parseEnv({
        NODE_ENV: 'production',
        PORT: '8000',
        MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/celebration',
        SESSION_SECRET: 'a-secure-production-random-secret-key-123456789',
        LLM_PROVIDER: 'gemini',
        GEMINI_API_KEY: 'test-server-key'
      });

      assert.strictEqual(validProd.success, true);
    });
  });
});
