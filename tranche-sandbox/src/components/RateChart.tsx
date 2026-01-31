import { useMemo } from 'react';
import type { TrancheData } from '../types';
import { formatPercent } from '../math/lotusAccounting';

interface RateChartProps {
  /** Computed tranche data */
  tranches: TrancheData[];
  /** Productive debt rate (base rate from LotusUSD) */
  productiveDebtRate: number;
}

/**
 * Line chart showing total borrow and supply rates by LLTV (inclusive of PD).
 */
export function RateChart({ tranches, productiveDebtRate }: RateChartProps) {
  const chartData = useMemo(() => {
    // Find max rate for scaling (using total rates with PD)
    let maxRate = 0;
    tranches.forEach(t => {
      const totalBorrowRate = productiveDebtRate + t.borrowRate;
      const totalSupplyRate = t.supplyRate !== null ? productiveDebtRate + t.supplyRate : null;
      if (totalBorrowRate > maxRate) maxRate = totalBorrowRate;
      if (totalSupplyRate !== null && totalSupplyRate > maxRate) maxRate = totalSupplyRate;
    });
    // Add 20% padding, minimum 5%
    maxRate = Math.max(maxRate * 1.2, 0.05);

    return { maxRate };
  }, [tranches, productiveDebtRate]);

  if (tranches.length === 0) return null;

  const chartWidth = 500;
  const chartHeight = 200;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  // Calculate x positions for each data point
  const xStep = graphWidth / (tranches.length - 1 || 1);
  const getX = (index: number) => paddingLeft + index * xStep;
  const getY = (rate: number) => paddingTop + graphHeight - (rate / chartData.maxRate) * graphHeight;

  // Build path data for lines (using total rates with PD)
  const borrowPoints = tranches.map((t, i) => ({
    x: getX(i),
    y: getY(productiveDebtRate + t.borrowRate),
    totalRate: productiveDebtRate + t.borrowRate,
  }));
  const supplyPoints = tranches
    .map((t, i) => t.supplyRate !== null ? {
      x: getX(i),
      y: getY(productiveDebtRate + t.supplyRate),
      totalRate: productiveDebtRate + t.supplyRate,
    } : null)
    .filter((p): p is { x: number; y: number; totalRate: number } => p !== null);

  const buildPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  // Y-axis tick values
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => f * chartData.maxRate);

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Rates by LLTV</h3>

      <div className="flex gap-6 items-start">
        <svg width={chartWidth} height={chartHeight} className="overflow-visible">
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={getY(tick)}
                x2={chartWidth - paddingRight}
                y2={getY(tick)}
                stroke="#e2e8f0"
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 8}
                y={getY(tick)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-xs fill-slate-400"
              >
                {formatPercent(tick)}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {tranches.map((t, i) => (
            <text
              key={i}
              x={getX(i)}
              y={chartHeight - paddingBottom + 20}
              textAnchor="middle"
              className="text-xs fill-slate-600 font-medium"
            >
              {t.lltv}%
            </text>
          ))}

          {/* X-axis title */}
          <text
            x={paddingLeft + graphWidth / 2}
            y={chartHeight - 5}
            textAnchor="middle"
            className="text-xs fill-slate-500"
          >
            LLTV
          </text>

          {/* Borrow rate line */}
          <path
            d={buildPath(borrowPoints)}
            fill="none"
            stroke="#f97316"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Supply rate line */}
          {supplyPoints.length > 0 && (
            <path
              d={buildPath(supplyPoints)}
              fill="none"
              stroke="#14b8a6"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Total borrow rate points */}
          {borrowPoints.map((p, i) => (
            <g key={`borrow-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={5}
                fill="#f97316"
                className="cursor-pointer"
              />
              <title>Total Borrow Rate: {formatPercent(p.totalRate)}</title>
            </g>
          ))}

          {/* Total supply rate points */}
          {supplyPoints.map((p, i) => (
            <g key={`supply-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={5}
                fill="#14b8a6"
                className="cursor-pointer"
              />
              <title>Total Supply Rate: {formatPercent(p.totalRate)}</title>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex flex-col gap-2 text-xs pt-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-orange-500 rounded"></div>
            <span className="text-slate-600">Total Borrow Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-teal-500 rounded"></div>
            <span className="text-slate-600">Total Supply Rate</span>
          </div>
          <div className="text-slate-400 mt-1 text-[10px]">
            (includes {formatPercent(productiveDebtRate)} PD rate)
          </div>
        </div>
      </div>
    </div>
  );
}

export default RateChart;
