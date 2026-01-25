import type { TrancheInput, TrancheData } from '../types';

/**
 * Compute Junior Supply for each tranche.
 * jrSupply[i] = Σ_{j=i..N-1} (trancheSupplyAssets[j] + pendingInterest[j])
 *
 * Junior supply represents the total supply available from this tranche
 * and all tranches junior to it (higher index = more junior).
 *
 * @param tranches - Array of tranche inputs (index 0 = most senior)
 * @param includePendingInterest - Whether to include pending interest in calculations
 * @returns Array of junior supply values, same length as input
 */
export function computeJrSupply(
  tranches: TrancheInput[],
  includePendingInterest: boolean = true
): number[] {
  const n = tranches.length;
  const jrSupply: number[] = new Array(n).fill(0);

  // Compute from junior to senior (reverse order)
  // Each tranche's jrSupply = own supply + sum of all junior tranches' supply
  let cumulativeSupply = 0;
  for (let i = n - 1; i >= 0; i--) {
    const tranche = tranches[i];
    const supply = tranche.supplyAssets + (includePendingInterest ? tranche.pendingInterest : 0);
    cumulativeSupply += supply;
    jrSupply[i] = cumulativeSupply;
  }

  return jrSupply;
}

/**
 * Compute Junior Borrow for each tranche.
 * jrBorrow[i] = Σ_{j=i..N-1} trancheBorrowAssets[j]
 *
 * Junior borrow represents the total borrow from this tranche
 * and all tranches junior to it.
 *
 * @param tranches - Array of tranche inputs (index 0 = most senior)
 * @returns Array of junior borrow values, same length as input
 */
export function computeJrBorrow(tranches: TrancheInput[]): number[] {
  const n = tranches.length;
  const jrBorrow: number[] = new Array(n).fill(0);

  // Compute from junior to senior (reverse order)
  let cumulativeBorrow = 0;
  for (let i = n - 1; i >= 0; i--) {
    cumulativeBorrow += tranches[i].borrowAssets;
    jrBorrow[i] = cumulativeBorrow;
  }

  return jrBorrow;
}

/**
 * Compute Junior Net Supply for each tranche.
 * jrNetSupply[i] = max(0, jrSupply[i] − jrBorrow[i])
 *
 * This represents the "unused" junior supply after accounting for junior borrows.
 *
 * @param jrSupply - Array of junior supply values
 * @param jrBorrow - Array of junior borrow values
 * @returns Array of junior net supply values
 */
export function computeJrNetSupply(jrSupply: number[], jrBorrow: number[]): number[] {
  return jrSupply.map((supply, i) => Math.max(0, supply - jrBorrow[i]));
}

/**
 * Compute Free Supply for each tranche.
 * freeSupply[i] = min_{j∈[0..i]} jrNetSupply[j]
 *
 * Free supply is constrained by the minimum jrNetSupply of all senior tranches.
 * This implements the "connected liquidity" model where senior tranches can
 * access junior liquidity, but are limited by any bottleneck in between.
 *
 * Also identifies which tranche(s) are the binding constraint.
 *
 * @param jrNetSupply - Array of junior net supply values
 * @returns Object with freeSupply array and bindingIndices
 */
export function computeFreeSupply(jrNetSupply: number[]): {
  freeSupply: number[];
  bindingIndices: number[];
} {
  const n = jrNetSupply.length;
  const freeSupply: number[] = new Array(n).fill(0);
  const bindingIndices: number[] = [];

  let runningMin = Infinity;
  let minIndices: number[] = [];

  for (let i = 0; i < n; i++) {
    if (jrNetSupply[i] < runningMin) {
      runningMin = jrNetSupply[i];
      minIndices = [i];
    } else if (jrNetSupply[i] === runningMin) {
      minIndices.push(i);
    }
    freeSupply[i] = runningMin;
  }

  // The binding constraint(s) are the tranche(s) with the minimum jrNetSupply
  // that actually constrain liquidity (only if there's actual supply)
  if (runningMin < Infinity && runningMin >= 0) {
    bindingIndices.push(...minIndices.filter(i => i === minIndices[0]));
    // Actually, the binding tranche is the first one that achieves the minimum
    // because that's where the bottleneck occurs
    return { freeSupply, bindingIndices: [minIndices[0]] };
  }

  return { freeSupply, bindingIndices };
}

/**
 * Compute Available Supply for each tranche.
 * availableSupply[i] = jrNetSupply[i] + trancheBorrowAssets[i]
 *
 * Available supply represents the total supply that was available to this tranche
 * before any of this tranche's borrowing.
 *
 * @param jrNetSupply - Array of junior net supply values
 * @param tranches - Array of tranche inputs
 * @returns Array of available supply values
 */
export function computeAvailableSupply(
  jrNetSupply: number[],
  tranches: TrancheInput[]
): number[] {
  return jrNetSupply.map((netSupply, i) => netSupply + tranches[i].borrowAssets);
}

/**
 * Compute Supply Utilization for each tranche.
 * supplyUtilization[i] = supply[i] / availableSupply[i]
 *
 * This shows what share of the available supply at this tranche comes from
 * this tranche's direct lenders. Used for interest and bad debt allocation.
 *
 * The most junior tranche always has 100% supply utilization.
 *
 * @param tranches - Array of tranche inputs
 * @param availableSupply - Array of available supply values
 * @param includePendingInterest - Whether to include pending interest
 * @returns Array of utilization values (null if availableSupply is 0)
 */
