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

// ============================================
// LotusUSD Allocation Types
// ============================================

/**
 * Inputs for LotusUSD allocation visualization
 */
export interface LotusUSDInputs {
  /** Treasury allocation (0 to 1) */
  treasuryAllocation: number;
  /** Treasury rate (APR as decimal) */
  treasuryRate: number;
}

/**
 * Outputs for LotusUSD allocation
 */
export interface LotusUSDOutputs {
  /** Productive debt rate = treasuryRate × treasuryAllocation */
  productiveDebtRate: number;
  /** USDC allocation = 1 - treasuryAllocation */
  usdcAllocation: number;
}

// ============================================
// Productive Debt Types
// ============================================

export type PDScenario = 1 | 2;

/**
 * Inputs for Productive Debt Scenario 1: Spread Compression
 */
export interface Scenario1Inputs {
  /** Total borrow rate (APR as decimal) */
  borrowRate: number;
  /** Base rate (APR as decimal) */
  baseRate: number;
  /** Utilization (0 to 1) */
  utilization: number;
}

/**
 * Outputs for Productive Debt Scenario 1
 */
export interface Scenario1Outputs {
  spread: number;
  borrowRate: number;
  supplyRatePD: number;
  supplyRateNoPD: number;
  wedgePD: number;
  wedgeNoPD: number;
  wedgeReduction: number;
  baseExceedsBorrow: boolean;
}

/**
 * Inputs for Productive Debt Scenario 2: Volatility Reduction
 */
export interface Scenario2Inputs {
  /** Target borrow rate at 90% utilization (APR as decimal) */
  targetBorrowRate90: number;
  /** Base rate (APR as decimal) */
  baseRate: number;
  /** Utilization (0 to 1) */
  utilization: number;
}

/**
 * Outputs for Productive Debt Scenario 2
 */
export interface Scenario2Outputs {
  spread90: number;
  spreadAtU: number;
  borrowRatePD: number;
  borrowRateNoPD: number;
  supplyRatePD: number;
  supplyRateNoPD: number;
  targetBorrow90: number;
  targetSupplyPD90: number;
  targetSupplyNoPD90: number;
  borrowDeviationPD: number | null;
  borrowDeviationNoPD: number | null;
  supplyDeviationPD: number | null;
  supplyDeviationNoPD: number | null;
  spreadIsZero: boolean;
}

/**
 * Chart data point for Productive Debt
 */
export interface ChartPoint {
  utilization: number;
  borrowPD?: number;
  borrowNoPD?: number;
  supplyPD: number;
  supplyNoPD: number;
}

/**
 * URL state for sharing
 */
export interface URLState {
  scenario: PDScenario;
  borrowRate?: number;
  targetBorrowRate90?: number;
  baseRate: number;
  utilization: number;
}

// ============================================
// Interest Accrual Simulation Types
// ============================================

/**
 * Time period options for interest simulation
 */
export type TimePeriod = '1week' | '1month' | '3months' | '1year';

/**
 * Result of interest accrual simulation for a single tranche
 */
export interface InterestAccrualResult {
  /** Tranche index */
  index: number;
  /** LLTV for this tranche */
  lltv: number;
  /** Interest generated by borrowers at this tranche */
  interestGenerated: number;
  /** Interest received by lenders at this tranche (after cascade) */
  interestReceived: number;
  /** Interest cascaded to junior tranches */
  interestCascaded: number;
  /** Net position (received - generated if tranche has both) */
  netPosition: number;
  /** Supply rate implied by this period */
  impliedSupplyRate: number | null;
}

/**
 * Complete interest accrual simulation result
 */
export interface InterestSimulationResult {
  /** Time period simulated */
  timePeriod: TimePeriod;
  /** Time in years (for calculations) */
  timeInYears: number;
  /** Results for each tranche */
  tranches: InterestAccrualResult[];
  /** Total interest generated across all tranches */
  totalInterestGenerated: number;
  /** Total interest received by lenders */
  totalInterestReceived: number;
}

// ============================================
// Bad Debt Simulation Types
// ============================================

/**
 * Result of bad debt simulation for a single tranche
 */
export interface BadDebtTrancheResult {
  /** Tranche index */
  index: number;
  /** LLTV for this tranche */
  lltv: number;
  /** Original supply before bad debt */
  originalSupply: number;
  /** Supply utilization at this tranche */
  supplyUtilization: number;
  /** Bad debt cascaded in from senior tranches */
  badDebtCascadedIn: number;
  /** Bad debt locally occurring at this tranche */
  badDebtLocal: number;
  /** Bad debt absorbed by this tranche */
  badDebtAbsorbed: number;
  /** Bad debt cascaded out to junior tranches */
  badDebtCascadedOut: number;
  /** Remaining supply after absorbing bad debt */
  remainingSupply: number;
  /** Whether this tranche was fully wiped out */
  wipedOut: boolean;
}

/**
 * A single bad debt event at a tranche
 */
export interface BadDebtEvent {
  /** Tranche index where bad debt occurred */
  trancheIndex: number;
  /** Amount of bad debt */
  amount: number;
}

/**
 * Complete bad debt simulation result
 */
export interface BadDebtSimulationResult {
  /** Bad debt events (one or more) */
  badDebtEvents: BadDebtEvent[];
  /** Total bad debt amount across all events */
  totalBadDebt: number;
  /** Results for each tranche */
  tranches: BadDebtTrancheResult[];
  /** Total bad debt absorbed */
  totalAbsorbed: number;
  /** Remaining unabsorbed bad debt (if any) */
  unabsorbedBadDebt: number;
}
