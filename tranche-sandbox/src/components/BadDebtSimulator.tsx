import { useState, useMemo } from 'react';
import type { TrancheData, BadDebtEvent } from '../types';
import { simulateBadDebt, formatNumber, formatPercent } from '../math/lotusAccounting';
import { analytics } from '../analytics';

interface BadDebtSimulatorProps {
  /** Computed tranche data */
  tranches: TrancheData[];
}

/**
 * Interactive simulator showing bad debt absorption across tranches.
 * Bad debt cascades from senior to junior (same mechanism as interest).
 */
export function BadDebtSimulator({ tranches }: BadDebtSimulatorProps) {
  // State: bad debt amount per tranche (indexed by tranche index)
  const [badDebtAmounts, setBadDebtAmounts] = useState<number[]>(
    () => tranches.map(() => 0)
  );

  // Update bad debt for a tranche (capped at borrow amount)
  const updateBadDebt = (trancheIndex: number, value: number) => {
    const maxAmount = tranches[trancheIndex]?.borrowAssets ?? 0;
    const newAmounts = [...badDebtAmounts];
    newAmounts[trancheIndex] = Math.min(Math.max(0, value), maxAmount);
    setBadDebtAmounts(newAmounts);
  };

  // Convert to events array for simulation
  const badDebtEvents: BadDebtEvent[] = useMemo(() => {
    return badDebtAmounts
      .map((amount, trancheIndex) => ({ trancheIndex, amount }))
      .filter(e => e.amount > 0);
  }, [badDebtAmounts]);

  const simulation = useMemo(() => {
    return simulateBadDebt(tranches, badDebtEvents.length > 0 ? badDebtEvents : [{ trancheIndex: 0, amount: 0 }]);
  }, [tranches, badDebtEvents]);

  // Preset scenarios
  const applyPreset = (preset: 'clear' | 'small' | 'moderate' | 'catastrophic') => {
    if (preset !== 'clear') {
      analytics.badDebtSimulated(preset);
    }
    const maxAmounts = tranches.map(t => t.borrowAssets);
    let newAmounts: number[];

    switch (preset) {
      case 'clear':
        newAmounts = tranches.map(() => 0);
        break;
      case 'small':
        // 1% default at senior tranche
        newAmounts = tranches.map((_, i) => i === 0 ? Math.round(maxAmounts[0] * 0.01) : 0);
        break;
      case 'moderate':
        // 5% default spread across multiple tranches
        newAmounts = tranches.map((_, i) => i <= 2 ? Math.round(maxAmounts[i] * 0.05) : 0);
        break;
      case 'catastrophic':
        // 10% default at all tranches
        newAmounts = tranches.map((t) => Math.round(t.borrowAssets * 0.1));
        break;
      default:
        newAmounts = tranches.map(() => 0);
    }
    setBadDebtAmounts(newAmounts);
  };

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-lotus-grey-400 self-center mr-2">Scenarios:</span>
        <button
          onClick={() => applyPreset('clear')}
          className="px-3 py-1.5 text-sm rounded-lg border bg-lotus-grey-700/50 border-lotus-grey-600 text-lotus-grey-300 hover:border-lotus-grey-500 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={() => applyPreset('small')}
          className="px-3 py-1.5 text-sm rounded-lg border bg-emerald-900/30 border-emerald-700 text-emerald-300 hover:border-emerald-500 transition-colors"
        >
          Small Default (1%)
        </button>
        <button
          onClick={() => applyPreset('moderate')}
          className="px-3 py-1.5 text-sm rounded-lg border bg-amber-900/30 border-amber-700 text-amber-300 hover:border-amber-500 transition-colors"
        >
          Moderate (5%)
        </button>
        <button
          onClick={() => applyPreset('catastrophic')}
          className="px-3 py-1.5 text-sm rounded-lg border bg-red-900/30 border-red-700 text-red-300 hover:border-red-500 transition-colors"
        >
          Catastrophic (10%)
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-900/30 rounded-lg p-4 border border-red-700/50">
          <div className="text-sm text-red-400">Total Bad Debt</div>
          <div className="text-2xl font-mono font-semibold text-red-300">
            ${formatNumber(simulation.totalBadDebt, 2)}
          </div>
        </div>
        <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-700/50">
          <div className="text-sm text-emerald-400">Total Absorbed</div>
          <div className="text-2xl font-mono font-semibold text-emerald-300">
            ${formatNumber(simulation.totalAbsorbed, 2)}
          </div>
        </div>
        <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
          <div className="text-sm text-lotus-grey-300">Unabsorbed</div>
          <div className={`text-2xl font-mono font-semibold ${simulation.unabsorbedBadDebt > 0 ? 'text-red-400' : 'text-lotus-grey-300'}`}>
            ${formatNumber(simulation.unabsorbedBadDebt, 2)}
          </div>
        </div>
      </div>

      {/* Combined Input + Calculation Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-lotus-grey-600">
              <th className="text-left py-2 px-2 font-semibold text-lotus-grey-300 bg-lotus-grey-800">Tranche</th>
              <th className="text-right py-2 px-2 font-semibold text-lotus-grey-300 bg-lotus-grey-800">Borrow (Max)</th>
              <th className="text-right py-2 px-2 font-semibold text-red-400 bg-red-900/20">Local Bad Debt</th>
              <th className="py-2 px-1 text-lotus-grey-300 bg-lotus-grey-800">+</th>
              <th className="text-right py-2 px-2 font-semibold text-orange-400 bg-orange-900/20">Cascaded In</th>
              <th className="py-2 px-1 text-lotus-grey-300 bg-lotus-grey-800">=</th>
              <th className="text-right py-2 px-2 font-semibold text-lotus-grey-300 bg-lotus-grey-800">Total</th>
              <th className="py-2 px-1 text-lotus-grey-300 bg-lotus-grey-800">×</th>
              <th className="text-right py-2 px-2 font-semibold text-lotus-purple-300 bg-lotus-purple-900/20">Supply Util</th>
              <th className="py-2 px-1 text-lotus-grey-300 bg-lotus-grey-800">=</th>
              <th className="text-right py-2 px-2 font-semibold text-lotus-purple-300 bg-lotus-purple-900/20">Absorbed</th>
              <th className="text-right py-2 px-2 font-semibold text-orange-400 bg-orange-900/20">Cascaded Out</th>
              <th className="text-right py-2 px-2 font-semibold text-emerald-400 bg-emerald-900/20">Supply Left</th>
            </tr>
          </thead>
          <tbody>
            {simulation.tranches.map((result, i) => {
              const t = tranches[i];
              const totalBadDebt = result.badDebtCascadedIn + result.badDebtLocal;
              const isLast = i === simulation.tranches.length - 1;
              const hasLocalBadDebt = result.badDebtLocal > 0;

              return (
                <tr
                  key={result.index}
                  className={`border-b border-lotus-grey-700 ${
                    result.badDebtAbsorbed > 0 ? 'bg-red-900/10' : ''
                  }`}
                >
                  <td className="py-2 px-2 font-medium text-lotus-grey-300 bg-lotus-grey-800/50">
                    {result.lltv}%
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-lotus-grey-300 bg-lotus-grey-800/50">
                    ${formatNumber(t.borrowAssets, 2)}
                  </td>
                  <td className="py-2 px-2 bg-red-900/10">
                    <input
                      type="number"
                      min="0"
                      max={t.borrowAssets}
                      value={badDebtAmounts[i] || 0}
                      onChange={(e) => updateBadDebt(i, Number(e.target.value))}
                      className={`w-20 px-2 py-1 text-sm font-mono border rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-right bg-lotus-grey-900 text-lotus-grey-100 ${
                        hasLocalBadDebt ? 'border-red-500' : 'border-lotus-grey-600'
                      }`}
                    />
                  </td>
                  <td className="py-2 px-1 text-lotus-grey-300">+</td>
                  <td className="py-2 px-2 text-right font-mono text-orange-400 bg-orange-900/10">
                    ${formatNumber(result.badDebtCascadedIn, 2)}
                  </td>
                  <td className="py-2 px-1 text-lotus-grey-300">=</td>
                  <td className="py-2 px-2 text-right font-mono text-lotus-grey-300 bg-lotus-grey-800/30">
                    ${formatNumber(totalBadDebt, 2)}
                  </td>
                  <td className="py-2 px-1 text-lotus-grey-300">×</td>
                  <td className="py-2 px-2 text-right font-mono text-lotus-purple-300 bg-lotus-purple-900/10">
                    {formatPercent(result.supplyUtilization, 0)}
                  </td>
                  <td className="py-2 px-1 text-lotus-grey-300">=</td>
                  <td className="py-2 px-2 text-right font-mono font-medium text-lotus-purple-300 bg-lotus-purple-900/10">
                    {result.badDebtAbsorbed > 0 ? `$${formatNumber(result.badDebtAbsorbed, 2)}` : '-'}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-orange-400 bg-orange-900/10">
                    {!isLast && result.badDebtCascadedOut > 0
                      ? `$${formatNumber(result.badDebtCascadedOut, 2)}`
                      : '-'}
                  </td>
                  <td className="py-2 px-2 text-right bg-emerald-900/10">
                    <span className={`font-mono ${result.wipedOut ? 'text-red-400 font-medium' : 'text-emerald-400'}`}>
                      ${formatNumber(result.remainingSupply, 2)}
                    </span>
                    {result.wipedOut && (
                      <span className="ml-1 text-xs text-red-400">(wiped)</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Formula explanation */}
      <div className="bg-lotus-grey-700/50 rounded-lg p-3 text-sm text-lotus-grey-300">
        <code className="font-mono text-lotus-purple-300">absorbed = (local + cascadedIn) × supplyUtil</code>
        <span className="mx-2">|</span>
        <code className="font-mono text-lotus-purple-300">cascadedOut = (local + cascadedIn) × (1 − supplyUtil)</code>
        <span className="mx-2">|</span>
        <span className="text-lotus-grey-300">Local bad debt capped at borrow amount</span>
      </div>

      {/* Explanation */}
      <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
        <h4 className="font-medium text-lotus-grey-200 mb-2">How Bad Debt is Absorbed</h4>
        <ol className="list-decimal list-inside text-sm text-lotus-grey-300 space-y-1">
          <li>
            <strong className="text-lotus-grey-300">Default occurs:</strong> Enter bad debt amounts for tranches where borrowers default
          </li>
          <li>
            <strong className="text-lotus-grey-300">Senior to junior:</strong> Bad debt cascades from senior to junior (same as interest)
          </li>
          <li>
            <strong className="text-lotus-grey-300">Allocation:</strong> At each tranche: Total Bad Debt × Supply Utilization → absorbed by lenders
          </li>
          <li>
            <strong className="text-lotus-grey-300">Cascade:</strong> Remaining bad debt (1 − Supply Util) flows to the next junior tranche
          </li>
          <li>
            <strong className="text-lotus-grey-300">Final:</strong> Most junior tranche (95% LLTV) absorbs 100% of remaining bad debt
          </li>
        </ol>
      </div>
    </div>
  );
}

export default BadDebtSimulator;
