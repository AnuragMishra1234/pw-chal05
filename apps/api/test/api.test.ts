import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { database } from '../src/config/database.js';

describe('Celebration & Event Planner — REST API Integration Tests', () => {
  const app = createApp();
  let createdEventId: string;
  let createdTaskId: string;
  let createdExpenseId: string;

  before(async () => {
    await database.connect();
  });

  test('GET /api/v1/health returns healthy system status', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'healthy');
    assert.strictEqual(res.body.data.service, 'celebration-api');
    assert.ok(res.body.data.database);
    assert.ok(res.body.data.uptimeSeconds >= 0);
  });

  test('GET /api/v1/templates returns registered event templates', async () => {
    const res = await request(app).get('/api/v1/templates');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 5);

    const templateIds = res.body.data.map((t: any) => t.id);
    assert.ok(templateIds.includes('wedding'));
    assert.ok(templateIds.includes('college_hackathon'));
    assert.ok(templateIds.includes('community_event'));
  });

  test('GET /api/v1/templates/:id returns specific template or 404', async () => {
    const validRes = await request(app).get('/api/v1/templates/wedding');
    assert.strictEqual(validRes.status, 200);
    assert.strictEqual(validRes.body.data.id, 'wedding');
    assert.ok(validRes.body.data.planningRules);

    const missingRes = await request(app).get('/api/v1/templates/non-existent-template');
    assert.strictEqual(missingRes.status, 404);
    assert.strictEqual(missingRes.body.success, false);
    assert.strictEqual(missingRes.body.error.code, 'RESOURCE_NOT_FOUND');
  });

  test('POST /api/v1/events fails validation on invalid payload', async () => {
    const invalidPayload = {
      title: 'A', // Too short (< 3)
      eventType: 'invalid_type',
      startDate: 'not-a-date',
      budgetLimitMinorUnits: -100 // Negative
    };

    const res = await request(app)
      .post('/api/v1/events')
      .send(invalidPayload);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.details.length > 0);
  });

  test('POST /api/v1/events creates a new event with template initialized tasks and budget', async () => {
    const validPayload = {
      title: 'National Tech Hackathon 2026',
      eventType: 'college_hackathon',
      templateId: 'college_hackathon',
      startDate: '2026-11-20T09:00:00.000Z',
      endDate: '2026-11-22T18:00:00.000Z',
      location: {
        type: 'physical',
        address: 'Innovation Campus, Block B',
        city: 'Bengaluru',
        country: 'India'
      },
      currency: 'INR',
      budgetLimitMinorUnits: 50000000, // 500,000 INR
      expectedAttendance: 250,
      description: 'Annual flagship student hackathon'
    };

    const res = await request(app)
      .post('/api/v1/events')
      .set('Authorization', 'Bearer user-test-organizer')
      .send(validPayload);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.id);
    assert.strictEqual(res.body.data.title, 'National Tech Hackathon 2026');
    assert.strictEqual(res.body.data.ownerId, 'user-test-organizer');
    assert.strictEqual(res.body.data.status, 'active');

    createdEventId = res.body.data.id;
  });

  test('GET /api/v1/events lists events for the user', async () => {
    const res = await request(app)
      .get('/api/v1/events')
      .set('Authorization', 'Bearer user-test-organizer');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    const found = res.body.data.find((e: any) => e.id === createdEventId);
    assert.ok(found);
  });

  test('GET /api/v1/events/:id retrieves the event', async () => {
    const res = await request(app)
      .get(`/api/v1/events/${createdEventId}`)
      .set('Authorization', 'Bearer user-test-organizer');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.id, createdEventId);
    assert.strictEqual(res.body.data.title, 'National Tech Hackathon 2026');
  });

  test('PATCH /api/v1/events/:id updates event attributes', async () => {
    const res = await request(app)
      .patch(`/api/v1/events/${createdEventId}`)
      .set('Authorization', 'Bearer user-test-organizer')
      .send({
        description: 'Updated hackathon description with extended prize pool.'
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.description, 'Updated hackathon description with extended prize pool.');
  });

  test('GET /api/v1/events/:id/budget retrieves auto-initialized budget', async () => {
    const res = await request(app)
      .get(`/api/v1/events/${createdEventId}/budget`)
      .set('Authorization', 'Bearer user-test-organizer');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.eventId, createdEventId);
    assert.strictEqual(res.body.data.totalLimitMinorUnits, 50000000);
    assert.ok(res.body.data.categoryAllocations.length > 0);
  });

  test('PATCH /api/v1/events/:id/budget updates allocations', async () => {
    const res = await request(app)
      .patch(`/api/v1/events/${createdEventId}/budget`)
      .set('Authorization', 'Bearer user-test-organizer')
      .send({
        contingencyMinorUnits: 5000000
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.contingencyMinorUnits, 5000000);
  });

  test('GET /api/v1/events/:id/tasks lists template initialized tasks', async () => {
    const res = await request(app)
      .get(`/api/v1/events/${createdEventId}/tasks`)
      .set('Authorization', 'Bearer user-test-organizer');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length > 0);
  });

  test('POST /api/v1/events/:id/tasks creates a new custom task', async () => {
    const taskPayload = {
      title: 'Arrange high-speed 1Gbps fiber internet for hacking hall',
      category: 'Venue & Infrastructure',
      priority: 'critical',
      status: 'pending',
      assigneeName: 'Alex Technical Lead'
    };

    const res = await request(app)
      .post(`/api/v1/events/${createdEventId}/tasks`)
      .set('Authorization', 'Bearer user-test-organizer')
      .send(taskPayload);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.title, taskPayload.title);
    assert.strictEqual(res.body.data.priority, 'critical');
    assert.strictEqual(res.body.data.source, 'user');

    createdTaskId = res.body.data.id;
  });

  test('PATCH /api/v1/events/:id/tasks/:taskId updates task status', async () => {
    const res = await request(app)
      .patch(`/api/v1/events/${createdEventId}/tasks/${createdTaskId}`)
      .set('Authorization', 'Bearer user-test-organizer')
      .send({
        status: 'completed'
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'completed');
  });

  test('POST /api/v1/events/:id/expenses records an expense and updates budget', async () => {
    const expensePayload = {
      category: 'Venue & Infrastructure',
      amountMinorUnits: 2500000, // 25,000 INR
      currency: 'INR',
      status: 'actual',
      vendorName: 'FiberNet Broadband Services',
      notes: 'Dedicated uplink for 48 hours'
    };

    const res = await request(app)
      .post(`/api/v1/events/${createdEventId}/expenses`)
      .set('Authorization', 'Bearer user-test-organizer')
      .send(expensePayload);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.amountMinorUnits, 2500000);

    createdExpenseId = res.body.data.id;

    // Verify expense appears in list
    const listRes = await request(app)
      .get(`/api/v1/events/${createdEventId}/expenses`)
      .set('Authorization', 'Bearer user-test-organizer');
    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.body.data.find((e: any) => e.id === createdExpenseId));
  });

  test('POST /api/v1/events/:id/plans creates a versioned plan & GET latest retrieves it', async () => {
    const planPayload = {
      version: 1,
      summary: 'Comprehensive 48-Hour National Hackathon Execution Plan with mentors and judging rounds.',
      assumptions: ['Stable 1Gbps internet connectivity', 'Campus auditorium reserved'],
      warnings: ['Exceeding 250 hackers may require additional food stations'],
      budgetProposal: {
        suggestedContingencyPercentage: 10,
        categories: [
          { categoryName: 'Prizes & Grants', percentageOfBudget: 40, reasoning: 'Attract top talent' },
          { categoryName: 'Catering & Red Bull', percentageOfBudget: 35, reasoning: 'Midnight fuel for hackers' },
          { categoryName: 'Venue & AV', percentageOfBudget: 25, reasoning: 'Acoustics and power strips' }
        ]
      },
      tasks: [],
      timelineMilestones: [
        { milestoneName: 'Sponsorship confirmation', daysBeforeEvent: 30, description: 'Finalize top sponsors' }
      ],
      eventDaySchedule: [
        { timeOffsetHours: 0, activityTitle: 'Opening Keynote & Team Formation' }
      ],
      recommendations: ['Schedule checkpoint syncs with mentors every 6 hours.']
    };

    const postRes = await request(app)
      .post(`/api/v1/events/${createdEventId}/plans`)
      .set('Authorization', 'Bearer user-test-organizer')
      .send(planPayload);

    assert.strictEqual(postRes.status, 201);
    assert.strictEqual(postRes.body.success, true);
    assert.strictEqual(postRes.body.data.version, 1);
    assert.strictEqual(postRes.body.data.status, 'active');

    // Retrieve latest plan
    const latestRes = await request(app)
      .get(`/api/v1/events/${createdEventId}/plans/latest`)
      .set('Authorization', 'Bearer user-test-organizer');

    assert.strictEqual(latestRes.status, 200);
    assert.strictEqual(latestRes.body.success, true);
    assert.strictEqual(latestRes.body.data.summary, planPayload.summary);
  });

  test('GET /api/v1/stats calculates dashboard statistics', async () => {
    const res = await request(app)
      .get('/api/v1/stats')
      .set('Authorization', 'Bearer user-test-organizer');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.totalEvents >= 1);
    assert.ok(res.body.data.completedTasksCount >= 1);
    assert.ok(res.body.data.totalPlannedBudgetMinorUnits >= 50000000);
  });

  test('POST /api/v1/events/:id/archive archives the event', async () => {
    const res = await request(app)
      .post(`/api/v1/events/${createdEventId}/archive`)
      .set('Authorization', 'Bearer user-test-organizer');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'archived');
  });

  test('DELETE /api/v1/events/:id deletes the event and cascades resources', async () => {
    const res = await request(app)
      .delete(`/api/v1/events/${createdEventId}`)
      .set('Authorization', 'Bearer user-test-organizer');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.deleted, true);

    // Verify it is no longer found
    const getRes = await request(app)
      .get(`/api/v1/events/${createdEventId}`)
      .set('Authorization', 'Bearer user-test-organizer');

    assert.strictEqual(getRes.status, 404);
  });

  test('GET /api/v1/unknown-endpoint returns standard 404 envelope', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'ROUTE_NOT_FOUND');
  });
});
