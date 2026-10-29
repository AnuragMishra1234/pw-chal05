import { CurrencyCode, Budget, Expense, BudgetSummary } from '../types/index.js';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$'
};

export const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU'
};

/**
 * Converts integer minor units (e.g. cents, paise) to major currency units (e.g. dollars, rupees).
 */
export function minorUnitsToMajor(amountMinorUnits: number): number {
  if (!Number.isFinite(amountMinorUnits)) return 0;
  return amountMinorUnits / 100;
}

/**
 * Converts major units (dollars, rupees) to integer minor units.
 */
export function majorToMinorUnits(amountMajorUnits: number): number {
  if (!Number.isFinite(amountMajorUnits)) return 0;
  return Math.round(amountMajorUnits * 100);
}

/**
 * Formats integer minor units into a human-readable localized currency string.
 * Example: 50000000 INR -> "₹5,00,000"
 */
export function formatMoney(amountMinorUnits: number, currency: CurrencyCode = 'INR'): string {
  const major = minorUnitsToMajor(amountMinorUnits);
  const locale = CURRENCY_LOCALES[currency] || 'en-IN';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(major);
  } catch (_e) {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${major.toLocaleString()}`;
  }
}

/**
 * Calculates deterministic budget allocations, actual expenditures, and overrun variance.
 */
export function calculateBudgetSummary(budget: Budget, expenses: Expense[] = []): BudgetSummary {
  const totalLimitMinorUnits = budget.totalLimitMinorUnits || 0;
  const totalAllocatedMinorUnits = (budget.categoryAllocations || []).reduce(
    (sum, cat) => sum + (cat.allocatedMinorUnits || 0),
    0
  );

  const totalSpentMinorUnits = expenses.reduce((sum, exp) => sum + (exp.amountMinorUnits || 0), 0);
  const remainingMinorUnits = totalLimitMinorUnits - totalSpentMinorUnits;
  const varianceMinorUnits = totalLimitMinorUnits - totalAllocatedMinorUnits;
  const isOverBudget = totalSpentMinorUnits > totalLimitMinorUnits || totalAllocatedMinorUnits > totalLimitMinorUnits;

  const allocatedPercentage = totalLimitMinorUnits > 0
    ? Math.min(100, Math.round((totalAllocatedMinorUnits / totalLimitMinorUnits) * 100))
    : 0;

  const spentPercentage = totalLimitMinorUnits > 0
    ? Math.min(100, Math.round((totalSpentMinorUnits / totalLimitMinorUnits) * 100))
    : 0;

  return {
    totalLimitMinorUnits,
    totalAllocatedMinorUnits,
    totalSpentMinorUnits,
    remainingMinorUnits,
    varianceMinorUnits,
    isOverBudget,
    allocatedPercentage,
    spentPercentage,
    currency: budget.currency || 'INR'
  };
}
