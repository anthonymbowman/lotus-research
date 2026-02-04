import { useState, useMemo, useRef } from 'react';
import type { TrancheData } from '../types';
import { computeFundingMatrix } from '../math/fundingMatrix';
import { formatPercent } from '../math/lotusAccounting';
import { ExportButton } from './ExportButton';

interface DynamicLoanMixProps {
  tranches: TrancheData[];
  defaultView?: ViewMode;
}

// Colors for bar segments (one per tranche)
const SEGMENT_COLORS = [
  'bg-emerald-500',
  'bg-teal-500',
  'bg-amber-500',
  'bg-orange-500',
  'bg-red-500',
];

const SEGMENT_TEXT_COLORS = [
  'text-emerald-400',
  'text-teal-400',
  'text-amber-400',
  'text-orange-400',
  'text-red-400',
];

type ViewMode = 'lender' | 'borrower';

export function DynamicLoanMix({ tranches, defaultView = 'lender' }: DynamicLoanMixProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const exportRef = useRef<HTMLDivElement>(null);

  const fundingData = useMemo(() => {
    return computeFundingMatrix(tranches, false);
  }, [tranches]);

  // Compute lender perspective for each tranche: where does their supply go?
  const lenderViews = useMemo(() => {
    return tranches.map((_, lenderIdx) => {
      const destinations: { trancheIdx: number; lltv: number; percent: number }[] = [];

      // Lender can only fund tranches at their level or more senior (borrowerIdx <= lenderIdx)
      for (let borrowerIdx = 0; borrowerIdx <= lenderIdx; borrowerIdx++) {
        const percent = fundingData.matrix[borrowerIdx][lenderIdx];
        if (percent > 0) {
          destinations.push({
            trancheIdx: borrowerIdx,
            lltv: tranches[borrowerIdx].lltv,
            percent,
          });
        }
      }

      const allocated = fundingData.capitalAllocated?.[lenderIdx] || 0;
      const unallocated = 1 - allocated;

      return { destinations, allocated, unallocated };
    });
  }, [tranches, fundingData]);

  // Compute borrower perspective for each tranche: where does their borrow come from?
  const borrowerViews = useMemo(() => {
    return tranches.map((tranche, borrowerIdx) => {
      const totalBorrow = tranche.borrowAssets;
      if (totalBorrow === 0) return { sources: [], hasBorrow: false };

      const sources: { trancheIdx: number; lltv: number; percent: number }[] = [];

      for (let lenderIdx = borrowerIdx; lenderIdx < tranches.length; lenderIdx++) {
        const lenderSupply = tranches[lenderIdx].supplyAssets;
        const percentOfLender = fundingData.matrix[borrowerIdx][lenderIdx];
        const amount = percentOfLender * lenderSupply;

        if (amount > 0) {
          sources.push({
            trancheIdx: lenderIdx,
            lltv: tranches[lenderIdx].lltv,
            percent: amount / totalBorrow,
          });
        }
      }

      return { sources, hasBorrow: true };
    });
  }, [tranches, fundingData]);

  return (
    <div ref={exportRef} className="export-section space-y-4 relative bg-lotus-grey-800 rounded-lg p-4 pb-6">
      <ExportButton targetRef={exportRef} filename="dynamic-loan-mix" />

      {/* Title for standalone export */}
      <h4 className="text-lg font-semibold text-lotus-grey-100 text-center pr-10">
        Dynamic Loan Mix
      </h4>

      {/* View Toggle */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setViewMode('lender')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'lender'
              ? 'bg-lotus-purple-600 text-white'
              : 'bg-lotus-grey-700 text-lotus-grey-300 hover:bg-lotus-grey-600'
          }`}
        >
          Lender View
        </button>
        <button
          onClick={() => setViewMode('borrower')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'borrower'
              ? 'bg-blue-600 text-white'
              : 'bg-lotus-grey-700 text-lotus-grey-300 hover:bg-lotus-grey-600'
          }`}
        >
          Borrower View
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-lotus-grey-300">
        {viewMode === 'lender' ? (
          <>Due to cascading supply, a lender at a junior tranche backs loans across multiple tranches (their own and more senior).</>
        ) : (
          <>Due to cascading supply, a borrower at a senior tranche draws liquidity from multiple tranches (their own and more junior).</>
        )}
      </p>

      {/* Bars */}
      <div className="space-y-2">
        {/* Column Headers */}
        <div className="flex items-center gap-3 text-xs font-medium text-lotus-grey-400 pb-1 border-b border-lotus-grey-700">
          <div className="w-20">Tranche LLTV</div>
          <div className="flex-1">
            {viewMode === 'lender' ? 'Tranches Lenders Supply To' : 'Tranches Borrowers Borrow From'}
          </div>
          <div className="w-24 text-right">
            {viewMode === 'lender' ? '% Allocated' : 'Supply Util'}
          </div>
        </div>

        {viewMode === 'lender' ? (
          // Lender View: For each tranche, show where their supply goes
          tranches.map((tranche, lenderIdx) => {
            const view = lenderViews[lenderIdx];
            return (
              <div key={lenderIdx} className="flex items-center gap-3">
                <div className="w-20 text-sm font-mono text-lotus-grey-200">{tranche.lltv}%</div>
                <div className="flex-1">
                  {view.allocated > 0.001 ? (
                    <div className="h-8 bg-lotus-grey-700 rounded-lg overflow-hidden flex">
                      {view.destinations.map((dest, i) => (
                        <div
                          key={i}
                          className={`h-full ${SEGMENT_COLORS[dest.trancheIdx]} flex items-center justify-center transition-all`}
                          style={{ width: `${dest.percent * 100}%` }}
                          title={`${dest.lltv}% tranche: ${formatPercent(dest.percent)}`}
                        >
                          {dest.percent > 0.1 && (
                            <span className="text-xs font-mono text-white/90">{formatPercent(dest.percent)}</span>
                          )}
                        </div>
                      ))}
                      {view.unallocated > 0.01 && (
                        <div
                          className="h-full bg-lotus-grey-600 flex items-center justify-center"
                          style={{ width: `${view.unallocated * 100}%` }}
                          title={`Unallocated: ${formatPercent(view.unallocated)}`}
                        >
                          {view.unallocated > 0.1 && (
                            <span className="text-xs font-mono text-lotus-grey-400">{formatPercent(view.unallocated)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-8 bg-lotus-grey-700 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-lotus-grey-500">No supply allocated</span>
                    </div>
                  )}
                </div>
                <div className="w-24 text-right text-xs font-mono text-emerald-400">
                  {formatPercent(view.allocated)}
                </div>
              </div>
            );
          })
        ) : (
          // Borrower View: For each tranche, show where their borrow comes from
          tranches.map((tranche, borrowerIdx) => {
            const view = borrowerViews[borrowerIdx];
            const supplyUtil = tranche.supplyUtilization ?? 0;
            return (
              <div key={borrowerIdx} className="flex items-center gap-3">
                <div className="w-20 text-sm font-mono text-lotus-grey-200">{tranche.lltv}%</div>
                <div className="flex-1">
                  {view.hasBorrow && view.sources.length > 0 ? (
                    <div className="h-8 bg-lotus-grey-700 rounded-lg overflow-hidden flex">
                      {view.sources.map((src, i) => (
                        <div
                          key={i}
                          className={`h-full ${SEGMENT_COLORS[src.trancheIdx]} flex items-center justify-center transition-all`}
                          style={{ width: `${src.percent * 100}%` }}
                          title={`From ${src.lltv}% lenders: ${formatPercent(src.percent)}`}
                        >
                          {src.percent > 0.1 && (
                            <span className="text-xs font-mono text-white/90">{formatPercent(src.percent)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-8 bg-lotus-grey-700 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-lotus-grey-500">No borrows</span>
                    </div>
                  )}
                </div>
                <div className="w-24 text-right text-xs font-mono text-blue-400">
                  {formatPercent(supplyUtil)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-2 border-t border-lotus-grey-700">
        <span className="text-xs text-lotus-grey-400">Tranches:</span>
        {tranches.map((t, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${SEGMENT_COLORS[i]}`} />
            <span className={`text-xs ${SEGMENT_TEXT_COLORS[i]}`}>{t.lltv}%</span>
          </div>
        ))}
        {viewMode === 'lender' && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-lotus-grey-600" />
            <span className="text-xs text-lotus-grey-400">Idle</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default DynamicLoanMix;
