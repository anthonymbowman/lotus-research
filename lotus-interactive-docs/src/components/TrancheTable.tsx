import { useState, useRef } from 'react';
import type { TrancheInput, TrancheData } from '../types';
import { formatNumber, formatPercent } from '../math/lotusAccounting';
import { FormulaTooltip, FORMULAS } from './FormulaTooltip';
import { TermDefinition } from './TermDefinition';
import { ConstraintTooltip } from './ConstraintTooltip';
import { TrancheConstraintInspector } from './TrancheConstraintInspector';
import { DefinitionBadge } from './DefinitionBadge';
import { ExportButton } from './ExportButton';

interface TrancheTableProps {
  tranches: TrancheData[];
  onTrancheChange: (id: number, field: keyof TrancheInput, value: number) => void;
  productiveDebtRate: number;
}

// Stepper button component for increment/decrement
function StepperButton({
  direction,
  onClick,
  disabled = false
}: {
  direction: 'up' | 'down';
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`hidden sm:flex items-center justify-center w-5 h-5 rounded-sm transition-colors
        ${disabled
          ? 'bg-lotus-grey-700 text-lotus-grey-500 cursor-not-allowed'
          : 'bg-lotus-grey-700 text-lotus-grey-300 hover:bg-lotus-purple-600 hover:text-white'
        }`}
      aria-label={direction === 'up' ? 'Increase' : 'Decrease'}
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        {direction === 'up' ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        )}
      </svg>
    </button>
  );
}

