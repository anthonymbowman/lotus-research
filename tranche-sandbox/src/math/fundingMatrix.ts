import type { TrancheInput, FundingMatrix, FundingMatrixEntry } from '../types';
import { computeJrSupply, computeJrBorrow, computeJrNetSupply, computeAvailableSupply } from './lotusAccounting';

/**
 * Disclaimer text for the funding matrix visualization.
 */
export const FUNDING_MATRIX_DISCLAIMER = `
This visualization shows the Dynamic Loan Mix - how each lender tranche's supply
is allocated across borrower tranches. Junior tranche supply can fund borrowers
in their own tranche and all more senior tranches. The allocation follows the
cascading logic where unutilized liquidity flows to more senior tranches.
`.trim();

/**
 * Compute the Dynamic Loan Mix matrix showing how each lender tranche's supply
 * is allocated across borrower tranches.
 *
 * Algorithm (from protocol_math.md):
 * For each supplier tranche j (column):
 * 1. Start with supply[j] as cascading supply
 * 2. Process from j down to 0 (own tranche to most senior):
 *    - At tranche i: shareOfAvailable = cascadedSupply / availableSupply[i]
 *    - allocated = shareOfAvailable * borrow[i]
 *    - matrix[i][j] = allocated / supply[j] (percentage of supplier's total)
 *    - cascadedSupply = cascadedSupply - allocated
 *
 * The matrix shows percentages: matrix[borrowerIdx][lenderIdx] = % of lender's supply
 * that funds this borrower tranche.
 *
 * @param tranches - Array of tranche inputs (index 0 = most senior)
 * @param includePendingInterest - Whether to include pending interest in supply
 * @returns FundingMatrix with percentage allocations
 */
export function computeFundingMatrix(
  tranches: TrancheInput[],
  includePendingInterest: boolean = true
): FundingMatrix {
  const n = tranches.length;

  // Compute intermediate values needed
  const jrSupply = computeJrSupply(tranches, includePendingInterest);
  const jrBorrow = computeJrBorrow(tranches);
  const jrNetSupply = computeJrNetSupply(jrSupply, jrBorrow);
  const availableSupply = computeAvailableSupply(jrNetSupply, tranches);

  // Initialize matrix with zeros
  // matrix[borrowerIdx][lenderIdx] = percentage of lender's supply allocated to this borrower
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  // Track capital allocation percentage for each lender (sum of their row in matrix)
  const capitalAllocated: number[] = new Array(n).fill(0);

  // Process each lender tranche (column)
  for (let lenderIdx = 0; lenderIdx < n; lenderIdx++) {
    const lenderSupply = tranches[lenderIdx].supplyAssets +
      (includePendingInterest ? tranches[lenderIdx].pendingInterest : 0);

    if (lenderSupply === 0) continue;

    // Start with all of this lender's supply available to cascade
    let cascadingSupply = lenderSupply;

    // Process from lender's tranche down to most senior (lenderIdx to 0)
    for (let borrowerIdx = lenderIdx; borrowerIdx >= 0; borrowerIdx--) {
      if (cascadingSupply <= 0) break;
      if (availableSupply[borrowerIdx] <= 0) continue;

      const borrow = tranches[borrowerIdx].borrowAssets;
      if (borrow <= 0) continue;

      // What share of available supply at this tranche is from this lender's cascade?
      const shareOfAvailable = cascadingSupply / availableSupply[borrowerIdx];

      // How much of the borrow does this lender fund?
      const allocated = shareOfAvailable * borrow;

      // Store as percentage of lender's total supply
      const percentOfLender = allocated / lenderSupply;
      matrix[borrowerIdx][lenderIdx] = percentOfLender;
      capitalAllocated[lenderIdx] += percentOfLender;

      // Reduce cascading supply by the amount allocated
      cascadingSupply -= allocated;
    }
  }

  // Build detailed entries for rendering
  const entries: FundingMatrixEntry[] = [];
  let totalFunded = 0;

  for (let lenderIdx = 0; lenderIdx < n; lenderIdx++) {
    const lenderSupply = tranches[lenderIdx].supplyAssets +
      (includePendingInterest ? tranches[lenderIdx].pendingInterest : 0);

    for (let borrowerIdx = 0; borrowerIdx < n; borrowerIdx++) {
      const percentOfLender = matrix[borrowerIdx][lenderIdx];
      if (percentOfLender > 0) {
        const amount = percentOfLender * lenderSupply;
        const borrowerBorrow = tranches[borrowerIdx].borrowAssets;

        entries.push({
          lenderIndex: lenderIdx,
          borrowerIndex: borrowerIdx,
          amount,
          percentOfLenderSupply: percentOfLender,
          percentOfBorrowerBorrow: borrowerBorrow > 0 ? amount / borrowerBorrow : 0,
        });

        totalFunded += amount;
      }
    }
  }

  return { matrix, entries, totalFunded, capitalAllocated };
}

/**
 * Get the color intensity for a funding matrix cell based on the percentage.
 *
 * @param percent - The percentage (0-1) in this cell
 * @returns A value between 0 and 1 for color intensity
 */
export function getFundingIntensity(percent: number): number {
  if (percent === 0) return 0;
  // Use square root scaling for better visual distribution
  return Math.sqrt(percent);
}

/**
 * Get the maximum percentage value in a funding matrix.
 *
 * @param matrix - The funding matrix
 * @returns The maximum percentage value
 */
export function getMatrixMax(matrix: number[][]): number {
  let max = 0;
  for (const row of matrix) {
    for (const val of row) {
      if (val > max) max = val;
    }
  }
  return max;
}

/**
 * Check if a funding relationship is valid (lender can fund borrower).
 * In Lotus, a tranche can only fund its own tranche or more senior tranches.
 *
 * @param lenderIdx - Index of the lender tranche
 * @param borrowerIdx - Index of the borrower tranche
 * @returns True if the relationship is valid
 */
export function isValidFundingRelationship(lenderIdx: number, borrowerIdx: number): boolean {
  // Lender at index i can fund borrowers at indices 0..i (more senior or same tranche)
  return borrowerIdx <= lenderIdx;
}
