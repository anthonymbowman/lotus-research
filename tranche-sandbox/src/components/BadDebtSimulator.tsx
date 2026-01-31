import { useState, useMemo } from 'react';
import type { TrancheData, BadDebtEvent } from '../types';
import { simulateBadDebt, formatNumber, formatPercent } from '../math/lotusAccounting';

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

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-sm text-red-600">Total Bad Debt</div>
          <div className="text-2xl font-mono font-semibold text-red-700">
            ${formatNumber(simulation.totalBadDebt, 0)}
          </div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
          <div className="text-sm text-emerald-600">Total Absorbed</div>
          <div className="text-2xl font-mono font-semibold text-emerald-700">
            ${formatNumber(simulation.totalAbsorbed, 0)}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="text-sm text-slate-600">Unabsorbed</div>
          <div className={`text-2xl font-mono font-semibold ${simulation.unabsorbedBadDebt > 0 ? 'text-red-700' : 'text-slate-400'}`}>
            ${formatNumber(simulation.unabsorbedBadDebt, 0)}
          </div>
        </div>
      </div>

      {/* Combined Input + Calculation Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-2 font-semibold text-slate-700 bg-slate-50">Tranche</th>
              <th className="text-right py-2 px-2 font-semibold text-slate-600 bg-slate-50">Borrow (Max)</th>
              <th className="text-right py-2 px-2 font-semibold text-red-700 bg-red-50">Local Bad Debt</th>
              <th className="py-2 px-1 text-slate-400 bg-slate-50">+</th>
              <th className="text-right py-2 px-2 font-semibold text-orange-700 bg-orange-50">Cascaded In</th>
              <th className="py-2 px-1 text-slate-400 bg-slate-50">=</th>
              <th className="text-right py-2 px-2 font-semibold text-slate-700 bg-slate-50">Total</th>
              <th className="py-2 px-1 text-slate-400 bg-slate-50">×</th>
              <th className="text-right py-2 px-2 font-semibold text-indigo-700 bg-indigo-50">Supply Util</th>
              <th className="py-2 px-1 text-slate-400 bg-slate-50">=</th>
              <th className="text-right py-2 px-2 font-semibold text-purple-700 bg-purple-50">Absorbed</th>
              <th className="text-right py-2 px-2 font-semibold text-orange-700 bg-orange-50">Cascaded Out</th>
              <th className="text-right py-2 px-2 font-semibold text-emerald-700 bg-emerald-50">Supply Left</th>
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
                  className={`border-b border-slate-100 ${
                    result.badDebtAbsorbed > 0 ? 'bg-red-50/30' : ''
                  }`}
                >
                  <td className="py-2 px-2 font-medium text-slate-700 bg-slate-50">
                    {result.lltv}%
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-500 bg-slate-50">
                    ${formatNumber(t.borrowAssets, 0)}
                  </td>
                  <td className="py-2 px-2 bg-red-50/30">
                    <input
                      type="number"
                      min="0"
                      max={t.borrowAssets}
                      value={badDebtAmounts[i] || 0}
                      onChange={(e) => updateBadDebt(i, Number(e.target.value))}
                      className={`w-20 px-2 py-1 text-sm font-mono border rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-right ${
                        hasLocalBadDebt ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    />
                  </td>
                  <td className="py-2 px-1 text-slate-400">+</td>
                  <td className="py-2 px-2 text-right font-mono text-orange-600 bg-orange-50/30">
                    ${formatNumber(result.badDebtCascadedIn, 0)}
                  </td>
                  <td className="py-2 px-1 text-slate-400">=</td>
                  <td className="py-2 px-2 text-right font-mono text-slate-700 bg-slate-50/50">
                    ${formatNumber(totalBadDebt, 0)}
                  </td>
                  <td className="py-2 px-1 text-slate-400">×</td>
                  <td className="py-2 px-2 text-right font-mono text-indigo-600 bg-indigo-50/30">
                    {formatPercent(result.supplyUtilization, 0)}
                  </td>
                  <td className="py-2 px-1 text-slate-400">=</td>
                  <td className="py-2 px-2 text-right font-mono font-medium text-purple-700 bg-purple-50/30">
                    {result.badDebtAbsorbed > 0 ? `$${formatNumber(result.badDebtAbsorbed, 0)}` : '-'}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-orange-600 bg-orange-50/30">
                    {!isLast && result.badDebtCascadedOut > 0
                      ? `$${formatNumber(result.badDebtCascadedOut, 0)}`
                      : '-'}
                  </td>
                  <td className="py-2 px-2 text-right bg-emerald-50/30">
                    <span className={`font-mono ${result.wipedOut ? 'text-red-600 font-medium' : 'text-emerald-600'}`}>
                      ${formatNumber(result.remainingSupply, 0)}
                    </span>
                    {result.wipedOut && (
                      <span className="ml-1 text-xs text-red-500">(wiped)</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Formula explanation */}
      <div className="bg-slate-100 rounded-lg p-3 text-sm text-slate-600">
        <code className="font-mono">absorbed = (local + cascadedIn) × supplyUtil</code>
        <span className="mx-2">|</span>
        <code className="font-mono">cascadedOut = (local + cascadedIn) × (1 − supplyUtil)</code>
        <span className="mx-2">|</span>
        <span className="text-slate-500">Local bad debt capped at borrow amount</span>
      </div>

      {/* Explanation */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h4 className="font-medium text-slate-700 mb-2">How Bad Debt is Absorbed</h4>
        <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
          <li>
            <strong>Default occurs:</strong> Enter bad debt amounts for tranches where borrowers default
          </li>
          <li>
            <strong>Senior to junior:</strong> Bad debt cascades from senior to junior (same as interest)
          </li>
          <li>
            <strong>Allocation:</strong> At each tranche: Total Bad Debt × Supply Utilization → absorbed by lenders
          </li>
          <li>
            <strong>Cascade:</strong> Remaining bad debt (1 − Supply Util) flows to the next junior tranche
          </li>
          <li>
            <strong>Final:</strong> Most junior tranche (95% LLTV) absorbs 100% of remaining bad debt
          </li>
        </ol>
      </div>
    </div>
  );
}

export default BadDebtSimulator;
