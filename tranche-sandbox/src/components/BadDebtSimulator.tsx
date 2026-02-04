import { useState, useMemo, useRef } from 'react';
import type { TrancheData, BadDebtEvent } from '../types';
import { simulateBadDebt, formatNumber, formatPercent } from '../math/lotusAccounting';
import { ConstraintBadge } from './ConstraintBadge';
import { DefinitionBadge } from './DefinitionBadge';
import { AssumptionsPanel, MODULE_ASSUMPTIONS } from './AssumptionsPanel';
import { ExportButton } from './ExportButton';

interface BadDebtSimulatorProps {
  /** Computed tranche data */
  tranches: TrancheData[];
}

/**
 * Interactive simulator showing bad debt absorption across tranches.
 * Bad debt cascades from senior to junior (same mechanism as interest).
 */
export function BadDebtSimulator({ tranches }: BadDebtSimulatorProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  // State: bad debt amount per tranche (indexed by tranche index)
  // Default: $100 in 90% LLTV (index 3), $200 in 95% LLTV (index 4)
  const [badDebtAmounts, setBadDebtAmounts] = useState<number[]>(
    () => tranches.map((_, i) => i === 3 ? 100 : i === 4 ? 200 : 0)
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
      {/* Exportable Section */}
      <div ref={exportRef} className="export-section bg-lotus-grey-800 rounded-lg p-4 pb-6 border border-lotus-grey-700 relative">
        <ExportButton targetRef={exportRef} filename="bad-debt-simulation" />

        <h4 className="text-lg font-semibold text-lotus-grey-100 mb-4 text-center pr-10">
          Bad Debt Simulation
        </h4>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-lotus-grey-600">
            <th className="text-left py-1.5 px-1.5 font-semibold text-lotus-grey-300">LLTV</th>
            <th className="text-right py-1.5 px-1.5 font-semibold text-lotus-grey-400">Supply</th>
            <th className="text-right py-1.5 px-1.5 font-semibold text-lotus-grey-400">Borrow</th>
            <th className="text-center py-1.5 px-1.5 font-semibold text-red-400">Bad Debt</th>
            <th className="py-1.5 px-1 text-center text-lotus-grey-400">+</th>
            <th className="text-center py-1.5 px-1.5 font-semibold text-orange-400">Cascade In</th>
            <th className="py-1.5 px-1 text-center text-lotus-grey-400">=</th>
            <th className="text-center py-1.5 px-1.5 font-semibold text-yellow-300">Total</th>
            <th className="py-1.5 px-1 text-center text-lotus-grey-400">×</th>
            <th className="text-center py-1.5 px-1.5 font-semibold text-lotus-purple-300">
              <DefinitionBadge
                label="Util"
                formula="Supply / Available Supply"
                note="Determines what portion of bad debt this tranche absorbs vs cascades to junior"
                textColor="text-lotus-purple-300"
              />
            </th>
            <th className="py-1.5 px-1 text-center text-lotus-grey-400">=</th>
            <th className="text-center py-1.5 px-1.5 font-semibold text-lotus-purple-300">Absorbed</th>
            <th className="text-center py-1.5 px-1.5 font-semibold text-orange-400">Cascade Out</th>
            <th className="text-right py-1.5 px-1.5 font-semibold text-emerald-400">Supply Left</th>
          </tr>
        </thead>
        <tbody>
          {simulation.tranches.map((result, i) => {
            const t = tranches[i];
            const totalBadDebt = result.badDebtCascadedIn + result.badDebtLocal;
            const isFirst = i === 0;
            const isLast = i === simulation.tranches.length - 1;
            const hasLocalBadDebt = result.badDebtLocal > 0;
            const supplyUtilHigh = result.supplyUtilization >= 0.99;

            return (
              <tr
                key={result.index}
                className={`border-b border-lotus-grey-700/50 hover:bg-lotus-grey-700/30 ${
                  result.badDebtAbsorbed > 0 ? 'bg-red-900/10' : ''
                }`}
              >
                <td className="py-1.5 px-1.5 font-medium text-lotus-grey-200">{result.lltv}%</td>
                <td className="py-1.5 px-1.5 text-right font-mono text-lotus-grey-400">
                  ${formatNumber(result.originalSupply, 0)}
                </td>
                <td className="py-1.5 px-1.5 text-right font-mono text-lotus-grey-400">
                  ${formatNumber(t.borrowAssets, 0)}
                </td>
                <td className="py-1.5 px-1.5 text-center">
                  <input
                    type="number"
                    min="0"
                    max={t.borrowAssets}
                    value={badDebtAmounts[i] || 0}
                    onChange={(e) => updateBadDebt(i, Number(e.target.value))}
                    className={`w-14 px-1 py-0.5 text-xs font-mono border rounded focus:outline-none focus:ring-1 focus:ring-red-500 text-right bg-lotus-grey-900 text-lotus-grey-100 ${
                      hasLocalBadDebt ? 'border-red-500' : 'border-lotus-grey-600'
                    }`}
                  />
                </td>
                <td className="py-1.5 px-1 text-center text-lotus-grey-300 font-medium">+</td>
                <td className="py-1.5 px-1.5 text-center font-mono text-orange-400">
                  {isFirst ? <span className="text-lotus-grey-500">—</span> : `$${formatNumber(result.badDebtCascadedIn, 0)}`}
                </td>
                <td className="py-1.5 px-1 text-center text-lotus-grey-300 font-medium">=</td>
                <td className="py-1.5 px-1.5 text-center font-mono text-yellow-400">
                  ${formatNumber(totalBadDebt, 0)}
                </td>
                <td className="py-1.5 px-1 text-center text-lotus-grey-300 font-medium">×</td>
                <td className={`py-1.5 px-1.5 text-center font-mono ${supplyUtilHigh ? 'text-amber-300' : 'text-lotus-purple-400'}`}>
                  {formatPercent(result.supplyUtilization, 1)}
                </td>
                <td className="py-1.5 px-1 text-center text-lotus-grey-300 font-medium">=</td>
                <td className="py-1.5 px-1.5 text-center font-mono font-medium text-lotus-purple-300">
                  {result.badDebtAbsorbed > 0 ? `$${formatNumber(result.badDebtAbsorbed, 0)}` : '—'}
                </td>
                <td className="py-1.5 px-1.5 text-center font-mono text-orange-400">
                  {isLast ? <span className="text-lotus-grey-500">—</span> : result.badDebtCascadedOut > 0 ? `$${formatNumber(result.badDebtCascadedOut, 0)}` : '—'}
                </td>
                <td className="py-1.5 px-1.5 text-right">
                  <span className={`font-mono ${result.wipedOut ? 'text-red-400 font-medium' : 'text-emerald-400'}`}>
                    ${formatNumber(result.remainingSupply, 0)}
                  </span>
                  {result.wipedOut && (
                    <ConstraintBadge
                      severity="active"
                      label="Wiped"
                      tooltip="This tranche's supply has been completely depleted by bad debt absorption."
                      className="ml-1"
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>{/* End exportable section */}

      {/* How Bad Debt is Absorbed - Collapsible */}
      <details className="bg-lotus-grey-700/50 rounded-lg border border-lotus-grey-600">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-lotus-grey-300 hover:text-lotus-grey-100">
          How Bad Debt is Absorbed
        </summary>
        <div className="px-4 pb-4">
          <ol className="list-decimal list-inside text-sm text-lotus-grey-300 space-y-1">
            <li>
              <strong className="text-lotus-grey-200">Default occurs:</strong> Enter bad debt amounts for tranches where borrowers default
            </li>
            <li>
              <strong className="text-lotus-grey-200">Senior to junior:</strong> Bad debt cascades from senior to junior (same as interest)
            </li>
            <li>
              <strong className="text-lotus-grey-200">Allocation:</strong> At each tranche: Total Bad Debt × Supply Utilization → absorbed by lenders
            </li>
            <li>
              <strong className="text-lotus-grey-200">Cascade:</strong> Remaining bad debt (1 − Supply Util) flows to the next junior tranche
            </li>
            <li>
              <strong className="text-lotus-grey-200">Final:</strong> Most junior tranche (95% LLTV) absorbs 100% of remaining bad debt
            </li>
          </ol>
        </div>
      </details>

      <AssumptionsPanel assumptions={MODULE_ASSUMPTIONS.badDebtSimulator} />
    </div>
  );
}

export default BadDebtSimulator;
