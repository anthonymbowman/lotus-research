import type { ChartPoint } from '../types';

interface PDRateChartProps {
  data: ChartPoint[];
  currentUtilization: number;
  showBorrowRates?: boolean;
  title?: string;
}

/**
 * SVG line chart for rates vs utilization (Productive Debt)
 */
export function PDRateChart({
  data,
  currentUtilization,
  showBorrowRates = false,
  title,
}: PDRateChartProps) {
  const width = 400;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate max rate for y-axis scale
  let maxRate = 0;
  for (const point of data) {
    maxRate = Math.max(maxRate, point.supplyPD, point.supplyNoPD);
    if (showBorrowRates && point.borrowPD !== undefined && point.borrowNoPD !== undefined) {
      maxRate = Math.max(maxRate, point.borrowPD, point.borrowNoPD);
    }
  }
  // Round up to nice number
  maxRate = Math.ceil(maxRate * 100) / 100;
  if (maxRate === 0) maxRate = 0.15;

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

  // Current utilization marker
  const currentX = xScale(currentUtilization);

  // Y-axis ticks
  const yTicks = [0, maxRate / 4, maxRate / 2, (maxRate * 3) / 4, maxRate];

  // X-axis ticks
  const xTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-lotus-grey-800 rounded p-4 border border-lotus-grey-700">
      {title && <h3 className="text-sm font-medium text-lotus-grey-300 mb-2">{title}</h3>}
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <line
            key={`y-grid-${i}`}
            x1={padding.left}
            y1={yScale(tick)}
            x2={width - padding.right}
            y2={yScale(tick)}
            stroke="#3D3B47"
            strokeWidth="1"
          />
        ))}

        {/* Current utilization marker */}
        <line
          x1={currentX}
          y1={padding.top}
          x2={currentX}
          y2={height - padding.bottom}
          stroke="#8E62FF"
          strokeWidth="2"
          strokeDasharray="4,4"
          opacity="0.5"
        />

        {/* 90% utilization reference (for scenario 2) */}
        {showBorrowRates && (
          <line
            x1={xScale(0.9)}
            y1={padding.top}
            x2={xScale(0.9)}
            y2={height - padding.bottom}
            stroke="#9ca3af"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        )}

        {/* Supply rate lines */}
        <path
          d={generatePath((p) => p.supplyPD)}
          fill="none"
          stroke="#6BF4A0"
          strokeWidth="2"
        />
        <path
          d={generatePath((p) => p.supplyNoPD)}
          fill="none"
          stroke="#6BF4A0"
          strokeWidth="2"
          strokeDasharray="6,4"
          opacity="0.6"
        />

        {/* Borrow rate lines (optional) */}
        {showBorrowRates && (
          <>
            <path
              d={generatePath((p) => p.borrowPD)}
              fill="none"
              stroke="#FFA5CD"
              strokeWidth="2"
            />
            <path
              d={generatePath((p) => p.borrowNoPD)}
              fill="none"
              stroke="#FFA5CD"
              strokeWidth="2"
              strokeDasharray="6,4"
              opacity="0.6"
            />
          </>
        )}

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#6B6978"
          strokeWidth="1"
        />

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#6B6978"
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
            className="text-xs fill-lotus-grey-400"
          >
            {(tick * 100).toFixed(0)}%
          </text>
        ))}

        {/* Axis titles */}
        <text
          x={width / 2}
          y={height - 4}
          textAnchor="middle"
          className="text-xs fill-lotus-grey-300 font-medium"
        >
          Utilization
        </text>
        <text
          x={12}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 12, ${height / 2})`}
          className="text-xs fill-lotus-grey-300 font-medium"
        >
          Rate (APR)
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-rating-a"></div>
          <span className="text-lotus-grey-300">Supply (PD)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-rating-a opacity-60" style={{ borderBottom: '2px dashed' }}></div>
          <span className="text-lotus-grey-300">Supply (no PD)</span>
        </div>
        {showBorrowRates && (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-rating-c-plus"></div>
              <span className="text-lotus-grey-300">Borrow (PD)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-rating-c-plus opacity-60" style={{ borderBottom: '2px dashed' }}></div>
              <span className="text-lotus-grey-300">Borrow (no PD)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
