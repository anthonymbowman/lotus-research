import { useMemo } from 'react';
import type { TrancheData } from '../types';
import { formatNumber, formatPercent } from '../math/lotusAccounting';
import { computeFundingMatrix } from '../math/fundingMatrix';
import { SimplePieChart, TRANCHE_COLORS, TRANCHE_TEXT_COLORS, IDLE_COLOR } from './SimplePieChart';

interface TrancheConstraintInspectorProps {
  /** The tranche being inspected */
  tranche: TrancheData;
  /** All tranches (needed to show senior jrNetSupply values) */
  allTranches: TrancheData[];
  /** Index of this tranche */
  trancheIndex: number;
  /** Callback to close the inspector */
  onClose: () => void;
}

/**
 * TrancheConstraintInspector - Educational modal showing tranche details
 *
 * Presents information in a logical learning progression:
 * 1. Supply & Borrow (direct values)
 * 2. Junior Aggregates (cumulative)
 * 3. Free Supply (the constraint)
 * 4. Available Supply
 * 5. Utilization Metrics
 * 6. Where Lenders Lend To (pie chart)
 * 7. Where Borrowers Borrow From (pie chart)
 */
export function TrancheConstraintInspector({
  tranche,
  allTranches,
  trancheIndex,
  onClose,
}: TrancheConstraintInspectorProps) {
  // Get all tranches from senior (0) to this tranche (inclusive)
  const seniorTranches = useMemo(() => {
    return allTranches.slice(0, trancheIndex + 1);
  }, [allTranches, trancheIndex]);

  // Find the binding constraint (minimum jrNetSupply among senior tranches)
  const bindingInfo = useMemo(() => {
    let minValue = Infinity;
    let bindingIndex = 0;

    seniorTranches.forEach((t, i) => {
      if (t.jrNetSupply < minValue) {
        minValue = t.jrNetSupply;
        bindingIndex = i;
      }
    });

    return {
      value: minValue === Infinity ? 0 : minValue,
      trancheIndex: bindingIndex,
      trancheLltv: seniorTranches[bindingIndex]?.lltv ?? 0,
      isThisTranche: bindingIndex === trancheIndex,
    };
  }, [seniorTranches, trancheIndex]);

  // Compute funding matrix for pie charts
  const fundingData = useMemo(() => {
    return computeFundingMatrix(allTranches, false);
  }, [allTranches]);

  // Where Lenders at this tranche Lend To (which borrower tranches)
  const lenderDestinations = useMemo(() => {
    const destinations: { lltv: number; percent: number; color: string }[] = [];
    let allocated = 0;

    // Lender at trancheIndex can fund borrowers at indices 0..trancheIndex
    for (let borrowerIdx = 0; borrowerIdx <= trancheIndex; borrowerIdx++) {
      const percent = fundingData.matrix[borrowerIdx][trancheIndex];
      if (percent > 0.001) {
        const lltv = allTranches[borrowerIdx].lltv;
        destinations.push({
          lltv,
          percent,
          color: TRANCHE_COLORS[lltv] || '#6b7280',
        });
        allocated += percent;
      }
    }

    const idle = 1 - allocated;
    return { destinations, idle: idle > 0.001 ? idle : 0, allocated };
  }, [fundingData, trancheIndex, allTranches]);

  // Where Borrowers at this tranche Borrow From (which lender tranches)
  const borrowerSources = useMemo(() => {
    const totalBorrow = tranche.borrowAssets;
    if (totalBorrow === 0) return { sources: [], hasBorrow: false };

    const sources: { lltv: number; percent: number; color: string }[] = [];

    // Borrower at trancheIndex receives from lenders at indices trancheIndex..n-1
    for (let lenderIdx = trancheIndex; lenderIdx < allTranches.length; lenderIdx++) {
      const lenderSupply = allTranches[lenderIdx].supplyAssets;
      const percentOfLender = fundingData.matrix[trancheIndex][lenderIdx];
      const amount = percentOfLender * lenderSupply;

      if (amount > 0.001) {
        const lltv = allTranches[lenderIdx].lltv;
        sources.push({
          lltv,
          percent: amount / totalBorrow,
          color: TRANCHE_COLORS[lltv] || '#6b7280',
        });
      }
    }

    return { sources, hasBorrow: true };
  }, [fundingData, trancheIndex, tranche.borrowAssets, allTranches]);

  // Compute Junior Borrow (sum of borrows at this tranche and all junior tranches)
  const jrBorrow = useMemo(() => {
    let sum = 0;
    for (let i = trancheIndex; i < allTranches.length; i++) {
      sum += allTranches[i].borrowAssets;
    }
    return sum;
  }, [allTranches, trancheIndex]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-lotus-grey-800 rounded-t-xl sm:rounded-xl border border-lotus-grey-700 shadow-xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-lotus-grey-800 px-4 py-3 border-b border-lotus-grey-700 flex items-center justify-between z-10">
          <h3 className="text-lg font-medium text-lotus-grey-100">
            Tranche {tranche.lltv}% Details
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-lotus-grey-700 rounded transition-colors"
          >
            <svg className="w-5 h-5 text-lotus-grey-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Section 1: Basic Values (Supply & Borrow) */}
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-grey-100 mb-3">Direct Values</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-lotus-grey-400 mb-1">Supply</div>
                <div className="text-xl font-mono text-blue-400">
                  {formatNumber(tranche.supplyAssets, 0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-lotus-grey-400 mb-1">Borrow</div>
                <div className="text-xl font-mono text-orange-400">
                  {formatNumber(tranche.borrowAssets, 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Junior Aggregates */}
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-grey-100 mb-2">Junior Aggregates</h4>
            <p className="text-xs text-lotus-grey-400 mb-3">
              Cumulative values from this tranche + all junior tranches
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-lotus-grey-300">Junior Supply</span>
                <span className="font-mono text-blue-400">{formatNumber(tranche.jrSupply, 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-lotus-grey-300">Junior Borrow</span>
                <span className="font-mono text-orange-400">{formatNumber(jrBorrow, 0)}</span>
              </div>
              <div className="border-t border-lotus-grey-600 pt-2 flex justify-between items-center">
                <span className="text-sm text-lotus-grey-200">Junior Net Supply</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {formatNumber(tranche.jrNetSupply, 0)}
                </span>
              </div>
              <div className="text-xs text-lotus-grey-500">
                = Jr Supply - Jr Borrow = {formatNumber(tranche.jrSupply, 0)} - {formatNumber(jrBorrow, 0)}
              </div>
            </div>
          </div>

          {/* Section 3: Free Supply */}
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-grey-100 mb-2">Free Supply</h4>
            <p className="text-xs text-lotus-grey-400 mb-3">
              The minimum Jr Net Supply across all senior tranches. This is the actual borrowable amount.
            </p>

            <div className="text-2xl font-mono text-amber-400 mb-3">
              {formatNumber(tranche.freeSupply, 0)}
            </div>

            {!bindingInfo.isThisTranche && tranche.jrNetSupply !== tranche.freeSupply && (
              <div className="bg-amber-900/20 rounded p-2 border border-amber-600/30 mb-3">
                <div className="flex items-center gap-2 text-sm text-amber-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Constrained by {bindingInfo.trancheLltv}% tranche
                </div>
              </div>
            )}

            {/* Jr Net Supply at each senior tranche */}
            <div className="text-xs text-lotus-grey-400 mb-2">Jr Net Supply at senior tranches:</div>
            <div className="space-y-1.5">
              {seniorTranches.map((t, i) => {
                const isBinding = i === bindingInfo.trancheIndex;
                const maxJrNet = Math.max(...seniorTranches.map(tr => Math.max(0, tr.jrNetSupply)));

                return (
                  <div
                    key={t.id}
                    className={`flex items-center gap-2 py-1 px-2 rounded ${
                      isBinding ? 'bg-amber-900/20 border border-amber-600/30' : ''
                    }`}
                  >
                    <span className={`text-xs font-medium w-10 ${isBinding ? 'text-amber-300' : 'text-lotus-grey-400'}`}>
                      {t.lltv}%
                    </span>
                    <div className="flex-1 h-2 bg-lotus-grey-700 rounded overflow-hidden">
                      <div
                        className={`h-full transition-all ${isBinding ? 'bg-amber-500' : 'bg-blue-500/60'}`}
                        style={{ width: `${maxJrNet > 0 ? (Math.max(0, t.jrNetSupply) / maxJrNet) * 100 : 0}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono w-16 text-right ${isBinding ? 'text-amber-400' : 'text-lotus-grey-400'}`}>
                      {formatNumber(t.jrNetSupply, 0)}
                    </span>
                    {isBinding && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                        min
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Available Supply */}
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-grey-100 mb-2">Available Supply</h4>
            <p className="text-xs text-lotus-grey-400 mb-3">
              Total supply that was available before borrowing at this tranche.
            </p>
            <div className="font-mono text-sm grid grid-cols-[auto_auto_auto_auto_auto] gap-x-2 items-center">
              <span className="text-lotus-grey-400 text-xs">Jr Net Supply</span>
              <span className="text-lotus-grey-500 text-center">+</span>
              <span className="text-lotus-grey-400 text-xs">Borrow</span>
              <span className="text-lotus-grey-500 text-center">=</span>
              <span className="text-lotus-grey-400 text-xs">Available</span>
              <span className="text-emerald-400">{formatNumber(tranche.jrNetSupply, 0)}</span>
              <span className="text-lotus-grey-500 text-center">+</span>
              <span className="text-orange-400">{formatNumber(tranche.borrowAssets, 0)}</span>
              <span className="text-lotus-grey-500 text-center">=</span>
              <span className="text-blue-400 font-semibold">{formatNumber(tranche.availableSupply, 0)}</span>
            </div>
          </div>

          {/* Section 5: Utilization Metrics */}
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-grey-100 mb-3">Utilization Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-lotus-grey-400 mb-1">Borrow Utilization</div>
                <div className="text-xl font-mono text-orange-400">
                  {tranche.borrowUtilization !== null ? formatPercent(tranche.borrowUtilization) : '—'}
                </div>
                <div className="text-[10px] text-lotus-grey-500 mt-1">
                  How much of junior liquidity is being used
                </div>
              </div>
              <div>
                <div className="text-xs text-lotus-grey-400 mb-1">Supply Utilization</div>
                <div className="text-xl font-mono text-blue-400">
                  {tranche.supplyUtilization !== null ? formatPercent(tranche.supplyUtilization) : '—'}
                </div>
                <div className="text-[10px] text-lotus-grey-500 mt-1">
                  Share of available supply from this tranche
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Where Lenders Lend To */}
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-grey-100 mb-2">Where Lenders Lend To</h4>
            <p className="text-xs text-lotus-grey-400 mb-3">
              Which borrower tranches receive funds from lenders at this tranche.
            </p>

            {lenderDestinations.allocated > 0.001 ? (
              <div className="flex items-start gap-4">
                <SimplePieChart
                  segments={[
                    ...lenderDestinations.destinations.map(d => ({
                      percent: d.percent,
                      color: d.color,
                      label: `${d.lltv}%`,
                    })),
                    ...(lenderDestinations.idle > 0 ? [{
                      percent: lenderDestinations.idle,
                      color: IDLE_COLOR,
                      label: 'Idle',
                    }] : []),
                  ]}
                  size={72}
                />
                <div className="flex-1 space-y-1.5">
                  {lenderDestinations.destinations.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className={`text-xs ${TRANCHE_TEXT_COLORS[d.lltv] || 'text-lotus-grey-300'}`}>
                        {d.lltv}% tranche:
                      </span>
                      <span className="text-xs font-mono text-lotus-grey-200">
                        {formatPercent(d.percent)}
                      </span>
                    </div>
                  ))}
                  {lenderDestinations.idle > 0 && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: IDLE_COLOR }}
                      />
                      <span className="text-xs text-lotus-grey-400">Idle:</span>
                      <span className="text-xs font-mono text-lotus-grey-400">
                        {formatPercent(lenderDestinations.idle)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-lotus-grey-500">
                No supply allocated (all idle)
              </div>
            )}
          </div>

          {/* Section 7: Where Borrowers Borrow From */}
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-grey-100 mb-2">Where Borrowers Borrow From</h4>
            <p className="text-xs text-lotus-grey-400 mb-3">
              Which lender tranches supply funds to borrowers at this tranche.
            </p>

            {borrowerSources.hasBorrow && borrowerSources.sources.length > 0 ? (
              <div className="flex items-start gap-4">
                <SimplePieChart
                  segments={borrowerSources.sources.map(s => ({
                    percent: s.percent,
                    color: s.color,
                    label: `From ${s.lltv}%`,
                  }))}
                  size={72}
                />
                <div className="flex-1 space-y-1.5">
                  {borrowerSources.sources.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className={`text-xs ${TRANCHE_TEXT_COLORS[s.lltv] || 'text-lotus-grey-300'}`}>
                        From {s.lltv}% lenders:
                      </span>
                      <span className="text-xs font-mono text-lotus-grey-200">
                        {formatPercent(s.percent)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-lotus-grey-500">
                No borrows at this tranche
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrancheConstraintInspector;
