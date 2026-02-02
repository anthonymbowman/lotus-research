import { useMemo } from 'react';
import { RateInput } from './RateInput';
import { DynamicInsight } from './DynamicInsight';
import { TermDefinition } from './TermDefinition';

interface LotusUSDAllocationProps {
  treasuryAllocation: number;
  treasuryRate: number;
  onTreasuryAllocationChange: (value: number) => void;
  onTreasuryRateChange: (value: number) => void;
}

function AllocationPieChart({ treasuryAllocation }: { treasuryAllocation: number }) {
  const usdcAllocation = 1 - treasuryAllocation;

  const size = 200;
  const center = size / 2;
  const radius = 80;

  const treasuryAngle = treasuryAllocation * 2 * Math.PI;
  const usdcAngle = usdcAllocation * 2 * Math.PI;

  const startAngle = -Math.PI / 2;

  const treasuryEndAngle = startAngle + treasuryAngle;
  const treasuryPath = describeArc(center, center, radius, startAngle, treasuryEndAngle);

  const usdcEndAngle = treasuryEndAngle + usdcAngle;
  const usdcPath = describeArc(center, center, radius, treasuryEndAngle, usdcEndAngle);

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-sm font-medium text-lotus-grey-300 mb-3">LotusUSD Allocation</h4>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {treasuryAllocation > 0 && (
          <path
            d={treasuryPath}
            fill="#10b981"
            stroke="#0D0A14"
            strokeWidth="2"
          />
        )}
        {usdcAllocation > 0 && (
          <path
            d={usdcPath}
            fill="#3b82f6"
            stroke="#0D0A14"
            strokeWidth="2"
          />
        )}
        <circle cx={center} cy={center} r={radius * 0.5} fill="#191621" />
      </svg>

      <div className="flex gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span className="text-sm text-lotus-grey-300">USDC ({(usdcAllocation * 100).toFixed(0)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-sm text-lotus-grey-300">Treasuries ({(treasuryAllocation * 100).toFixed(0)}%)</span>
        </div>
      </div>
    </div>
  );
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);

  const angleDiff = endAngle - startAngle;
  const largeArcFlag = angleDiff > Math.PI ? 1 : 0;

  if (Math.abs(angleDiff - 2 * Math.PI) < 0.001) {
    const mid = polarToCartesian(cx, cy, radius, startAngle + Math.PI);
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, 0, 1, mid.x, mid.y,
      'A', radius, radius, 0, 0, 1, start.x, start.y,
      'L', cx, cy,
      'Z'
    ].join(' ');
  }

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y,
    'L', cx, cy,
    'Z'
  ].join(' ');
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle)
  };
}

const ALLOCATION_PRESETS = [
  { value: 0.1, label: 'Liquidity-first', description: 'Low treasury exposure, maximum liquidity' },
  { value: 0.5, label: 'Balanced', description: 'Equal USDC and Treasury allocation' },
  { value: 0.8, label: 'Yield-first', description: 'Higher treasury exposure for yield' },
  { value: 0.95, label: 'Max yield', description: 'Maximum treasury exposure' },
];

function AllocationSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-lotus-grey-300">Treasury Allocation</label>
        <span className="text-sm font-mono text-emerald-400">{(value * 100).toFixed(0)}%</span>
      </div>
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 mb-2">
        {ALLOCATION_PRESETS.map(preset => (
          <button
            key={preset.value}
            onClick={() => onChange(preset.value)}
            title={preset.description}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              Math.abs(value - preset.value) < 0.01
                ? 'bg-emerald-600 text-white'
                : 'bg-lotus-grey-700 text-lotus-grey-300 hover:bg-lotus-grey-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <input
        type="range"
        value={value * 100}
        onChange={(e) => onChange(parseFloat(e.target.value) / 100)}
        min="0"
        max="100"
        step="1"
        className="w-full"
      />
      <div className="flex justify-between text-xs text-lotus-grey-300">
        <span>0% (All USDC)</span>
        <span>50%</span>
        <span>100% (All Treasuries)</span>
      </div>
    </div>
  );
}

export function LotusUSDAllocation({
  treasuryAllocation,
  treasuryRate,
  onTreasuryAllocationChange,
  onTreasuryRateChange,
}: LotusUSDAllocationProps) {
  const productiveDebtRate = useMemo(() => {
    return treasuryRate * treasuryAllocation;
  }, [treasuryRate, treasuryAllocation]);

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

  return (
    <div className="space-y-6">
      <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50 mb-4">
        <p className="text-sm text-emerald-200">
          <TermDefinition term="lotususd">LotusUSD</TermDefinition> is a yield-bearing vault token backed by USDC and short-term Treasuries.
          Its yield becomes the market's base rate, allowing idle liquidity to earn yield even when not being borrowed.
        </p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-lotus-grey-400 self-center mr-2">Presets:</span>
        <button
          onClick={() => { onTreasuryAllocationChange(0.8); onTreasuryRateChange(0.04); }}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            treasuryAllocation === 0.8 && treasuryRate === 0.04
              ? 'bg-lotus-purple-900/30 border-lotus-purple-500 text-lotus-purple-300'
              : 'bg-lotus-grey-700/50 border-lotus-grey-600 text-lotus-grey-300 hover:border-lotus-grey-500'
          }`}
        >
          Typical (80% @ 4%)
        </button>
        <button
          onClick={() => { onTreasuryAllocationChange(0.95); onTreasuryRateChange(0.05); }}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            treasuryAllocation === 0.95 && treasuryRate === 0.05
              ? 'bg-emerald-900/30 border-emerald-500 text-emerald-300'
              : 'bg-lotus-grey-700/50 border-lotus-grey-600 text-lotus-grey-300 hover:border-lotus-grey-500'
          }`}
        >
          High Yield (95% @ 5%)
        </button>
        <button
          onClick={() => { onTreasuryAllocationChange(0.5); onTreasuryRateChange(0.035); }}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            treasuryAllocation === 0.5 && treasuryRate === 0.035
              ? 'bg-blue-900/30 border-blue-500 text-blue-300'
              : 'bg-lotus-grey-700/50 border-lotus-grey-600 text-lotus-grey-300 hover:border-lotus-grey-500'
          }`}
        >
          High Liquidity (50% @ 3.5%)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700 flex items-center justify-center">
          <AllocationPieChart treasuryAllocation={treasuryAllocation} />
        </div>

        <div className="space-y-6">
          <div className="bg-lotus-grey-800 rounded-lg p-4 border border-lotus-grey-700">
            <h3 className="text-sm font-medium text-lotus-grey-300 mb-4">Inputs</h3>
            <div className="space-y-4">
              <AllocationSlider
                value={treasuryAllocation}
                onChange={onTreasuryAllocationChange}
              />
              <RateInput
                label="US Treasury Rate"
                value={treasuryRate}
                onChange={onTreasuryRateChange}
                description="Current yield on US Treasury bills"
              />
            </div>
          </div>

          <div className="bg-lotus-grey-800 rounded-lg p-4 border border-lotus-grey-700">
            <h3 className="text-sm font-medium text-lotus-grey-300 mb-3">Output</h3>
            <div className="p-4 bg-emerald-900/30 rounded-lg border border-emerald-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-300 font-medium">Productive Debt Rate</span>
                <span className="text-2xl font-mono font-bold text-emerald-400">
                  {formatPercent(productiveDebtRate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-lotus-grey-800/50 rounded-lg p-4 border border-lotus-grey-700">
        <p className="text-sm text-lotus-grey-300">
          The % allocated to treasuries will vary depending on market conditions. It is designed to maintain
          sufficient instantaneous market liquidity while maximizing the % allocated to treasuries.
        </p>
      </div>

      <DynamicInsight show={treasuryAllocation >= 0.95} variant="info">
        <strong>Maximum Treasury Exposure:</strong> At near-100% treasury allocation, the productive debt rate equals the full treasury rate. However, this leaves minimal USDC reserves for instant redemptions.
      </DynamicInsight>

      <DynamicInsight show={treasuryAllocation <= 0.05} variant="warning">
        <strong>Minimal Yield:</strong> With treasury allocation near 0%, the productive debt rate approaches zero. All backing is in USDC which earns no yield, but provides maximum liquidity for redemptions.
      </DynamicInsight>

      <div className="bg-lotus-grey-800 rounded-lg p-4 border border-lotus-grey-700">
        <h3 className="text-sm font-medium text-lotus-grey-300 mb-3">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-700/50">
            <div className="font-medium text-blue-300 mb-1">USDC Reserve</div>
            <p className="text-blue-400 text-xs">
              Held as instant liquidity for redemptions. Earns 0% yield but provides stability.
            </p>
          </div>
          <div className="p-3 bg-emerald-900/30 rounded-lg border border-emerald-700/50">
            <div className="font-medium text-emerald-300 mb-1">Treasury Holdings</div>
            <p className="text-emerald-400 text-xs">
              Invested in US Treasury bills to generate yield for the productive debt base rate.
            </p>
          </div>
          <div className="p-3 bg-lotus-purple-900/30 rounded-lg border border-lotus-purple-700/50">
            <div className="font-medium text-lotus-purple-300 mb-1">Productive Debt Rate</div>
            <p className="text-lotus-purple-400 text-xs">
              The rate earned by idle supply. Used in the next section to compress spreads.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
