import { describe, it, expect } from 'vitest';
import {
  computeJrSupply,
  computeJrBorrow,
  computeJrNetSupply,
  computeFreeSupply,
  computeAvailableSupply,
  computeSupplyUtilization,
  computeBorrowUtilization,
  computeAllTranches,
  formatNumber,
  formatPercent,
  timePeriodToYears,
  getTimePeriodLabel,
  simulateInterestAccrual,
  simulateBadDebt,
} from './lotusAccounting';
import type { TrancheInput } from '../types';

/**
 * Test data matching the protocol_math.md example.
 * 5 tranches with equal supply of 200 each.
 */
const createDocExampleTranches = (): TrancheInput[] => [
  { id: 0, lltv: 75, supplyAssets: 200, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.03 },
  { id: 1, lltv: 80, supplyAssets: 200, borrowAssets: 250, pendingInterest: 0, borrowRate: 0.04 },
  { id: 2, lltv: 85, supplyAssets: 200, borrowAssets: 200, pendingInterest: 0, borrowRate: 0.05 },
  { id: 3, lltv: 90, supplyAssets: 200, borrowAssets: 150, pendingInterest: 0, borrowRate: 0.07 },
  { id: 4, lltv: 95, supplyAssets: 200, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.10 },
];

/**
 * Default test tranches with LLTVs: 75%, 80%, 85%, 90%, 95%
 */
const createTestTranches = (): TrancheInput[] => [
  { id: 0, lltv: 75, supplyAssets: 1000, borrowAssets: 500, pendingInterest: 20, borrowRate: 0.03 },
  { id: 1, lltv: 80, supplyAssets: 1200, borrowAssets: 600, pendingInterest: 25, borrowRate: 0.04 },
  { id: 2, lltv: 85, supplyAssets: 1500, borrowAssets: 800, pendingInterest: 30, borrowRate: 0.05 },
  { id: 3, lltv: 90, supplyAssets: 1800, borrowAssets: 600, pendingInterest: 40, borrowRate: 0.07 },
  { id: 4, lltv: 95, supplyAssets: 2000, borrowAssets: 400, pendingInterest: 50, borrowRate: 0.10 },
];

