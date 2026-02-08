import type { PDScenario, URLState } from './types';

/**
 * Default values
 */
export const DEFAULTS = {
  scenario: 1 as PDScenario,
  borrowRate: 0.12,
  targetBorrowRate90: 0.12,
  baseRate: 0.05,
  utilization: 0.7,
};

/**
 * Parse URL state from query string
 */
export function parseURLState(): Partial<URLState> {
  const params = new URLSearchParams(window.location.search);
  const state: Partial<URLState> = {};

  const scenario = params.get('scenario');
  if (scenario === '1' || scenario === '2') {
    state.scenario = parseInt(scenario, 10) as PDScenario;
  }

  const R = params.get('R');
  if (R !== null) {
    const value = parseFloat(R);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      state.borrowRate = value;
    }
  }

  const R90 = params.get('R90');
  if (R90 !== null) {
    const value = parseFloat(R90);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      state.targetBorrowRate90 = value;
    }
  }

  const Rb = params.get('Rb');
  if (Rb !== null) {
    const value = parseFloat(Rb);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      state.baseRate = value;
    }
  }

  const u = params.get('u');
  if (u !== null) {
    const value = parseFloat(u);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      state.utilization = value;
    }
  }

  return state;
}

/**
 * Build URL with state parameters
 */
export function buildURL(state: URLState): string {
  const params = new URLSearchParams();

  params.set('scenario', state.scenario.toString());

  if (state.scenario === 1 && state.borrowRate !== undefined) {
    params.set('R', state.borrowRate.toFixed(4));
  } else if (state.scenario === 2 && state.targetBorrowRate90 !== undefined) {
    params.set('R90', state.targetBorrowRate90.toFixed(4));
  }

  params.set('Rb', state.baseRate.toFixed(4));
  params.set('u', state.utilization.toFixed(4));

  const baseURL = window.location.origin + window.location.pathname;
  return `${baseURL}?${params.toString()}`;
}

/**
 * Update browser URL without navigation
 */
export function updateURL(state: URLState): void {
  const url = buildURL(state);
  window.history.replaceState(null, '', url);
}

/**
 * Copy shareable link to clipboard
 */
export async function copyShareLink(state: URLState): Promise<boolean> {
  const url = buildURL(state);
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
