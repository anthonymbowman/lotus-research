import { useState, useMemo, useEffect } from 'react';
import type { TrancheData } from '../types';
import { computeFundingMatrix, getMatrixMax, FUNDING_MATRIX_DISCLAIMER } from '../math/fundingMatrix';
import { formatPercent } from '../math/lotusAccounting';

interface FundingMatrixProps {
  /** Computed tranche data */
  tranches: TrancheData[];
  /** Whether to include pending interest */
  includePendingInterest: boolean;
}

interface HoverInfo {
  lenderIdx: number;
  borrowerIdx: number;
  percent: number;
  lenderLltv: number;
  borrowerLltv: number;
}

// Colors for pie chart slices (one per tranche)
const SLICE_COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
];

/**
 * Dynamic Loan Mix visualization showing how each lender's supply is allocated
 * across borrower tranches as percentages.
 */
export function FundingMatrix({ tranches, includePendingInterest }: FundingMatrixProps) {
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(0);
  const [selectedLender, setSelectedLender] = useState(0);

  const fundingData = useMemo(() => {
    return computeFundingMatrix(tranches, includePendingInterest);
  }, [tranches, includePendingInterest]);

  const maxValue = useMemo(() => getMatrixMax(fundingData.matrix), [fundingData.matrix]);

  // Update selections when a cell is hovered
  useEffect(() => {
    if (hoverInfo) {
      setSelectedBorrower(hoverInfo.borrowerIdx);
      setSelectedLender(hoverInfo.lenderIdx);
    }
  }, [hoverInfo]);

  // Compute borrower perspective: what % of my borrow comes from each lender?
  const borrowerPerspective = useMemo(() => {
    const borrowerIdx = selectedBorrower;
    const totalBorrow = tranches[borrowerIdx]?.borrowAssets || 0;

    if (totalBorrow === 0) return [];

    const sources: { trancheIdx: number; lltv: number; percent: number }[] = [];

    for (let lenderIdx = borrowerIdx; lenderIdx < tranches.length; lenderIdx++) {
      const lenderSupply = tranches[lenderIdx].supplyAssets +
        (includePendingInterest ? tranches[lenderIdx].pendingInterest : 0);
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

    return sources;
  }, [tranches, fundingData.matrix, selectedBorrower, includePendingInterest]);

  // Compute lender perspective: where does my supply go?
  const lenderPerspective = useMemo(() => {
    const lenderIdx = selectedLender;
    const destinations: { trancheIdx: number; lltv: number; percent: number; isUnallocated?: boolean }[] = [];

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

    // Add unallocated portion
    const allocated = fundingData.capitalAllocated?.[lenderIdx] || 0;
    const unallocated = 1 - allocated;
    if (unallocated > 0.001) {
      destinations.push({
        trancheIdx: -1, // Special marker for unallocated
        lltv: 0,
        percent: unallocated,
        isUnallocated: true,
      });
    }

    return destinations;
  }, [tranches, fundingData.matrix, selectedLender, fundingData.capitalAllocated]);

  const getCellColor = (percent: number): string => {
    if (percent === 0) return 'bg-slate-50';
    const intensity = Math.sqrt(percent / Math.max(maxValue, 0.01));
    if (intensity > 0.8) return 'bg-blue-600 text-white';
    if (intensity > 0.6) return 'bg-blue-500 text-white';
    if (intensity > 0.4) return 'bg-blue-400 text-white';
    if (intensity > 0.2) return 'bg-blue-300';
    return 'bg-blue-100';
  };

  const handleCellHover = (lenderIdx: number, borrowerIdx: number) => {
    const percent = fundingData.matrix[borrowerIdx][lenderIdx];
    setHoverInfo({
      lenderIdx,
      borrowerIdx,
      percent,
      lenderLltv: tranches[lenderIdx].lltv,
      borrowerLltv: tranches[borrowerIdx].lltv,
    });
  };

  if (tranches.length === 0) return null;

  // Build pie chart for borrower perspective
  const borrowerPieSlices = buildPieSlices(borrowerPerspective);
  const lenderPieSlices = buildPieSlices(lenderPerspective);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Dynamic Loan Mix</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={showExplanation ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
            {showExplanation ? 'Hide' : 'Show'} Calculation Details
          </button>
          <button
            onClick={() => setShowDisclaimer(!showDisclaimer)}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About
          </button>
        </div>
      </div>

      {showDisclaimer && (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
          {FUNDING_MATRIX_DISCLAIMER}
        </div>
      )}

      {showExplanation && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-700 space-y-3">
          <div>
            <strong className="text-blue-800">Matrix Calculation:</strong>
            <p className="mt-1">
              Each cell shows what percentage of a <em>lender tranche's supply</em> is allocated to fund a <em>borrower tranche</em>.
              The calculation cascades from junior to senior: each lender's supply first funds their own tranche's borrowers,
              then any remaining supply cascades to fund more senior tranches proportionally.
            </p>
            <p className="mt-1 font-mono text-xs bg-white px-2 py-1 rounded border">
              matrix[borrower][lender] = (lender's share of available supply) × (borrower's borrow) / (lender's supply)
            </p>
          </div>
          <div>
            <strong className="text-blue-800">Borrower Perspective (left pie):</strong>
            <p className="mt-1">
              Shows where a borrower's funds come from. For each lender that can fund this borrower (same or more junior tranche):
            </p>
            <p className="mt-1 font-mono text-xs bg-white px-2 py-1 rounded border">
              % from lender = (matrix[borrower][lender] × lender's supply) / borrower's total borrow
            </p>
          </div>
          <div>
            <strong className="text-blue-800">Lender Perspective (right pie):</strong>
            <p className="mt-1">
              Shows where a lender's supply goes. This is simply the column values from the matrix for that lender.
              The "Allocated" row shows the total % of supply actively funding loans.
            </p>
            <p className="mt-1 font-mono text-xs bg-white px-2 py-1 rounded border">
              % to borrower = matrix[borrower][lender] (directly from matrix)
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-6 flex-wrap">
        {/* Matrix */}
        <div>
          <table className="text-xs">
            <thead>
              <tr>
                <th className="w-6"></th>
                <th className="p-2"></th>
                <th colSpan={tranches.length} className="p-2 text-center text-slate-500 font-medium border-b border-slate-200">
                  Lender Tranche (supply source) →
                </th>
              </tr>
              <tr>
                <th className="w-6"></th>
                <th className="p-2"></th>
                {tranches.map((t, i) => (
                  <th
                    key={i}
                    className={`px-4 py-2 text-center font-medium cursor-pointer transition-colors
                      ${selectedLender === i ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                    onClick={() => setSelectedLender(i)}
                  >
                    {t.lltv}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tranches.map((borrower, borrowerIdx) => (
                <tr key={borrowerIdx}>
                  {borrowerIdx === 0 && (
                    <th
                      rowSpan={tranches.length}
                      className="pr-1 text-slate-500 font-medium text-xs"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      ← Borrower
                    </th>
                  )}
                  <th
                    className={`px-3 py-2 text-right font-medium cursor-pointer transition-colors
                      ${selectedBorrower === borrowerIdx ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                    onClick={() => setSelectedBorrower(borrowerIdx)}
                  >
                    {borrower.lltv}%
                  </th>
                  {tranches.map((_, lenderIdx) => {
                    const percent = fundingData.matrix[borrowerIdx][lenderIdx];
                    const isValidRelation = borrowerIdx <= lenderIdx;
                    const isHovered = hoverInfo?.lenderIdx === lenderIdx && hoverInfo?.borrowerIdx === borrowerIdx;
                    const isSelected = selectedBorrower === borrowerIdx && selectedLender === lenderIdx;

                    return (
                      <td
                        key={lenderIdx}
                        className={`px-4 py-2 text-center transition-all duration-150 cursor-pointer
                          ${isValidRelation ? getCellColor(percent) : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                          ${isHovered || isSelected ? 'ring-2 ring-blue-600 ring-inset' : ''}`}
                        onMouseEnter={() => isValidRelation && handleCellHover(lenderIdx, borrowerIdx)}
                        onMouseLeave={() => setHoverInfo(null)}
                        onClick={() => {
                          if (isValidRelation) {
                            setSelectedBorrower(borrowerIdx);
                            setSelectedLender(lenderIdx);
                          }
                        }}
                        title={!isValidRelation ? 'Cannot fund: lender is senior to borrower' : undefined}
                      >
                        {isValidRelation ? (
                          percent > 0 ? formatPercent(percent) : '-'
                        ) : (
                          <span className="text-slate-300">×</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Capital Allocated row */}
              <tr className="border-t-2 border-slate-300">
                <td></td>
                <th className="px-3 py-2 text-right font-medium text-emerald-700 whitespace-nowrap">
                  Allocated
                </th>
                {fundingData.capitalAllocated?.map((percent, lenderIdx) => (
                  <td
                    key={lenderIdx}
                    className="px-4 py-2 text-center font-mono text-emerald-600 bg-emerald-50"
                  >
                    {formatPercent(percent)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Color Scale */}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-slate-500">Color scale:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 bg-blue-100 rounded"></div>
              <div className="w-4 h-3 bg-blue-300 rounded"></div>
              <div className="w-4 h-3 bg-blue-500 rounded"></div>
              <div className="w-4 h-3 bg-blue-600 rounded"></div>
            </div>
            <span className="text-slate-400">Low → High</span>
          </div>
        </div>

        {/* Pie Charts */}
        <div className="flex gap-6">
          {/* Borrower Perspective */}
          <div className="flex-shrink-0">
            <div className="text-xs font-semibold text-slate-700 mb-1">
              Borrower Perspective
            </div>
            <div className="text-xs text-slate-500 mb-2">
              Where does {tranches[selectedBorrower]?.lltv}% borrow come from?
            </div>

            {tranches[selectedBorrower]?.borrowAssets > 0 ? (
              <div className="flex items-start gap-3">
                <PieChart slices={borrowerPieSlices} size={120} />
                <PieLegend slices={borrowerPieSlices} />
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-8">
                No borrows in {tranches[selectedBorrower]?.lltv}% tranche
              </div>
            )}
          </div>

          {/* Lender Perspective */}
          <div className="flex-shrink-0">
            <div className="text-xs font-semibold text-slate-700 mb-1">
              Lender Perspective
            </div>
            <div className="text-xs text-slate-500 mb-2">
              Where does {tranches[selectedLender]?.lltv}% supply go?
            </div>

            {lenderPieSlices.length > 0 ? (
              <div className="flex items-start gap-3">
                <PieChart slices={lenderPieSlices} size={120} />
                <PieLegend slices={lenderPieSlices} />
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-8">
                No supply allocated from {tranches[selectedLender]?.lltv}% tranche
              </div>
            )}

            <div className="mt-2 text-xs text-slate-500">
              Total allocated: <span className="font-mono font-medium text-emerald-600">
                {formatPercent(fundingData.capitalAllocated?.[selectedLender] || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PieSlice {
  trancheIdx: number;
  lltv: number;
  percent: number;
  path: string;
  color: string;
  isUnallocated?: boolean;
}

function buildPieSlices(data: { trancheIdx: number; lltv: number; percent: number; isUnallocated?: boolean }[]): PieSlice[] {
  const pieRadius = 50;
  const pieCenter = 60;
  let currentAngle = -Math.PI / 2;

  return data.map((item) => {
    const startAngle = currentAngle;
    const sliceAngle = item.percent * 2 * Math.PI;
    currentAngle += sliceAngle;
    const endAngle = currentAngle;

    const x1 = pieCenter + pieRadius * Math.cos(startAngle);
    const y1 = pieCenter + pieRadius * Math.sin(startAngle);
    const x2 = pieCenter + pieRadius * Math.cos(endAngle);
    const y2 = pieCenter + pieRadius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const path = item.percent >= 0.9999
      ? `M ${pieCenter} ${pieCenter - pieRadius} A ${pieRadius} ${pieRadius} 0 1 1 ${pieCenter - 0.01} ${pieCenter - pieRadius} Z`
      : `M ${pieCenter} ${pieCenter} L ${x1} ${y1} A ${pieRadius} ${pieRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      ...item,
      path,
      color: item.isUnallocated ? '#e2e8f0' : SLICE_COLORS[item.trancheIdx % SLICE_COLORS.length],
      isUnallocated: item.isUnallocated,
    };
  });
}

function PieChart({ slices, size }: { slices: PieSlice[]; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="flex-shrink-0">
      {/* Define stripe pattern for unallocated */}
      <defs>
        <pattern id="stripes" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <rect width="3" height="6" fill="#e2e8f0" />
          <rect x="3" width="3" height="6" fill="#cbd5e1" />
        </pattern>
      </defs>
      {slices.map((slice, idx) => (
        <path
          key={idx}
          d={slice.path}
          fill={slice.isUnallocated ? 'url(#stripes)' : slice.color}
          stroke={slice.isUnallocated ? '#94a3b8' : 'none'}
          strokeWidth={slice.isUnallocated ? 1 : 0}
          className="transition-opacity hover:opacity-80"
        >
          <title>{slice.isUnallocated ? 'Unallocated' : `${slice.lltv}%`}: {formatPercent(slice.percent)}</title>
        </path>
      ))}
    </svg>
  );
}

function PieLegend({ slices }: { slices: PieSlice[] }) {
  return (
    <div className="text-xs space-y-1">
      {slices.map((slice, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {slice.isUnallocated ? (
            <svg width="10" height="10" className="flex-shrink-0">
              <defs>
                <pattern id={`legend-stripes-${idx}`} patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                  <rect width="2" height="4" fill="#e2e8f0" />
                  <rect x="2" width="2" height="4" fill="#cbd5e1" />
                </pattern>
              </defs>
              <rect width="10" height="10" rx="2" fill={`url(#legend-stripes-${idx})`} stroke="#94a3b8" strokeWidth="0.5" />
            </svg>
          ) : (
            <div
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: slice.color }}
            />
          )}
          <span className="text-slate-500">{slice.isUnallocated ? 'Unallocated' : `${slice.lltv}%`}:</span>
          <span className="font-mono text-slate-700">{formatPercent(slice.percent)}</span>
        </div>
      ))}
      {slices.length === 0 && (
        <div className="text-slate-400 italic">None</div>
      )}
    </div>
  );
}

export default FundingMatrix;