export function computeSupplyUtilization(
  tranches: TrancheInput[],
  availableSupply: number[],
  includePendingInterest: boolean = true
): (number | null)[] {
  return tranches.map((tranche, i) => {
    if (availableSupply[i] === 0) return null;
    const supply = tranche.supplyAssets + (includePendingInterest ? tranche.pendingInterest : 0);
    return supply / availableSupply[i];
  });
}

/**
 * Compute Borrow Utilization for each tranche.
 * borrowUtilization[i] = (jrSupply[i] - freeSupply[i]) / jrSupply[i]
 *              or equivalently: 1 - freeSupply[i] / jrSupply[i]
 *
 * This shows what fraction of the junior supply is being utilized
 * (i.e., has been borrowed or is locked due to borrows).
 * Used by interest rate models.
 *
 * @param jrSupply - Array of junior supply values
 * @param freeSupply - Array of free supply values
 * @returns Array of utilization values (null if jrSupply is 0)
 */
export function computeBorrowUtilization(
  jrSupply: number[],
  freeSupply: number[]
): (number | null)[] {
  return jrSupply.map((supply, i) => {
    if (supply === 0) return null;
    return (supply - freeSupply[i]) / supply;
  });
}

/**
 * Compute Supply Rate for each tranche using cascading interest allocation.
 *
 * Interest allocation works like bad debt allocation:
 * 1. Start from the most senior tranche (index 0)
 * 2. For each tranche:
 *    - Take any cascading interest from more senior tranches
 *    - Add this tranche's own accrued interest (borrow * borrowRate)
 *    - Allocate (totalInterest * supplyUtilization) to this tranche's lenders
 *    - Cascade (totalInterest * (1 - supplyUtilization)) to the next junior tranche
 * 3. The most junior tranche gets 100% of whatever cascades to it
 *
 * Supply rate = interest allocated to tranche / tranche's supply
 *
 * @param tranches - Array of tranche inputs
 * @param supplyUtilization - Array of supply utilization values
 * @param includePendingInterest - Whether to include pending interest in supply
 * @returns Array of supply rate values (null if supply is 0)
 */
export function computeSupplyRates(
  tranches: TrancheInput[],
  supplyUtilization: (number | null)[],
  includePendingInterest: boolean = true
): (number | null)[] {
  const n = tranches.length;
  const supplyRates: (number | null)[] = new Array(n).fill(null);
  const interestAllocated: number[] = new Array(n).fill(0);

  let cascadingInterest = 0;

  // Process from senior (0) to junior (n-1)
  for (let i = 0; i < n; i++) {
    // Interest accrued at this tranche = borrow * borrowRate
    const trancheInterest = tranches[i].borrowAssets * tranches[i].borrowRate;

    // Total interest to allocate = cascading from senior + this tranche's interest
    const totalInterest = cascadingInterest + trancheInterest;

    // Get supply utilization (defaults to 1 for most junior or if null)
    const utilization = supplyUtilization[i] ?? 1;

    // Allocate to this tranche's lenders
    const allocated = totalInterest * utilization;
    interestAllocated[i] = allocated;

    // Cascade remainder to next junior tranche
    cascadingInterest = totalInterest * (1 - utilization);
  }

  // Calculate supply rates
  for (let i = 0; i < n; i++) {
    const supply = tranches[i].supplyAssets +
      (includePendingInterest ? tranches[i].pendingInterest : 0);

    if (supply === 0) {
      supplyRates[i] = null;
    } else {
      supplyRates[i] = interestAllocated[i] / supply;
    }
  }

  return supplyRates;
}

/**
 * Compute all derived values for a set of tranches.
 * This is the main entry point for the calculation engine.
 *
 * @param tranches - Array of tranche inputs (index 0 = most senior)
 * @param includePendingInterest - Whether to include pending interest
 * @returns Array of TrancheData with all computed values
 */
export function computeAllTranches(
  tranches: TrancheInput[],
  includePendingInterest: boolean = true
): TrancheData[] {
  const jrSupply = computeJrSupply(tranches, includePendingInterest);
  const jrBorrow = computeJrBorrow(tranches);
  const jrNetSupply = computeJrNetSupply(jrSupply, jrBorrow);
  const { freeSupply, bindingIndices } = computeFreeSupply(jrNetSupply);
  const availableSupply = computeAvailableSupply(jrNetSupply, tranches);
  const supplyUtilization = computeSupplyUtilization(tranches, availableSupply, includePendingInterest);
  const borrowUtilization = computeBorrowUtilization(jrSupply, freeSupply);
  const supplyRates = computeSupplyRates(tranches, supplyUtilization, includePendingInterest);

  const bindingSet = new Set(bindingIndices);

  return tranches.map((tranche, i): TrancheData => ({
    ...tranche,
    jrSupply: jrSupply[i],
    jrBorrow: jrBorrow[i],
    jrNetSupply: jrNetSupply[i],
    freeSupply: freeSupply[i],
    availableSupply: availableSupply[i],
    isBindingConstraint: bindingSet.has(i),
    supplyUtilization: supplyUtilization[i],
    borrowUtilization: borrowUtilization[i],
    supplyRate: supplyRates[i],
  }));
}

/**
 * Format a number for display with appropriate precision.
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places (default 2)
 * @returns Formatted string
 */
export function formatNumber(value: number | null, decimals: number = 2): string {
  if (value === null) return '-';
  if (!Number.isFinite(value)) return '-';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a number as a percentage.
 *
 * @param value - Number to format (0-1 scale)
 * @param decimals - Number of decimal places (default 1)
 * @returns Formatted percentage string
 */
export function formatPercent(value: number | null, decimals: number = 1): string {
  if (value === null) return '-';
  if (!Number.isFinite(value)) return '-';
  return (value * 100).toFixed(decimals) + '%';
}
