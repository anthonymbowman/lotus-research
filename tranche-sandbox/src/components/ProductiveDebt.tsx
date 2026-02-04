import { useMemo, useState, useRef } from 'react';
import { generateScenario2ChartData } from '../math/scenario2';
import type { ChartPoint } from '../types';
import { DefinitionBadge } from './DefinitionBadge';
import { ExportButton } from './ExportButton';
import { TeachingPrompt } from './TeachingPrompt';
import { content } from '../content';

const { productiveDebt: pdContent } = content;

interface ProductiveDebtProps {
  baseRate: number;
  spread: number;
  utilization: number;
  onSpreadChange: (value: number) => void;
  onUtilizationChange: (value: number) => void;
}

function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// ============================================
// Section 1: Intro - Three Benefits Cards
// ============================================

function IntroSection() {
  const icons = [
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>,
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>,
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>,
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">{pdContent.intro.heading}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pdContent.intro.benefits.map((benefit, i) => (
          <div
            key={i}
            className="bg-lotus-grey-800 rounded-lg p-4 border border-lotus-grey-700 hover:border-lotus-purple-500/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-lotus-purple-400">{icons[i]}</div>
              <h4 className="font-medium text-lotus-grey-100">{benefit.title}</h4>
            </div>
            <p className="text-sm text-lotus-grey-300">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Section 2: Rate Composition
// ============================================

interface RateCompositionSectionProps {
  baseRate: number;
  spread: number;
  onSpreadChange: (value: number) => void;
}

function RateCompositionSection({ baseRate, spread, onSpreadChange }: RateCompositionSectionProps) {
  const borrowRate = baseRate + spread;
  const rc = pdContent.rateComposition;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">{rc.heading}</h3>
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <p className="text-sm text-lotus-grey-300 mb-6 text-center max-w-xl mx-auto">
          {rc.description}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg px-5 py-4 text-center min-w-[140px]">
            <div className="text-xs text-emerald-400 mb-1 font-medium">{rc.baseRateLabel}</div>
            <div className="text-2xl font-mono font-semibold text-emerald-300">
              {formatPercent(baseRate)}
            </div>
            <div className="text-xs text-emerald-500 mt-1">{rc.baseRateSource}</div>
          </div>

          <div className="text-3xl font-light text-lotus-grey-600">+</div>

          <div className="bg-lotus-purple-900/30 border border-lotus-purple-700 rounded-lg px-5 py-4 text-center min-w-[140px]">
            <div className="text-xs text-lotus-purple-400 mb-1 font-medium">{rc.creditSpreadLabel}</div>
            <input
              type="number"
              value={(spread * 100).toFixed(1)}
              onChange={(e) => onSpreadChange(parseFloat(e.target.value) / 100 || 0)}
              step="0.1"
              min="0"
              max="50"
              className="w-20 text-2xl font-mono font-semibold text-lotus-purple-300 bg-transparent text-center border-b-2 border-lotus-purple-500 focus:border-lotus-purple-400 focus:outline-none"
            />
            <span className="text-2xl font-mono font-semibold text-lotus-purple-300">%</span>
            <div className="text-xs text-lotus-purple-500 mt-1">{rc.creditSpreadSource}</div>
          </div>

          <div className="text-3xl font-light text-lotus-grey-600">=</div>

          <div className="bg-lotus-grey-700 border border-lotus-grey-600 rounded-lg px-5 py-4 text-center min-w-[140px]">
            <div className="text-xs text-lotus-grey-300 mb-1 font-medium">{rc.borrowRateLabel}</div>
            <div className="text-2xl font-mono font-semibold text-lotus-grey-100">
              {formatPercent(borrowRate)}
            </div>
            <div className="text-xs text-lotus-grey-300 mt-1">{rc.borrowRateSource}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Section 3: Spread Compression
// ============================================

interface SpreadCompressionSectionProps {
  baseRate: number;
  spread: number;
  utilization: number;
  onUtilizationChange: (value: number) => void;
}

function SpreadCompressionSection({
  baseRate,
  spread,
  utilization,
  onUtilizationChange,
}: SpreadCompressionSectionProps) {
  const [lenderShare, setLenderShare] = useState(0.5);
  const [showFormulas, setShowFormulas] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const sc = pdContent.spreadCompression;

  const borrowRate = baseRate + spread;

  const borrowRateNoPD = borrowRate;
  const supplyRateNoPD = borrowRate * utilization;
  const blSpreadNoPD = borrowRate * (1 - utilization);

  const maxBorrowerAdjustment = utilization > 0 ? baseRate * (1 - utilization) / utilization : 0;
  const spreadAdj = Math.max(spread - (1 - lenderShare) * maxBorrowerAdjustment, 0);

  const borrowRatePD = baseRate + spreadAdj;
  const supplyRatePD = baseRate + spreadAdj * utilization;
  const blSpreadPD = spreadAdj * (1 - utilization);

  const borrowImprovement = borrowRateNoPD - borrowRatePD;
  const supplyImprovement = supplyRatePD - supplyRateNoPD;

  const maxRate = Math.max(borrowRateNoPD, borrowRatePD, supplyRateNoPD, supplyRatePD) * 1.1;

  // Calculate borrower share percentage
  const borrowerShare = 1 - lenderShare;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">{sc.heading}</h3>

      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        {/* Section 1: Controls (NOT exported) */}
        <div className="controls-section">
          {/* What is Spread Compression */}
          <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50 mb-6">
            <h4 className="text-sm font-medium text-lotus-purple-200 mb-2">{sc.whatIs.heading}</h4>
            <p className="text-sm text-lotus-purple-300 mb-3">
              The <strong>borrow-lend spread</strong> is the gap between what borrowers pay and what lenders earn.
              The <strong>credit spread</strong> is the additional rate set by the Interest Rate Model (IRM) on top of the base rate.
              In traditional markets, when utilization is low, this gap is large because idle capital earns nothing.
            </p>
            <h4 className="text-sm font-medium text-lotus-purple-200 mb-2">{sc.whyMatters.heading}</h4>
            <p className="text-sm text-lotus-purple-300">
              Productive debt (PD) compresses this spread by ensuring idle liquidity earns the base rate.
              This means <strong>better rates for both sides</strong>: borrowers pay less, and lenders earn more
              — especially when utilization is low.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
              <div className="flex justify-between items-center mb-2">
                <DefinitionBadge
                  label="Borrow Utilization"
                  formula="1 - (Free Supply / Jr Supply)"
                  note="This is the utilization that drives IRM rates. Higher utilization = higher borrow rates."
                  textColor="text-lotus-grey-300"
                  className="text-sm font-medium"
                />
                <span className="text-lg font-mono font-semibold text-lotus-grey-100">
                  {(utilization * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                value={utilization * 100}
                onChange={(e) => onUtilizationChange(parseFloat(e.target.value) / 100)}
                min="0"
                max="100"
                step="5"
                className="w-full"
              />
              <p className="text-xs text-lotus-grey-300 mt-2">
                {sc.utilizationNote}
              </p>
            </div>

            <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
              <h4 className="text-sm font-medium text-lotus-grey-200 mb-2">{sc.efficiencySplitLabel}</h4>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-400">Borrowers</span>
                <span className="text-sm font-medium text-lotus-grey-300">
                  {((1 - lenderShare) * 100).toFixed(0)}% / {(lenderShare * 100).toFixed(0)}%
                </span>
                <span className="text-sm font-medium text-emerald-400">Lenders</span>
              </div>
              <input
                type="range"
                value={lenderShare * 100}
                onChange={(e) => setLenderShare(parseFloat(e.target.value) / 100)}
                min="0"
                max="100"
                step="5"
                className="w-full"
              />
              <p className="text-xs text-lotus-grey-300 mt-2">
                {sc.efficiencySplitNote}
              </p>
            </div>
          </div>

          {/* 0% Utilization Explanation */}
          {utilization === 0 && (
            <div className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-700/50 mb-4">
              <p className="text-sm text-emerald-300">
                {sc.zeroUtilizationNote}
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Exportable Visual */}
        <div ref={exportRef} className="export-section bg-lotus-grey-800 rounded-lg p-6 pb-8 relative">
          {/* Export Button - top right */}
          <ExportButton targetRef={exportRef} filename="spread-compression-comparison" />

          {/* Export Title */}
          <h4 className="text-lg font-semibold text-lotus-grey-100 mb-3 text-center pr-10">
            {sc.chartTitle}
          </h4>

          {/* Input Summary Line */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-lotus-grey-300 mb-6 pb-4 border-b border-lotus-grey-700">
            <span>
              Utilization: <span className="font-mono font-medium text-lotus-grey-100">{(utilization * 100).toFixed(0)}%</span>
            </span>
            <span className="text-lotus-grey-600">|</span>
            <span>
              Borrow Rate: <span className="font-mono font-medium text-lotus-grey-100">{formatPercent(borrowRate)}</span>
            </span>
            <span className="text-lotus-grey-600">|</span>
            <span>
              Base Rate: <span className="font-mono font-medium text-lotus-grey-100">{formatPercent(baseRate)}</span>
            </span>
            <span className="text-lotus-grey-600">|</span>
            <span>
              Efficiency Split: <span className="text-lotus-grey-400">Borrowers </span><span className="font-mono font-medium text-emerald-400">{(borrowerShare * 100).toFixed(0)}%</span>
              <span className="text-lotus-grey-400"> / Lenders </span>
              <span className="font-mono font-medium text-emerald-400">{(lenderShare * 100).toFixed(0)}%</span>
            </span>
          </div>

          <div className="space-y-6">
            {/* Borrow Rate Comparison */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-lotus-grey-300">Borrow Rate</span>
                {borrowImprovement > 0.00005 && (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded">
                    {formatPercent(borrowImprovement)} savings
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {/* No PD bar */}
                {(() => {
                  const widthPercent = (borrowRateNoPD / maxRate) * 100;
                  return (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-lotus-grey-400 w-16">No PD</span>
                      <span className="text-xs font-mono text-lotus-grey-300 font-medium w-14 text-right">{formatPercent(borrowRateNoPD)}</span>
                      <div className="flex-1 h-8 bg-lotus-grey-700 rounded-lg overflow-visible relative">
                        <div
                          className="h-full bg-lotus-grey-500 rounded-lg"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
                {/* With PD bar - Split into Base Rate + Credit Spread segments */}
                {(() => {
                  const totalWidthPercent = (borrowRatePD / maxRate) * 100;
                  const baseRateProportion = baseRate / borrowRatePD;
                  const spreadProportion = spreadAdj / borrowRatePD;
                  return (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-emerald-400 w-16 font-medium">With PD</span>
                      <span className="text-xs font-mono text-emerald-400 font-medium w-14 text-right">{formatPercent(borrowRatePD)}</span>
                      <div className="flex-1 h-8 bg-emerald-900/30 rounded-lg overflow-visible relative">
                        <div className="h-full flex" style={{ width: `${totalWidthPercent}%` }}>
                          {/* Base Rate segment */}
                          <div
                            className="h-full bg-emerald-600 rounded-l-lg flex items-center justify-center"
                            style={{ width: `${baseRateProportion * 100}%` }}
                          >
                            <span className="text-[10px] font-mono text-white font-medium px-1 truncate">
                              {formatPercent(baseRate)}
                            </span>
                          </div>
                          {/* Credit Spread segment */}
                          {spreadAdj > 0 && (
                            <div
                              className="h-full bg-teal-400 rounded-r-lg flex items-center justify-center"
                              style={{ width: `${spreadProportion * 100}%` }}
                            >
                              <span className="text-[10px] font-mono text-teal-900 font-medium px-1 truncate">
                                {formatPercent(spreadAdj)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              {/* Legend for split bar */}
              <div className="flex gap-4 mt-2 ml-[124px] text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                  <span className="text-lotus-grey-300">Base Rate</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-teal-400 rounded"></div>
                  <span className="text-lotus-grey-300">Credit Spread</span>
                </div>
              </div>
            </div>

            {/* Supply Rate Comparison */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-lotus-grey-300">Supply Rate</span>
                {supplyImprovement > 0.00005 && (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded">
                    +{formatPercent(supplyImprovement)} yield
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {/* No PD bar */}
                {(() => {
                  const widthPercent = (supplyRateNoPD / maxRate) * 100;
                  return (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-lotus-grey-400 w-16">No PD</span>
                      <span className="text-xs font-mono text-lotus-grey-300 font-medium w-14 text-right">{formatPercent(supplyRateNoPD)}</span>
                      <div className="flex-1 h-8 bg-lotus-grey-700 rounded-lg overflow-visible relative">
                        <div
                          className="h-full bg-lotus-grey-500 rounded-lg"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
                {/* With PD bar */}
                {(() => {
                  const widthPercent = (supplyRatePD / maxRate) * 100;
                  return (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-emerald-400 w-16 font-medium">With PD</span>
                      <span className="text-xs font-mono text-emerald-400 font-medium w-14 text-right">{formatPercent(supplyRatePD)}</span>
                      <div className="flex-1 h-8 bg-emerald-900/30 rounded-lg overflow-visible relative">
                        <div
                          className="h-full bg-emerald-500 rounded-lg"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Borrow-Lend Spread Comparison */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-lotus-grey-300">Borrow-Lend Spread</span>
                <span className="text-xs text-lotus-grey-300">(inefficiency in the market)</span>
              </div>
              <div className="space-y-2">
                {/* No PD bar */}
                {(() => {
                  const widthPercent = (blSpreadNoPD / maxRate) * 100;
                  return (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-lotus-grey-400 w-16">No PD</span>
                      <span className="text-xs font-mono text-lotus-grey-300 font-medium w-14 text-right">{formatPercent(blSpreadNoPD)}</span>
                      <div className="flex-1 h-8 bg-lotus-grey-700 rounded-lg overflow-visible relative">
                        <div
                          className="h-full bg-lotus-grey-500 rounded-lg"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
                {/* With PD bar */}
                {(() => {
                  const widthPercent = (blSpreadPD / maxRate) * 100;
                  return (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-emerald-400 w-16 font-medium">With PD</span>
                      <span className="text-xs font-mono text-emerald-400 font-medium w-14 text-right">{formatPercent(blSpreadPD)}</span>
                      <div className="flex-1 h-8 bg-emerald-900/30 rounded-lg overflow-visible relative">
                        <div
                          className="h-full bg-emerald-500 rounded-lg"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Efficiency Multiple */}
          {blSpreadNoPD > 0 && (
            <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-emerald-300">{sc.spreadEfficiency.label}</span>
                  <p className="text-xs text-emerald-200/70 mt-0.5">{sc.spreadEfficiency.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-mono font-bold text-emerald-400">
                    {blSpreadPD > 0 ? `${(blSpreadNoPD / blSpreadPD).toFixed(1)}x` : '∞'}
                  </span>
                  <span className="text-sm text-emerald-300 ml-2">tighter</span>
                  <div className="text-xs text-emerald-400 mt-1">
                    ↓ {formatPercent(blSpreadNoPD - blSpreadPD)} spread reduction
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Formulas toggle (outside exportable section) */}
        <div className="mt-6 border-t border-lotus-grey-700 pt-4">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="flex items-center gap-2 text-sm text-lotus-grey-300 hover:text-lotus-grey-300"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showFormulas ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showFormulas ? 'Hide formulas' : 'Show formulas'}
          </button>
          {showFormulas && (
            <div className="mt-3 p-3 bg-lotus-grey-900 rounded-lg text-sm font-mono">
              <p className="text-emerald-400">
                <span className="text-emerald-300">Supply Rate (with PD)</span> = Base Rate + (Spread × Utilization)
              </p>
              <p className="text-lotus-grey-300 mt-1">
                <span className="text-lotus-grey-300">Supply Rate (no PD)</span> = Borrow Rate × Utilization
              </p>
              <p className="text-lotus-grey-300 mt-2">
                <span className="text-lotus-grey-300">B-L Spread</span> = Borrow Rate − Supply Rate
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Section 4: Volatility Reduction (Exported for Advanced section)
// ============================================

export interface VolatilityReductionSectionProps {
  baseRate: number;
  spread: number;
}

export function VolatilityReductionSection({ baseRate, spread }: VolatilityReductionSectionProps) {
  const [showFormulas, setShowFormulas] = useState(false);
  const borrowRate = baseRate + spread;
  const vr = pdContent.volatilityReduction;

  const chartData = useMemo(
    () => generateScenario2ChartData(borrowRate, baseRate),
    [borrowRate, baseRate]
  );

  const withPD = {
    u0: baseRate + spread * 0.25,
    u90: baseRate + spread,
    u100: baseRate + spread * 4,
  };
  const withoutPD = {
    u0: borrowRate * 0.25,
    u90: borrowRate,
    u100: borrowRate * 4,
  };

  const pdRange = withPD.u100 - withPD.u0;
  const noPdRange = withoutPD.u100 - withoutPD.u0;
  const volatilityReduction = noPdRange > 0 ? ((noPdRange - pdRange) / noPdRange) * 100 : 0;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">{vr.heading}</h3>

      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <div className="bg-lotus-purple-900/20 rounded-lg p-3 border border-lotus-purple-700/50 mb-6">
          <p className="text-sm text-lotus-purple-200">
            {vr.description}
          </p>
        </div>

        <BorrowRateChart data={chartData} baseRate={baseRate} spread={spread} />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 text-center border border-lotus-grey-600">
            <div className="text-xs text-lotus-grey-300 uppercase tracking-wide mb-1">{vr.withoutPdRange}</div>
            <div className="text-xl font-mono font-semibold text-lotus-grey-300">
              {formatPercent(withoutPD.u0)} — {formatPercent(withoutPD.u100)}
            </div>
            <div className="text-xs text-lotus-grey-300 mt-1">Δ {formatPercent(noPdRange)}</div>
          </div>
          <div className="bg-orange-900/30 rounded-lg p-4 text-center border border-orange-700">
            <div className="text-xs text-orange-400 uppercase tracking-wide mb-1">{vr.withPdRange}</div>
            <div className="text-xl font-mono font-semibold text-orange-300">
              {formatPercent(withPD.u0)} — {formatPercent(withPD.u100)}
            </div>
            <div className="text-xs text-orange-500 mt-1">Δ {formatPercent(pdRange)}</div>
          </div>
          <div className="bg-emerald-900/30 rounded-lg p-4 text-center border border-emerald-700">
            <div className="text-xs text-emerald-400 uppercase tracking-wide mb-1">{vr.volatilityReduced}</div>
            <div className="text-xl font-mono font-semibold text-emerald-300">
              {volatilityReduction.toFixed(0)}%
            </div>
            <div className="text-xs text-emerald-500 mt-1">{vr.volatilityReducedNote}</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lotus-grey-300">0% util:</span>
            <span className="font-mono text-orange-400">{formatPercent(withPD.u0)}</span>
            <span className="text-lotus-grey-600">vs</span>
            <span className="font-mono text-lotus-grey-300">{formatPercent(withoutPD.u0)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-lotus-grey-700 rounded-full">
            <span className="text-lotus-grey-300 font-medium">90% util:</span>
            <span className="font-mono text-lotus-grey-100">{formatPercent(borrowRate)}</span>
            <span className="text-xs text-lotus-grey-300">(equal)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lotus-grey-300">100% util:</span>
            <span className="font-mono text-orange-400">{formatPercent(withPD.u100)}</span>
            <span className="text-lotus-grey-600">vs</span>
            <span className="font-mono text-lotus-grey-300">{formatPercent(withoutPD.u100)}</span>
          </div>
        </div>

        <div className="mt-6 border-t border-lotus-grey-700 pt-4">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="flex items-center gap-2 text-sm text-lotus-grey-300 hover:text-lotus-grey-300"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showFormulas ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showFormulas ? 'Hide formulas' : 'Show formulas'}
          </button>
          {showFormulas && (
            <div className="mt-3 p-3 bg-lotus-grey-900 rounded-lg text-sm font-mono space-y-2">
              <p className="text-orange-400">
                With PD: Rate = Base + Spread × factor(u) = {formatPercent(baseRate)} + {formatPercent(spread)} × factor
              </p>
              <p className="text-lotus-grey-300">
                Without PD: Rate = BorrowRate × factor(u) = {formatPercent(borrowRate)} × factor
              </p>
              <p className="text-lotus-grey-600 text-xs mt-2">
                factor(u): 0.25× at 0%, 1× at 90%, 4× at 100%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Borrow Rate Chart Component
// ============================================

interface BorrowRateChartProps {
  data: ChartPoint[];
  baseRate: number;
  spread: number;
}

function BorrowRateChart({ data, baseRate, spread }: BorrowRateChartProps) {
  const width = 560;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 45, left: 55 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  let maxRate = 0;
  for (const point of data) {
    if (point.borrowPD !== undefined) maxRate = Math.max(maxRate, point.borrowPD);
    if (point.borrowNoPD !== undefined) maxRate = Math.max(maxRate, point.borrowNoPD);
  }
  maxRate = Math.ceil(maxRate * 100) / 100;
  if (maxRate === 0) maxRate = 0.2;

  const xScale = (u: number) => padding.left + u * chartWidth;
  const yScale = (rate: number) => padding.top + chartHeight - (rate / maxRate) * chartHeight;

  const generatePath = (getValue: (p: ChartPoint) => number | undefined) => {
    const points = data
      .filter((p) => getValue(p) !== undefined)
      .map((p) => `${xScale(p.utilization)},${yScale(getValue(p)!)}`);
    return `M${points.join(' L')}`;
  };

  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount }, (_, i) => (maxRate * i) / (yTickCount - 1));
  const xTicks = [0, 0.25, 0.5, 0.75, 0.9, 1];
  const borrowRateAt90 = baseRate + spread;

  return (
    <div className="bg-lotus-grey-900 rounded-xl p-4 border border-lotus-grey-700">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto max-w-[680px] mx-auto block overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect
          x={padding.left}
          y={padding.top}
          width={chartWidth}
          height={chartHeight}
          fill="#191621"
          rx="4"
        />

        {yTicks.map((tick, i) => (
          <line
            key={`y-grid-${i}`}
            x1={padding.left}
            y1={yScale(tick)}
            x2={width - padding.right}
            y2={yScale(tick)}
            stroke="#27232F"
            strokeWidth="1"
          />
        ))}

        <line
          x1={xScale(0.9)}
          y1={padding.top}
          x2={xScale(0.9)}
          y2={height - padding.bottom}
          stroke="#454052"
          strokeWidth="1"
          strokeDasharray="4,4"
        />

        <rect
          x={padding.left}
          y={yScale(baseRate)}
          width={chartWidth}
          height={chartHeight - (chartHeight - (baseRate / maxRate) * chartHeight)}
          fill="#10b981"
          opacity="0.1"
        />
        <line
          x1={padding.left}
          y1={yScale(baseRate)}
          x2={width - padding.right}
          y2={yScale(baseRate)}
          stroke="#10b981"
          strokeWidth="1.5"
          strokeDasharray="3,3"
          opacity="0.6"
        />

        <path
          d={generatePath((p) => p.borrowNoPD)}
          fill="none"
          stroke="#736D7F"
          strokeWidth="2"
          strokeDasharray="6,4"
        />

        <path
          d={generatePath((p) => p.borrowPD)}
          fill="none"
          stroke="#f97316"
          strokeWidth="2.5"
        />

        <circle
          cx={xScale(0.9)}
          cy={yScale(borrowRateAt90)}
          r="4"
          fill="#f97316"
          stroke="#191621"
          strokeWidth="2"
        />

        {yTicks.map((tick, i) => (
          <text
            key={`y-label-${i}`}
            x={padding.left - 8}
            y={yScale(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-xs fill-lotus-grey-500"
          >
            {(tick * 100).toFixed(0)}%
          </text>
        ))}

        {xTicks.map((tick, i) => (
          <text
            key={`x-label-${i}`}
            x={xScale(tick)}
            y={height - padding.bottom + 16}
            textAnchor="middle"
            className={`text-xs ${tick === 0.9 ? 'fill-lotus-grey-300 font-medium' : 'fill-lotus-grey-500'}`}
          >
            {(tick * 100).toFixed(0)}%
          </text>
        ))}

        <text
          x={width / 2}
          y={height - 6}
          textAnchor="middle"
          className="text-xs fill-lotus-grey-500"
        >
          Utilization
        </text>
        <text
          x={14}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 14, ${height / 2})`}
          className="text-xs fill-lotus-grey-500"
        >
          Borrow Rate
        </text>

        <text
          x={width - padding.right - 4}
          y={yScale(baseRate) - 6}
          textAnchor="end"
          className="text-xs fill-emerald-400 font-medium"
        >
          Base {formatPercent(baseRate)}
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 bg-orange-500 rounded"></div>
          <span className="text-lotus-grey-300">With PD</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="20" height="2">
            <line x1="0" y1="1" x2="20" y2="1" stroke="#736D7F" strokeWidth="2" strokeDasharray="4,2" />
          </svg>
          <span className="text-lotus-grey-300">Without PD</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="20" height="2">
            <line x1="0" y1="1" x2="20" y2="1" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
          </svg>
          <span className="text-emerald-400">Base Rate</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ProductiveDebt({
  baseRate,
  spread,
  utilization,
  onSpreadChange,
  onUtilizationChange,
}: ProductiveDebtProps) {
  return (
    <div className="space-y-8">
      <IntroSection />
      <RateCompositionSection
        baseRate={baseRate}
        spread={spread}
        onSpreadChange={onSpreadChange}
      />
      <SpreadCompressionSection
        baseRate={baseRate}
        spread={spread}
        utilization={utilization}
        onUtilizationChange={onUtilizationChange}
      />
      <TeachingPrompt title="Key takeaway:">
        {pdContent.keyTakeaway}
      </TeachingPrompt>
    </div>
  );
}
