import { useMemo } from 'react';
import type { TrancheData } from '../types';
import {
  simulateInterestAccrual,
  formatNumber,
  formatPercent,
} from '../math/lotusAccounting';

interface InterestSimulatorProps {
  tranches: TrancheData[];
  productiveDebtRate: number;
}

export function InterestSimulator({ tranches }: InterestSimulatorProps) {
  const simulation = useMemo(() => {
    return simulateInterestAccrual(tranches, '1month');
  }, [tranches]);

  return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <div className="overflow-x-auto">
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
            };
          });

          return (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-lotus-grey-700">
                  <th className="text-left py-2 px-2 font-semibold text-lotus-grey-300 bg-lotus-grey-800">
                    Tranche
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-blue-300 bg-blue-900/30">
                    Cascaded In
                  </th>
                  <th className="text-center py-2 px-1 text-lotus-grey-500">+</th>
                  <th className="text-right py-2 px-2 font-semibold text-emerald-300 bg-emerald-900/30">
                    Generated
                  </th>
                  <th className="text-center py-2 px-1 text-lotus-grey-500">×</th>
                  <th className="text-right py-2 px-2 font-semibold text-lotus-purple-300 bg-lotus-purple-900/30">
                    Supply Util
                  </th>
                  <th className="text-center py-2 px-1 text-lotus-grey-500">=</th>
                  <th className="text-right py-2 px-2 font-semibold text-teal-300 bg-teal-900/30">
                    Received
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-orange-300 bg-orange-900/30">
                    Cascaded Out
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((result, i) => (
                  <tr key={result.index} className="border-b border-lotus-grey-700/50 hover:bg-lotus-grey-700/30">
                    <td className="py-2 px-2 font-medium text-lotus-grey-200 bg-lotus-grey-800">
                      {result.lltv}%
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-blue-400 bg-blue-900/20">
                      ${formatNumber(result.cascadeIn, 2)}
                    </td>
                    <td className="text-center text-lotus-grey-600">+</td>
                    <td className="py-2 px-2 text-right font-mono text-emerald-400 bg-emerald-900/20">
                      ${formatNumber(result.interestGenerated, 2)}
                    </td>
                    <td className="text-center text-lotus-grey-600">×</td>
                    <td className="py-2 px-2 text-right font-mono text-lotus-purple-400 bg-lotus-purple-900/20">
                      {formatPercent(result.supplyUtil, 2)}
                    </td>
                    <td className="text-center text-lotus-grey-600">=</td>
                    <td className="py-2 px-2 text-right font-mono font-medium text-teal-300 bg-teal-900/20">
                      ${formatNumber(result.interestReceived, 2)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-orange-400 bg-orange-900/20">
                      {i < tableData.length - 1 ? `$${formatNumber(result.cascadeOut, 2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}
      </div>

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

      <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
        <h4 className="font-medium text-lotus-grey-200 mb-2">How Interest Flows</h4>
        <ol className="list-decimal list-inside text-sm text-lotus-grey-300 space-y-1">
          <li><strong>Generation:</strong> Each tranche generates interest from its borrowers</li>
          <li><strong>Cascade Start:</strong> Starting from the most senior tranche (75% LLTV)</li>
          <li><strong>Allocation:</strong> Lenders receive interest proportional to supply utilization</li>
          <li><strong>Cascade:</strong> Remaining interest flows to the next junior tranche</li>
          <li><strong>Final:</strong> Most junior tranche receives 100% of remaining interest</li>
        </ol>
      </div>
    </div>
  );
}

export default InterestSimulator;