describe('Protocol Math Doc Example', () => {
  it('matches jrSupply from doc example', () => {
    const tranches = createDocExampleTranches();
    const result = computeJrSupply(tranches, false);

    // From doc: Jr Supply = [1000, 800, 600, 400, 200]
    expect(result[0]).toBe(1000);
    expect(result[1]).toBe(800);
    expect(result[2]).toBe(600);
    expect(result[3]).toBe(400);
    expect(result[4]).toBe(200);
  });

  it('matches jrBorrow from doc example', () => {
    const tranches = createDocExampleTranches();
    const result = computeJrBorrow(tranches);

    // From doc: Jr Borrow = [800, 700, 450, 250, 100]
    expect(result[0]).toBe(800);
    expect(result[1]).toBe(700);
    expect(result[2]).toBe(450);
    expect(result[3]).toBe(250);
    expect(result[4]).toBe(100);
  });

  it('matches jrNetSupply from doc example', () => {
    const tranches = createDocExampleTranches();
    const jrSupply = computeJrSupply(tranches, false);
    const jrBorrow = computeJrBorrow(tranches);
    const result = computeJrNetSupply(jrSupply, jrBorrow);

    // From doc: Jr Net Supply = [200, 100, 150, 150, 100]
    expect(result[0]).toBe(200);
    expect(result[1]).toBe(100);
    expect(result[2]).toBe(150);
    expect(result[3]).toBe(150);
    expect(result[4]).toBe(100);
  });

  it('matches freeSupply from doc example', () => {
    const jrNetSupply = [200, 100, 150, 150, 100];
    const { freeSupply, bindingIndices } = computeFreeSupply(jrNetSupply);

    // From doc: Free Supply = [200, 100, 100, 100, 100]
    expect(freeSupply[0]).toBe(200);
    expect(freeSupply[1]).toBe(100);
    expect(freeSupply[2]).toBe(100);
    expect(freeSupply[3]).toBe(100);
    expect(freeSupply[4]).toBe(100);

    // Binding constraint is tranche 1 (first to hit minimum)
    expect(bindingIndices).toEqual([1]);
  });

  it('matches availableSupply from doc example', () => {
    const tranches = createDocExampleTranches();
    const jrNetSupply = [200, 100, 150, 150, 100];
    const result = computeAvailableSupply(jrNetSupply, tranches);

    // From doc: Available Supply = [300, 350, 350, 300, 200]
    expect(result[0]).toBe(300);
    expect(result[1]).toBe(350);
    expect(result[2]).toBe(350);
    expect(result[3]).toBe(300);
    expect(result[4]).toBe(200);
  });

  it('matches supplyUtilization from doc example', () => {
    const tranches = createDocExampleTranches();
    const availableSupply = [300, 350, 350, 300, 200];
    const result = computeSupplyUtilization(tranches, availableSupply, false);

    // From doc: Supply Utilization = [66.67%, 57.14%, 57.14%, 66.67%, 100%]
    expect(result[0]).toBeCloseTo(200 / 300);  // 66.67%
    expect(result[1]).toBeCloseTo(200 / 350);  // 57.14%
    expect(result[2]).toBeCloseTo(200 / 350);  // 57.14%
    expect(result[3]).toBeCloseTo(200 / 300);  // 66.67%
    expect(result[4]).toBeCloseTo(200 / 200);  // 100%
  });

  it('matches borrowUtilization from doc example', () => {
    const jrSupply = [1000, 800, 600, 400, 200];
    const freeSupply = [200, 100, 100, 100, 100];
    const result = computeBorrowUtilization(jrSupply, freeSupply);

    // From doc: Borrow Utilization = [80%, 87.5%, 83.33%, 75%, 50%]
    expect(result[0]).toBeCloseTo(1 - 200 / 1000);  // 80%
    expect(result[1]).toBeCloseTo(1 - 100 / 800);   // 87.5%
    expect(result[2]).toBeCloseTo(1 - 100 / 600);   // 83.33%
    expect(result[3]).toBeCloseTo(1 - 100 / 400);   // 75%
    expect(result[4]).toBeCloseTo(1 - 100 / 200);   // 50%
  });
});

describe('computeJrSupply', () => {
  it('computes junior supply correctly with pending interest', () => {
    const tranches = createTestTranches();
    const result = computeJrSupply(tranches, true);

    // Junior (index 4): 2000 + 50 = 2050
    expect(result[4]).toBe(2050);

    // Index 0 (senior): sum of all supplies + interests
    expect(result[0]).toBe(7665);
  });

  it('computes junior supply correctly without pending interest', () => {
    const tranches = createTestTranches();
    const result = computeJrSupply(tranches, false);

    // Total without interest: 1000 + 1200 + 1500 + 1800 + 2000 = 7500
    expect(result[0]).toBe(7500);
  });

  it('handles empty array', () => {
    const result = computeJrSupply([], true);
    expect(result).toEqual([]);
  });

  it('handles single tranche', () => {
    const tranches: TrancheInput[] = [
      { id: 0, lltv: 75, supplyAssets: 1000, borrowAssets: 0, pendingInterest: 50, borrowRate: 0.03 },
    ];
    const result = computeJrSupply(tranches, true);
    expect(result).toEqual([1050]);
  });
});

describe('computeJrBorrow', () => {
  it('computes junior borrow correctly', () => {
    const tranches = createTestTranches();
    const result = computeJrBorrow(tranches);

    // Senior: 500 + 600 + 800 + 600 + 400 = 2900
    expect(result[0]).toBe(2900);
    // Junior: 400
    expect(result[4]).toBe(400);
  });

  it('handles all zeros', () => {
    const tranches: TrancheInput[] = [
      { id: 0, lltv: 75, supplyAssets: 100, borrowAssets: 0, pendingInterest: 0, borrowRate: 0.03 },
      { id: 1, lltv: 80, supplyAssets: 100, borrowAssets: 0, pendingInterest: 0, borrowRate: 0.04 },
    ];
    const result = computeJrBorrow(tranches);
    expect(result).toEqual([0, 0]);
  });
});

