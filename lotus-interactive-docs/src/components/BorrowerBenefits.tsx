import { useMemo, useState, useEffect } from 'react';
import type { TrancheData } from '../types';
import { formatPercent } from '../math/lotusAccounting';
import { ContextZone } from './ContextZone';
import { InteractiveZone } from './InteractiveZone';
import { TeachingPrompt } from './TeachingPrompt';
import { content } from '../content';

const { borrowerBenefits: bbContent } = content;

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
      className={`flex items-center justify-center w-7 h-7 rounded-sm transition-colors
        ${disabled
          ? 'bg-lotus-grey-700 text-lotus-grey-500 cursor-not-allowed'
          : 'bg-lotus-grey-700 text-lotus-grey-300 hover:bg-lotus-purple-600 hover:text-white'
        }`}
      aria-label={direction === 'up' ? 'Increase' : 'Decrease'}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        {direction === 'up' ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        )}
      </svg>
    </button>
  );
}

interface BorrowerBenefitsProps {
  tranches: TrancheData[];
  productiveDebtRate: number;
}

export function BorrowerBenefits({ tranches, productiveDebtRate }: BorrowerBenefitsProps) {
  const WSTETH_PRICE = 4000;
  const collateralWstEth = 0.5;
  const [selectedLLTV, setSelectedLLTV] = useState(80);
  const [borrowAmount, setBorrowAmount] = useState(1000);
  const lltvOptions = useMemo(() => tranches.map((t) => t.lltv).sort((a, b) => a - b), [tranches]);
  const maxLLTV = lltvOptions[lltvOptions.length - 1] ?? 95;

  const collateralValue = useMemo(() => collateralWstEth * WSTETH_PRICE, [collateralWstEth]);
  const selectedMaxBorrow = useMemo(() => (collateralValue * selectedLLTV) / 100, [collateralValue, selectedLLTV]);
  const maxBorrowOverall = useMemo(() => (collateralValue * maxLLTV) / 100, [collateralValue, maxLLTV]);
  const rateColorMap = useMemo(() => {
    const sorted = [...new Set(tranches.map((t) => t.lltv))].sort((a, b) => a - b);
    const colors = [
      'text-rating-a-plus',
      'text-rating-a',
      'text-rating-b',
      'text-rating-c-plus',
      'text-rating-d',
    ];
    return new Map(sorted.map((lltv, index) => [lltv, colors[Math.min(index, colors.length - 1)]]));
  }, [tranches]);

  const borrowerLtv = collateralValue > 0 ? borrowAmount / collateralValue : 0;
  const isOverSelectedMax = borrowAmount > selectedMaxBorrow + 0.0001;

  useEffect(() => {
    if (borrowAmount > maxBorrowOverall) {
      setBorrowAmount(maxBorrowOverall);
    }
  }, [borrowAmount, maxBorrowOverall]);

  const hfClass = (hf: number) => {
    if (!Number.isFinite(hf)) return 'text-lotus-grey-400';
    if (hf < 1.05) return 'text-rating-d';
    if (hf < 1.25) return 'text-rating-c-plus';
    if (hf < 1.5) return 'text-rating-b';
    return 'text-rating-a';
  };

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════════════════
          CONTEXT ZONE - Minimal context above the fold
          ═══════════════════════════════════════════════════════════════════ */}
      <ContextZone
        context="Explore borrowing options across tranches. Higher LLTV means more leverage but higher rates — find your optimal balance."
        whatYoullLearn={['Max leverage by LLTV', 'Health factor impact', 'Liquidation thresholds']}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          INTERACTIVE ZONE - The main event
          ═══════════════════════════════════════════════════════════════════ */}
      <InteractiveZone
        tryThis={bbContent.pageHeader.tryThis}
        title="Borrowing Calculator"
      >

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-lotus-grey-900 rounded p-4 border border-lotus-grey-700 border-l-2 border-l-lotus-purple-500 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wide text-lotus-grey-400">Collateral (wstETH)</label>
                <span className="text-xs text-lotus-grey-500">Price: ${WSTETH_PRICE.toLocaleString()}</span>
              </div>
              <div className="mt-2 w-full bg-lotus-grey-800 border border-lotus-grey-700 rounded px-3 py-2 text-lg font-mono text-lotus-grey-100 flex items-center justify-between">
                <span>{collateralWstEth}</span>
                <span className="text-xs text-lotus-grey-400">fixed</span>
              </div>
              <p className="text-xs text-lotus-grey-500 mt-2">
                ≈ ${collateralValue.toLocaleString()} available collateral value.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wide text-lotus-grey-400">
                  Borrow Amount (USDC received)
                </label>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <StepperButton
                  direction="down"
                  onClick={() => setBorrowAmount(Math.max(0, borrowAmount - 100))}
                  disabled={borrowAmount <= 0}
                />
                <input
                  type="number"
                  value={borrowAmount}
                  onChange={(event) => {
                    const nextValue = Math.min(Math.max(0, Number(event.target.value)), maxBorrowOverall);
                    setBorrowAmount(nextValue);
                  }}
                  className="flex-1 bg-lotus-grey-900 border-2 border-lotus-purple-500/40 rounded-sm px-3 py-2 text-lg font-mono text-lotus-grey-100 text-center
                    hover:border-lotus-purple-400 hover:bg-lotus-grey-800
                    focus:outline-none focus:ring-2 focus:ring-lotus-purple-500/50 focus:border-lotus-purple-500 focus:bg-lotus-grey-800
                    transition-colors cursor-text"
                  min={0}
                  step={100}
                />
                <StepperButton
                  direction="up"
                  onClick={() => setBorrowAmount(Math.min(maxBorrowOverall, borrowAmount + 100))}
                  disabled={borrowAmount >= maxBorrowOverall}
                />
              </div>
              <p className={`text-xs mt-2 ${isOverSelectedMax ? 'text-rating-d' : 'text-lotus-grey-500'}`}>
                {isOverSelectedMax
                  ? bbContent.overMaxMessage(selectedLLTV)
                  : bbContent.maxBorrowMessage(selectedLLTV, selectedMaxBorrow.toLocaleString())}
              </p>
              <p className="text-xs text-lotus-grey-500 mt-1">
                {bbContent.loanDenominationNote}
              </p>
            </div>
          </div>

          <div className="bg-lotus-grey-900 rounded p-4 border border-lotus-grey-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-lotus-grey-400">Current LTV</span>
              <span className="text-lg font-mono text-lotus-grey-100">
                {formatPercent(borrowerLtv, 1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-lotus-grey-400">Selected LLTV</span>
              <span className="text-lg font-mono text-lotus-purple-300">{selectedLLTV}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-lotus-grey-400">Max Borrow (Selected)</span>
              <span className="text-lg font-mono text-rating-a">${selectedMaxBorrow.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-lotus-grey-400">Leverage at Max</span>
              <span className="text-lg font-mono text-lotus-grey-100">
                {(1 / (1 - selectedLLTV / 100)).toFixed(1)}x
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-[11px] sm:text-xs">
            <thead>
              <tr className="border-b border-lotus-grey-700 text-lotus-grey-400 uppercase tracking-wide text-[10px]">
                <th className="text-left py-2 px-2">LLTV</th>
                <th className="text-left py-2 px-2">Max Borrow</th>
                <th className="text-left py-2 px-2">Max Leverage</th>
                <th className="text-left py-2 px-2">Borrow Rate (Base + Spread)</th>
                <th className="text-left py-2 px-2">Health Factor</th>
                <th className="text-left py-2 px-2">Liq. Price (wstETH)</th>
                <th className="text-left py-2 px-2">Price Drop to Liq.</th>
              </tr>
            </thead>
            <tbody>
              {tranches.map((tranche) => {
                const maxBorrow = (collateralValue * tranche.lltv) / 100;
                const leverage = 1 / (1 - tranche.lltv / 100);
                const rate = productiveDebtRate + tranche.borrowRate;
                const hf = borrowerLtv > 0 ? (tranche.lltv / 100) / borrowerLtv : Infinity;
                const liquidationValue = borrowerLtv > 0 ? borrowAmount / (tranche.lltv / 100) : 0;
                const liquidationPrice = collateralWstEth > 0 ? liquidationValue / collateralWstEth : 0;
                const priceDropToLiq = borrowerLtv > 0
                  ? Math.max(0, (WSTETH_PRICE - liquidationPrice) / WSTETH_PRICE)
                  : null;
                const isSelectable = borrowerLtv === 0 || hf >= 1.05;
                const isSelected = tranche.lltv === selectedLLTV && isSelectable;
                const rateClass = rateColorMap.get(tranche.lltv) ?? 'text-lotus-grey-200';

                return (
                  <tr
                    key={tranche.lltv}
                    onClick={() => {
                      if (isSelectable) {
                        setSelectedLLTV(tranche.lltv);
                      }
                    }}
                    className={`border-b border-lotus-grey-700/50 transition-colors ${
                      isSelected ? 'bg-lotus-purple-900/20' : ''
                    } ${isSelectable ? 'cursor-pointer hover:bg-lotus-grey-700/30' : 'opacity-40 cursor-not-allowed'}`}
                  >
                    <td className="py-2 px-2 font-mono text-lotus-grey-200">
                      <span className="inline-flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-lotus-purple-400' : 'bg-lotus-grey-500'}`} />
                        {tranche.lltv}%
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="text-xs font-mono text-lotus-grey-100">${Math.round(maxBorrow).toLocaleString()}</div>
                    </td>
                    <td className="py-2 px-2 text-xs font-mono text-lotus-grey-200">
                      Up to {leverage.toFixed(1)}x
                    </td>
                    <td className={`py-2 px-2 text-xs font-mono ${rateClass}`}>{formatPercent(rate, 2)}</td>
                    <td className={`py-2 px-2 text-xs font-mono ${hfClass(hf)}`}>
                      {borrowerLtv > 0 ? hf.toFixed(2) : '—'}
                    </td>
                    <td className="py-2 px-2 text-xs font-mono text-lotus-grey-200">
                      {borrowerLtv > 0
                        ? `$${Math.round(liquidationPrice).toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="py-2 px-2 text-xs font-mono text-lotus-grey-200">
                      {priceDropToLiq === null ? '—' : formatPercent(priceDropToLiq, 1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-lotus-grey-400 mt-4">
          {bbContent.healthFactorNote}
        </div>
      </InteractiveZone>

      {/* Key takeaway - visible after interactive zone */}
      <TeachingPrompt title="Key takeaway:">
        {bbContent.keyTakeaway}
      </TeachingPrompt>
    </div>
  );
}

export default BorrowerBenefits;
