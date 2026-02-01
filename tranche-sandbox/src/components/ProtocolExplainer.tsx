import { useState } from 'react';

const TOTAL_SCENES = 6;

interface SceneData {
  title: string;
  copy: string;
  insights?: string[];
}

const SCENE_DATA: Record<number, SceneData> = {
  1: {
    title: 'Isolated Market Baseline',
    copy: 'One market, one risk configuration, everyone shares the same terms.',
  },
  2: {
    title: 'Risk Curve',
    copy: 'As the liquidation loan-to-value ratio rises the risk of bad debt increases. As a result the interest rate increases with LLTV.',
  },
  3: {
    title: 'Risk Is Not Static',
    copy: 'As collateral risk changes, the risk changes. But, an isolated market\'s LLTV remains fixed. This causes the interest rate to be volatile.',
  },
  4: {
    title: 'Borrower Subsidy Problem',
    copy: 'All borrowers pay the same rate.',
  },
  5: {
    title: 'Borrower That Cannot Exist',
    copy: 'Some borrowers are simply excluded.',
  },
  6: {
    title: 'Risk Migration',
    copy: 'To earn more, risk-seeking lenders move to markets with riskier collateral.',
  },
};

// ============================================================================
// CHART UTILITIES
// ============================================================================

const CHART = {
  width: 440,
  height: 240,
  padding: { top: 30, right: 20, bottom: 40, left: 50 },
  get graphWidth() { return this.width - this.padding.left - this.padding.right; },
  get graphHeight() { return this.height - this.padding.top - this.padding.bottom; },
};

// Risk curve: continuously increasing with steeper rise at high LLTV
function riskCurveY(x: number, shift = 0): number {
  const adjusted = Math.max(0, x + shift);
  // Steeper exponential curve that keeps accelerating at high LLTV
  const base = 0.05;
  const growth = Math.pow(adjusted, 3.5) * 0.95;
  // Cap output at 1 (top of chart) so curve terminates at chart boundary
  return Math.min(1, base + growth);
}

function toX(x: number): number {
  return CHART.padding.left + x * CHART.graphWidth;
}

function toY(y: number): number {
  return CHART.padding.top + CHART.graphHeight - y * CHART.graphHeight;
}

function generateCurvePath(shift = 0): string {
  const points: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = i / 60;
    const y = riskCurveY(x, shift);
    points.push(i === 0 ? `M${toX(x)},${toY(y)}` : `L${toX(x)},${toY(y)}`);
    // Stop drawing if we've hit the top of the chart
    if (y >= 1) break;
  }
  return points.join(' ');
}

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

function ChartContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-lotus-grey-900 rounded-xl p-5 border border-lotus-grey-700 shadow-lg">
      <svg width={CHART.width} height={CHART.height} className="overflow-visible block mx-auto">
        {/* Background */}
        <defs>
          <linearGradient id="chartBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#191621" />
            <stop offset="100%" stopColor="#0D0A14" />
          </linearGradient>
        </defs>
        <rect
          x={CHART.padding.left}
          y={CHART.padding.top}
          width={CHART.graphWidth}
          height={CHART.graphHeight}
          fill="url(#chartBg)"
          rx="6"
        />
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
          <line
            key={i}
            x1={CHART.padding.left}
            y1={toY(tick)}
            x2={CHART.padding.left + CHART.graphWidth}
            y2={toY(tick)}
            stroke="#27232F"
            strokeWidth={1}
          />
        ))}
        {/* X-Axis label */}
        <text x={CHART.padding.left + CHART.graphWidth / 2} y={CHART.height - 8} textAnchor="middle" className="text-xs fill-lotus-grey-300 font-semibold">
          Liquidation LTV (LLTV) →
        </text>
        {/* Y-Axis label */}
        <text x={16} y={CHART.padding.top + CHART.graphHeight / 2} textAnchor="middle" transform={`rotate(-90, 16, ${CHART.padding.top + CHART.graphHeight / 2})`} className="text-xs fill-lotus-grey-300 font-semibold">
          Interest Rate
        </text>
        {children}
      </svg>
    </div>
  );
}

