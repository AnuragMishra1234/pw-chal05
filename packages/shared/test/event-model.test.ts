import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CreateEventSchema } from '../src/index.js';

describe('Event Domain Model Validation Tests', () => {
  const validEventInput = {
    title: 'CodeStorm 2027 Campus Hackathon',
    eventType: 'college_hackathon' as const,
    templateId: 'college_hackathon',
    templateVersion: '1.0.0',
    description: '36-hour student hackathon centered around Generative AI.',
    startDate: '2027-04-10T08:00:00.000Z',
    endDate: '2027-04-11T20:00:00.000Z',
    timezone: 'Asia/Kolkata',
    location: {
      type: 'physical' as const,
      address: 'Department of Computing',
      city: 'Bengaluru',
      country: 'India'
    },
    currency: 'INR' as const,
    budgetLimitMinorUnits: 65000000, // ₹6,50,000
    expectedAttendance: 250,
    preferences: {
      durationHours: '36',
      hardwareLabNeeded: true
    }
  };

  it('should validate a complete, well-formed event payload', () => {
    const result = CreateEventSchema.safeParse(validEventInput);
    assert.strictEqual(result.success, true);
  });

  it('should fail when title is missing or shorter than 3 characters', () => {
    const invalid = { ...validEventInput, title: 'Hi' };
    const result = CreateEventSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.issues.some(i => i.path.includes('title')));
    }
  });

  it('should fail when start date is not a valid ISO date', () => {
    const invalid = { ...validEventInput, startDate: 'invalid-date-string' };
    const result = CreateEventSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.issues.some(i => i.path.includes('startDate')));
    }
  });

  it('should fail when expected attendance is non-positive', () => {
    const invalid = { ...validEventInput, expectedAttendance: 0 };
    const result = CreateEventSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.issues.some(i => i.path.includes('expectedAttendance')));
    }
  });

  it('should fail when budget is negative or zero', () => {
    const invalid = { ...validEventInput, budgetLimitMinorUnits: -5000 };
    const result = CreateEventSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.issues.some(i => i.path.includes('budgetLimitMinorUnits')));
    }
  });

  it('should fail when eventType is unrecognized', () => {
    const invalid = { ...validEventInput, eventType: 'space_launch' as any };
    const result = CreateEventSchema.safeParse(invalid);
    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.ok(result.error.issues.some(i => i.path.includes('eventType')));
    }
  });
});
