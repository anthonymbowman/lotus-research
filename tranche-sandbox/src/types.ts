/**
 * Fixed LLTV values for the 5 tranches (most senior to most junior)
 */
export const TRANCHE_LLTVS = [75, 80, 85, 90, 95] as const;

/**
 * Input data for a single tranche
 */
export interface TrancheInput {
  /** Unique identifier for the tranche */
  id: number;
  /** LLTV percentage for this tranche */
  lltv: number;
  /** Total assets supplied to this tranche */
  supplyAssets: number;
  /** Total assets borrowed from this tranche */
  borrowAssets: number;
  /** Pending interest accrued but not yet distributed */
  pendingInterest: number;
  /** Borrow rate (APR as decimal, e.g., 0.05 = 5%) */
  borrowRate: number;
}

/**
 * Computed values for a single tranche
 */
export interface TrancheComputed {
  /** Junior supply: sum of supply from this tranche and all junior tranches */
  jrSupply: number;
  /** Junior borrow: sum of borrow from this tranche and all junior tranches */
  jrBorrow: number;
  /** Junior net supply: max(0, jrSupply - jrBorrow) */
  jrNetSupply: number;
  /** Free supply: min of jrNetSupply from senior tranches through this one */
  freeSupply: number;
  /** Available supply: jrNetSupply + borrowAssets of this tranche */
  availableSupply: number;
  /** Whether this tranche is the binding constraint for free supply */
  isBindingConstraint: boolean;
  /** Supply utilization: borrowAssets / (supplyAssets + pendingInterest) */
  supplyUtilization: number | null;
  /** Borrow utilization: (jrSupply - freeSupply) / jrSupply (if jrSupply > 0) */
  borrowUtilization: number | null;
  /** Supply rate (APR) based on interest received from borrowers */
  supplyRate: number | null;
}

/**
 * Combined tranche data (input + computed)
 */
export interface TrancheData extends TrancheInput, TrancheComputed {}

/**
 * Funding matrix entry showing how much of a lender's supply funds a specific borrower tranche
 */
export interface FundingMatrixEntry {
  /** Lender tranche index (row) */
  lenderIndex: number;
  /** Borrower tranche index (column) */
  borrowerIndex: number;
  /** Amount of funds flowing from lender to borrower */
  amount: number;
  /** Percentage of lender's total supply this represents */
  percentOfLenderSupply: number;
  /** Percentage of borrower's total borrow this represents */
  percentOfBorrowerBorrow: number;
}

/**
 * Complete funding matrix result
 */
export interface FundingMatrix {
  /** 2D array where [borrowerIdx][lenderIdx] = percentage of lender's supply */
  matrix: number[][];
  /** Detailed entries for rendering */
  entries: FundingMatrixEntry[];
  /** Total amount funded */
  totalFunded: number;
  /** Capital allocation percentage for each lender */
  capitalAllocated?: number[];
}

/**
 * Preset scenario configuration
 */
export interface Preset {
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Tranche configurations (without id and lltv, those are fixed) */
  tranches: Omit<TrancheInput, 'id' | 'lltv'>[];
}

/**
 * Application state
 */
export interface AppState {
  /** Current tranche inputs */
  tranches: TrancheInput[];
  /** Whether to include pending interest in calculations */
  includePendingInterest: boolean;
  /** Currently selected preset (null if custom) */
  selectedPreset: string | null;
}
