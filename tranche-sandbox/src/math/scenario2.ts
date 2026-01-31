import type { Scenario2Inputs, Scenario2Outputs, ChartPoint } from '../types';

/**
 * Kink curve constants
 */
const TARGET_UTIL = 0.9;
const MIN_FACTOR = 0.25;
const MAX_FACTOR = 4.0;

/**
 * Calculate the kink curve multiplier factor at a given utilization
 *
 * If u <= 0.9: factor = 0.25 + 0.75 * (u / 0.9)
 * If u > 0.9:  factor = 1 + 3 * ((u - 0.9) / 0.1)
 *
 * Key points: (0, 0.25), (0.9, 1), (1, 4)
 */
export function calculateKinkFactor(utilization: number): number {
  if (utilization <= TARGET_UTIL) {
    // Linear from 0.25× at u=0 to 1× at u=0.9
    return MIN_FACTOR + (1 - MIN_FACTOR) * (utilization / TARGET_UTIL);
  } else {
    // Linear from 1× at u=0.9 to 4× at u=1.0
    return 1 + (MAX_FACTOR - 1) * ((utilization - TARGET_UTIL) / (1 - TARGET_UTIL));
  }
}

/**
 * Calculate spread at a given utilization using Morpho-style linear kink curve
 *
 * If u <= 0.9: S(u) = S90 * (0.25 + 0.75 * (u / 0.9))
 * If u > 0.9:  S(u) = S90 * (1 + 30 * (u - 0.9))
 */
export function calculateSpreadAtUtilization(spread90: number, utilization: number): number {
  return spread90 * calculateKinkFactor(utilization);
}

/**
 * Scenario 2: Volatility Reduction (kink IRM applied to spread only)
 *
 * Shows how productive debt makes borrower/supplier rates less volatile
 * vs utilization changes by adding a base component.
 *
 * With PD: Only the spread is multiplied by the kink curve factor
 *   Borrow_PD = baseRate + spread × factor(u)
 *
 * Without PD: The entire borrow rate is multiplied by the kink curve factor
 *   Borrow_noPD = borrowRate90 × factor(u)
 */
export function computeScenario2(inputs: Scenario2Inputs): Scenario2Outputs {
  const { targetBorrowRate90, baseRate, utilization } = inputs;

  // Derived spread at 90% utilization: S90 = max(R90 - Rb, 0)
  const spread90 = Math.max(targetBorrowRate90 - baseRate, 0);

  // Calculate the kink curve factor at current utilization
  const factor = calculateKinkFactor(utilization);

  // Spread at current utilization (for PD case)
  const spreadAtU = spread90 * factor;

  // Borrow rate with productive debt: Borrow_PD = Rb + S × factor(u)
  // Only the spread is volatile, base rate stays constant
  const borrowRatePD = baseRate + spreadAtU;

  // Borrow rate without productive debt: Borrow_noPD = R90 × factor(u)
  // The entire borrow rate is volatile
  const borrowRateNoPD = targetBorrowRate90 * factor;

  // Supply rate with productive debt: Supply_PD = Rb + S(u) * u
  const supplyRatePD = baseRate + spreadAtU * utilization;

  // Supply rate without productive debt: Supply_noPD = Borrow_noPD * u
  const supplyRateNoPD = borrowRateNoPD * utilization;

  // Target values at 90% utilization
  const targetBorrow90 = targetBorrowRate90;
  const targetSupplyPD90 = baseRate + spread90 * TARGET_UTIL;
  const targetSupplyNoPD90 = targetBorrowRate90 * TARGET_UTIL;

  // Deviation calculations (null when denominator is 0)
  let borrowDeviationPD: number | null = null;
  let borrowDeviationNoPD: number | null = null;
  let supplyDeviationPD: number | null = null;
  let supplyDeviationNoPD: number | null = null;

  if (targetBorrowRate90 > 0) {
    borrowDeviationPD = (borrowRatePD - targetBorrowRate90) / targetBorrowRate90;
    borrowDeviationNoPD = (borrowRateNoPD - targetBorrowRate90) / targetBorrowRate90;
  }

  if (targetSupplyPD90 > 0) {
    supplyDeviationPD = (supplyRatePD - targetSupplyPD90) / targetSupplyPD90;
  }

  if (targetSupplyNoPD90 > 0) {
    supplyDeviationNoPD = (supplyRateNoPD - targetSupplyNoPD90) / targetSupplyNoPD90;
  }

  return {
    spread90,
    spreadAtU,
    borrowRatePD,
    borrowRateNoPD,
    supplyRatePD,
    supplyRateNoPD,
    targetBorrow90,
    targetSupplyPD90,
    targetSupplyNoPD90,
    borrowDeviationPD,
    borrowDeviationNoPD,
    supplyDeviationPD,
    supplyDeviationNoPD,
    spreadIsZero: spread90 === 0,
  };
}

/**
 * Generate chart data for Scenario 2 across all utilization values
 */
export function generateScenario2ChartData(
  targetBorrowRate90: number,
  baseRate: number,
  steps: number = 100
): ChartPoint[] {
  const points: ChartPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const utilization = i / steps;
    const result = computeScenario2({ targetBorrowRate90, baseRate, utilization });

    points.push({
      utilization,
      borrowPD: result.borrowRatePD,
      borrowNoPD: result.borrowRateNoPD,
      supplyPD: result.supplyRatePD,
      supplyNoPD: result.supplyRateNoPD,
    });
  }

  return points;
}
