import { useState, useMemo } from 'react';
import type { TrancheData, TimePeriod } from '../types';
import {
  simulateInterestAccrual,
  formatNumber,
  formatPercent,
  getTimePeriodLabel,
} from '../math/lotusAccounting';

interface InterestSimulatorProps {
  /** Computed tranche data */
  tranches: TrancheData[];
  /** Productive debt rate (base rate) */
  productiveDebtRate: number;
}

const TIME_PERIODS: TimePeriod[] = ['1week', '1month', '3months', '1year'];

/**
 * Interactive simulator showing interest accrual and cascade mechanism.
 */
export function InterestSimulator({ tranches, productiveDebtRate }: InterestSimulatorProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1month');
  const [showCascade, setShowCascade] = useState(false);

  const simulation = useMemo(() => {
    return simulateInterestAccrual(tranches, timePeriod);
  }, [tranches, timePeriod]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Time Period:</span>
          <div className="flex gap-1">
            {TIME_PERIODS.map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors
                  ${timePeriod === period
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                {getTimePeriodLabel(period)}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowCascade(!showCascade)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors
            ${showCascade
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
        >
          {showCascade ? 'Hide Cascade' : 'Show Cascade'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
          <div className="text-sm text-emerald-600">Total Interest Generated</div>
          <div className="text-2xl font-mono font-semibold text-emerald-700">
            ${formatNumber(simulation.totalInterestGenerated, 2)}
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-600">Total Interest Received</div>
          <div className="text-2xl font-mono font-semibold text-blue-700">
            ${formatNumber(simulation.totalInterestReceived, 2)}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="text-sm text-slate-600">Time Period</div>
          <div className="text-2xl font-semibold text-slate-700">
            {getTimePeriodLabel(timePeriod)}
          </div>
        </div>
      </div>

      {/* Interest Table */}
      <div className="overflow-x-auto">
        {(() => {
          // Calculate cascade data for the table
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
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 font-semibold text-slate-700 bg-slate-50">
                    Tranche
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-indigo-700 bg-indigo-50">
                    Supply Util
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-emerald-700 bg-emerald-50">
                    Int Gen
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-blue-700 bg-blue-50">
                    Cascaded In
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-teal-700 bg-teal-50">
                    Int Received
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-orange-700 bg-orange-50">
                    Cascaded Out
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-slate-700 bg-slate-50">
                    Supply Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((result, i) => (
                  <tr key={result.index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-2 font-medium text-slate-700 bg-slate-50">
                      {result.lltv}%
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-indigo-600 bg-indigo-50/30">
                      {formatPercent(result.supplyUtil, 0)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-emerald-600 bg-emerald-50/30">
                      ${formatNumber(result.interestGenerated, 2)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-blue-600 bg-blue-50/30">
                      ${formatNumber(result.cascadeIn, 2)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-medium text-teal-700 bg-teal-50/30">
                      ${formatNumber(result.interestReceived, 2)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-orange-600 bg-orange-50/30">
                      {i < tableData.length - 1 ? `$${formatNumber(result.cascadeOut, 2)}` : '-'}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-slate-700 bg-slate-50/30">
                      {result.impliedSupplyRate !== null
                        ? formatPercent(productiveDebtRate + result.impliedSupplyRate, 2)
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}
      </div>

      {/* Formula explanation */}
      <div className="bg-slate-100 rounded-lg p-3 text-sm text-slate-600">
        <code className="font-mono">intReceived = (cascadedIn + intGen) × supplyUtil</code>
        <span className="mx-2">|</span>
        <code className="font-mono">cascadedOut = (cascadedIn + intGen) × (1 - supplyUtil)</code>
      </div>

      {/* Cascade Visualization */}
      {showCascade && (
        <div className="mt-6">
          <h4 className="font-medium text-slate-700 mb-3">Interest Cascade Flow</h4>
          <p className="text-sm text-slate-500 mb-4">
            Interest flows from senior to junior tranches. At each level, lenders receive a share
            based on their supply utilization, and the remainder cascades to the next junior tranche.
          </p>
          <CascadeVisualization tranches={tranches} simulation={simulation} />
        </div>
      )}

      {/* Explanation */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h4 className="font-medium text-slate-700 mb-2">How Interest Flows</h4>
        <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
          <li>
            <strong>Generation:</strong> Each tranche generates interest = Borrow Amount × Borrow Rate × Time
          </li>
          <li>
            <strong>Cascade Start:</strong> Starting from the most senior tranche (75% LLTV)
          </li>
          <li>
            <strong>Allocation:</strong> At each tranche: Total Interest × Supply Utilization → allocated to lenders
          </li>
          <li>
            <strong>Cascade:</strong> Remaining interest (1 - Supply Util) flows to the next junior tranche
          </li>
          <li>
            <strong>Final:</strong> Most junior tranche (95% LLTV) receives 100% of cascaded interest
          </li>
        </ol>
      </div>
    </div>
  );
}

/**
 * Visual cascade diagram showing interest flow.
 */
function CascadeVisualization({
  tranches,
  simulation,
}: {
  tranches: TrancheData[];
  simulation: ReturnType<typeof simulateInterestAccrual>;
}) {
  // Calculate cascading values for visualization
  const cascadeData = useMemo(() => {
    let cascading = 0;
    return simulation.tranches.map((result, i) => {
      const inFlow = cascading + result.interestGenerated;
      const supplyUtil = tranches[i].supplyUtilization ?? 1;
      const allocated = inFlow * supplyUtil;
      const outFlow = inFlow * (1 - supplyUtil);
      cascading = outFlow;
      return {
        lltv: result.lltv,
        inFlow,
        allocated,
        outFlow,
        supplyUtil,
      };
    });
  }, [simulation, tranches]);

  const maxFlow = Math.max(...cascadeData.map((d) => Math.max(d.inFlow, d.allocated)));

  return (
    <div className="space-y-2">
      {cascadeData.map((data, i) => (
        <div key={data.lltv} className="flex items-center gap-2">
          {/* Tranche label */}
          <div className="w-20 text-right text-sm font-medium text-slate-600">
            {data.lltv}% LLTV
          </div>

          {/* Flow visualization */}
          <div className="flex-1 flex items-center gap-1">
            {/* In flow arrow */}
            {data.inFlow > 0 && (
              <div className="flex items-center">
                <div
                  className="h-6 bg-blue-400 rounded-l flex items-center justify-end pr-1"
                  style={{
                    width: `${maxFlow > 0 ? (data.inFlow / maxFlow) * 100 : 0}px`,
                    minWidth: data.inFlow > 0 ? '20px' : '0',
                  }}
                >
                  <span className="text-xs text-white font-mono">${data.inFlow.toFixed(0)}</span>
                </div>
              </div>
            )}

            {/* Allocation box */}
            <div className="relative flex-shrink-0 w-32 bg-emerald-100 border border-emerald-300 rounded px-2 py-1 text-center">
              <div className="text-xs text-emerald-600">
                Keeps {formatPercent(data.supplyUtil, 0)}
              </div>
              <div className="text-sm font-mono font-medium text-emerald-700">
                ${data.allocated.toFixed(0)}
              </div>
            </div>

            {/* Out flow arrow */}
            {i < cascadeData.length - 1 && data.outFlow > 0 && (
              <div className="flex items-center">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div
                  className="h-4 bg-blue-300 rounded-r flex items-center justify-start pl-1"
                  style={{
                    width: `${maxFlow > 0 ? (data.outFlow / maxFlow) * 60 : 0}px`,
                    minWidth: data.outFlow > 0 ? '15px' : '0',
                  }}
                >
                  <span className="text-xs text-blue-800 font-mono">${data.outFlow.toFixed(0)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-400 rounded"></div>
          <span className="text-xs text-slate-600">Interest Flowing</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-emerald-300 border border-emerald-400 rounded"></div>
          <span className="text-xs text-slate-600">Interest Allocated to Lenders</span>
        </div>
      </div>
    </div>
  );
}

export default InterestSimulator;
