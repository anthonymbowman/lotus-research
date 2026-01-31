import { useMemo } from 'react';
import { RateInput } from './RateInput';

interface LotusUSDAllocationProps {
  treasuryAllocation: number; // 0-1
  treasuryRate: number; // 0-1
  onTreasuryAllocationChange: (value: number) => void;
  onTreasuryRateChange: (value: number) => void;
}

/**
 * SVG Pie Chart component for USDC vs Treasuries allocation
 */
function AllocationPieChart({ treasuryAllocation }: { treasuryAllocation: number }) {
  const usdcAllocation = 1 - treasuryAllocation;

  // SVG pie chart calculations
  const size = 200;
  const center = size / 2;
  const radius = 80;

  // Calculate the arc path for treasuries (starting from top, going clockwise)
  const treasuryAngle = treasuryAllocation * 2 * Math.PI;
  const usdcAngle = usdcAllocation * 2 * Math.PI;

  // Start at 12 o'clock position
  const startAngle = -Math.PI / 2;

  // Treasury arc (first slice, clockwise from top)
  const treasuryEndAngle = startAngle + treasuryAngle;
  const treasuryPath = describeArc(center, center, radius, startAngle, treasuryEndAngle);

  // USDC arc (second slice)
  const usdcEndAngle = treasuryEndAngle + usdcAngle;
  const usdcPath = describeArc(center, center, radius, treasuryEndAngle, usdcEndAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Treasury slice (green) */}
        {treasuryAllocation > 0 && (
          <path
            d={treasuryPath}
            fill="#10b981"
            stroke="#fff"
            strokeWidth="2"
          />
        )}
        {/* USDC slice (blue) */}
        {usdcAllocation > 0 && (
          <path
            d={usdcPath}
            fill="#3b82f6"
            stroke="#fff"
            strokeWidth="2"
          />
        )}
        {/* Center hole for donut effect */}
        <circle cx={center} cy={center} r={radius * 0.5} fill="#f8fafc" />
        {/* Center text */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          className="fill-slate-600 text-xs font-medium"
        >
          LotusUSD
        </text>
        <text
          x={center}
          y={center + 8}
          textAnchor="middle"
          className="fill-slate-500 text-xs"
        >
          Backing
        </text>
      </svg>

      {/* Legend */}
      <div className="flex gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span className="text-sm text-slate-600">USDC ({(usdcAllocation * 100).toFixed(0)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-sm text-slate-600">Treasuries ({(treasuryAllocation * 100).toFixed(0)}%)</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to describe an SVG arc path
 */
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

  // Handle full circle case
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

/**
 * Allocation slider component
 */
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
        <label className="block text-sm font-medium text-gray-700">Treasury Allocation</label>
        <span className="text-sm font-mono text-emerald-600">{(value * 100).toFixed(0)}%</span>
      </div>
      <input
        type="range"
        value={value * 100}
        onChange={(e) => onChange(parseFloat(e.target.value) / 100)}
        min="0"
        max="100"
        step="1"
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>0% (All USDC)</span>
        <span>50%</span>
        <span>100% (All Treasuries)</span>
      </div>
    </div>
  );
}

/**
 * LotusUSD Allocation component - introduces users to LotusUSD backing
 */
export function LotusUSDAllocation({
  treasuryAllocation,
  treasuryRate,
  onTreasuryAllocationChange,
  onTreasuryRateChange,
}: LotusUSDAllocationProps) {
  // Calculate productive debt rate
  const productiveDebtRate = useMemo(() => {
    return treasuryRate * treasuryAllocation;
  }, [treasuryRate, treasuryAllocation]);

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
        <p className="text-sm text-emerald-800">
          LotusUSD is backed by USDC and US Treasuries. The treasury yield generates the base rate
          for productive debt, allowing idle liquidity to earn yield even when not being borrowed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 flex items-center justify-center">
          <AllocationPieChart treasuryAllocation={treasuryAllocation} />
        </div>

        {/* Inputs and Output */}
        <div className="space-y-6">
          {/* Inputs */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Inputs</h3>
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

          {/* Output */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Output</h3>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-800 font-medium">Productive Debt Rate</span>
                <span className="text-2xl font-mono font-bold text-emerald-700">
                  {formatPercent(productiveDebtRate)}
                </span>
              </div>
              <p className="text-xs text-emerald-600 mt-2">
                = Treasury Rate x Treasury Allocation
              </p>
              <p className="text-xs text-emerald-600">
                = {formatPercent(treasuryRate)} x {(treasuryAllocation * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-800 mb-1">USDC Reserve</div>
            <p className="text-blue-600 text-xs">
              Held as instant liquidity for redemptions. Earns 0% yield but provides stability.
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <div className="font-medium text-emerald-800 mb-1">Treasury Holdings</div>
            <p className="text-emerald-600 text-xs">
              Invested in US Treasury bills to generate yield for the productive debt base rate.
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="font-medium text-purple-800 mb-1">Productive Debt Rate</div>
            <p className="text-purple-600 text-xs">
              The rate earned by idle supply. Used in the next section to compress spreads.
            </p>
          </div>
        </div>
      </div>

      {/* Formula */}
      <details className="bg-gray-50 rounded-lg border border-gray-200">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-100">
          Show Formula
        </summary>
        <div className="px-4 pb-4 text-sm text-gray-600 font-mono space-y-2">
          <p>productiveDebtRate = treasuryRate x treasuryAllocation</p>
          <p>productiveDebtRate = {formatPercent(treasuryRate)} x {treasuryAllocation.toFixed(2)} = {formatPercent(productiveDebtRate)}</p>
        </div>
      </details>
    </div>
  );
}
