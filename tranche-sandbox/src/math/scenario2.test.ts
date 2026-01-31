import { describe, it, expect } from 'vitest';
import { computeScenario2, calculateSpreadAtUtilization } from './scenario2';

describe('Scenario 2: Volatility Reduction', () => {
  describe('spread calculation at different utilizations', () => {
    it('calculates spread at u=0 correctly (0.25× factor)', () => {
      const spread90 = 0.07; // 7%
      const spreadAt0 = calculateSpreadAtUtilization(spread90, 0);
      // S(0) = S90 * 0.25 = 7% * 0.25 = 1.75%
      expect(spreadAt0).toBeCloseTo(0.0175, 4);
    });

    it('calculates spread at u=0.9 correctly (1× factor)', () => {
      const spread90 = 0.07;
      const spreadAt90 = calculateSpreadAtUtilization(spread90, 0.9);
      // S(0.9) = S90 * 1 = 7%
      expect(spreadAt90).toBeCloseTo(0.07, 4);
    });

    it('calculates spread at u=1 correctly (4× factor)', () => {
      const spread90 = 0.07;
      const spreadAt1 = calculateSpreadAtUtilization(spread90, 1);
      // S(1) = S90 * 4 = 7% * 4 = 28%
      expect(spreadAt1).toBeCloseTo(0.28, 4);
    });

    it('calculates spread at u=0.45 correctly (midpoint below kink)', () => {
      const spread90 = 0.07;
      const spreadAt45 = calculateSpreadAtUtilization(spread90, 0.45);
      // factor = 0.25 + 0.75 * (0.45 / 0.9) = 0.25 + 0.375 = 0.625
      // S(0.45) = 7% * 0.625 = 4.375%
      expect(spreadAt45).toBeCloseTo(0.04375, 4);
    });
  });

  describe('acceptance criteria', () => {
    it('matches at u=0.9: Rb=5%, R90=12%', () => {
      const result = computeScenario2({
        targetBorrowRate90: 0.12,
        baseRate: 0.05,
        utilization: 0.9,
      });

      // S90 = 7%
      expect(result.spread90).toBeCloseTo(0.07, 4);
      // S(u) = 7% at u=0.9 (factor = 1)
      expect(result.spreadAtU).toBeCloseTo(0.07, 4);
      // Borrow_PD = Rb + S = 5% + 7% = 12%
      expect(result.borrowRatePD).toBeCloseTo(0.12, 4);
      // Borrow_noPD = R90 * 1 = 12%
      expect(result.borrowRateNoPD).toBeCloseTo(0.12, 4);
    });

    it('matches at u=0: Rb=5%, R90=12%', () => {
      const result = computeScenario2({
        targetBorrowRate90: 0.12,
        baseRate: 0.05,
        utilization: 0,
      });

      // S(u) = S90 * 0.25 = 7% * 0.25 = 1.75%
      expect(result.spreadAtU).toBeCloseTo(0.0175, 4);
      // Borrow_PD = Rb + 0.25*S90 = 5% + 1.75% = 6.75%
      expect(result.borrowRatePD).toBeCloseTo(0.0675, 4);
      // Borrow_noPD = R90 * 0.25 = 12% * 0.25 = 3%
      expect(result.borrowRateNoPD).toBeCloseTo(0.03, 4);
    });

    it('matches at u=1: Rb=5%, R90=12%', () => {
      const result = computeScenario2({
        targetBorrowRate90: 0.12,
        baseRate: 0.05,
        utilization: 1,
      });

      // S(u) = 4 * S90 = 4 * 7% = 28%
      expect(result.spreadAtU).toBeCloseTo(0.28, 4);
      // Borrow_PD = Rb + 4*S90 = 5% + 28% = 33%
      expect(result.borrowRatePD).toBeCloseTo(0.33, 4);
      // Borrow_noPD = R90 * 4 = 12% * 4 = 48%
      expect(result.borrowRateNoPD).toBeCloseTo(0.48, 4);
    });
  });

  describe('edge cases', () => {
    it('handles S90=0 (base rate equals target)', () => {
      const result = computeScenario2({
        targetBorrowRate90: 0.05,
        baseRate: 0.05,
        utilization: 0.7,
      });

      // At u=0.7, factor = 0.25 + 0.75 * (0.7/0.9) = 0.8333...
      const factor = 0.25 + 0.75 * (0.7 / 0.9);

      expect(result.spread90).toBe(0);
      expect(result.spreadAtU).toBe(0);
      expect(result.borrowRatePD).toBeCloseTo(0.05, 4);
      // Without PD: entire borrow rate is volatile
      expect(result.borrowRateNoPD).toBeCloseTo(0.05 * factor, 4);
      expect(result.supplyRatePD).toBeCloseTo(0.05, 4);
      expect(result.supplyRateNoPD).toBeCloseTo(0.05 * factor * 0.7, 4);
      expect(result.spreadIsZero).toBe(true);
    });

    it('handles base rate exceeding target', () => {
      const result = computeScenario2({
        targetBorrowRate90: 0.05,
        baseRate: 0.08,
        utilization: 0.7,
      });

      // At u=0.7, factor = 0.25 + 0.75 * (0.7/0.9) = 0.8333...
      const factor = 0.25 + 0.75 * (0.7 / 0.9);

      // S90 = max(5% - 8%, 0) = 0
      expect(result.spread90).toBe(0);
      expect(result.borrowRatePD).toBeCloseTo(0.08, 4);
      // Without PD: R90 * factor = 5% * 0.8333 = 4.167%
      expect(result.borrowRateNoPD).toBeCloseTo(0.05 * factor, 4);
    });

    it('calculates deviation metrics correctly', () => {
      const result = computeScenario2({
        targetBorrowRate90: 0.12,
        baseRate: 0.05,
        utilization: 0.7,
      });

      // At u=0.7, factor = 0.25 + 0.75 * (0.7/0.9) = 0.8333...
      // S(0.7) = 7% * 0.8333 = 5.833%
      // Borrow_PD = 5% + 5.833% = 10.833%
      // Deviation = (10.833% - 12%) / 12% = -9.72%
      expect(result.borrowDeviationPD).toBeCloseTo(-0.0972, 2);

      // Borrow_noPD = 12% * 0.8333 = 10%
      // Deviation = (10% - 12%) / 12% = -16.67%
      expect(result.borrowDeviationNoPD).toBeCloseTo(-0.1667, 2);
    });
  });
});
