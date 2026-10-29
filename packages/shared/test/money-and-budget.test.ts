import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  minorUnitsToMajor,
  majorToMinorUnits,
  formatMoney,
  calculateBudgetSummary,
  Budget,
  Expense
} from '../src/index.js';

describe('Deterministic Financial Arithmetic & Budget Tests', () => {
  it('should convert major units to minor units without floating-point precision loss', () => {
    assert.strictEqual(majorToMinorUnits(100), 10000);
    assert.strictEqual(majorToMinorUnits(500000), 50000000); // ₹5,00,000 -> 50000000 paise
    assert.strictEqual(majorToMinorUnits(19.99), 1999);
  });

  it('should convert minor units to major units accurately', () => {
    assert.strictEqual(minorUnitsToMajor(10000), 100);
    assert.strictEqual(minorUnitsToMajor(50000000), 500000);
    assert.strictEqual(minorUnitsToMajor(1999), 19.99);
  });

  it('should format money with appropriate currency symbols and localized separators', () => {
    const inr = formatMoney(50000000, 'INR');
    assert.ok(inr.includes('5,00,000') || inr.includes('₹'), `Unexpected INR format: ${inr}`);

    const usd = formatMoney(1500000, 'USD'); // $15,000
    assert.ok(usd.includes('15,000') || usd.includes('$'), `Unexpected USD format: ${usd}`);
  });

  it('should compute exact deterministic budget summary, percentage allocations, and spending variance', () => {
    const mockBudget: Budget = {
      id: 'bdg-test-1',
      eventId: 'evt-test-1',
      currency: 'INR',
      totalLimitMinorUnits: 10000000, // ₹1,00,000
      allocatedMinorUnits: 9000000,   // ₹90,000
      contingencyMinorUnits: 1000000, // ₹10,000
      categoryAllocations: [
        { category: 'Venue', allocatedMinorUnits: 5000000, percentage: 50 },
        { category: 'Catering', allocatedMinorUnits: 4000000, percentage: 40 }
      ],
      updatedAt: '2026-10-27T00:00:00Z'
    };

    const mockExpenses: Expense[] = [
      {
        id: 'exp-1',
        eventId: 'evt-test-1',
        category: 'Venue',
        amountMinorUnits: 3000000, // ₹30,000
        currency: 'INR',
        status: 'actual',
        createdAt: '2026-10-27T00:00:00Z'
      },
      {
        id: 'exp-2',
        eventId: 'evt-test-1',
        category: 'Catering',
        amountMinorUnits: 2000000, // ₹20,000
        currency: 'INR',
        status: 'actual',
        createdAt: '2026-10-27T00:00:00Z'
      }
    ];

    const summary = calculateBudgetSummary(mockBudget, mockExpenses);

    assert.strictEqual(summary.totalLimitMinorUnits, 10000000);
    assert.strictEqual(summary.totalAllocatedMinorUnits, 9000000);
    assert.strictEqual(summary.totalSpentMinorUnits, 5000000); // 30k + 20k
    assert.strictEqual(summary.remainingMinorUnits, 5000000);   // 100k - 50k
    assert.strictEqual(summary.varianceMinorUnits, 1000000);    // 100k - 90k
    assert.strictEqual(summary.isOverBudget, false);
    assert.strictEqual(summary.allocatedPercentage, 90);
    assert.strictEqual(summary.spentPercentage, 50);
  });

  it('should flag isOverBudget when expenditures exceed the total budget limit', () => {
    const mockBudget: Budget = {
      id: 'bdg-test-2',
      eventId: 'evt-test-2',
      currency: 'INR',
      totalLimitMinorUnits: 1000000, // ₹10,000
      allocatedMinorUnits: 1000000,
      contingencyMinorUnits: 0,
      categoryAllocations: [
        { category: 'Equipment', allocatedMinorUnits: 1000000, percentage: 100 }
      ],
      updatedAt: '2026-10-27T00:00:00Z'
    };

    const mockExpenses: Expense[] = [
      {
        id: 'exp-over',
        eventId: 'evt-test-2',
        category: 'Equipment',
        amountMinorUnits: 1200000, // ₹12,000 (> 10,000 limit)
        currency: 'INR',
        status: 'actual',
        createdAt: '2026-10-27T00:00:00Z'
      }
    ];

    const summary = calculateBudgetSummary(mockBudget, mockExpenses);
    assert.strictEqual(summary.isOverBudget, true);
    assert.strictEqual(summary.remainingMinorUnits, -200000);
  });
});
