import type { Preset, TrancheInput } from './types';
import { TRANCHE_LLTVS } from './types';

/**
 * Predefined scenarios demonstrating different liquidity dynamics.
 * All presets use 5 tranches with fixed LLTVs: 75%, 80%, 85%, 90%, 95%
 *
 * Note: Monotonically increasing borrow rates shown here reflect typical
 * market behavior, not a protocol guarantee. The IRM sets rates independently
 * per tranche based on borrow utilization.
 */
export const PRESETS: Record<string, Preset> = {
  highSeniorDemand: {
    name: 'High Senior Demand',
    description: 'High demand in senior tranches, deep junior liquidity',
    tranches: [
      { supplyAssets: 500, borrowAssets: 2000, pendingInterest: 0, borrowRate: 0.03 },
      { supplyAssets: 800, borrowAssets: 1500, pendingInterest: 0, borrowRate: 0.04 },
      { supplyAssets: 1500, borrowAssets: 500, pendingInterest: 0, borrowRate: 0.05 },
      { supplyAssets: 2500, borrowAssets: 300, pendingInterest: 0, borrowRate: 0.07 },
      { supplyAssets: 3000, borrowAssets: 200, pendingInterest: 0, borrowRate: 0.10 },
    ],
  },

  midTrancheBottleneck: {
    name: 'Mid-Tranche Bottleneck',
    description: '85% LLTV tranche creates a constraint on liquidity flow',
    tranches: [
      { supplyAssets: 2000, borrowAssets: 1500, pendingInterest: 0, borrowRate: 0.03 },
      { supplyAssets: 1500, borrowAssets: 1200, pendingInterest: 0, borrowRate: 0.04 },
      { supplyAssets: 500, borrowAssets: 1800, pendingInterest: 0, borrowRate: 0.05 },
      { supplyAssets: 3000, borrowAssets: 400, pendingInterest: 0, borrowRate: 0.07 },
      { supplyAssets: 4000, borrowAssets: 300, pendingInterest: 0, borrowRate: 0.10 },
    ],
  },

  evenDistribution: {
    name: 'Even Distribution',
    description: 'Evenly distributed supply and demand across all tranches',
    tranches: [
      { supplyAssets: 1000, borrowAssets: 600, pendingInterest: 0, borrowRate: 0.03 },
      { supplyAssets: 1000, borrowAssets: 600, pendingInterest: 0, borrowRate: 0.04 },
      { supplyAssets: 1000, borrowAssets: 600, pendingInterest: 0, borrowRate: 0.05 },
      { supplyAssets: 1000, borrowAssets: 600, pendingInterest: 0, borrowRate: 0.07 },
      { supplyAssets: 1000, borrowAssets: 600, pendingInterest: 0, borrowRate: 0.10 },
    ],
  },

  withdrawalStress: {
    name: 'Withdrawal Stress',
    description: 'High utilization scenario simulating withdrawal pressure',
    tranches: [
      { supplyAssets: 1000, borrowAssets: 900, pendingInterest: 0, borrowRate: 0.04 },
      { supplyAssets: 900, borrowAssets: 850, pendingInterest: 0, borrowRate: 0.05 },
      { supplyAssets: 800, borrowAssets: 750, pendingInterest: 0, borrowRate: 0.06 },
      { supplyAssets: 700, borrowAssets: 650, pendingInterest: 0, borrowRate: 0.08 },
      { supplyAssets: 600, borrowAssets: 550, pendingInterest: 0, borrowRate: 0.12 },
    ],
  },

  docExample: {
    name: 'Doc Example',
    description: 'Example from protocol math documentation with equal supply',
    tranches: [
      { supplyAssets: 200, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.03 },
      { supplyAssets: 200, borrowAssets: 250, pendingInterest: 0, borrowRate: 0.04 },
      { supplyAssets: 200, borrowAssets: 200, pendingInterest: 0, borrowRate: 0.05 },
      { supplyAssets: 200, borrowAssets: 150, pendingInterest: 0, borrowRate: 0.07 },
      { supplyAssets: 200, borrowAssets: 100, pendingInterest: 0, borrowRate: 0.10 },
    ],
  },
};

/**
 * Default tranche configuration (used for reset).
 * 5 tranches with LLTVs: 75%, 80%, 85%, 90%, 95%
 * ~90% total utilization with 85% LLTV tranche as bottleneck (borrow > supply)
 */
export const DEFAULT_TRANCHES: Omit<TrancheInput, 'id' | 'lltv'>[] = [
  { supplyAssets: 2500, borrowAssets: 2000, pendingInterest: 0, borrowRate: 0.005 },
  { supplyAssets: 2500, borrowAssets: 2200, pendingInterest: 0, borrowRate: 0.01 },
  { supplyAssets: 1000, borrowAssets: 2000, pendingInterest: 0, borrowRate: 0.03 },
  { supplyAssets: 2000, borrowAssets: 1600, pendingInterest: 0, borrowRate: 0.06 },
  { supplyAssets: 2000, borrowAssets: 1200, pendingInterest: 0, borrowRate: 0.14 },
];

/**
 * Convert preset tranches to full TrancheInput array with IDs and LLTVs.
 */
export function presetToTranches(preset: Preset): TrancheInput[] {
  return preset.tranches.map((t, i) => ({
    ...t,
    id: i,
    lltv: TRANCHE_LLTVS[i],
  }));
}

/**
 * Create default tranche inputs with IDs and LLTVs.
 */
export function createDefaultTranches(): TrancheInput[] {
  return DEFAULT_TRANCHES.map((t, i) => ({
    ...t,
    id: i,
    lltv: TRANCHE_LLTVS[i],
  }));
}
