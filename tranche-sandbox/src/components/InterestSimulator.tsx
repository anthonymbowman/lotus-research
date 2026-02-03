import { useMemo, useRef } from 'react';
import type { TrancheData } from '../types';
import {
  simulateInterestAccrual,
  formatNumber,
  formatPercent,
} from '../math/lotusAccounting';
import { DefinitionBadge } from './DefinitionBadge';
import { ConstraintTooltip } from './ConstraintTooltip';
import { AssumptionsPanel, MODULE_ASSUMPTIONS } from './AssumptionsPanel';
import { ExportButton } from './ExportButton';

interface InterestSimulatorProps {
  tranches: TrancheData[];
  productiveDebtRate: number;
}

export function InterestSimulator({ tranches }: InterestSimulatorProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const simulation = useMemo(() => {
    return simulateInterestAccrual(tranches, '1month');
  }, [tranches]);

  return (
    <div className="space-y-4">

      {/* Exportable Section */}
      <div ref={exportRef} className="export-section bg-lotus-grey-800 rounded-lg p-4 pb-6 border border-lotus-grey-700 relative">
        <ExportButton targetRef={exportRef} filename="interest-accrual-simulation" />

        <h4 className="text-lg font-semibold text-lotus-grey-100 mb-4 text-center pr-10">
          Interest Accrual Simulation
        </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-700">
          <div className="text-sm text-emerald-400">Total Interest Generated</div>
          <div className="text-2xl font-mono font-semibold text-emerald-300">
            ${formatNumber(simulation.totalInterestGenerated, 2)}
          </div>
        </div>
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700">
          <div className="text-sm text-blue-400">Total Interest Received</div>
          <div className="text-2xl font-mono font-semibold text-blue-300">
            ${formatNumber(simulation.totalInterestReceived, 2)}
          </div>
        </div>
        <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
          <div className="text-sm text-lotus-grey-300">Time Period</div>
          <div className="text-2xl font-semibold text-lotus-grey-200">
            1 Month
          </div>
        </div>
      </div>

      {(() => {
        let cascadeIn = 0;
        const tableData = simulation.tranches.map((result, i) => {
          const currentCascadeIn = cascadeIn;
          const total = currentCascadeIn + result.interestGenerated;
          const supplyUtil = tranches[i].supplyUtilization ?? 1;
          const cascadeOut = total * (1 - supplyUtil);
          cascadeIn = cascadeOut;
          return {
            ...result,
            cascadeIn: currentCascadeIn,
            cascadeOut,
            supplyUtil,
            total,
          };
        });

        return (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-lotus-grey-700">
                <th className="text-left py-1.5 px-1.5 font-semibold text-lotus-grey-300">LLTV</th>
                <th className="text-center py-1.5 px-1.5 font-semibold text-blue-300">Cascade In</th>
                <th className="py-1.5 px-1 text-center text-lotus-grey-400">+</th>
                <th className="text-center py-1.5 px-1.5 font-semibold text-emerald-300">Generated</th>
                <th className="py-1.5 px-1 text-center text-lotus-grey-400">=</th>
                <th className="text-center py-1.5 px-1.5 font-semibold text-yellow-300">Total</th>
                <th className="py-1.5 px-1 text-center text-lotus-grey-400">×</th>
                <th className="text-center py-1.5 px-1.5 font-semibold text-lotus-purple-300">
                  <DefinitionBadge
                    label="Util"
                    formula="Supply / Available Supply"
                    note="Determines how much interest stays at this tranche vs cascading to junior tranches"
                    textColor="text-lotus-purple-300"
                  />
                </th>
                <th className="py-1.5 px-1 text-center text-lotus-grey-400">=</th>
                <th className="text-center py-1.5 px-1.5 font-semibold text-teal-300">Received</th>
                <th className="text-right py-1.5 px-1.5 font-semibold text-orange-300">Cascade Out</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((result, i) => {
                const isFirst = i === 0;
                const isLast = i === tableData.length - 1;
                const supplyUtilHigh = result.supplyUtil >= 0.99;

                return (
                  <tr key={result.index} className="border-b border-lotus-grey-700/50 hover:bg-lotus-grey-700/30">
                    <td className="py-1.5 px-1.5 font-medium text-lotus-grey-200">{result.lltv}%</td>
                    <td className="py-1.5 px-1.5 text-center font-mono text-blue-400">
                      {isFirst ? <span className="text-lotus-grey-500">—</span> : `$${formatNumber(result.cascadeIn, 2)}`}
                    </td>
                    <td className="py-1.5 px-1 text-center text-lotus-grey-300 font-medium">+</td>
                    <td className="py-1.5 px-1.5 text-center font-mono text-emerald-400">
                      ${formatNumber(result.interestGenerated, 2)}
                    </td>
                    <td className="py-1.5 px-1 text-center text-lotus-grey-300 font-medium">=</td>
                    <td className="py-1.5 px-1.5 text-center font-mono text-yellow-400">
                      ${formatNumber(result.total, 2)}
                    </td>
                    <td className="py-1.5 px-1 text-center text-lotus-grey-300 font-medium">×</td>
                    <td className={`py-1.5 px-1.5 text-center font-mono ${supplyUtilHigh ? 'text-amber-300' : 'text-lotus-purple-400'}`}>
                      {formatPercent(result.supplyUtil, 1)}
                    </td>
                    <td className="py-1.5 px-1 text-center text-lotus-grey-300 font-medium">=</td>
                    <td className="py-1.5 px-1.5 text-center font-mono font-medium text-teal-300">
                      ${formatNumber(result.interestReceived, 2)}
                    </td>
                    <td className="py-1.5 px-1.5 text-right font-mono text-orange-400">
                      {isLast ? <span className="text-lotus-grey-500">—</span> : `$${formatNumber(result.cascadeOut, 2)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      })()}
      </div>{/* End exportable section */}

      {/* Formula - Collapsible */}
      <details className="bg-lotus-grey-700/50 rounded-lg border border-lotus-grey-600">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-lotus-grey-300 hover:text-lotus-grey-100">
          Show Formula
        </summary>
        <div className="px-4 pb-4">
          <div className="bg-lotus-grey-900 rounded-lg p-3 text-sm text-lotus-grey-300">
            <code className="font-mono">Interest Received = (Cascaded In + Generated) × Supply Utilization</code>
            <br />
            <code className="font-mono">Cascaded Out = (Cascaded In + Generated) × (1 - Supply Utilization)</code>
          </div>
        </div>
      </details>

      {/* How Interest Flows - Collapsible */}
      <details className="bg-lotus-grey-700/50 rounded-lg border border-lotus-grey-600">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-lotus-grey-300 hover:text-lotus-grey-100">
          How Interest Flows
        </summary>
        <div className="px-4 pb-4">
          <ol className="list-decimal list-inside text-sm text-lotus-grey-300 space-y-1">
            <li><strong>Generation:</strong> Each tranche generates interest from its borrowers</li>
            <li><strong>Cascade Start:</strong> Starting from the most senior tranche (75% LLTV)</li>
            <li><strong>Allocation:</strong> Lenders receive interest proportional to supply utilization</li>
            <li><strong>Cascade:</strong> Remaining interest flows to the next junior tranche</li>
            <li><strong>Final:</strong> Most junior tranche receives 100% of remaining interest</li>
          </ol>
        </div>
      </details>

      <AssumptionsPanel assumptions={MODULE_ASSUMPTIONS.interestSimulator} />
    </div>
  );
}

export default InterestSimulator;