function PoolCard({ title, subtitle, metrics, variant = 'default', size = 'normal' }: {
  title: string;
  subtitle?: string;
  metrics?: { label: string; value: string; color?: string }[];
  variant?: 'default' | 'muted' | 'highlight';
  size?: 'normal' | 'small';
}) {
  const variants = {
    default: 'bg-gradient-to-br from-lotus-grey-800 to-lotus-grey-900 border-lotus-grey-600',
    muted: 'bg-lotus-grey-900/50 border-lotus-grey-700 opacity-60',
    highlight: 'bg-gradient-to-br from-lotus-purple-900/40 to-lotus-purple-950/60 border-lotus-purple-500 shadow-lg shadow-lotus-purple-500/20',
  };
  const padding = size === 'small' ? 'px-4 py-3' : 'px-5 py-4';

  return (
    <div className={`rounded-xl border-2 ${padding} ${variants[variant]} transition-all duration-300`}>
      <div className={`font-semibold ${size === 'small' ? 'text-sm' : 'text-base'} ${variant === 'muted' ? 'text-lotus-grey-400' : 'text-lotus-grey-100'}`}>
        {title}
      </div>
      {subtitle && (
        <div className={`${size === 'small' ? 'text-[10px]' : 'text-xs'} ${variant === 'muted' ? 'text-lotus-grey-500' : 'text-lotus-grey-400'} mt-0.5`}>
          {subtitle}
        </div>
      )}
      {metrics && (
        <div className={`flex gap-4 ${size === 'small' ? 'mt-2' : 'mt-3'}`}>
          {metrics.map((m, i) => (
            <div key={i} className="text-center">
              <div className={`font-mono font-bold ${size === 'small' ? 'text-base' : 'text-lg'} ${m.color || 'text-lotus-grey-100'}`}>
                {m.value}
              </div>
              <div className="text-[9px] text-lotus-grey-500 uppercase tracking-wide">{m.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Actor({ type, label, sublabel, variant = 'neutral', size = 'normal' }: {
  type: 'borrower' | 'lender';
  label: string;
  sublabel?: string;
  variant?: 'safe' | 'risky' | 'neutral' | 'blocked';
  size?: 'normal' | 'small';
}) {
  const styles = {
    safe: {
      bg: 'from-emerald-900/40 to-emerald-950/60',
      border: 'border-emerald-500',
      icon: 'text-emerald-400',
      text: 'text-emerald-300',
      glow: 'shadow-emerald-500/20',
    },
    risky: {
      bg: 'from-orange-900/40 to-orange-950/60',
      border: 'border-orange-500',
      icon: 'text-orange-400',
      text: 'text-orange-300',
      glow: 'shadow-orange-500/20',
    },
    neutral: {
      bg: 'from-lotus-grey-800 to-lotus-grey-900',
      border: 'border-lotus-grey-600',
      icon: 'text-lotus-grey-400',
      text: 'text-lotus-grey-300',
      glow: '',
    },
    blocked: {
      bg: 'from-red-900/40 to-red-950/60',
      border: 'border-red-500',
      icon: 'text-red-400',
      text: 'text-red-300',
      glow: 'shadow-red-500/20',
    },
  };
  const s = styles[variant];
  const iconSize = size === 'small' ? 'w-8 h-8' : 'w-10 h-10';
  const innerIconSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
  const padding = size === 'small' ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className={`bg-gradient-to-br ${s.bg} border-2 ${s.border} rounded-xl ${padding} text-center shadow-lg ${s.glow} transition-all duration-300`}>
      <div className={`${iconSize} mx-auto mb-2 rounded-full bg-black/30 flex items-center justify-center ${s.icon}`}>
        {type === 'borrower' ? (
          <svg className={innerIconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className={innerIconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div className={`${size === 'small' ? 'text-[10px]' : 'text-xs'} font-semibold ${s.text}`}>{label}</div>
      {sublabel && <div className={`${size === 'small' ? 'text-[9px]' : 'text-[10px]'} ${variant === 'neutral' ? 'text-lotus-grey-400' : s.text} opacity-80 mt-0.5`}>{sublabel}</div>}
    </div>
  );
}

function Arrow({ direction = 'right', color = 'text-lotus-grey-500' }: { direction?: 'right' | 'down' | 'up' | 'both'; color?: string }) {
  if (direction === 'both') {
    return (
      <svg className={`w-6 h-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18m0 0l-4 4m4-4l-4-4" />
      </svg>
    );
  }
  const paths = {
    right: 'M17 8l4 4m0 0l-4 4m4-4H3',
    down: 'M19 14l-7 7m0 0l-7-7m7 7V3',
    up: 'M5 10l7-7m0 0l7 7m-7-7v18',
  };
  return (
    <svg className={`w-6 h-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[direction]} />
    </svg>
  );
}

function Callout({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'warning' | 'success' }) {
  const styles = {
    info: 'bg-lotus-purple-900/30 border-lotus-purple-600/50 text-lotus-purple-200',
    warning: 'bg-amber-900/30 border-amber-600/50 text-amber-200',
    success: 'bg-emerald-900/30 border-emerald-600/50 text-emerald-200',
  };
  return (
    <div className={`rounded-lg border px-4 py-2.5 text-xs text-center ${styles[variant]}`}>
      {children}
    </div>
  );
}


// ============================================================================
// SCENES
// ============================================================================

function Scene1() {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Main flow diagram */}
      <div className="flex items-center gap-6">
        {/* Lender side */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-900/60 to-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-emerald-300 mt-2">Lender</span>
        </div>

        {/* Arrow to market */}
        <svg className="w-10 h-6 text-lotus-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>

        {/* Market in center */}
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-br from-lotus-purple-900/50 to-lotus-purple-950/70 border-2 border-lotus-purple-500 rounded-xl px-8 py-5 shadow-lg shadow-lotus-purple-500/20">
            <div className="text-lg font-bold text-lotus-grey-100 text-center">wstETH / USDC</div>
            <div className="text-center mt-2">
              <span className="text-xl font-mono font-bold text-orange-400">86% LLTV</span>
            </div>
          </div>
        </div>

        {/* Arrow from market */}
        <svg className="w-10 h-6 text-lotus-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>

        {/* Borrower side */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-900/60 to-orange-950/80 border-2 border-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg className="w-7 h-7 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-orange-300 mt-2">Borrower</span>
        </div>
      </div>

      {/* Explanation text */}
      <div className="max-w-lg text-center bg-lotus-grey-900/50 rounded-lg px-5 py-3 border border-lotus-grey-700">
        <p className="text-sm text-lotus-grey-300 leading-relaxed">
          All lenders earn the same rate regardless of their risk preference.<br />
          All borrowers pay the same rate regardless of their risk.
        </p>
      </div>
    </div>
  );
}

function Scene2() {
  const lltvX = 0.65;
  return (
    <ChartContainer>
      {/* Risk curve */}
      <path d={generateCurvePath()} fill="none" stroke="#8E62FF" strokeWidth={3} strokeLinecap="round" />
      {/* LLTV line */}
      <line x1={toX(lltvX)} y1={CHART.padding.top} x2={toX(lltvX)} y2={toY(0)} stroke="#f97316" strokeWidth={2} strokeDasharray="6,4" />
      {/* Point on curve */}
      <circle cx={toX(lltvX)} cy={toY(riskCurveY(lltvX))} r={10} fill="#f97316" stroke="#fff" strokeWidth={2} />
      {/* LLTV Label */}
      <text x={toX(lltvX)} y={CHART.padding.top - 12} textAnchor="middle" className="text-sm fill-orange-400 font-bold">86% LLTV</text>
      {/* Interest rate label at the point */}
      <text x={toX(lltvX) + 20} y={toY(riskCurveY(lltvX)) - 15} textAnchor="start" className="text-xs fill-lotus-grey-200 font-semibold">Interest Rate</text>
    </ChartContainer>
  );
}

function Scene3() {
  const lltvX = 0.65;
  const shift = 0.15;
  return (
    <ChartContainer>
      {/* Original curve (faded) */}
      <path d={generateCurvePath()} fill="none" stroke="#8E62FF" strokeWidth={2} opacity={0.3} strokeLinecap="round" />
      {/* Shifted curve */}
      <path d={generateCurvePath(shift)} fill="none" stroke="#ef4444" strokeWidth={3} strokeLinecap="round" />
      {/* LLTV line */}
      <line x1={toX(lltvX)} y1={CHART.padding.top} x2={toX(lltvX)} y2={toY(0)} stroke="#f97316" strokeWidth={2} strokeDasharray="6,4" />
      {/* Mismatch zone */}
      <rect
        x={toX(lltvX) - 15}
        y={toY(riskCurveY(lltvX, shift))}
        width={30}
        height={toY(riskCurveY(lltvX)) - toY(riskCurveY(lltvX, shift))}
        fill="#ef4444"
        fillOpacity={0.3}
        rx={4}
      />
      {/* Points */}
      <circle cx={toX(lltvX)} cy={toY(riskCurveY(lltvX))} r={7} fill="#8E62FF" opacity={0.5} />
      <circle cx={toX(lltvX)} cy={toY(riskCurveY(lltvX, shift))} r={10} fill="#ef4444" stroke="#fff" strokeWidth={2} />
      {/* LLTV Label */}
      <text x={toX(lltvX)} y={CHART.padding.top - 12} textAnchor="middle" className="text-sm fill-orange-400 font-bold">86% (fixed)</text>
      {/* Rate volatility annotation */}
      <g transform={`translate(${toX(lltvX) + 25}, ${(toY(riskCurveY(lltvX)) + toY(riskCurveY(lltvX, shift))) / 2})`}>
        <text x={0} y={-6} className="text-xs fill-red-400 font-semibold">Rate</text>
        <text x={0} y={8} className="text-xs fill-red-400 font-semibold">Volatility</text>
      </g>
      {/* Legend - more readable */}
      <g transform={`translate(${CHART.padding.left + 10}, ${CHART.padding.top + 10})`}>
        <rect x={0} y={0} width={130} height={50} rx={6} fill="#191621" stroke="#3B3546" strokeWidth={1} />
        <line x1={12} y1={18} x2={32} y2={18} stroke="#ef4444" strokeWidth={3} />
        <text x={40} y={22} className="text-xs fill-red-300 font-medium">Actual Risk</text>
        <line x1={12} y1={36} x2={32} y2={36} stroke="#8E62FF" strokeWidth={2} opacity={0.5} />
        <text x={40} y={40} className="text-xs fill-lotus-grey-400 font-medium">Original Risk</text>
      </g>
    </ChartContainer>
  );
}

function Scene4() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Two columns: Lenders and Borrowers */}
      <div className="flex items-stretch gap-8">
        {/* Lenders */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs text-lotus-grey-400 uppercase tracking-wide font-semibold mb-1">Lenders</div>
          <div className="flex flex-col gap-2">
            <Actor type="lender" variant="safe" label="Conservative" sublabel="Wants safety" size="small" />
            <Actor type="lender" variant="risky" label="Aggressive" sublabel="Wants yield" size="small" />
          </div>
          <div className="mt-2 max-w-[140px] bg-amber-900/50 border border-amber-600/50 rounded-lg px-3 py-2">
            <p className="text-[11px] text-amber-200 text-center leading-tight">
              Both take on the same risk exposure
            </p>
          </div>
        </div>

        {/* Center: Same Rate */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-px h-8 bg-lotus-grey-700" />
          <div className="bg-gradient-to-br from-lotus-grey-800 to-lotus-grey-900 border-2 border-orange-500 rounded-xl px-6 py-4 shadow-lg shadow-orange-500/10">
            <div className="text-[10px] text-lotus-grey-500 uppercase tracking-wide text-center mb-1">Same Rate</div>
            <div className="text-2xl font-mono font-bold text-orange-400 text-center">5.2%</div>
          </div>
          <div className="w-px h-8 bg-lotus-grey-700" />
        </div>

        {/* Borrowers */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs text-lotus-grey-400 uppercase tracking-wide font-semibold mb-1">Borrowers</div>
          <div className="flex flex-col gap-2">
            <Actor type="borrower" variant="safe" label="Conservative" sublabel="40% LTV" size="small" />
            <Actor type="borrower" variant="risky" label="Aggressive" sublabel="84% LTV" size="small" />
          </div>
          <div className="mt-2 max-w-[140px] bg-amber-900/50 border border-amber-600/50 rounded-lg px-3 py-2">
            <p className="text-[11px] text-amber-200 text-center leading-tight">
              Conservative subsidizes aggressive
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Scene5() {
  const lltvX = 0.65; // 86% LLTV position on chart
  return (
    <div className="flex flex-col items-center gap-5">
      <ChartContainer>
        {/* Risk curve */}
        <path d={generateCurvePath()} fill="none" stroke="#8E62FF" strokeWidth={3} strokeLinecap="round" />
        {/* LLTV cutoff line */}
        <line x1={toX(lltvX)} y1={CHART.padding.top} x2={toX(lltvX)} y2={toY(0)} stroke="#f97316" strokeWidth={2} strokeDasharray="6,4" />
        {/* Blocked zone (right of LLTV) */}
        <rect
          x={toX(lltvX)}
          y={CHART.padding.top}
          width={CHART.graphWidth - lltvX * CHART.graphWidth}
          height={CHART.graphHeight}
          fill="#ef4444"
          fillOpacity={0.15}
        />
        {/* Blocked pattern overlay */}
        <defs>
          <pattern id="blockedPattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l2,-2" stroke="#ef4444" strokeWidth="0.5" opacity="0.4"/>
          </pattern>
        </defs>
        <rect
          x={toX(lltvX)}
          y={CHART.padding.top}
          width={CHART.graphWidth - lltvX * CHART.graphWidth}
          height={CHART.graphHeight}
          fill="url(#blockedPattern)"
        />
        {/* LLTV Label */}
        <text x={toX(lltvX)} y={CHART.padding.top - 12} textAnchor="middle" className="text-sm fill-orange-400 font-bold">86% Max</text>
        {/* Blocked demand annotation */}
        <g transform={`translate(${toX(0.82)}, ${toY(0.5)})`}>
          <rect x={-50} y={-22} width={100} height={44} rx={6} fill="#7f1d1d" stroke="#ef4444" strokeWidth={1} />
          <text x={0} y={-4} textAnchor="middle" className="text-sm fill-red-200 font-bold">BLOCKED</text>
          <text x={0} y={12} textAnchor="middle" className="text-xs fill-red-300">Demand Denied</text>
        </g>
      </ChartContainer>

      {/* Blocked participants */}
      <div className="flex items-center gap-10">
        <div className="flex flex-col items-center gap-2">
          <Actor type="borrower" variant="blocked" label="High-leverage Borrower" size="small" />
          <div className="bg-red-900/50 border border-red-600/50 rounded px-3 py-1.5">
            <span className="text-sm text-red-200 font-medium">Wants 95% LTV</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Actor type="lender" variant="blocked" label="Risk-seeking Lender" size="small" />
          <div className="bg-red-900/50 border border-red-600/50 rounded px-3 py-1.5">
            <span className="text-sm text-red-200 font-medium">Wants higher yield</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Scene6() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-6">
        <PoolCard title="wstETH / USDC" subtitle="Safe collateral" metrics={[{ label: 'Yield', value: '4%', color: 'text-lotus-grey-400' }]} variant="muted" size="small" />
        <div className="flex flex-col items-center">
          <Arrow direction="right" color="text-lotus-purple-400" />
          <span className="text-xs text-lotus-purple-400 mt-1 font-medium">Capital flows</span>
        </div>
        <PoolCard title="ALT / USDC" subtitle="Risky collateral" metrics={[{ label: 'Yield', value: '12%', color: 'text-emerald-400' }]} variant="highlight" size="small" />
      </div>
      <Callout variant="warning">
        <span className="font-semibold text-amber-300">Risk migrates — it doesn't disappear.</span>
      </Callout>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function SceneVisual({ scene }: { scene: number }) {
  const scenes: Record<number, JSX.Element> = {
    1: <Scene1 />,
    2: <Scene2 />,
    3: <Scene3 />,
    4: <Scene4 />,
    5: <Scene5 />,
    6: <Scene6 />,
  };
  return (
    <div className="animate-fadeIn">
      {scenes[scene] || scenes[1]}
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <button
          key={s}
          className={`h-1 rounded-full transition-all duration-300 ${
            s === current
              ? 'w-6 bg-lotus-purple-500'
              : s < current
              ? 'w-2 bg-lotus-purple-700'
              : 'w-2 bg-lotus-grey-700'
          }`}
          aria-label={`Scene ${s}`}
        />
      ))}
    </div>
  );
}

export function ProtocolExplainer() {
  const [scene, setScene] = useState(1);
  const data = SCENE_DATA[scene];

  const handlePrev = () => setScene((s) => Math.max(1, s - 1));
  const handleNext = () => setScene((s) => Math.min(TOTAL_SCENES, s + 1));

  return (
    <div className="bg-gradient-to-b from-lotus-grey-800 to-lotus-grey-900 rounded-2xl border border-lotus-grey-700 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-3 border-b border-lotus-grey-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
            The Problem
          </div>
        </div>
        <h3 className="text-sm font-semibold text-lotus-grey-100">{data.title}</h3>
        <span className="text-xs text-lotus-grey-500 font-mono">{scene}/{TOTAL_SCENES}</span>
      </div>

      {/* Visual */}
      <div className="px-6 py-8 min-h-[320px] flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-lotus-grey-800/50 via-transparent to-transparent">
        <SceneVisual scene={scene} />
      </div>

      {/* Copy */}
      <div className="px-5 py-4 border-t border-lotus-grey-700/50 bg-lotus-grey-900/50">
        <p className="text-lotus-grey-200 text-center text-sm font-medium">{data.copy}</p>
        {data.insights && (
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mt-3 text-xs text-lotus-grey-400">
            {data.insights.map((insight, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lotus-purple-500" />
                {insight}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-5 py-3 border-t border-lotus-grey-700/50 flex items-center justify-between bg-lotus-grey-900">
        <button
          onClick={handlePrev}
          disabled={scene === 1}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-lotus-grey-800 hover:bg-lotus-grey-700 text-lotus-grey-200 border border-lotus-grey-700"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <ProgressBar current={scene} total={TOTAL_SCENES} />

        <button
          onClick={handleNext}
          disabled={scene === TOTAL_SCENES}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-lotus-purple-600 hover:bg-lotus-purple-500 text-white shadow-lg shadow-lotus-purple-500/20"
        >
          Next
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function LotusSolution() {
  return (
    <div className="bg-gradient-to-b from-lotus-grey-800 to-lotus-grey-900 rounded-2xl border border-lotus-grey-700 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-3 border-b border-lotus-grey-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
            The Solution
          </div>
        </div>
        <h3 className="text-sm font-semibold text-lotus-grey-100">Lotus Protocol</h3>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Overview */}
        <div className="text-sm text-lotus-grey-200 leading-relaxed">
          <p className="mb-4">
            <span className="text-lotus-purple-400 font-semibold">Lotus</span> is an onchain lending protocol that lets lenders and borrowers meet on a risk curve inside a single market. Instead of creating separate pools for every risk setting, Lotus uses <span className="text-emerald-400 font-medium">tranches</span> to offer multiple risk levels while keeping liquidity connected.
          </p>
          <p>
            A market contains multiple tranches ordered by risk (senior to junior). Unused liquidity from junior tranches can support more senior borrowers. This keeps markets deep without forcing everyone into the same risk profile.
          </p>
        </div>

        {/* Tranche visualization */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[
            { lltv: 75, color: 'bg-emerald-500', label: 'Senior' },
            { lltv: 80, color: 'bg-emerald-400' },
            { lltv: 85, color: 'bg-amber-500' },
            { lltv: 90, color: 'bg-orange-500' },
            { lltv: 95, color: 'bg-red-500', label: 'Junior' },
          ].map((t, i) => (
            <div key={t.lltv} className="flex flex-col items-center gap-1">
              {i === 0 && <span className="text-xs text-emerald-400 font-semibold">Senior</span>}
              {i === 4 && <span className="text-xs text-red-400 font-semibold">Junior</span>}
              {i !== 0 && i !== 4 && <span className="text-xs text-transparent">-</span>}
              <div className={`${t.color} rounded-lg px-3 py-2`}>
                <span className="font-mono text-sm font-bold text-white">{t.lltv}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interest and Loss Allocation */}
        <div className="text-sm text-lotus-grey-200 leading-relaxed">
          <p>
            Interest and loss allocation follow the tranche structure, so risk and reward stay aligned.
          </p>
        </div>

        {/* LotusUSD Section */}
        <div className="bg-lotus-purple-900/20 rounded-xl p-5 border border-lotus-purple-700/50">
          <h4 className="text-sm font-semibold text-lotus-purple-300 mb-3">LotusUSD</h4>
          <p className="text-sm text-lotus-grey-200 leading-relaxed">
            In USD-denominated Lotus markets, the loan asset is <span className="text-lotus-purple-400 font-medium">LotusUSD</span>. LotusUSD is a vault token backed by USDC and tokenized short-term US Treasuries. Its goal is to earn a rate that is close to the risk-free rate on deployed assets while maintaining onchain liquidity. Using a yield-bearing token as the loan asset is called <span className="text-emerald-400 font-medium">"productive debt"</span>.
          </p>
        </div>

        {/* Productive Debt Benefits */}
        <div className="bg-emerald-900/20 rounded-xl p-5 border border-emerald-700/50">
          <h4 className="text-sm font-semibold text-emerald-300 mb-4">Productive Debt Benefits</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-sm text-lotus-grey-100 font-medium">Baseline yield for lenders</p>
                <p className="text-xs text-lotus-grey-300 mt-1">
                  Lenders earn a baseline yield even when utilization is low. Some return comes from LotusUSD's base yield, not only from borrower demand.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-sm text-lotus-grey-100 font-medium">Idle liquidity earns yield</p>
                <p className="text-xs text-lotus-grey-300 mt-1">
                  Unborrowed funds can remain productive instead of sitting as zero-yield reserves.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-sm text-lotus-grey-100 font-medium">More stable rates</p>
                <p className="text-xs text-lotus-grey-300 mt-1">
                  Because part of the return comes from the base rate, rates tend to move less abruptly as utilization changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProtocolExplainer;