describe('computeJrNetSupply', () => {
  it('floors at zero (no negative net supply)', () => {
    const jrSupply = [100, 50];
    const jrBorrow = [200, 100]; // More borrow than supply
    const result = computeJrNetSupply(jrSupply, jrBorrow);

    expect(result[0]).toBe(0); // max(0, 100 - 200)
    expect(result[1]).toBe(0); // max(0, 50 - 100)
  });
});

describe('computeFreeSupply', () => {
  it('identifies mid-tranche bottleneck', () => {
    const jrNetSupply = [3000, 2500, 1000, 2000, 2500];
    const { freeSupply, bindingIndices } = computeFreeSupply(jrNetSupply);

    expect(freeSupply[2]).toBe(1000); // Bottleneck
    expect(freeSupply[4]).toBe(1000); // Stays at bottleneck
    expect(bindingIndices).toEqual([2]);
  });

  it('identifies senior bottleneck', () => {
    const jrNetSupply = [500, 2000, 3000, 4000, 5000];
    const { freeSupply, bindingIndices } = computeFreeSupply(jrNetSupply);

    expect(freeSupply[4]).toBe(500);
    expect(bindingIndices).toEqual([0]);
  });
});

describe('computeSupplyRates - Cascading Interest', () => {
  it('cascades interest from senior to junior', () => {
    // Simple case: 2 tranches, senior has low supply utilization
    const tranches: TrancheInput[] = [
      { id: 0, lltv: 75, supplyAssets: 100, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.10 },
      { id: 1, lltv: 95, supplyAssets: 100, borrowAssets: 0, pendingInterest: 0, borrowRate: 0.10 },
    ];

    const result = computeAllTranches(tranches, false);

    // jrNetSupply: [100, 100], availableSupply: [200, 100]
    // supplyUtil: [100/200=0.5, 100/100=1.0]
    expect(result[0].supplyUtilization).toBeCloseTo(0.5);
    expect(result[1].supplyUtilization).toBeCloseTo(1.0);

    // Interest at tranche 0: 100 * 0.10 = 10
    // Allocated to T0: 10 * 0.5 = 5
    // Cascaded to T1: 10 * 0.5 = 5
    // T1 has no borrow, so just cascade: 5 * 1.0 = 5 allocated
    // Supply rate T0: 5 / 100 = 0.05 (5%)
    // Supply rate T1: 5 / 100 = 0.05 (5%)
    expect(result[0].supplyRate).toBeCloseTo(0.05);
    expect(result[1].supplyRate).toBeCloseTo(0.05);
  });

  it('allocates all interest to most junior when only junior has supply', () => {
    const tranches: TrancheInput[] = [
      { id: 0, lltv: 75, supplyAssets: 0, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.10 },
      { id: 1, lltv: 95, supplyAssets: 100, borrowAssets: 0, pendingInterest: 0, borrowRate: 0.10 },
    ];

    const result = computeAllTranches(tranches, false);

    // All 10 units of interest cascade to junior
    // Supply rate T1: 10 / 100 = 0.10 (10%)
    expect(result[0].supplyRate).toBeNull(); // No supply
    expect(result[1].supplyRate).toBeCloseTo(0.10);
  });

  it('handles multiple tranches with cascading', () => {
    const tranches = createDocExampleTranches();
    const result = computeAllTranches(tranches, false);

    // All tranches should have positive supply rates
    result.forEach((t) => {
      expect(t.supplyRate).not.toBeNull();
      expect(t.supplyRate).toBeGreaterThan(0);
    });

    // Junior tranches get cascaded interest, so they may have higher rates
    // despite lower borrow rates in their own tranche
  });
});

