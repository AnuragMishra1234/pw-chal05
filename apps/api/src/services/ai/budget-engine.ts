import { CurrencyCode } from '@celebration/shared';

export interface RawBudgetCategoryProposal {
  categoryName: string;
  percentageOfBudget: number;
  reasoning: string;
  savingTips?: string[];
}

export interface CalculatedCategoryAllocation {
  category: string;
  percentage: number;
  allocatedMinorUnits: number;
  reasoning: string;
  savingTips: string[];
}

export interface BudgetEngineResult {
  totalLimitMinorUnits: number;
  allocatedMinorUnits: number;
  contingencyMinorUnits: number;
  contingencyPercentage: number;
  unallocatedMinorUnits: number;
  categoryAllocations: CalculatedCategoryAllocation[];
  isOverBudget: boolean;
  warnings: string[];
  currency: CurrencyCode;
}

export class BudgetEngine {
  /**
   * Translates AI-suggested category percentages into exact deterministic integer minor units.
   * Never relies on LLM arithmetic.
   */
  static processProposal(
    totalLimitMinorUnits: number,
    currency: CurrencyCode,
    categories: RawBudgetCategoryProposal[],
    suggestedContingencyPercentage: number = 10
  ): BudgetEngineResult {
    const warnings: string[] = [];

    // Ensure valid contingency bounded between 0% and 30%
    const contingencyPercentage = Math.min(Math.max(suggestedContingencyPercentage || 10, 5), 25);
    const contingencyMinorUnits = Math.round(totalLimitMinorUnits * (contingencyPercentage / 100));
    const allocatableLimitMinorUnits = totalLimitMinorUnits - contingencyMinorUnits;

    // Check raw percentages sum
    const rawSum = categories.reduce((sum, c) => sum + (c.percentageOfBudget || 0), 0);

    if (rawSum === 0) {
      warnings.push('AI proposal contained 0% total allocations. Evenly distributed allocatable budget.');
    } else if (rawSum > 100) {
      warnings.push(`AI proposed category allocations totaling ${rawSum.toFixed(1)}%, which exceeds 100%. Allocations were proportionally normalized to match the ceiling.`);
    }

    // Proportional normalization to fit allocatable limit
    const normalizer = rawSum > 0 ? (100 - contingencyPercentage) / rawSum : 0;

    let accumulatedAllocatedMinorUnits = 0;
    const categoryAllocations: CalculatedCategoryAllocation[] = categories.map((cat, index) => {
      const normalizedPct = rawSum > 0
        ? Number(((cat.percentageOfBudget || 0) * normalizer).toFixed(2))
        : Number(((100 - contingencyPercentage) / categories.length).toFixed(2));

      // Calculate minor units strictly as integer
      let allocatedMinorUnits = Math.round(totalLimitMinorUnits * (normalizedPct / 100));

      // Ensure last item catches rounding differences so sum doesn't exceed allocatable limit
      if (index === categories.length - 1) {
        const remaining = allocatableLimitMinorUnits - accumulatedAllocatedMinorUnits;
        if (remaining > 0) {
          allocatedMinorUnits = remaining;
        }
      }

      accumulatedAllocatedMinorUnits += allocatedMinorUnits;

      return {
        category: cat.categoryName,
        percentage: normalizedPct,
        allocatedMinorUnits,
        reasoning: cat.reasoning || `Allocated for ${cat.categoryName}`,
        savingTips: cat.savingTips || []
      };
    });

    const totalCalculated = accumulatedAllocatedMinorUnits + contingencyMinorUnits;
    const unallocatedMinorUnits = Math.max(0, totalLimitMinorUnits - totalCalculated);
    const isOverBudget = totalCalculated > totalLimitMinorUnits;

    if (isOverBudget) {
      warnings.push(`Allocations of ${totalCalculated} exceeded budget limit of ${totalLimitMinorUnits}. Adjusted final allocations.`);
    }

    return {
      totalLimitMinorUnits,
      allocatedMinorUnits: accumulatedAllocatedMinorUnits,
      contingencyMinorUnits,
      contingencyPercentage,
      unallocatedMinorUnits,
      categoryAllocations,
      isOverBudget,
      warnings,
      currency
    };
  }
}
