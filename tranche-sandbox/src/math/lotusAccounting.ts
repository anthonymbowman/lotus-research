import type {
  TrancheInput,
  TrancheData,
  TimePeriod,
  InterestSimulationResult,
  InterestAccrualResult,
  BadDebtSimulationResult,
  BadDebtTrancheResult,
  BadDebtEvent,
} from '../types';

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
 * Also identifies which tranche(s) are binding constraints.
 * A tranche is "binding" if its Jr Net Supply constrains ANY junior tranche's
 * Free Supply (i.e., a junior tranche has higher Jr Net Supply but is limited
 * by this tranche's Jr Net Supply).
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
  const bindingIndicesSet = new Set<number>();

  let runningMin = Infinity;
  let currentBindingIndex = -1;

  for (let i = 0; i < n; i++) {
    // Check if this tranche establishes a new minimum
    if (jrNetSupply[i] < runningMin) {
      runningMin = jrNetSupply[i];
      currentBindingIndex = i;
    }

    freeSupply[i] = runningMin;

    // If this tranche's Jr Net Supply is greater than its Free Supply,
    // it means this tranche is constrained by the currentBindingIndex tranche
    if (jrNetSupply[i] > freeSupply[i] && currentBindingIndex >= 0) {
      bindingIndicesSet.add(currentBindingIndex);
    }
  }

  return { freeSupply, bindingIndices: Array.from(bindingIndicesSet) };
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
  _includePendingInterest: boolean = true
): (number | null)[] {
  return tranches.map((tranche, i) => {
    if (availableSupply[i] === 0) return null;
    // Docs formula: trancheSupplyAssets[i] / availableSupply[i]
    // pendingInterest is already reflected in availableSupply via jrSupply
    return tranche.supplyAssets / availableSupply[i];
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
export function formatPercent(value: number | null, decimals: number = 2): string {
  if (value === null) return '-';
  if (!Number.isFinite(value)) return '-';
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * Convert a time period to years for interest calculations.
 */
export function timePeriodToYears(period: TimePeriod): number {
  switch (period) {
    case '1week':
      return 1 / 52;
    case '1month':
      return 1 / 12;
    case '3months':
      return 3 / 12;
    case '1year':
      return 1;
  }
}

/**
 * Get display label for a time period.
 */
export function getTimePeriodLabel(period: TimePeriod): string {
  switch (period) {
    case '1week':
      return '1 Week';
    case '1month':
      return '1 Month';
    case '3months':
      return '3 Months';
    case '1year':
      return '1 Year';
  }
}

/**
 * Simulate interest accrual over a time period.
 *
 * This shows how interest flows through the cascade mechanism:
 * 1. Each tranche generates interest = borrowAssets × borrowRate × time
 * 2. Interest cascades from senior to junior based on supply utilization
 * 3. Each tranche receives interest based on their supply utilization share
 *
 * @param tranches - Array of computed tranche data
 * @param timePeriod - Time period to simulate
 * @returns Detailed breakdown of interest flow
 */
export function simulateInterestAccrual(
  tranches: TrancheData[],
  timePeriod: TimePeriod
): InterestSimulationResult {
  const timeInYears = timePeriodToYears(timePeriod);
  const n = tranches.length;

  // Calculate interest generated at each tranche
  const interestGenerated: number[] = tranches.map(
    (t) => t.borrowAssets * t.borrowRate * timeInYears
  );

  // Track interest received and cascaded
  const interestReceived: number[] = new Array(n).fill(0);
  const interestCascaded: number[] = new Array(n).fill(0);

  let cascadingInterest = 0;

  // Process from senior (0) to junior (n-1)
  for (let i = 0; i < n; i++) {
    // Total interest at this tranche = cascading + locally generated
    const totalInterest = cascadingInterest + interestGenerated[i];

    // Get supply utilization (defaults to 1 for most junior or if null)
    const utilization = tranches[i].supplyUtilization ?? 1;

    // Allocate to this tranche's lenders
    interestReceived[i] = totalInterest * utilization;

    // Cascade remainder to next junior tranche
    interestCascaded[i] = totalInterest * (1 - utilization);
    cascadingInterest = interestCascaded[i];
  }

  // Build result array
  const trancheResults: InterestAccrualResult[] = tranches.map((t, i) => {
    const supply = t.supplyAssets;
    return {
      index: i,
      lltv: t.lltv,
      interestGenerated: interestGenerated[i],
      interestReceived: interestReceived[i],
      interestCascaded: interestCascaded[i],
      netPosition: interestReceived[i] - interestGenerated[i],
      impliedSupplyRate: supply > 0 ? interestReceived[i] / supply / timeInYears : null,
    };
  });

  return {
    timePeriod,
    timeInYears,
    tranches: trancheResults,
    totalInterestGenerated: interestGenerated.reduce((a, b) => a + b, 0),
    totalInterestReceived: interestReceived.reduce((a, b) => a + b, 0),
  };
}

/**
 * Simulate bad debt absorption across tranches.
 *
 * Bad debt cascades using the same supply utilization weights as interest
 * (senior to junior), but absorption is additionally capped by each
 * tranche's supply balance:
 * 1. Bad debt occurs at one or more tranches
 * 2. Starting from the most senior tranche (index 0):
 *    - Total bad debt at this tranche = cascaded in + locally occurring
 *    - Absorbed by this tranche = min(totalBadDebt × supplyUtilization, trancheSupply)
 *    - Cascaded to junior = totalBadDebt - absorbed
 * 3. The most junior tranche absorbs 100% of remaining bad debt (up to its supply)
 *
 * @param tranches - Array of computed tranche data
 * @param badDebtEvents - Array of bad debt events, or single event params for backwards compatibility
 * @param badDebtAmount - (deprecated) Amount of bad debt when using old API
 * @returns Detailed breakdown of loss absorption
 */
export function simulateBadDebt(
  tranches: TrancheData[],
  badDebtEventsOrIndex: BadDebtEvent[] | number,
  badDebtAmount?: number
): BadDebtSimulationResult {
  const n = tranches.length;

  // Handle both old API (index, amount) and new API (events array)
  let events: BadDebtEvent[];
  if (typeof badDebtEventsOrIndex === 'number') {
    // Old API: simulateBadDebt(tranches, sourceIndex, amount)
    events = [{ trancheIndex: badDebtEventsOrIndex, amount: badDebtAmount ?? 0 }];
  } else {
    // New API: simulateBadDebt(tranches, events)
    events = badDebtEventsOrIndex;
  }

  // Calculate local bad debt for each tranche from all events
  const localBadDebt: number[] = new Array(n).fill(0);
  for (const event of events) {
    if (event.trancheIndex >= 0 && event.trancheIndex < n) {
      localBadDebt[event.trancheIndex] += event.amount;
    }
  }

  const totalBadDebtAmount = events.reduce((sum, e) => sum + e.amount, 0);

  // Initialize results
  const trancheResults: BadDebtTrancheResult[] = tranches.map((t, i) => ({
    index: i,
    lltv: t.lltv,
    originalSupply: t.supplyAssets,
    supplyUtilization: t.supplyUtilization ?? 1,
    badDebtCascadedIn: 0,
    badDebtLocal: localBadDebt[i],
    badDebtAbsorbed: 0,
    badDebtCascadedOut: 0,
    remainingSupply: t.supplyAssets,
    wipedOut: false,
  }));

  let cascadingBadDebt = 0;

  // Bad debt cascades from senior (0) to junior (n-1), same as interest
  for (let i = 0; i < n; i++) {
    const result = trancheResults[i];

    // Bad debt at this tranche = cascaded from senior + locally occurring
    result.badDebtCascadedIn = cascadingBadDebt;
    const totalBadDebtAtLevel = cascadingBadDebt + result.badDebtLocal;

    // Get supply utilization (defaults to 1 for most junior or if null)
    // Most junior tranche (last) always absorbs 100%
    const utilization = i === n - 1 ? 1 : (tranches[i].supplyUtilization ?? 1);
    result.supplyUtilization = utilization;

    // Absorbed = total × supplyUtilization (capped by available supply)
    const absorbed = Math.min(totalBadDebtAtLevel * utilization, result.originalSupply);
    result.badDebtAbsorbed = absorbed;
    result.remainingSupply = result.originalSupply - absorbed;
    result.wipedOut = result.remainingSupply === 0 && absorbed > 0;

    // Cascade remainder to next junior tranche
    // Use total - absorbed (not total * (1 - util)) so cap binding is handled correctly
    result.badDebtCascadedOut = totalBadDebtAtLevel - absorbed;
    cascadingBadDebt = result.badDebtCascadedOut;
  }

  const totalAbsorbed = trancheResults.reduce((sum, t) => sum + t.badDebtAbsorbed, 0);

  return {
    badDebtEvents: events,
    totalBadDebt: totalBadDebtAmount,
    tranches: trancheResults,
    totalAbsorbed,
    unabsorbedBadDebt: totalBadDebtAmount - totalAbsorbed,
  };
}