describe('computeAllTranches', () => {
  it('computes all derived values in one call', () => {
    const tranches = createTestTranches();
    const result = computeAllTranches(tranches, true);

    expect(result).toHaveLength(5);

    // Check structure
    expect(result[0]).toHaveProperty('jrSupply');
    expect(result[0]).toHaveProperty('jrBorrow');
    expect(result[0]).toHaveProperty('jrNetSupply');
    expect(result[0]).toHaveProperty('freeSupply');
    expect(result[0]).toHaveProperty('availableSupply');
    expect(result[0]).toHaveProperty('isBindingConstraint');
    expect(result[0]).toHaveProperty('supplyUtilization');
    expect(result[0]).toHaveProperty('borrowUtilization');
    expect(result[0]).toHaveProperty('supplyRate');
  });

  it('preserves original input data', () => {
    const tranches = createTestTranches();
    const result = computeAllTranches(tranches, true);

    expect(result[0].lltv).toBe(75);
    expect(result[0].supplyAssets).toBe(1000);
    expect(result[0].borrowAssets).toBe(500);
    expect(result[0].borrowRate).toBe(0.03);
  });
});

describe('Edge cases', () => {
  it('handles borrowed > supplied scenario', () => {
    const tranches: TrancheInput[] = [
      { id: 0, lltv: 75, supplyAssets: 100, borrowAssets: 500, pendingInterest: 0, borrowRate: 0.03 },
      { id: 1, lltv: 95, supplyAssets: 200, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.10 },
    ];

    const result = computeAllTranches(tranches, true);

    // jrNetSupply should floor at 0 for senior
    expect(result[0].jrNetSupply).toBe(0);
    expect(result[0].isBindingConstraint).toBe(true);
  });

  it('handles many tranches efficiently', () => {
    const tranches: TrancheInput[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      lltv: 75 + i,
      supplyAssets: 1000,
      borrowAssets: 500,
      pendingInterest: 10,
      borrowRate: 0.03 + i * 0.005,
    }));

    const start = performance.now();
    const result = computeAllTranches(tranches, true);
    const elapsed = performance.now() - start;

    expect(result).toHaveLength(15);
    expect(elapsed).toBeLessThan(50); // Should be <50ms
  });
});

describe('formatNumber', () => {
  it('formats numbers with commas', () => {
    expect(formatNumber(1000)).toBe('1,000.00');
    expect(formatNumber(1234567.89)).toBe('1,234,567.89');
  });

  it('handles null', () => {
    expect(formatNumber(null)).toBe('-');
  });

  it('handles Infinity', () => {
    expect(formatNumber(Infinity)).toBe('-');
  });

  it('respects decimal places', () => {
    expect(formatNumber(100, 0)).toBe('100');
    expect(formatNumber(100.5, 1)).toBe('100.5');
  });
});

describe('formatPercent', () => {
  it('formats percentages', () => {
    expect(formatPercent(0.5)).toBe('50.0%');
    expect(formatPercent(1)).toBe('100.0%');
    expect(formatPercent(0.123)).toBe('12.3%');
  });

  it('handles null', () => {
    expect(formatPercent(null)).toBe('-');
  });
});

describe('timePeriodToYears', () => {
  it('converts time periods to years correctly', () => {
    expect(timePeriodToYears('1week')).toBeCloseTo(1 / 52);
    expect(timePeriodToYears('1month')).toBeCloseTo(1 / 12);
    expect(timePeriodToYears('3months')).toBeCloseTo(0.25);
    expect(timePeriodToYears('1year')).toBe(1);
  });
});

describe('getTimePeriodLabel', () => {
  it('returns correct labels', () => {
    expect(getTimePeriodLabel('1week')).toBe('1 Week');
    expect(getTimePeriodLabel('1month')).toBe('1 Month');
    expect(getTimePeriodLabel('3months')).toBe('3 Months');
    expect(getTimePeriodLabel('1year')).toBe('1 Year');
  });
});

