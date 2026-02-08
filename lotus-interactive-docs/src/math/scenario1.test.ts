import { describe, it, expect } from 'vitest';
import { computeScenario1 } from './scenario1';

describe('Scenario 1: Spread Compression', () => {
  it('matches acceptance criteria: Rb=5%, R=12%, u=70%', () => {
    const result = computeScenario1({
      borrowRate: 0.12,
      baseRate: 0.05,
      utilization: 0.7,
    });

    // S = 7%
    expect(result.spread).toBeCloseTo(0.07, 4);

    // Supply_PD = 5% + 7% * 0.7 = 9.9%
    expect(result.supplyRatePD).toBeCloseTo(0.099, 4);

    // Supply_noPD = 12% * 0.7 = 8.4%
    expect(result.supplyRateNoPD).toBeCloseTo(0.084, 4);

    // Reduction = 5% * (1 - 0.7) = 1.5%
    expect(result.wedgeReduction).toBeCloseTo(0.015, 4);

    // Wedge_PD = 12% - 9.9% = 2.1%
    expect(result.wedgePD).toBeCloseTo(0.021, 4);

    // Wedge_noPD = 12% - 8.4% = 3.6%
    expect(result.wedgeNoPD).toBeCloseTo(0.036, 4);

    expect(result.baseExceedsBorrow).toBe(false);
  });

  it('handles u=0 correctly', () => {
    const result = computeScenario1({
      borrowRate: 0.12,
      baseRate: 0.05,
      utilization: 0,
    });

    // At u=0: Supply_PD = Rb = 5%
    expect(result.supplyRatePD).toBeCloseTo(0.05, 4);
    // Supply_noPD = 0
    expect(result.supplyRateNoPD).toBeCloseTo(0, 4);
    // Reduction = Rb * 1 = 5%
    expect(result.wedgeReduction).toBeCloseTo(0.05, 4);
  });

  it('handles u=1 correctly', () => {
    const result = computeScenario1({
      borrowRate: 0.12,
      baseRate: 0.05,
      utilization: 1,
    });

    // At u=1: Supply_PD = Rb + S = 5% + 7% = 12%
    expect(result.supplyRatePD).toBeCloseTo(0.12, 4);
    // Supply_noPD = R = 12%
    expect(result.supplyRateNoPD).toBeCloseTo(0.12, 4);
    // Reduction = 0 (both equal borrow rate)
    expect(result.wedgeReduction).toBeCloseTo(0, 4);
  });

  it('handles base rate exceeding borrow rate', () => {
    const result = computeScenario1({
      borrowRate: 0.05,
      baseRate: 0.08,
      utilization: 0.7,
    });

    // S = max(5% - 8%, 0) = 0
    expect(result.spread).toBe(0);
    // Supply_PD = Rb = 8% (can exceed borrow rate)
    expect(result.supplyRatePD).toBeCloseTo(0.08, 4);
    // Supply_noPD = 5% * 0.7 = 3.5%
    expect(result.supplyRateNoPD).toBeCloseTo(0.035, 4);
    expect(result.baseExceedsBorrow).toBe(true);
  });

  it('handles zero rates', () => {
    const result = computeScenario1({
      borrowRate: 0,
      baseRate: 0,
      utilization: 0.5,
    });

    expect(result.spread).toBe(0);
    expect(result.supplyRatePD).toBe(0);
    expect(result.supplyRateNoPD).toBe(0);
    expect(result.wedgePD).toBe(0);
    expect(result.wedgeNoPD).toBe(0);
    expect(result.wedgeReduction).toBe(0);
  });
});
