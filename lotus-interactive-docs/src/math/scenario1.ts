import type { Scenario1Inputs, Scenario1Outputs, ChartPoint } from '../types';

/**
 * Scenario 1: Spread Compression (hold borrow rate constant)
 *
 * Shows how productive debt compresses the wedge between borrower rate
 * and lender rate when the borrower-facing borrow rate is held fixed.
 */
export function computeScenario1(inputs: Scenario1Inputs): Scenario1Outputs {
  const { borrowRate, baseRate, utilization } = inputs;

  // Derived spread: S = max(R - Rb, 0)
  const spread = Math.max(borrowRate - baseRate, 0);

  // Supply rate with productive debt: Supply_PD = Rb + S * u
  const supplyRatePD = baseRate + spread * utilization;

  // Supply rate without productive debt: Supply_noPD = R * u
  const supplyRateNoPD = borrowRate * utilization;

  // Wedge (borrow minus supply)
  const wedgePD = borrowRate - supplyRatePD;
  const wedgeNoPD = borrowRate - supplyRateNoPD;

  // Wedge reduction: Reduction = Wedge_noPD - Wedge_PD
  // Simplifies to: Rb * (1 - u) when S = R - Rb
  const wedgeReduction = wedgeNoPD - wedgePD;

  return {
    spread,
    borrowRate,
    supplyRatePD,
    supplyRateNoPD,
    wedgePD,
    wedgeNoPD,
    wedgeReduction,
    baseExceedsBorrow: baseRate >= borrowRate,
  };
}

/**
 * Generate chart data for Scenario 1 across all utilization values
 */
export function generateScenario1ChartData(
  borrowRate: number,
  baseRate: number,
  steps: number = 100
): ChartPoint[] {
  const points: ChartPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const utilization = i / steps;
    const result = computeScenario1({ borrowRate, baseRate, utilization });

    points.push({
      utilization,
      supplyPD: result.supplyRatePD,
      supplyNoPD: result.supplyRateNoPD,
    });
  }

  return points;
}