describe('simulateInterestAccrual', () => {
  it('calculates interest generated correctly', () => {
    const tranches = computeAllTranches(createDocExampleTranches(), false);
    const result = simulateInterestAccrual(tranches, '1year');

    // Interest generated = borrow * rate
    // T0: 100 * 0.03 = 3
    // T1: 250 * 0.04 = 10
    // T2: 200 * 0.05 = 10
    // T3: 150 * 0.07 = 10.5
    // T4: 100 * 0.10 = 10
    expect(result.tranches[0].interestGenerated).toBeCloseTo(3);
    expect(result.tranches[1].interestGenerated).toBeCloseTo(10);
    expect(result.tranches[2].interestGenerated).toBeCloseTo(10);
    expect(result.tranches[3].interestGenerated).toBeCloseTo(10.5);
    expect(result.tranches[4].interestGenerated).toBeCloseTo(10);
  });

  it('total interest received equals total interest generated', () => {
    const tranches = computeAllTranches(createDocExampleTranches(), false);
    const result = simulateInterestAccrual(tranches, '1year');

    // Total should be conserved (no interest lost in cascade)
    expect(result.totalInterestReceived).toBeCloseTo(result.totalInterestGenerated);
  });

  it('scales with time period', () => {
    const tranches = computeAllTranches(createDocExampleTranches(), false);
    const yearResult = simulateInterestAccrual(tranches, '1year');
    const monthResult = simulateInterestAccrual(tranches, '1month');

    // 1 month should be ~1/12 of 1 year
    expect(monthResult.totalInterestGenerated).toBeCloseTo(yearResult.totalInterestGenerated / 12);
  });

  it('cascades interest from senior to junior', () => {
    // Simple 2-tranche case
    const inputTranches: TrancheInput[] = [
      { id: 0, lltv: 75, supplyAssets: 100, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.10 },
      { id: 1, lltv: 95, supplyAssets: 100, borrowAssets: 0, pendingInterest: 0, borrowRate: 0.10 },
    ];
    const tranches = computeAllTranches(inputTranches, false);
    const result = simulateInterestAccrual(tranches, '1year');

    // T0 generates 10, T1 generates 0
    expect(result.tranches[0].interestGenerated).toBeCloseTo(10);
    expect(result.tranches[1].interestGenerated).toBeCloseTo(0);

    // With 50% supply utilization at T0, half cascades to T1
    // T0 receives 5, T1 receives 5
    expect(result.tranches[0].interestReceived).toBeCloseTo(5);
    expect(result.tranches[1].interestReceived).toBeCloseTo(5);
  });

  it('handles zero borrow (no interest generated)', () => {
    const inputTranches: TrancheInput[] = [
      { id: 0, lltv: 75, supplyAssets: 1000, borrowAssets: 0, pendingInterest: 0, borrowRate: 0.10 },
    ];
    const tranches = computeAllTranches(inputTranches, false);
    const result = simulateInterestAccrual(tranches, '1year');

    expect(result.totalInterestGenerated).toBe(0);
    expect(result.totalInterestReceived).toBe(0);
  });
});

