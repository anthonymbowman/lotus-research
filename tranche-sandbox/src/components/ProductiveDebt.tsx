import { useMemo, useState } from 'react';
import { generateScenario2ChartData } from '../math/scenario2';
import type { ChartPoint } from '../types';

interface ProductiveDebtProps {
  baseRate: number;
  spread: number;
  utilization: number;
  onSpreadChange: (value: number) => void;
  onUtilizationChange: (value: number) => void;
}

/**
 * Format a decimal as a percentage string
 */
function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// ============================================
// Section 1: Intro - Three Benefits Cards
// ============================================

function IntroSection() {
  const benefits = [
    {
      title: 'Minimum Rate for Lenders',
      description: 'Lenders earn at least the base rate from productive assets, even when utilization is low.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: 'Spread Compression',
      description: 'The wedge between borrow and supply rates narrows, creating a more efficient market.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      title: 'Volatility Reduction',
      description: 'The IRM only prices the spread, not the base rate — resulting in smaller rate swings.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Benefits of Productive Debt</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {benefits.map((benefit, i) => (
          <div
            key={i}
            className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-indigo-600">{benefit.icon}</div>
              <h3 className="font-medium text-slate-800">{benefit.title}</h3>
            </div>
            <p className="text-sm text-slate-600">{benefit.description}</p>
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

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Borrow Rate Composition</h2>
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <p className="text-sm text-slate-600 mb-6 text-center max-w-xl mx-auto">
          With productive debt, the borrow rate decomposes into a base component (from productive assets)
          plus a spread component (set by the market).
        </p>

        {/* Equation Display with integrated input */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-4 text-center min-w-[140px]">
            <div className="text-xs text-emerald-600 mb-1 font-medium">Base Rate</div>
            <div className="text-2xl font-mono font-semibold text-emerald-700">
              {formatPercent(baseRate)}
            </div>
            <div className="text-xs text-emerald-500 mt-1">from LotusUSD</div>
          </div>

          <div className="text-3xl font-light text-slate-300">+</div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-5 py-4 text-center min-w-[140px]">
            <div className="text-xs text-indigo-600 mb-1 font-medium">Spread</div>
            <input
              type="number"
              value={(spread * 100).toFixed(1)}
              onChange={(e) => onSpreadChange(parseFloat(e.target.value) / 100 || 0)}
              step="0.1"
              min="0"
              max="50"
              className="w-20 text-2xl font-mono font-semibold text-indigo-700 bg-transparent text-center border-b-2 border-indigo-300 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-2xl font-mono font-semibold text-indigo-700">%</span>
            <div className="text-xs text-indigo-500 mt-1">market-determined</div>
          </div>

          <div className="text-3xl font-light text-slate-300">=</div>

          <div className="bg-slate-100 border border-slate-300 rounded-lg px-5 py-4 text-center min-w-[140px]">
            <div className="text-xs text-slate-600 mb-1 font-medium">Borrow Rate</div>
            <div className="text-2xl font-mono font-semibold text-slate-800">
              {formatPercent(borrowRate)}
            </div>
            <div className="text-xs text-slate-500 mt-1">total rate</div>
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
  const [lenderShare, setLenderShare] = useState(0.5); // 50% default
  const [showFormulas, setShowFormulas] = useState(false);

  const borrowRate = baseRate + spread;

  // Without PD (baseline)
  const borrowRateNoPD = borrowRate;
  const supplyRateNoPD = borrowRate * utilization;
  const blSpreadNoPD = borrowRate * (1 - utilization);

  // With PD: the spread adjusts based on benefit distribution
  const maxBorrowerAdjustment = utilization > 0 ? baseRate * (1 - utilization) / utilization : 0;
  const spreadAdj = Math.max(spread - (1 - lenderShare) * maxBorrowerAdjustment, 0);

  // With PD rates (using adjusted spread)
  const borrowRatePD = baseRate + spreadAdj;
  const supplyRatePD = baseRate + spreadAdj * utilization;
  const blSpreadPD = spreadAdj * (1 - utilization);

  // Improvements
  const borrowImprovement = borrowRateNoPD - borrowRatePD;
  const supplyImprovement = supplyRatePD - supplyRateNoPD;

  // Max rate for visualization scaling
  const maxRate = Math.max(borrowRateNoPD, borrowRatePD, supplyRateNoPD, supplyRatePD) * 1.1;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Spread Compression</h2>

      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100 mb-6">
          <p className="text-sm text-indigo-800">
            Productive debt lets idle liquidity earn the base rate, so lenders don't rely entirely on
            utilization to earn yield. This compresses the borrow-lend spread.
          </p>
        </div>

        {/* Two Sliders Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Utilization Slider */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Utilization</span>
              <span className="text-lg font-mono font-semibold text-slate-800">
                {(utilization * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              value={utilization * 100}
              onChange={(e) => onUtilizationChange(parseFloat(e.target.value) / 100)}
              min="10"
              max="100"
              step="5"
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
            />
            <p className="text-xs text-slate-500 mt-2">
              Lower utilization = bigger PD advantage. At low utilization, traditional markets pay lenders very little, but PD guarantees the base rate.
            </p>
          </div>

          {/* Benefit Distribution Slider */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-600">Borrowers</span>
              <span className="text-sm font-medium text-slate-600">
                {((1 - lenderShare) * 100).toFixed(0)}% / {(lenderShare * 100).toFixed(0)}%
              </span>
              <span className="text-sm font-medium text-emerald-600">Lenders</span>
            </div>
            <input
              type="range"
              value={lenderShare * 100}
              onChange={(e) => setLenderShare(parseFloat(e.target.value) / 100)}
              min="0"
              max="100"
              step="5"
              className="w-full h-2 bg-gradient-to-r from-blue-200 via-slate-200 to-emerald-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-2">
              How efficiency gains are distributed between borrowers (lower rates) and lenders (higher yields).
            </p>
          </div>
        </div>

        {/* Visual Rate Comparison */}
        <div className="space-y-6">
          {/* Borrow Rate Comparison */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Borrow Rate</span>
              {borrowImprovement > 0.00005 && (
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {formatPercent(borrowImprovement)} savings
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-16">No PD</span>
                <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-slate-400 rounded-lg flex items-center justify-end pr-2"
                    style={{ width: `${(borrowRateNoPD / maxRate) * 100}%` }}
                  >
                    <span className="text-xs font-mono text-white font-medium">{formatPercent(borrowRateNoPD)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-blue-600 w-16 font-medium">With PD</span>
                <div className="flex-1 h-8 bg-blue-50 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-blue-500 rounded-lg flex items-center justify-end pr-2"
                    style={{ width: `${(borrowRatePD / maxRate) * 100}%` }}
                  >
                    <span className="text-xs font-mono text-white font-medium">{formatPercent(borrowRatePD)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supply Rate Comparison */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Supply Rate</span>
              {supplyImprovement > 0.00005 && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  +{formatPercent(supplyImprovement)} yield
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-16">No PD</span>
                <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-slate-400 rounded-lg flex items-center justify-end pr-2"
                    style={{ width: `${(supplyRateNoPD / maxRate) * 100}%` }}
                  >
                    <span className="text-xs font-mono text-white font-medium">{formatPercent(supplyRateNoPD)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-600 w-16 font-medium">With PD</span>
                <div className="flex-1 h-8 bg-emerald-50 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-emerald-500 rounded-lg flex items-center justify-end pr-2"
                    style={{ width: `${(supplyRatePD / maxRate) * 100}%` }}
                  >
                    <span className="text-xs font-mono text-white font-medium">{formatPercent(supplyRatePD)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Borrow-Lend Spread Comparison */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Borrow-Lend Spread</span>
              <span className="text-xs text-slate-500">(inefficiency in the market)</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-16">No PD</span>
                <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-red-400 rounded-lg flex items-center justify-end pr-2"
                    style={{ width: `${(blSpreadNoPD / maxRate) * 100}%` }}
                  >
                    <span className="text-xs font-mono text-white font-medium">{formatPercent(blSpreadNoPD)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-600 w-16 font-medium">With PD</span>
                <div className="flex-1 h-8 bg-emerald-50 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-emerald-400 rounded-lg flex items-center justify-end pr-2"
                    style={{ width: `${(blSpreadPD / maxRate) * 100}%` }}
                  >
                    <span className="text-xs font-mono text-white font-medium">{formatPercent(blSpreadPD)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Formulas */}
        <div className="mt-6 border-t border-slate-200 pt-4">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
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
            <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm font-mono">
              <p className="text-slate-700">
                <span className="text-emerald-600">Supply Rate (with PD)</span> = Base Rate + (Spread × Utilization)
              </p>
              <p className="text-slate-500 mt-1">
                <span className="text-slate-400">Supply Rate (no PD)</span> = Borrow Rate × Utilization
              </p>
              <p className="text-slate-500 mt-2">
                <span className="text-slate-400">B-L Spread</span> = Borrow Rate − Supply Rate
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Section 4: Volatility Reduction
// ============================================

interface VolatilityReductionSectionProps {
  baseRate: number;
  spread: number;
}

function VolatilityReductionSection({ baseRate, spread }: VolatilityReductionSectionProps) {
  const [showFormulas, setShowFormulas] = useState(false);
  const borrowRate = baseRate + spread;

  const chartData = useMemo(
    () => generateScenario2ChartData(borrowRate, baseRate),
    [borrowRate, baseRate]
  );

  // Key points for display
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

  // Calculate volatility range (difference between min and max)
  const pdRange = withPD.u100 - withPD.u0;
  const noPdRange = withoutPD.u100 - withoutPD.u0;
  const volatilityReduction = noPdRange > 0 ? ((noPdRange - pdRange) / noPdRange) * 100 : 0;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Volatility Reduction</h2>

      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100 mb-6">
          <p className="text-sm text-indigo-800">
            The IRM only prices the <strong>spread</strong>, not the base rate. This means rate swings
            are proportionally smaller with productive debt.
          </p>
        </div>

        {/* Chart - Main Focus */}
        <BorrowRateChart data={chartData} baseRate={baseRate} spread={spread} />

        {/* Rate Range Comparison */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Without PD Range</div>
            <div className="text-xl font-mono font-semibold text-slate-600">
              {formatPercent(withoutPD.u0)} — {formatPercent(withoutPD.u100)}
            </div>
            <div className="text-xs text-slate-400 mt-1">Δ {formatPercent(noPdRange)}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-200">
            <div className="text-xs text-orange-600 uppercase tracking-wide mb-1">With PD Range</div>
            <div className="text-xl font-mono font-semibold text-orange-600">
              {formatPercent(withPD.u0)} — {formatPercent(withPD.u100)}
            </div>
            <div className="text-xs text-orange-400 mt-1">Δ {formatPercent(pdRange)}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-200">
            <div className="text-xs text-emerald-600 uppercase tracking-wide mb-1">Volatility Reduced</div>
            <div className="text-xl font-mono font-semibold text-emerald-600">
              {volatilityReduction.toFixed(0)}%
            </div>
            <div className="text-xs text-emerald-400 mt-1">smaller rate swings</div>
          </div>
        </div>

        {/* Compact Key Points */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">0% util:</span>
            <span className="font-mono text-orange-600">{formatPercent(withPD.u0)}</span>
            <span className="text-slate-300">vs</span>
            <span className="font-mono text-slate-400">{formatPercent(withoutPD.u0)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
            <span className="text-slate-600 font-medium">90% util:</span>
            <span className="font-mono text-slate-700">{formatPercent(borrowRate)}</span>
            <span className="text-xs text-slate-400">(equal)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">100% util:</span>
            <span className="font-mono text-orange-600">{formatPercent(withPD.u100)}</span>
            <span className="text-slate-300">vs</span>
            <span className="font-mono text-slate-400">{formatPercent(withoutPD.u100)}</span>
          </div>
        </div>

        {/* Expandable Formulas */}
        <div className="mt-6 border-t border-slate-200 pt-4">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
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
            <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm font-mono space-y-2">
              <p className="text-orange-600">
                With PD: Rate = Base + Spread × factor(u) = {formatPercent(baseRate)} + {formatPercent(spread)} × factor
              </p>
              <p className="text-slate-500">
                Without PD: Rate = BorrowRate × factor(u) = {formatPercent(borrowRate)} × factor
              </p>
              <p className="text-slate-400 text-xs mt-2">
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

  // Calculate max rate for y-axis scale
  let maxRate = 0;
  for (const point of data) {
    if (point.borrowPD !== undefined) maxRate = Math.max(maxRate, point.borrowPD);
    if (point.borrowNoPD !== undefined) maxRate = Math.max(maxRate, point.borrowNoPD);
  }
  maxRate = Math.ceil(maxRate * 100) / 100;
  if (maxRate === 0) maxRate = 0.2;

  // Scale functions
  const xScale = (u: number) => padding.left + u * chartWidth;
  const yScale = (rate: number) => padding.top + chartHeight - (rate / maxRate) * chartHeight;

  // Generate path data
  const generatePath = (getValue: (p: ChartPoint) => number | undefined) => {
    const points = data
      .filter((p) => getValue(p) !== undefined)
      .map((p) => `${xScale(p.utilization)},${yScale(getValue(p)!)}`);
    return `M${points.join(' L')}`;
  };

  // Y-axis ticks - nice round numbers
  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount }, (_, i) => (maxRate * i) / (yTickCount - 1));

  // X-axis ticks
  const xTicks = [0, 0.25, 0.5, 0.75, 0.9, 1];

  // Intersection point at 90%
  const borrowRateAt90 = baseRate + spread;

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <svg width={width} height={height} className="overflow-visible mx-auto block">
        {/* Background fill for chart area */}
        <rect
          x={padding.left}
          y={padding.top}
          width={chartWidth}
          height={chartHeight}
          fill="white"
          rx="4"
        />

        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <line
            key={`y-grid-${i}`}
            x1={padding.left}
            y1={yScale(tick)}
            x2={width - padding.right}
            y2={yScale(tick)}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}

        {/* 90% utilization reference line */}
        <line
          x1={xScale(0.9)}
          y1={padding.top}
          x2={xScale(0.9)}
          y2={height - padding.bottom}
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="4,4"
        />

        {/* Base rate reference line with fill below */}
        <rect
          x={padding.left}
          y={yScale(baseRate)}
          width={chartWidth}
          height={chartHeight - (chartHeight - (baseRate / maxRate) * chartHeight)}
          fill="#10b981"
          opacity="0.05"
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

        {/* Area fill between curves to show gap */}
        <defs>
          <linearGradient id="gapGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Borrow rate without PD (dashed, gray) */}
        <path
          d={generatePath((p) => p.borrowNoPD)}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="6,4"
        />

        {/* Borrow rate with PD (solid orange) */}
        <path
          d={generatePath((p) => p.borrowPD)}
          fill="none"
          stroke="#f97316"
          strokeWidth="2.5"
        />

        {/* Intersection point */}
        <circle
          cx={xScale(0.9)}
          cy={yScale(borrowRateAt90)}
          r="4"
          fill="#f97316"
          stroke="white"
          strokeWidth="2"
        />

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={`y-label-${i}`}
            x={padding.left - 8}
            y={yScale(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-xs fill-slate-500"
          >
            {(tick * 100).toFixed(0)}%
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((tick, i) => (
          <text
            key={`x-label-${i}`}
            x={xScale(tick)}
            y={height - padding.bottom + 16}
            textAnchor="middle"
            className={`text-xs ${tick === 0.9 ? 'fill-slate-700 font-medium' : 'fill-slate-500'}`}
          >
            {(tick * 100).toFixed(0)}%
          </text>
        ))}

        {/* Axis titles */}
        <text
          x={width / 2}
          y={height - 6}
          textAnchor="middle"
          className="text-xs fill-slate-600"
        >
          Utilization
        </text>
        <text
          x={14}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 14, ${height / 2})`}
          className="text-xs fill-slate-600"
        >
          Borrow Rate
        </text>

        {/* Base rate label */}
        <text
          x={width - padding.right - 4}
          y={yScale(baseRate) - 6}
          textAnchor="end"
          className="text-xs fill-emerald-600 font-medium"
        >
          Base {formatPercent(baseRate)}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 bg-orange-500 rounded"></div>
          <span className="text-slate-600">With PD</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="20" height="2">
            <line x1="0" y1="1" x2="20" y2="1" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,2" />
          </svg>
          <span className="text-slate-500">Without PD</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="20" height="2">
            <line x1="0" y1="1" x2="20" y2="1" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
          </svg>
          <span className="text-emerald-600">Base Rate</span>
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
    <div>
      {/* Section 1: Intro */}
      <IntroSection />

      {/* Section 2: Rate Composition */}
      <RateCompositionSection
        baseRate={baseRate}
        spread={spread}
        onSpreadChange={onSpreadChange}
      />

      {/* Section 3: Spread Compression */}
      <SpreadCompressionSection
        baseRate={baseRate}
        spread={spread}
        utilization={utilization}
        onUtilizationChange={onUtilizationChange}
      />

      {/* Section 4: Volatility Reduction */}
      <VolatilityReductionSection
        baseRate={baseRate}
        spread={spread}
      />
    </div>
  );
}
