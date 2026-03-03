import { useMemo, useRef } from 'react';
import type { TrancheData } from '../types';
import {
  simulateInterestAccrual,
  formatNumber,
  formatPercent,
} from '../math/lotusAccounting';
import { DefinitionBadge } from './DefinitionBadge';
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
      {/* Data source callout */}
      <div className="flex items-start gap-3 bg-lotus-purple-900/20 border border-lotus-purple-700/50 rounded p-3">
        <div className="w-6 h-6 bg-lotus-purple-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-lotus-purple-200">
          <strong className="text-lotus-purple-300">Live data:</strong> These numbers reflect the market you configured in{' '}
          <span className="text-lotus-purple-300 font-medium">Liquidity Flow</span>.
          Change supply/borrow amounts there to see how interest redistributes here.
        </p>
      </div>

      {/* Exportable Section */}
      <div ref={exportRef} className="export-section bg-lotus-grey-800 rounded p-4 pb-6 border border-lotus-grey-700 relative">
        <ExportButton targetRef={exportRef} filename="interest-accrual-simulation" />

        <h4 className="text-lg font-semibold text-lotus-grey-100 mb-4 text-center pr-10">
          Interest Accrual Simulation
        </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-rating-a/15 rounded p-4 border border-rating-a">
          <div className="text-sm text-rating-a">Total Interest Generated</div>
          <div className="text-2xl font-mono font-semibold text-rating-a">
            ${formatNumber(simulation.totalInterestGenerated, 2)}
          </div>
        </div>
        <div className="bg-lotus-purple-900/30 rounded p-4 border border-lotus-purple-700">
          <div className="text-sm text-lotus-purple-400">Total Interest Received</div>
          <div className="text-2xl font-mono font-semibold text-lotus-purple-300">
            ${formatNumber(simulation.totalInterestReceived, 2)}
          </div>
        </div>
        <div className="bg-lotus-grey-900 rounded p-4 border border-lotus-grey-700">
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[11px] sm:text-xs">
            <thead>
              <tr className="border-b border-lotus-grey-700">
                <th className="text-left py-1.5 px-1.5 font-semibold text-lotus-grey-300">LLTV</th>
                <th className="text-center py-1.5 px-1.5 font-semibold text-lotus-purple-300">Cascade In</th>
                <th className="py-1.5 px-1 text-center text-lotus-grey-400">+</th>
                <th className="text-center py-1.5 px-1.5 font-semibold text-rating-a">Generated</th>
                <th className="py-1.5 px-1 text-center text-lotus-grey-400">=</th>
                <th className="text-center py-1.5 px-1.5 font-semibold text-rating-b">Total</th>
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
                <th className="text-center py-1.5 px-1.5 font-semibold text-rating-a-plus">Received</th>
                <th className="text-right py-1.5 px-1.5 font-semibold text-rating-c-plus">Cascade Out</th>
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
                    <td className="py-1.5 px-1.5 text-center font-mono text-lotus-purple-400">
                      {isFirst ? <span className="text-lotus-grey-500">—</span> : `$${formatNumber(result.cascadeIn, 2)}`}
                    </td>
                    <td className="py-1.5 px-1 text-center text-lotus-grey-300 font-medium">+</td>
                    <td className="py-1.5 px-1.5 text-center font-mono text-rating-a">
                      ${formatNumber(result.interestGenerated, 2)}
                    </td>
                    <td className="py-1.5 px-1 text-center text-lotus-grey-300 font-medium">=</td>
                    <td className="py-1.5 px-1.5 text-center font-mono text-rating-b">
                      ${formatNumber(result.total, 2)}
                    </td>
                    <td className="py-1.5 px-1 text-center text-lotus-grey-300 font-medium">×</td>
                    <td className={`py-1.5 px-1.5 text-center font-mono ${supplyUtilHigh ? 'text-rating-b' : 'text-lotus-purple-400'}`}>
                      {formatPercent(result.supplyUtil, 1)}
                    </td>
                    <td className="py-1.5 px-1 text-center text-lotus-grey-300 font-medium">=</td>
                    <td className="py-1.5 px-1.5 text-center font-mono font-medium text-rating-a-plus">
                      ${formatNumber(result.interestReceived, 2)}
                    </td>
                    <td className="py-1.5 px-1.5 text-right font-mono text-rating-c-plus">
                      {isLast ? <span className="text-lotus-grey-500">—</span> : `$${formatNumber(result.cascadeOut, 2)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        );
      })()}
      </div>{/* End exportable section */}

      {/* Formula - Collapsible */}
      <details className="bg-lotus-grey-900 rounded border border-lotus-grey-700">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-lotus-grey-300 hover:text-lotus-grey-100">
          Show Formula
        </summary>
        <div className="px-4 pb-4">
          <div className="bg-lotus-grey-900 rounded p-3 text-sm text-lotus-grey-300">
            <code className="font-mono">Interest Received = (Cascaded In + Generated) × Supply Utilization</code>
            <br />
            <code className="font-mono">Cascaded Out = (Cascaded In + Generated) × (1 - Supply Utilization)</code>
          </div>
        </div>
      </details>

      {/* How Interest Flows - Collapsible */}
      <details className="bg-lotus-grey-900 rounded border border-lotus-grey-700">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-lotus-grey-300 hover:text-lotus-grey-100">
          How Interest Flows
        </summary>
        <div className="px-4 pb-4">
          <ol className="list-decimal list-inside text-sm text-lotus-grey-300 space-y-1">
            <li><strong>Generation:</strong> Each tranche generates interest from its borrowers</li>
            <li><strong>Cascade Start:</strong> Starting from the most senior tranche (lowest LLTV)</li>
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
