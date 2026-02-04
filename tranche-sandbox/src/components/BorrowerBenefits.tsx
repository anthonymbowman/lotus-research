import { useMemo, useState, useEffect } from 'react';
import type { TrancheData } from '../types';
import { formatPercent } from '../math/lotusAccounting';
import { PageHeader } from './PageHeader';
import { TeachingPrompt } from './TeachingPrompt';

interface BorrowerBenefitsProps {
  tranches: TrancheData[];
  productiveDebtRate: number;
}

export function BorrowerBenefits({ tranches, productiveDebtRate }: BorrowerBenefitsProps) {
  const WSTETH_PRICE = 4000;
  const collateralWstEth = 0.5;
  const [selectedLLTV, setSelectedLLTV] = useState(80);
  const [borrowAmount, setBorrowAmount] = useState(1000);
  const [inflectionLtv, setInflectionLtv] = useState(85);

  const lltvOptions = useMemo(() => tranches.map((t) => t.lltv).sort((a, b) => a - b), [tranches]);
  const maxLLTV = lltvOptions[lltvOptions.length - 1] ?? 95;

  const collateralValue = useMemo(() => collateralWstEth * WSTETH_PRICE, [collateralWstEth]);
  const selectedMaxBorrow = useMemo(() => (collateralValue * selectedLLTV) / 100, [collateralValue, selectedLLTV]);
  const maxBorrowOverall = useMemo(() => (collateralValue * maxLLTV) / 100, [collateralValue, maxLLTV]);
  const rateColorMap = useMemo(() => {
    const sorted = [...new Set(tranches.map((t) => t.lltv))].sort((a, b) => a - b);
    const colors = [
      'text-emerald-300',
      'text-emerald-400',
      'text-amber-400',
      'text-orange-400',
      'text-red-400',
    ];
    return new Map(sorted.map((lltv, index) => [lltv, colors[Math.min(index, colors.length - 1)]]));
  }, [tranches]);

  const borrowerLtv = collateralValue > 0 ? borrowAmount / collateralValue : 0;
  const borrowerLtvPct = borrowerLtv * 100;
  const isOverSelectedMax = borrowAmount > selectedMaxBorrow + 0.0001;

  useEffect(() => {
    if (borrowAmount > maxBorrowOverall) {
      setBorrowAmount(maxBorrowOverall);
    }
  }, [borrowAmount, maxBorrowOverall]);

  const hfClass = (hf: number) => {
    if (!Number.isFinite(hf)) return 'text-lotus-grey-400';
    if (hf < 1.05) return 'text-red-400';
    if (hf < 1.25) return 'text-orange-400';
    if (hf < 1.5) return 'text-amber-300';
    return 'text-emerald-300';
  };

  const chartMinLtv = 60;
  const chartMaxLtv = 95;
  const chartWidth = 360;
  const chartHeight = 140;

  const riskY = (ltv: number, inflection: number) => {
    if (ltv <= inflection) {
      return 0.15 * (ltv / inflection);
    }
    const excess = (ltv - inflection) / (chartMaxLtv - inflection);
    return 0.15 + excess * 0.85;
  };

  const chartX = (ltv: number) =>
    ((ltv - chartMinLtv) / (chartMaxLtv - chartMinLtv)) * chartWidth;
  const chartY = (risk: number) => chartHeight - risk * chartHeight;

  const curvePoints = (() => {
    const pts: string[] = [];
    for (let ltv = chartMinLtv; ltv <= chartMaxLtv; ltv += 1) {
      const x = chartX(ltv);
      const y = chartY(riskY(ltv, inflectionLtv));
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  })();

  const borrowerMarkerLtv = Math.min(Math.max(borrowerLtvPct, chartMinLtv), chartMaxLtv);
  const borrowerMarkerX = chartX(borrowerMarkerLtv);
  const borrowerMarkerY = chartY(riskY(borrowerMarkerLtv, inflectionLtv));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Borrower Outcomes"
        whatYoullLearn={[
          'How higher LLTV unlocks more borrowing power',
          'Why senior borrowers access deeper liquidity',
          'How to choose a tranche for your borrowing goals',
        ]}
        tryThis="Adjust your borrow amount and compare outcomes across tranches."
      />

      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-lotus-grey-100 mb-2">Borrow Experience</h3>
          <p className="text-sm text-lotus-grey-300">
            Higher LLTV tranches unlock more borrowing power. Senior borrowers can access deeper liquidity because
            junior supply cascades upward.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-lotus-grey-900/60 rounded-lg p-4 border border-lotus-grey-700 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wide text-lotus-grey-400">Collateral (wstETH)</label>
                <span className="text-xs text-lotus-grey-500">Price: ${WSTETH_PRICE.toLocaleString()}</span>
              </div>
              <div className="mt-2 w-full bg-lotus-grey-800 border border-lotus-grey-600 rounded-lg px-3 py-2 text-lg font-mono text-lotus-grey-100 flex items-center justify-between">
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
              <input
                type="number"
                value={borrowAmount}
                onChange={(event) => {
                  const nextValue = Math.min(Math.max(0, Number(event.target.value)), maxBorrowOverall);
                  setBorrowAmount(nextValue);
                }}
                className="mt-2 w-full bg-lotus-grey-800 border border-lotus-grey-600 rounded-lg px-3 py-2 text-lg font-mono text-lotus-grey-100"
                min={0}
                step={100}
              />
              <p className={`text-xs mt-2 ${isOverSelectedMax ? 'text-red-400' : 'text-lotus-grey-500'}`}>
                {isOverSelectedMax
                  ? `Over the max borrow for ${selectedLLTV}% LLTV. Choose a higher LLTV or reduce borrow.`
                  : `Max borrow at ${selectedLLTV}% LLTV: $${selectedMaxBorrow.toLocaleString()}`}
              </p>
              <p className="text-xs text-lotus-grey-500 mt-1">
                Loan balances are denominated in LotusUSD. USDC conversion happens automatically.
              </p>
            </div>
          </div>

          <div className="bg-lotus-grey-900/60 rounded-lg p-4 border border-lotus-grey-700 space-y-3">
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
              <span className="text-lg font-mono text-emerald-300">${selectedMaxBorrow.toLocaleString()}</span>
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
          <table className="w-full min-w-[760px] text-[11px] sm:text-xs">
            <thead>
              <tr className="border-b border-lotus-grey-700 text-lotus-grey-400 uppercase tracking-wide text-[10px]">
                <th className="text-left py-2 px-2">LLTV</th>
                <th className="text-left py-2 px-2">Max Borrow</th>
                <th className="text-left py-2 px-2">Max Leverage</th>
                <th className="text-left py-2 px-2">Borrow Rate (Base + Spread)</th>
                <th className="text-left py-2 px-2">Health Factor</th>
                <th className="text-left py-2 px-2">Liq. Price (wstETH)</th>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-lotus-grey-400">
          Tranches that would put your health factor below 1.05 are disabled. In this simulator, health factor below
          1.0 means LTV exceeds the tranche LLTV (liquidation threshold); 1.05 is a safety buffer.
        </div>

        <div className="bg-lotus-grey-900/60 rounded-lg p-5 border border-lotus-grey-700 space-y-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-lotus-grey-100">Rate Stability Explorer</h4>
            <p className="text-xs text-lotus-grey-400">
              Productive debt anchors the base rate. Utilization shifts the credit spread, and higher LLTV tranches
              generally face higher borrow rates. This chart is a simplified, illustrative view of how risk premium
              can steepen as LLTV rises.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-lotus-grey-400">
                <span>Risk threshold (illustrative)</span>
                <span className="font-mono text-lotus-grey-100">{inflectionLtv}% LLTV</span>
              </div>
              <input
                type="range"
                min={80}
                max={90}
                step={1}
                value={inflectionLtv}
                onChange={(event) => setInflectionLtv(Number(event.target.value))}
                className="w-full accent-lotus-purple-400"
              />
              <div className="flex items-center justify-between text-[10px] text-lotus-grey-500">
                <span>Lower threshold → steeper sooner</span>
                <span>Higher threshold → steeper later</span>
              </div>
              <div className="flex items-center justify-between text-xs text-lotus-grey-400 pt-2">
                <span>Your LTV (from inputs)</span>
                <span className="font-mono text-lotus-grey-100">{borrowerLtvPct.toFixed(1)}%</span>
              </div>
            </div>

            <div className="bg-lotus-grey-900 rounded-lg border border-lotus-grey-700 p-3">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36">
                <rect
                  x={chartX(80)}
                  y={0}
                  width={chartX(90) - chartX(80)}
                  height={chartHeight}
                  fill="rgba(124, 90, 255, 0.08)"
                />
                <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="rgba(148, 163, 184, 0.25)" strokeWidth={1} />
                <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="rgba(148, 163, 184, 0.25)" strokeWidth={1} />
                <line
                  x1={chartX(inflectionLtv)}
                  y1={0}
                  x2={chartX(inflectionLtv)}
                  y2={chartHeight}
                  stroke="rgba(244, 114, 182, 0.7)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <polyline
                  points={curvePoints}
                  fill="none"
                  stroke="rgba(52, 211, 153, 0.9)"
                  strokeWidth={2.5}
                />
                <line
                  x1={borrowerMarkerX}
                  y1={borrowerMarkerY}
                  x2={borrowerMarkerX}
                  y2={chartHeight}
                  stroke="rgba(248, 250, 252, 0.5)"
                  strokeDasharray="3 3"
                />
                <circle cx={borrowerMarkerX} cy={borrowerMarkerY} r={4} fill="rgba(248, 250, 252, 0.9)" />
              </svg>
              <div className="flex justify-between text-[10px] text-lotus-grey-500 mt-2">
                <span>60% LLTV</span>
                <span>95% LLTV</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-lotus-grey-500">
            The curve shows a simplified risk-premium shape by LLTV. Moving the threshold shifts where rates start to
            rise faster in this illustration.
          </div>
        </div>

      </div>

      <TeachingPrompt title="Key takeaway:">
        Borrowing at lower LLTV generally means lower rates and more room before liquidation; your total rate still
        moves with utilization (base + spread).
      </TeachingPrompt>
    </div>
  );
}

export default BorrowerBenefits;
