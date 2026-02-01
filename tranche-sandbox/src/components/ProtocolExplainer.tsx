import { useState } from 'react';

const TOTAL_SCENES = 12;

interface SceneData {
  title: string;
  copy: string;
  insights?: string[];
}

const SCENE_DATA: Record<number, SceneData> = {
  1: {
    title: 'Isolated Market Baseline',
    copy: 'Most lending markets use one pool per asset pair.',
    insights: ['One market', 'One risk configuration', 'Everyone shares the same terms'],
  },
  2: {
    title: 'Risk Curve',
    copy: 'Markets lock risk parameters in place.',
    insights: ['The market defines one acceptable risk point', 'Pricing assumes a static risk profile'],
  },
  3: {
    title: 'Risk Is Not Static',
    copy: 'Collateral risk changes. Market parameters don\'t.',
    insights: ['The same LLTV can mean very different real risk', 'Rates lag reality'],
  },
  4: {
    title: 'Borrower Subsidy Problem',
    copy: 'All borrowers pay the same rate.',
    insights: ['Low-risk borrower overpays', 'High-risk borrower underpays', 'Risk is averaged, not priced'],
  },
  5: {
    title: 'Borrower That Cannot Exist',
    copy: 'Some borrowers are simply excluded.',
    insights: ['Market forbids valid demand', 'Leverage ceiling is arbitrary'],
  },
  6: {
    title: 'Forced Lender Exposure',
    copy: 'Lenders can\'t choose their risk.',
    insights: ['Conservative lenders ride choppy risk', 'Aggressive lenders don\'t get paid enough'],
  },
  7: {
    title: 'System-Level Failure Mode',
    copy: 'To earn more, risk must move elsewhere.',
    insights: ['Yield pressure pushes lenders toward riskier collateral', 'Risk migrates, not disappears'],
  },
  8: {
    title: 'Transition to Lotus',
    copy: 'Lotus keeps one market — but lets risk vary.',
  },
  9: {
    title: 'Borrowers Choose Their Risk',
    copy: 'Borrowers choose where they sit on the curve.',
    insights: ['Low LTV borrower → low rate', 'High LTV borrower → higher rate, max leverage'],
  },
  10: {
    title: 'Lenders Choose Their Exposure',
    copy: 'Lenders choose what risk they underwrite.',
    insights: ['No forced averaging', 'Risk and return are aligned'],
  },
  11: {
    title: 'Cascading Liquidity',
    copy: 'Unused liquidity doesn\'t go idle.',
    insights: ['Junior lenders not dependent on junior borrowers', 'Capital remains productive'],
  },
  12: {
    title: 'Resolution',
    copy: 'One market. Many risk choices. Shared liquidity.',
    insights: ['Borrowers: Fair pricing', 'Lenders: Risk control'],
  },
};

// ============================================================================
// CHART UTILITIES
// ============================================================================

const CHART = {
  width: 380,
  height: 180,
  padding: { top: 25, right: 15, bottom: 30, left: 40 },
  get graphWidth() { return this.width - this.padding.left - this.padding.right; },
  get graphHeight() { return this.height - this.padding.top - this.padding.bottom; },
};

// Risk curve: flat at low LLTV, exponential at high LLTV
function riskCurveY(x: number, shift = 0): number {
  const adjusted = Math.max(0, Math.min(1, x + shift));
  const k = 6;
  const threshold = 0.55;
  const raw = Math.exp(k * (adjusted - threshold));
  const minVal = Math.exp(k * (0 - threshold));
  const maxVal = Math.exp(k * (1 - threshold));
  return 0.05 + 0.9 * (raw - minVal) / (maxVal - minVal);
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
  }
  return points.join(' ');
}

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

function ChartContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-lotus-grey-900 rounded-xl p-4 border border-lotus-grey-700 shadow-lg">
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
        {/* Axis labels */}
        <text x={CHART.padding.left + CHART.graphWidth / 2} y={CHART.height - 4} textAnchor="middle" className="text-[9px] fill-lotus-grey-500 font-medium">
          LLTV →
        </text>
        <text x={10} y={CHART.padding.top + CHART.graphHeight / 2} textAnchor="middle" transform={`rotate(-90, 10, ${CHART.padding.top + CHART.graphHeight / 2})`} className="text-[9px] fill-lotus-grey-500 font-medium">
          Risk
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

function Actor({ type, label, sublabel, variant = 'neutral' }: {
  type: 'borrower' | 'lender';
  label: string;
  sublabel?: string;
  variant?: 'safe' | 'risky' | 'neutral' | 'blocked';
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

  return (
    <div className={`bg-gradient-to-br ${s.bg} border-2 ${s.border} rounded-xl px-4 py-3 text-center shadow-lg ${s.glow} transition-all duration-300`}>
      <div className={`w-10 h-10 mx-auto mb-2 rounded-full bg-black/30 flex items-center justify-center ${s.icon}`}>
        {type === 'borrower' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div className={`text-xs font-semibold ${s.text}`}>{label}</div>
      {sublabel && <div className="text-[10px] text-lotus-grey-500 mt-0.5">{sublabel}</div>}
    </div>
  );
}

function Arrow({ direction = 'right', color = 'text-lotus-grey-500' }: { direction?: 'right' | 'down' | 'up'; color?: string }) {
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

function TrancheBar({ tranches, activeIndex, showRates = false }: {
  tranches: { lltv: number; rate?: string }[];
  activeIndex?: number | number[];
  showRates?: boolean;
}) {
  const colors = [
    { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-100' },
    { bg: 'bg-cyan-500', border: 'border-cyan-400', text: 'text-cyan-100' },
    { bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-amber-100' },
    { bg: 'bg-red-500', border: 'border-red-400', text: 'text-red-100' },
  ];

  const isActive = (i: number) => {
    if (activeIndex === undefined) return false;
    return Array.isArray(activeIndex) ? activeIndex.includes(i) : activeIndex === i;
  };

  return (
    <div className="flex flex-col gap-1.5">
      {tranches.map((t, i) => (
        <div
          key={t.lltv}
          className={`
            relative rounded-lg px-4 py-2 border-2 transition-all duration-300
            ${isActive(i)
              ? `${colors[i].bg} ${colors[i].border} shadow-lg`
              : 'bg-lotus-grey-800/80 border-lotus-grey-700'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <span className={`font-mono text-sm font-bold ${isActive(i) ? colors[i].text : 'text-lotus-grey-300'}`}>
              {t.lltv}%
            </span>
            {showRates && t.rate && (
              <span className={`text-xs font-mono ${isActive(i) ? colors[i].text : 'text-lotus-grey-500'}`}>
                {t.rate}
              </span>
            )}
          </div>
          {i === 0 && (
            <span className="absolute -right-12 top-1/2 -translate-y-1/2 text-[9px] text-emerald-500 font-medium">Senior</span>
          )}
          {i === tranches.length - 1 && (
            <span className="absolute -right-12 top-1/2 -translate-y-1/2 text-[9px] text-red-500 font-medium">Junior</span>
          )}
        </div>
      ))}
    </div>
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

function StatRow({ items }: { items: { value: string; label: string; color?: string }[] }) {
  return (
    <div className="flex items-center justify-center gap-8">
      {items.map((item, i) => (
        <div key={i} className="text-center">
          <div className={`text-3xl font-mono font-bold ${item.color || 'text-lotus-grey-100'}`}>{item.value}</div>
          <div className="text-[10px] text-lotus-grey-500 uppercase tracking-wide mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// SCENES
// ============================================================================

function Scene1() {
  return (
    <div className="flex flex-col items-center gap-6">
      <PoolCard
        title="wstETH / USDC"
        subtitle="Isolated Lending Pool"
        metrics={[
          { label: 'LLTV', value: '86%', color: 'text-orange-400' },
          { label: 'Rate', value: '5.2%', color: 'text-emerald-400' },
        ]}
        variant="highlight"
      />
      <StatRow items={[
        { value: '1', label: 'Market', color: 'text-lotus-purple-400' },
        { value: '1', label: 'LLTV', color: 'text-orange-400' },
        { value: '1', label: 'Rate', color: 'text-emerald-400' },
      ]} />
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
      <circle cx={toX(lltvX)} cy={toY(riskCurveY(lltvX))} r={8} fill="#f97316" stroke="#fff" strokeWidth={2} />
      {/* Label */}
      <text x={toX(lltvX)} y={CHART.padding.top - 8} textAnchor="middle" className="text-[11px] fill-orange-400 font-bold">86%</text>
      {/* Legend */}
      <g transform={`translate(${CHART.width - 80}, ${CHART.padding.top + 10})`}>
        <rect x={0} y={0} width={70} height={24} rx={4} fill="#191621" stroke="#27232F" />
        <line x1={8} y1={12} x2={24} y2={12} stroke="#8E62FF" strokeWidth={2} />
        <text x={30} y={16} className="text-[9px] fill-lotus-grey-400">Risk Curve</text>
      </g>
    </ChartContainer>
  );
}

function Scene3() {
  const lltvX = 0.65;
  const shift = 0.12;
  return (
    <ChartContainer>
      {/* Original curve (faded) */}
      <path d={generateCurvePath()} fill="none" stroke="#8E62FF" strokeWidth={2} opacity={0.25} strokeLinecap="round" />
      {/* Shifted curve */}
      <path d={generateCurvePath(shift)} fill="none" stroke="#ef4444" strokeWidth={3} strokeLinecap="round" />
      {/* LLTV line */}
      <line x1={toX(lltvX)} y1={CHART.padding.top} x2={toX(lltvX)} y2={toY(0)} stroke="#f97316" strokeWidth={2} strokeDasharray="6,4" />
      {/* Mismatch zone */}
      <rect
        x={toX(lltvX) - 12}
        y={toY(riskCurveY(lltvX, shift))}
        width={24}
        height={toY(riskCurveY(lltvX)) - toY(riskCurveY(lltvX, shift))}
        fill="#ef4444"
        fillOpacity={0.3}
        rx={3}
      />
      {/* Points */}
      <circle cx={toX(lltvX)} cy={toY(riskCurveY(lltvX))} r={6} fill="#8E62FF" opacity={0.4} />
      <circle cx={toX(lltvX)} cy={toY(riskCurveY(lltvX, shift))} r={8} fill="#ef4444" stroke="#fff" strokeWidth={2} />
      {/* Labels */}
      <text x={toX(lltvX)} y={CHART.padding.top - 8} textAnchor="middle" className="text-[11px] fill-orange-400 font-bold">86% (fixed)</text>
      {/* Legend */}
      <g transform={`translate(${CHART.width - 90}, ${CHART.padding.top + 8})`}>
        <rect x={0} y={0} width={80} height={36} rx={4} fill="#191621" stroke="#27232F" />
        <line x1={8} y1={10} x2={24} y2={10} stroke="#ef4444" strokeWidth={2} />
        <text x={30} y={13} className="text-[9px] fill-red-400">New Risk</text>
        <line x1={8} y1={26} x2={24} y2={26} stroke="#8E62FF" strokeWidth={2} opacity={0.4} />
        <text x={30} y={29} className="text-[9px] fill-lotus-grey-500">Original</text>
      </g>
    </ChartContainer>
  );
}

function Scene4() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-6">
        <Actor type="borrower" variant="safe" label="Conservative" sublabel="40% LTV" />
        <Actor type="borrower" variant="risky" label="Aggressive" sublabel="84% LTV" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-lotus-grey-600" />
        <div className="bg-gradient-to-br from-lotus-grey-800 to-lotus-grey-900 border-2 border-orange-500 rounded-xl px-5 py-3 shadow-lg shadow-orange-500/10">
          <div className="text-[10px] text-lotus-grey-500 uppercase tracking-wide">Same Rate</div>
          <div className="text-2xl font-mono font-bold text-orange-400">5.2%</div>
        </div>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-lotus-grey-600" />
      </div>
      <Callout variant="warning">
        Cautious borrower subsidizes the aggressive one
      </Callout>
    </div>
  );
}

function Scene5() {
  return (
    <div className="flex flex-col items-center gap-5">
      <PoolCard title="wstETH / USDC" subtitle="Maximum LLTV: 86%" variant="default" size="small" />
      <div className="flex items-center gap-4">
        <Actor type="borrower" variant="blocked" label="Wants 95%" sublabel="Needs leverage" />
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-red-900/50 border-2 border-red-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="text-[10px] text-red-400 mt-1 font-medium">DENIED</span>
        </div>
      </div>
      <Callout variant="warning">
        Valid demand is blocked by arbitrary ceiling
      </Callout>
    </div>
  );
}

function Scene6() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">
        <Actor type="lender" variant="safe" label="Conservative" sublabel="Wants safety" />
        <Actor type="lender" variant="risky" label="Yield-seeker" sublabel="Wants returns" />
      </div>
      <div className="flex items-center gap-2 text-lotus-grey-600">
        <Arrow direction="down" />
        <Arrow direction="down" />
      </div>
      <PoolCard title="Same Pool" subtitle="Single risk profile" metrics={[{ label: 'LLTV', value: '86%' }]} variant="default" size="small" />
      <Callout variant="warning">
        Both lenders forced into identical risk exposure
      </Callout>
    </div>
  );
}

function Scene7() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <PoolCard title="wstETH / USDC" subtitle="Safe collateral" metrics={[{ label: 'Yield', value: '4%', color: 'text-lotus-grey-400' }]} variant="muted" size="small" />
        <div className="flex flex-col items-center">
          <Arrow direction="right" color="text-lotus-purple-400" />
          <span className="text-[9px] text-lotus-purple-400 mt-1">Capital</span>
        </div>
        <PoolCard title="ALT / USDC" subtitle="Risky collateral" metrics={[{ label: 'Yield', value: '12%', color: 'text-emerald-400' }]} variant="highlight" size="small" />
      </div>
      <Callout variant="warning">
        Yield-seeking lenders move to riskier markets.<br />
        <span className="font-semibold text-amber-300">Risk migrates — it doesn't disappear.</span>
      </Callout>
    </div>
  );
}

function Scene8() {
  const tranches = [
    { lltv: 77 },
    { lltv: 86 },
    { lltv: 91.5 },
    { lltv: 94.5 },
  ];
  return (
    <div className="flex items-center justify-center gap-6">
      <PoolCard title="Single Pool" subtitle="One LLTV" variant="muted" size="small" />
      <div className="flex flex-col items-center">
        <Arrow direction="right" color="text-lotus-purple-500" />
      </div>
      <div>
        <TrancheBar tranches={tranches} activeIndex={[0, 1, 2, 3]} />
        <div className="text-center text-[10px] text-lotus-purple-400 font-semibold mt-3">Lotus Tranches</div>
      </div>
    </div>
  );
}

function Scene9() {
  const tranches = [
    { lltv: 77, rate: '3.5%' },
    { lltv: 86, rate: '4.8%' },
    { lltv: 91.5, rate: '6.5%' },
    { lltv: 94.5, rate: '8.2%' },
  ];
  return (
    <div className="flex items-center justify-center gap-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Actor type="borrower" variant="safe" label="Conservative" />
          <Arrow direction="right" color="text-emerald-500" />
        </div>
        <div className="flex items-center gap-3">
          <Actor type="borrower" variant="risky" label="Aggressive" />
          <Arrow direction="right" color="text-red-500" />
        </div>
      </div>
      <TrancheBar tranches={tranches} activeIndex={[0, 3]} showRates />
    </div>
  );
}

function Scene10() {
  const tranches = [
    { lltv: 77, rate: 'Safe' },
    { lltv: 86, rate: '' },
    { lltv: 91.5, rate: '' },
    { lltv: 94.5, rate: 'High yield' },
  ];
  return (
    <div className="flex items-center justify-center gap-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Actor type="lender" variant="safe" label="Conservative" />
          <Arrow direction="right" color="text-emerald-500" />
        </div>
        <div className="flex items-center gap-3">
          <Actor type="lender" variant="risky" label="Yield-seeker" />
          <Arrow direction="right" color="text-red-500" />
        </div>
      </div>
      <TrancheBar tranches={tranches} activeIndex={[0, 3]} showRates />
    </div>
  );
}

function Scene11() {
  const tranches = [
    { lltv: 77 },
    { lltv: 86 },
    { lltv: 91.5 },
    { lltv: 94.5 },
  ];
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Actor type="borrower" variant="blocked" label="Exits" />
          <Arrow direction="up" color="text-red-400" />
        </div>
        <TrancheBar tranches={tranches} activeIndex={3} />
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-lotus-purple-900/50 border-2 border-lotus-purple-500 flex items-center justify-center">
            <Arrow direction="up" color="text-lotus-purple-400" />
          </div>
          <span className="text-[10px] text-lotus-purple-400 mt-1 font-medium">Cascades</span>
        </div>
      </div>
      <Callout variant="success">
        Junior lenders stay productive — liquidity flows to senior tranches.
      </Callout>
    </div>
  );
}

function Scene12() {
  return (
    <div className="flex flex-col items-center gap-5">
      <ChartContainer>
        <path d={generateCurvePath()} fill="none" stroke="#8E62FF" strokeWidth={3} strokeLinecap="round" />
        {[0.15, 0.4, 0.65, 0.85].map((x, i) => {
          const colors = ['#10b981', '#22d3ee', '#f59e0b', '#ef4444'];
          const y = riskCurveY(x);
          return (
            <g key={x}>
              <line x1={toX(x)} y1={toY(y) + 10} x2={toX(x)} y2={toY(0)} stroke={colors[i]} strokeWidth={2} strokeDasharray="4,3" opacity={0.5} />
              <circle cx={toX(x)} cy={toY(y)} r={10} fill={colors[i]} stroke="#fff" strokeWidth={2} />
            </g>
          );
        })}
        {/* Connected liquidity bar */}
        <line x1={toX(0.15)} y1={toY(0) + 15} x2={toX(0.85)} y2={toY(0) + 15} stroke="#8E62FF" strokeWidth={4} strokeLinecap="round" />
        <text x={CHART.padding.left + CHART.graphWidth / 2} y={toY(0) + 28} textAnchor="middle" className="text-[10px] fill-lotus-purple-400 font-semibold">
          Connected Liquidity
        </text>
      </ChartContainer>
      <div className="flex gap-4">
        <Callout variant="success">
          <span className="font-semibold">Borrowers:</span> Fair pricing
        </Callout>
        <Callout variant="info">
          <span className="font-semibold">Lenders:</span> Risk control
        </Callout>
      </div>
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
    7: <Scene7 />,
    8: <Scene8 />,
    9: <Scene9 />,
    10: <Scene10 />,
    11: <Scene11 />,
    12: <Scene12 />,
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
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
            scene <= 7
              ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
          }`}>
            {scene <= 7 ? 'The Problem' : 'The Solution'}
          </div>
        </div>
        <h3 className="text-sm font-semibold text-lotus-grey-100">{data.title}</h3>
        <span className="text-xs text-lotus-grey-500 font-mono">{scene}/{TOTAL_SCENES}</span>
      </div>

      {/* Visual */}
      <div className="px-6 py-8 min-h-[300px] flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-lotus-grey-800/50 via-transparent to-transparent">
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

export default ProtocolExplainer;
