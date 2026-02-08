import { describe, it, expect } from 'vitest';
import { computeFundingMatrix } from './fundingMatrix';
import type { TrancheInput } from '../types';

/**
 * Test data matching the protocol_math.md Dynamic Loan Mix example.
 * 5 tranches with equal supply of 200 each.
 */
const createDocExampleTranches = (): TrancheInput[] => [
  { id: 0, lltv: 75, supplyAssets: 200, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.03 },
  { id: 1, lltv: 80, supplyAssets: 200, borrowAssets: 250, pendingInterest: 0, borrowRate: 0.04 },
  { id: 2, lltv: 85, supplyAssets: 200, borrowAssets: 200, pendingInterest: 0, borrowRate: 0.05 },
  { id: 3, lltv: 90, supplyAssets: 200, borrowAssets: 150, pendingInterest: 0, borrowRate: 0.07 },
  { id: 4, lltv: 95, supplyAssets: 200, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.10 },
];

describe('Dynamic Loan Mix from protocol_math.md', () => {
  it('matches T4 lender allocations from doc', () => {
    const tranches = createDocExampleTranches();
    const result = computeFundingMatrix(tranches, false);

    // T4 (index 4) allocations from doc:
    // 50% to T4, 25% to T3, 14.29% to T2, 7.65% to T1, 1.02% to T0
    expect(result.matrix[4][4]).toBeCloseTo(0.50, 2);     // T4 → T4: 50%
    expect(result.matrix[3][4]).toBeCloseTo(0.25, 2);     // T4 → T3: 25%
    expect(result.matrix[2][4]).toBeCloseTo(0.1429, 2);   // T4 → T2: 14.29%
    expect(result.matrix[1][4]).toBeCloseTo(0.0765, 2);   // T4 → T1: 7.65%
    expect(result.matrix[0][4]).toBeCloseTo(0.0102, 2);   // T4 → T0: 1.02%
  });

  it('matches T3 lender allocations from doc', () => {
    const tranches = createDocExampleTranches();
    const result = computeFundingMatrix(tranches, false);

    // T3 (index 3) allocations from doc:
    // 50% to T3, others cascade to senior tranches
    expect(result.matrix[3][3]).toBeCloseTo(0.50, 2);     // T3 → T3: 50%
    expect(result.matrix[4][3]).toBe(0);                  // T3 cannot fund T4 (junior)
  });

  it('matches capital allocation percentages from doc', () => {
    const tranches = createDocExampleTranches();
    const result = computeFundingMatrix(tranches, false);

    // Capital Allocated from doc:
    // T0: 33.33%, T1: 80.95%, T2: 91.83%, T3: 95.92%, T4: 97.96%
    expect(result.capitalAllocated![0]).toBeCloseTo(0.3333, 2);
    expect(result.capitalAllocated![1]).toBeCloseTo(0.8095, 2);
    expect(result.capitalAllocated![2]).toBeCloseTo(0.9183, 2);
    expect(result.capitalAllocated![3]).toBeCloseTo(0.9592, 2);
    expect(result.capitalAllocated![4]).toBeCloseTo(0.9796, 2);
  });

  it('senior lenders cannot fund junior borrowers', () => {
    const tranches = createDocExampleTranches();
    const result = computeFundingMatrix(tranches, false);

    // T0 can only fund T0
    expect(result.matrix[1][0]).toBe(0);
    expect(result.matrix[2][0]).toBe(0);
    expect(result.matrix[3][0]).toBe(0);
    expect(result.matrix[4][0]).toBe(0);

    // T1 cannot fund T2, T3, T4
    expect(result.matrix[2][1]).toBe(0);
    expect(result.matrix[3][1]).toBe(0);
    expect(result.matrix[4][1]).toBe(0);
  });

  it('handles zero borrow scenario', () => {
    const tranches: TrancheInput[] = [
      { id: 0, lltv: 75, supplyAssets: 100, borrowAssets: 0, pendingInterest: 0, borrowRate: 0.03 },
      { id: 1, lltv: 95, supplyAssets: 100, borrowAssets: 0, pendingInterest: 0, borrowRate: 0.10 },
    ];

    const result = computeFundingMatrix(tranches, false);

    // No borrows means no allocations
    expect(result.capitalAllocated![0]).toBe(0);
    expect(result.capitalAllocated![1]).toBe(0);
    expect(result.totalFunded).toBe(0);
  });

  it('handles zero supply scenario', () => {
    const tranches: TrancheInput[] = [
      { id: 0, lltv: 75, supplyAssets: 0, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.03 },
      { id: 1, lltv: 95, supplyAssets: 200, borrowAssets: 50, pendingInterest: 0, borrowRate: 0.10 },
    ];

    const result = computeFundingMatrix(tranches, false);

    // T0 has no supply, so no allocation from T0
    expect(result.capitalAllocated![0]).toBe(0);
    // T1 funds both T1 and T0 borrowers
    expect(result.capitalAllocated![1]).toBeGreaterThan(0);
  });
});