export function TrancheTable({
  tranches,
  onTrancheChange,
  productiveDebtRate,
}: TrancheTableProps) {
  const [inspectedTranche, setInspectedTranche] = useState<number | null>(null);
  const [showFullBreakdown, setShowFullBreakdown] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      {/* Exportable Section */}
      <div ref={exportRef} className="export-section bg-lotus-grey-800 rounded p-4 pb-6 relative">
        <ExportButton targetRef={exportRef} filename="liquidity-flow-table" />

        {/* Title and Toggle */}
        <div className="flex items-center justify-between mb-4 pr-10">
          <div /> {/* Spacer for centering */}
          <h4 className="text-lg font-semibold text-lotus-grey-100 text-center">
            Liquidity Flow by Tranche
          </h4>
          <button
            onClick={() => setShowFullBreakdown(!showFullBreakdown)}
            className="text-xs text-lotus-grey-400 hover:text-lotus-purple-300 transition-colors flex items-center gap-1"
          >
            {showFullBreakdown ? (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                Hide breakdown
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Show full breakdown
              </>
            )}
          </button>
        </div>

      <div className="overflow-x-auto">
        <table className={`w-full text-[11px] sm:text-xs ${showFullBreakdown ? 'min-w-[860px]' : ''}`}>
          <thead>
            <tr className="border-b border-lotus-grey-700">
              <th className="text-left py-1 px-1 font-semibold text-lotus-grey-300 bg-lotus-grey-800 border-r border-lotus-grey-700 sticky left-0 z-10 w-1 whitespace-nowrap">
                <TermDefinition term="lltv">LLTV</TermDefinition>
              </th>
              <th className="text-right py-1 px-1 font-semibold bg-lotus-grey-800 w-1 whitespace-nowrap">
                <span className="text-lotus-purple-300 flex items-center justify-end gap-1">
                  Supply
                  <svg className="w-3 h-3 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </span>
              </th>
              <th className="text-right py-1 px-1 font-semibold bg-lotus-grey-800 w-1 whitespace-nowrap">
                <span className="text-lotus-purple-300 flex items-center justify-end gap-1">
                  Borrow
                  <svg className="w-3 h-3 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </span>
              </th>
              {/* Credit Spread - expanded only */}
              {showFullBreakdown && (
                <th className="text-right py-1 px-1 font-semibold text-lotus-purple-300 bg-lotus-purple-900/30">
                  <DefinitionBadge
                    label="Credit Spread"
                    formula="Determined by IRM"
                    note="Set by the Interest Rate Model based on this tranche's borrow utilization. Total borrow rate = base rate + credit spread."
                    textColor="text-lotus-purple-300"
                  />
                </th>
              )}
              <th className="text-right py-1 px-1 font-semibold text-rating-c-plus bg-rating-c-plus/20">
                Borrow Rate
              </th>
              {/* Jr Supply, Jr Borrow, Jr Net - expanded only */}
              {showFullBreakdown && (
                <>
                  <th className="text-right py-1 px-1 font-semibold text-rating-a bg-rating-a/20">
                    <FormulaTooltip {...FORMULAS.jrSupply}>Jr Supply</FormulaTooltip>
                  </th>
                  <th className="text-right py-1 px-1 font-semibold text-rating-a bg-rating-a/20">
                    <FormulaTooltip {...FORMULAS.jrBorrow}>Jr Borrow</FormulaTooltip>
                  </th>
                  <th className="text-right py-1 px-1 font-semibold text-rating-a bg-rating-a/20">
                    <FormulaTooltip {...FORMULAS.jrNetSupply}>Jr Net</FormulaTooltip>
                  </th>
                  <th className="text-right py-1 px-1 font-semibold text-rating-a-plus bg-rating-a-plus/20">
                    <FormulaTooltip {...FORMULAS.freeSupply}>Free Supply</FormulaTooltip>
                  </th>
                </>
              )}
              <th className="text-right py-1 px-1 font-semibold text-rating-a-plus bg-rating-a-plus/20">
                <FormulaTooltip {...FORMULAS.availableSupply}>Available</FormulaTooltip>
              </th>
              {/* Supply Util, Borrow Util - expanded only */}
              {showFullBreakdown && (
                <>
                  <th className="text-right py-1 px-1 font-semibold text-lotus-purple-300 bg-lotus-purple-900/30">
                    <DefinitionBadge
                      label="Supply Util"
                      formula="Supply / Available Supply"
                      note="Determines how much interest stays at this tranche vs cascading to junior tranches"
                      textColor="text-lotus-purple-300"
                    />
                  </th>
                  <th className="text-right py-1 px-1 font-semibold text-lotus-purple-300 bg-lotus-purple-900/30">
                    <DefinitionBadge
                      label="Borrow Util"
                      formula="1 - (Free Supply / Jr Supply)"
                      note="This drives IRM rates. Higher utilization = higher borrow rates."
                      textColor="text-lotus-purple-300"
                    />
                  </th>
                </>
              )}
              <th className="text-right py-1 px-1 font-semibold text-lotus-purple-300 bg-lotus-purple-900/30">
                <FormulaTooltip {...FORMULAS.supplyRate}>Supply Rate</FormulaTooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {tranches.map((tranche, index) => {
              const hasCascadingSupply = tranche.borrowAssets > tranche.supplyAssets;
              const isBindingConstraint = tranche.isBindingConstraint;
              // Illegal: at most junior tranche, borrow cannot exceed supply (no junior liquidity to draw from)
              // At other tranches: if Jr Net Supply is 0, the system is at capacity
              const isMostJunior = index === tranches.length - 1;
              const isOverBorrowed = isMostJunior && tranche.borrowAssets > tranche.supplyAssets;

              return (
                <tr
                  key={tranche.id}
                  className={`border-b transition-colors cursor-pointer ${
                    isOverBorrowed
                      ? 'border-rating-d/50 bg-rating-d/20 hover:bg-rating-d/30'
                      : isBindingConstraint
                      ? 'border-rating-b/50 bg-rating-b/10 hover:bg-rating-b/20'
                      : 'border-lotus-grey-700/50 hover:bg-lotus-grey-700/30'
                  }`}
                  onClick={() => setInspectedTranche(index)}
                >
                  <td className={`py-1 px-1 border-r border-lotus-grey-700 sticky left-0 z-10 w-1 whitespace-nowrap ${
                    isOverBorrowed ? 'bg-rating-d/30' : isBindingConstraint ? 'bg-rating-b/20' : 'bg-lotus-grey-800'
                  }`}>
                    <span className={`font-medium ${isOverBorrowed ? 'text-rating-d' : 'text-lotus-grey-200'}`}>{tranche.lltv}%</span>
                    {isOverBorrowed && <span className="ml-1 text-rating-d text-xs">!</span>}
                  </td>

                  <td className="py-1 px-1 w-1 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <div className="hidden sm:flex flex-col gap-0.5">
                        <StepperButton
                          direction="up"
                          onClick={() => onTrancheChange(tranche.id, 'supplyAssets', tranche.supplyAssets + 100)}
                        />
                        <StepperButton
                          direction="down"
                          onClick={() => onTrancheChange(tranche.id, 'supplyAssets', Math.max(0, tranche.supplyAssets - 100))}
                          disabled={tranche.supplyAssets <= 0}
                        />
                      </div>
                      <input
                        type="number"
                        value={tranche.supplyAssets}
                        onChange={(e) => onTrancheChange(tranche.id, 'supplyAssets', parseFloat(e.target.value) || 0)}
                        min={0}
                        step={100}
                        aria-label={`Supply for ${tranche.lltv}% LLTV`}
                        className={`w-20 px-2 py-1 text-sm text-right bg-lotus-grey-900 border-2 rounded-sm font-mono text-lotus-grey-100
                          hover:border-lotus-purple-400 hover:bg-lotus-grey-800 transition-colors cursor-text
                          focus:outline-none focus:ring-2 focus:ring-lotus-purple-500/50 focus:border-lotus-purple-500 focus:bg-lotus-grey-800 ${
                          isOverBorrowed ? 'border-rating-d' : 'border-lotus-purple-500/40'
                        }`}
                      />
                    </div>
                  </td>

                  <td className="py-1 px-1 w-1 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {isOverBorrowed ? (
                        <ConstraintTooltip
                          title="Illegal: Borrow Exceeds Available"
                          why="This borrow amount exceeds the available liquidity. In the real protocol, this state would not be possible."
                          scope="tranche"
                          trancheIndex={index}
                        >
                          <span className="w-2 h-2 rounded-sm bg-rating-d animate-pulse" />
                        </ConstraintTooltip>
                      ) : hasCascadingSupply && (
                        <ConstraintTooltip
                          title="Borrow Exceeds Direct Supply"
                          why="This is normal! This tranche borrows more than its direct supply by drawing from junior tranche liquidity. The actual limit is Free Supply (which includes junior liquidity), not direct supply."
                          primitive="cascadingSupply"
                          scope="tranche"
                          trancheIndex={index}
                        >
                          <span className="w-2 h-2 rounded-sm bg-rating-a" title="B > S" />
                        </ConstraintTooltip>
                      )}
                      <div className="hidden sm:flex flex-col gap-0.5">
                        <StepperButton
                          direction="up"
                          onClick={() => onTrancheChange(tranche.id, 'borrowAssets', tranche.borrowAssets + 100)}
                        />
                        <StepperButton
                          direction="down"
                          onClick={() => onTrancheChange(tranche.id, 'borrowAssets', Math.max(0, tranche.borrowAssets - 100))}
                          disabled={tranche.borrowAssets <= 0}
                        />
                      </div>
                      <input
                        type="number"
                        value={tranche.borrowAssets}
                        onChange={(e) => onTrancheChange(tranche.id, 'borrowAssets', parseFloat(e.target.value) || 0)}
                        min={0}
                        step={100}
                        aria-label={`Borrow for ${tranche.lltv}% LLTV`}
                        className={`w-20 px-2 py-1 text-sm text-right bg-lotus-grey-900 border-2 rounded-sm font-mono
                          hover:border-lotus-purple-400 hover:bg-lotus-grey-800 transition-colors cursor-text
                          focus:outline-none focus:ring-2 focus:ring-lotus-purple-500/50 focus:border-lotus-purple-500 focus:bg-lotus-grey-800 ${
                          isOverBorrowed ? 'border-rating-d text-rating-d' : 'border-lotus-purple-500/40 text-lotus-grey-100'
                        }`}
                      />
                    </div>
                  </td>

                  {/* Credit Spread - expanded only */}
                  {showFullBreakdown && (
                    <td className="py-1 px-1 bg-lotus-purple-900/20" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono text-lotus-purple-200">
                          {formatPercent(tranche.borrowRate, 1)}
                        </span>
                        <span className="text-[10px] text-lotus-grey-400 uppercase tracking-wide">IRM</span>
                      </div>
                    </td>
                  )}

                  <td className="py-1 px-1 text-right font-mono text-rating-c-plus bg-rating-c-plus/15">
                    {formatPercent(productiveDebtRate + tranche.borrowRate, 2)}
                  </td>

                  {/* Jr Supply, Jr Borrow, Jr Net, Free Supply - expanded only */}
                  {showFullBreakdown && (
                    <>
                      <td className="py-1 px-1 text-right font-mono text-rating-a bg-rating-a/15">
                        {formatNumber(tranche.jrSupply, 0)}
                      </td>

                      <td className="py-1 px-1 text-right font-mono text-rating-a bg-rating-a/15">
                        {formatNumber(tranche.jrBorrow, 0)}
                      </td>

                      <td className={`py-1 px-1 text-right font-mono bg-rating-a/15 ${
                        isBindingConstraint ? 'text-rating-b font-semibold' : 'text-rating-a'
                      }`}>
                        {formatNumber(tranche.jrNetSupply, 0)}
                      </td>

                      <td className="py-1 px-1 text-right font-mono text-rating-a-plus bg-rating-a-plus/15">
                        {formatNumber(tranche.freeSupply, 0)}
                      </td>
                    </>
                  )}

                  <td className="py-1 px-1 text-right font-mono text-rating-a-plus bg-rating-a-plus/15">
                    {formatNumber(tranche.availableSupply, 0)}
                  </td>

                  {/* Supply Util, Borrow Util - expanded only */}
                  {showFullBreakdown && (
                    <>
                      <td className="py-2 px-1 text-right font-mono text-lotus-purple-400 bg-lotus-purple-900/20">
                        {tranche.supplyUtilization !== null ? formatPercent(tranche.supplyUtilization, 0) : '-'}
                      </td>

                      <td className="py-2 px-1 text-right font-mono text-lotus-purple-400 bg-lotus-purple-900/20">
                        {tranche.borrowUtilization !== null ? formatPercent(tranche.borrowUtilization, 0) : '-'}
                      </td>
                    </>
                  )}

                  <td className="py-1 px-1 text-right font-mono text-lotus-purple-300 bg-lotus-purple-900/20">
                    {tranche.supplyRate !== null
                      ? formatPercent(productiveDebtRate + tranche.supplyRate, 2)
                      : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

        {/* Productive Debt Rate at bottom */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <span className="text-rating-a-plus">Productive Debt Rate (from LotusUSD):</span>
          <span className="font-mono font-semibold text-rating-a-plus">
            {formatPercent(productiveDebtRate, 2)}
          </span>
        </div>
      </div>{/* End exportable section */}

      {/* Constraint Inspector Modal */}
      {inspectedTranche !== null && (
        <TrancheConstraintInspector
          tranche={tranches[inspectedTranche]}
          allTranches={tranches}
          trancheIndex={inspectedTranche}
          onClose={() => setInspectedTranche(null)}
        />
      )}
    </div>
  );
}

export default TrancheTable;