describe('simulateBadDebt', () => {
  it('cascades bad debt from senior to junior based on supply utilization', () => {
    // Simple 2-tranche case with 50% supply util at senior tranche
    const inputTranches: TrancheInput[] = [
      { id: 0, lltv: 75, supplyAssets: 100, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.10 },
      { id: 1, lltv: 95, supplyAssets: 100, borrowAssets: 0, pendingInterest: 0, borrowRate: 0.10 },
    ];
    const tranches = computeAllTranches(inputTranches, false);

    // jrNetSupply: [100, 100], availableSupply: [200, 100]
    // supplyUtil: [100/200=0.5, 100/100=1.0]

    // Bad debt of 100 at 75% tranche
    const result = simulateBadDebt(tranches, 0, 100);

    // T0: absorbs 100 * 0.5 = 50, cascades 100 * 0.5 = 50
    // T1: absorbs 50 * 1.0 = 50 (100% utilization at most junior)
    expect(result.tranches[0].badDebtAbsorbed).toBeCloseTo(50);
    expect(result.tranches[0].badDebtCascadedOut).toBeCloseTo(50);
    expect(result.tranches[1].badDebtAbsorbed).toBeCloseTo(50);
    expect(result.tranches[1].badDebtCascadedIn).toBeCloseTo(50);

    expect(result.totalAbsorbed).toBeCloseTo(100);
    expect(result.unabsorbedBadDebt).toBeCloseTo(0);
  });

  it('most junior tranche absorbs 100% of cascaded bad debt', () => {
    const inputTranches: TrancheInput[] = [
      { id: 0, lltv: 75, supplyAssets: 0, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.10 },
      { id: 1, lltv: 95, supplyAssets: 100, borrowAssets: 0, pendingInterest: 0, borrowRate: 0.10 },
    ];
    const tranches = computeAllTranches(inputTranches, false);

    // T0 has 0% supply utilization (no supply)
    // All bad debt cascades to T1

    const result = simulateBadDebt(tranches, 0, 100);

    // T0: absorbs 0 (no supply), cascades 100
    expect(result.tranches[0].badDebtAbsorbed).toBe(0);
    expect(result.tranches[0].badDebtCascadedOut).toBeCloseTo(100);

    // T1: absorbs 100 (100% utilization at most junior)
    expect(result.tranches[1].badDebtAbsorbed).toBeCloseTo(100);

    expect(result.totalAbsorbed).toBeCloseTo(100);
  });

  it('tracks cascade flow through multiple tranches', () => {
    // 3 tranches with varying supply utilization
    const inputTranches: TrancheInput[] = [
      { id: 0, lltv: 75, supplyAssets: 100, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.05 },
      { id: 1, lltv: 85, supplyAssets: 100, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.07 },
      { id: 2, lltv: 95, supplyAssets: 100, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.10 },
    ];
    const tranches = computeAllTranches(inputTranches, false);

    // Bad debt of 100 at middle tranche
    const result = simulateBadDebt(tranches, 1, 100);

    // Bad debt starts at T1 but cascades from T0 (senior) onwards
    // Since bad debt occurs at T1, T0 sees 0 bad debt in
    expect(result.tranches[0].badDebtLocal).toBe(0);
    expect(result.tranches[0].badDebtCascadedIn).toBe(0);

    // T1 has the local bad debt
    expect(result.tranches[1].badDebtLocal).toBe(100);

    // All absorbed should equal total
    expect(result.totalAbsorbed).toBeCloseTo(result.totalBadDebt);
  });

  it('handles zero bad debt', () => {
    const tranches = computeAllTranches(createDocExampleTranches(), false);
    const result = simulateBadDebt(tranches, 2, 0);

    expect(result.totalAbsorbed).toBe(0);
    expect(result.tranches.every(t => t.badDebtAbsorbed === 0)).toBe(true);
    expect(result.tranches.every(t => t.remainingSupply === t.originalSupply)).toBe(true);
  });

  it('tracks source tranche correctly', () => {
    const tranches = computeAllTranches(createDocExampleTranches(), false);
    const result = simulateBadDebt(tranches, 3, 100);

    expect(result.badDebtEvents).toHaveLength(1);
    expect(result.badDebtEvents[0].trancheIndex).toBe(3);
    expect(result.badDebtEvents[0].amount).toBe(100);
    expect(result.totalBadDebt).toBe(100);
    expect(result.tranches[3].badDebtLocal).toBe(100);
  });

  it('handles multiple bad debt events', () => {
    const tranches = computeAllTranches(createDocExampleTranches(), false);
    const events = [
      { trancheIndex: 1, amount: 50 },
      { trancheIndex: 3, amount: 100 },
    ];
    const result = simulateBadDebt(tranches, events);

    expect(result.badDebtEvents).toHaveLength(2);
    expect(result.totalBadDebt).toBe(150);
    expect(result.tranches[1].badDebtLocal).toBe(50);
    expect(result.tranches[3].badDebtLocal).toBe(100);
  });

  it('supply utilization determines absorption ratio', () => {
    // Create scenario with specific supply utilization
    const inputTranches: TrancheInput[] = [
      { id: 0, lltv: 75, supplyAssets: 200, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.03 },
      { id: 1, lltv: 95, supplyAssets: 100, borrowAssets: 0, pendingInterest: 0, borrowRate: 0.10 },
    ];
    const tranches = computeAllTranches(inputTranches, false);

    // jrNetSupply: [200, 100], availableSupply: [300, 100]
    // supplyUtil T0: 200/300 = 66.67%
    // supplyUtil T1: 100/100 = 100%

    const result = simulateBadDebt(tranches, 0, 300);

    // T0: absorbs 300 * 0.6667 ≈ 200 (capped by supply), cascades 100
    // T1: absorbs remaining 100
    expect(result.tranches[0].supplyUtilization).toBeCloseTo(200/300);
    expect(result.tranches[1].supplyUtilization).toBe(1);
  });
});
