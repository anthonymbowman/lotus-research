import { useMemo } from 'react';
import type { TrancheData } from '../types';
import { formatNumber, formatPercent } from '../math/lotusAccounting';

interface IsolatedComparisonProps {
  /** Computed tranche data from Lotus */
  tranches: TrancheData[];
  /** Productive debt rate (base rate) */
  productiveDebtRate: number;
}

interface ComparisonPoint {
  lltv: number;
  // Constant
  borrowRate: number;
  supply: number;
  // Lotus
  lotusBorrowAmount: number;
  lotusSupplyRate: number;
  lotusFreeSupply: number;
  lotusLiquidityPercent: number;
  // Isolated
  isoBorrowAmount: number;
  isoSupplyRate: number;
  isoLiquidityPercent: number;
  // Comparison
  borrowAmountDiff: number;
}

/**
 * Compares Lotus tranche system to hypothetical isolated markets.
 * Holds borrow rate and supply constant, shows how isolated markets
 * must limit borrowing to maintain the same lender liquidity.
 */
export function IsolatedComparison({ tranches, productiveDebtRate }: IsolatedComparisonProps) {
  const comparison = useMemo(() => {
    return tranches.map((t): ComparisonPoint => {
      // Constants (same for both)
      // Borrow rate = base rate + spread (t.borrowRate is the spread)
      const spread = t.borrowRate;
      const borrowRate = productiveDebtRate + spread;
      const supply = t.supplyAssets;

      // Lotus values
      const lotusBorrowAmount = t.borrowAssets;
      const lotusFreeSupply = t.freeSupply;
      const lotusLiquidityPercent = supply > 0 ? lotusFreeSupply / supply : 1;
      // Lotus supply rate from cascade (add productiveDebtRate as base)
      const lotusSupplyRate = productiveDebtRate + (t.supplyRate ?? 0);

      // Isolated market: to maintain same liquidity %, borrow must be limited
      // In isolated market: liquidityPercent = (supply - borrow) / supply
      // Setting equal to Lotus: (supply - isoBorrow) / supply = freeSupply / supply
      // So: isoBorrow = supply - freeSupply = supply * (1 - freeSupply/supply)
      const maxIsoBorrow = supply * (1 - lotusLiquidityPercent);
      const isoBorrowAmount = Math.min(lotusBorrowAmount, Math.max(0, maxIsoBorrow));

      // Isolated liquidity (should match Lotus when not demand-capped)
      const isoLiquidityPercent = supply > 0 ? (supply - isoBorrowAmount) / supply : 1;

      // Isolated supply rate = (base + spread) × (isoBorrowAmount / supply)
      const isoUtilization = supply > 0 ? isoBorrowAmount / supply : 0;
      const isoSupplyRate = borrowRate * isoUtilization;

      return {
        lltv: t.lltv,
        borrowRate,
        supply,
        lotusBorrowAmount,
        lotusSupplyRate,
        lotusFreeSupply,
        lotusLiquidityPercent,
        isoBorrowAmount,
        isoSupplyRate,
        isoLiquidityPercent,
        borrowAmountDiff: lotusBorrowAmount - isoBorrowAmount,
      };
    });
  }, [tranches, productiveDebtRate]);

  // Totals
  const totals = useMemo(() => {
    const totalSupply = comparison.reduce((sum, c) => sum + c.supply, 0);
    const lotusTotalBorrow = comparison.reduce((sum, c) => sum + c.lotusBorrowAmount, 0);
    const isoTotalBorrow = comparison.reduce((sum, c) => sum + c.isoBorrowAmount, 0);

    // Weighted average supply rates
    const lotusAvgSupplyRate = comparison.reduce((sum, c) =>
      sum + c.lotusSupplyRate * c.supply, 0) / totalSupply;
    const isoAvgSupplyRate = comparison.reduce((sum, c) =>
      sum + c.isoSupplyRate * c.supply, 0) / totalSupply;

    return {
      totalSupply,
      lotusTotalBorrow,
      isoTotalBorrow,
      borrowDiff: lotusTotalBorrow - isoTotalBorrow,
      borrowDiffPercent: isoTotalBorrow > 0 ? (lotusTotalBorrow - isoTotalBorrow) / isoTotalBorrow : 0,
      lotusAvgSupplyRate,
      isoAvgSupplyRate,
      supplyRateDiff: lotusAvgSupplyRate - isoAvgSupplyRate,
    };
  }, [comparison]);

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
        <h4 className="font-medium text-lotus-grey-200 mb-3">What This Comparison Shows</h4>
        <div className="text-sm text-lotus-grey-300 space-y-2">
          <p>
            We compare Lotus's connected liquidity to <strong className="text-lotus-grey-300">hypothetical isolated markets</strong> while
            holding <strong className="text-lotus-grey-300">borrow rate</strong> and <strong className="text-lotus-grey-300">supply</strong> constant at each LLTV.
          </p>
          <div className="bg-lotus-grey-800 rounded p-3 border border-lotus-grey-700 my-3">
            <p className="font-medium text-lotus-grey-200 mb-2">Key Constraint:</p>
            <p className="text-sm text-lotus-grey-300">
              To maintain the same <strong className="text-lotus-grey-300">lender liquidity</strong> (% of supply that can be withdrawn instantly),
              isolated markets must limit how much can be borrowed.
            </p>
            <div className="font-mono text-xs mt-2 space-y-1 text-lotus-grey-300">
              <p>Lotus liquidity = freeSupply ÷ supply</p>
              <p>Isolated liquidity = (supply − borrow) ÷ supply</p>
              <p className="text-emerald-400">∴ isoBorrow = min(demand, supply × (1 − freeSupply ÷ supply))</p>
            </div>
          </div>
          <p className="font-medium text-lotus-grey-200">Result:</p>
          <p>
            Isolated markets support <strong className="text-lotus-grey-300">less borrowing</strong> and therefore generate
            <strong className="text-lotus-grey-300"> lower supply rates</strong> for lenders, even at the same borrow rate.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-lotus-purple-900/30 rounded-lg p-4 border border-lotus-purple-700/50">
          <div className="text-xs text-lotus-purple-300">Lotus Total Borrow</div>
          <div className="text-xl font-mono font-semibold text-lotus-purple-300">
            ${formatNumber(totals.lotusTotalBorrow, 0)}
          </div>
        </div>
        <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
          <div className="text-xs text-lotus-grey-300">Isolated Total Borrow</div>
          <div className="text-xl font-mono font-semibold text-lotus-grey-300">
            ${formatNumber(totals.isoTotalBorrow, 0)}
          </div>
        </div>
        <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-700/50">
          <div className="text-xs text-emerald-400">Lotus Avg Supply Rate</div>
          <div className="text-xl font-mono font-semibold text-emerald-300">
            {formatPercent(totals.lotusAvgSupplyRate, 2)}
          </div>
        </div>
        <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
          <div className="text-xs text-lotus-grey-300">Isolated Avg Supply Rate</div>
          <div className="text-xl font-mono font-semibold text-lotus-grey-300">
            {formatPercent(totals.isoAvgSupplyRate, 2)}
          </div>
        </div>
      </div>

      {/* Benefits summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-lotus-purple-900/20 rounded-lg p-3 border border-lotus-purple-700/50">
          <div className="text-sm text-lotus-purple-300">
            <strong>More Borrowing:</strong> Lotus enables{' '}
            <span className="font-mono">${formatNumber(totals.borrowDiff, 0)}</span>{' '}
            ({formatPercent(totals.borrowDiffPercent, 0)}) more borrowing at the same liquidity level
          </div>
        </div>
        <div className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-700/50">
          <div className="text-sm text-emerald-300">
            <strong>Higher Yield:</strong> Lenders earn{' '}
            <span className="font-mono">{formatPercent(totals.supplyRateDiff, 2)}</span>{' '}
            more on average due to higher utilization
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-lotus-grey-800 rounded-lg p-4 border border-lotus-grey-700">
        <h4 className="font-medium text-lotus-grey-200 mb-4">Rates by LLTV</h4>
        <RateComparisonChart data={comparison} />
      </div>

      {/* Data Table */}
      <div className="bg-lotus-grey-800 rounded-lg border border-lotus-grey-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-lotus-grey-700 bg-lotus-grey-800">
              <th className="text-left py-2 px-3 font-semibold text-lotus-grey-300">LLTV</th>
              <th className="text-right py-2 px-3 font-semibold text-lotus-grey-300">Borrow Rate</th>
              <th className="text-right py-2 px-3 font-semibold text-lotus-grey-300">Supply</th>
              <th className="text-right py-2 px-3 font-semibold text-lotus-purple-300">Lotus Borrow</th>
              <th className="text-right py-2 px-3 font-semibold text-lotus-grey-300">Iso Borrow</th>
              <th className="text-right py-2 px-3 font-semibold text-lotus-purple-300">Liquidity %</th>
              <th className="text-right py-2 px-3 font-semibold text-emerald-400">Lotus Supply Rate</th>
              <th className="text-right py-2 px-3 font-semibold text-lotus-grey-300">Iso Supply Rate</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((c) => (
              <tr key={c.lltv} className="border-b border-lotus-grey-700 hover:bg-lotus-grey-700/30">
                <td className="py-2 px-3 font-medium text-lotus-grey-300">{c.lltv}%</td>
                <td className="py-2 px-3 text-right font-mono text-lotus-grey-300">
                  {formatPercent(c.borrowRate, 2)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-lotus-grey-300">
                  ${formatNumber(c.supply, 0)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-lotus-purple-300">
                  ${formatNumber(c.lotusBorrowAmount, 0)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-lotus-grey-300">
                  ${formatNumber(c.isoBorrowAmount, 0)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-lotus-purple-300">
                  {formatPercent(c.lotusLiquidityPercent, 0)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-emerald-400">
                  {formatPercent(c.lotusSupplyRate, 2)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-lotus-grey-300">
                  {formatPercent(c.isoSupplyRate, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formula explanation */}
      <div className="bg-lotus-grey-700/50 rounded-lg p-3 text-sm text-lotus-grey-300">
        <div className="font-mono text-xs space-y-1">
          <p><strong className="text-lotus-grey-300">Borrow Rate:</strong> baseRate + spread (constant for both)</p>
          <p><strong className="text-lotus-grey-300">Iso Borrow:</strong> min(lotusBorrow, supply × (1 − freeSupply ÷ supply))</p>
          <p><strong className="text-lotus-grey-300">Iso Supply Rate:</strong> (baseRate + spread) × (isoBorrow ÷ supply)</p>
          <p><strong className="text-lotus-grey-300">Lotus Supply Rate:</strong> from cascade mechanism (includes base rate)</p>
        </div>
      </div>

      {/* Why isolated markets can't serve high-risk borrowers */}
      <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-700/50">
        <h4 className="font-medium text-amber-300 mb-3">
          Why Isolated Markets Can't Efficiently Serve High-Risk Borrowers
        </h4>
        <div className="text-sm text-amber-200/80 space-y-3">
          <p>
            In practice, isolated lending markets converge toward a <strong className="text-amber-300">single equilibrium LLTV per asset pair</strong>.
            This is a game-theoretical result:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong className="text-amber-300">Lenders concentrate in the safest market</strong> — Given a choice between isolated markets
              at 75%, 80%, 85%, etc., risk-averse lenders prefer the lower LLTV for less default exposure.
            </li>
            <li>
              <strong className="text-amber-300">Liquidity fragments and dries up</strong> — With lenders concentrated in safe tranches,
              higher-LLTV markets have insufficient supply, driving up rates until borrowing becomes uneconomical.
            </li>
            <li>
              <strong className="text-amber-300">Equilibrium: one market wins</strong> — The market converges to a single LLTV that balances
              lender risk appetite with borrower demand. Higher-risk tranches simply don't exist in equilibrium.
            </li>
          </ul>
          <p className="font-medium text-amber-300 mt-3">
            Lotus solves this by connecting liquidity across tranches. Lenders at any LLTV benefit from the full
            stack's liquidity, enabling sustainable markets at higher LLTVs (85%, 90%, 95%) that would be
            impossible with isolated markets.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * SVG Line chart comparing rates across LLTVs
 * Shows: Borrow Rate (constant), Lotus Supply Rate, Isolated Supply Rate
 */
function RateComparisonChart({ data }: { data: ComparisonPoint[] }) {
  const width = 600;
  const height = 320;
  const padding = { top: 30, right: 140, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate rate range
  let minRate = Infinity;
  let maxRate = 0;
  for (const point of data) {
    minRate = Math.min(minRate, point.isoSupplyRate, point.lotusSupplyRate);
    maxRate = Math.max(maxRate, point.borrowRate, point.lotusSupplyRate, point.isoSupplyRate);
  }
  // Add padding
  minRate = Math.max(0, minRate - 0.005);
  maxRate = maxRate + 0.01;

  // LLTV range
  const lltvs = data.map(d => d.lltv);
  const minLltv = Math.min(...lltvs);
  const maxLltv = Math.max(...lltvs);
  const lltvRange = maxLltv - minLltv;

  // Scale functions
  const xScale = (lltv: number) => padding.left + ((lltv - minLltv) / lltvRange) * chartWidth;
  const yScale = (rate: number) => padding.top + chartHeight - ((rate - minRate) / (maxRate - minRate)) * chartHeight;

  // Generate path data
  const generatePath = (getValue: (p: ComparisonPoint) => number) => {
    const points = data.map((p) => `${xScale(p.lltv)},${yScale(getValue(p))}`);
    return `M${points.join(' L')}`;
  };

  // Y-axis ticks
  const yTickCount = 6;
  const yTicks = Array.from({ length: yTickCount }, (_, i) =>
    minRate + (i / (yTickCount - 1)) * (maxRate - minRate)
  );

  return (
    <div>
      <svg width={width} height={height} className="overflow-visible mx-auto block">
        {/* Grid lines */}
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

        {/* Borrow Rate (constant per tranche - orange line) */}
        <path
          d={generatePath((p) => p.borrowRate)}
          fill="none"
          stroke="#f97316"
          strokeWidth="2.5"
        />

        {/* Lotus Supply Rate (solid emerald) */}
        <path
          d={generatePath((p) => p.lotusSupplyRate)}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
        />

        {/* Isolated Supply Rate (dashed gray) */}
        <path
          d={generatePath((p) => p.isoSupplyRate)}
          fill="none"
          stroke="#736D7F"
          strokeWidth="2"
          strokeDasharray="6,4"
        />

        {/* Data points */}
        {data.map((point) => (
          <g key={point.lltv}>
            <circle cx={xScale(point.lltv)} cy={yScale(point.borrowRate)} r="4" fill="#f97316" />
            <circle cx={xScale(point.lltv)} cy={yScale(point.lotusSupplyRate)} r="4" fill="#10b981" />
            <circle cx={xScale(point.lltv)} cy={yScale(point.isoSupplyRate)} r="3" fill="#736D7F" />
          </g>
        ))}

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#736D7F"
          strokeWidth="1"
        />

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#736D7F"
          strokeWidth="1"
        />

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={`y-label-${i}`}
            x={padding.left - 8}
            y={yScale(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-xs fill-lotus-grey-400"
          >
            {(tick * 100).toFixed(1)}%
          </text>
        ))}

        {/* X-axis labels */}
        {lltvs.map((tick) => (
          <text
            key={`x-label-${tick}`}
            x={xScale(tick)}
            y={height - padding.bottom + 16}
            textAnchor="middle"
            className="text-xs fill-lotus-grey-400"
          >
            {tick}%
          </text>
        ))}

        {/* Axis titles */}
        <text
          x={(padding.left + width - padding.right) / 2}
          y={height - 8}
          textAnchor="middle"
          className="text-xs fill-lotus-grey-300 font-medium"
        >
          LLTV
        </text>
        <text
          x={16}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 16, ${height / 2})`}
          className="text-xs fill-lotus-grey-300 font-medium"
        >
          Rate (APR)
        </text>

        {/* Legend on right side */}
        <g transform={`translate(${width - padding.right + 10}, ${padding.top + 20})`}>
          <g>
            <line x1="0" y1="0" x2="20" y2="0" stroke="#f97316" strokeWidth="2.5" />
            <circle cx="10" cy="0" r="3" fill="#f97316" />
            <text x="28" y="0" dominantBaseline="middle" className="text-xs fill-lotus-grey-300">Borrow Rate</text>
          </g>
          <g transform="translate(0, 24)">
            <line x1="0" y1="0" x2="20" y2="0" stroke="#10b981" strokeWidth="2.5" />
            <circle cx="10" cy="0" r="3" fill="#10b981" />
            <text x="28" y="0" dominantBaseline="middle" className="text-xs fill-lotus-grey-300">Lotus Supply</text>
          </g>
          <g transform="translate(0, 48)">
            <line x1="0" y1="0" x2="20" y2="0" stroke="#736D7F" strokeWidth="2" strokeDasharray="4,3" />
            <circle cx="10" cy="0" r="3" fill="#736D7F" />
            <text x="28" y="0" dominantBaseline="middle" className="text-xs fill-lotus-grey-300">Iso Supply</text>
          </g>
        </g>
      </svg>
    </div>
  );
}

export default IsolatedComparison;
