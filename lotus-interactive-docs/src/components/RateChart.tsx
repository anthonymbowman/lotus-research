import { useState, useMemo, useRef } from 'react';
import type { TrancheData } from '../types';
import { formatPercent } from '../math/lotusAccounting';
import { ExportButton } from './ExportButton';

interface RateChartProps {
  tranches: TrancheData[];
  productiveDebtRate: number;
}

interface HoverInfo {
  x: number;
  y: number;
  lltv: number;
  borrowRate: number;
  supplyRate: number | null;
  type: 'borrow' | 'supply';
}

export function RateChart({ tranches, productiveDebtRate }: RateChartProps) {
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(() => {
    let maxRate = 0;
    tranches.forEach(t => {
      const totalBorrowRate = productiveDebtRate + t.borrowRate;
      const totalSupplyRate = t.supplyRate !== null ? productiveDebtRate + t.supplyRate : null;
      if (totalBorrowRate > maxRate) maxRate = totalBorrowRate;
      if (totalSupplyRate !== null && totalSupplyRate > maxRate) maxRate = totalSupplyRate;
    });
    maxRate = Math.max(maxRate * 1.2, 0.05);

    return { maxRate };
  }, [tranches, productiveDebtRate]);

  if (tranches.length === 0) return null;

  const chartWidth = 800;
  const chartHeight = 200;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;
  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const xStep = graphWidth / (tranches.length - 1 || 1);
  const getX = (index: number) => paddingLeft + index * xStep;
  const getY = (rate: number) => paddingTop + graphHeight - (rate / chartData.maxRate) * graphHeight;

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

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => f * chartData.maxRate);

  return (
    <div ref={exportRef} className="export-section bg-lotus-grey-900 rounded-xl p-4 pb-6 border border-lotus-grey-700 relative">
      <ExportButton targetRef={exportRef} filename="rates-by-lltv" />

      {/* Title for standalone export */}
      <h4 className="text-lg font-semibold text-lotus-grey-100 mb-4 text-center pr-10">
        Rates by LLTV
      </h4>

      {/* Legend at top */}
      <div className="flex gap-6 items-center justify-center mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-orange-500 rounded"></div>
          <span className="text-lotus-grey-300">Total Borrow Rate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-teal-500 rounded"></div>
          <span className="text-lotus-grey-300">Total Supply Rate</span>
        </div>
        <div className="text-lotus-grey-400 text-[10px]">
          (includes {formatPercent(productiveDebtRate)} PD rate)
        </div>
      </div>

      <div className="w-full relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background */}
          <rect
            x={paddingLeft}
            y={paddingTop}
            width={graphWidth}
            height={graphHeight}
            fill="#191621"
            rx="4"
          />

          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={getY(tick)}
                x2={chartWidth - paddingRight}
                y2={getY(tick)}
                stroke="#27232F"
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 8}
                y={getY(tick)}
                textAnchor="end"
                alignmentBaseline="middle"
                style={{ fontSize: '12px' }}
                fill="#6b7280"
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
              style={{ fontSize: '12px', fontWeight: 500 }}
              fill="#9ca3af"
            >
              {t.lltv}%
            </text>
          ))}

          {/* X-axis title */}
          <text
            x={paddingLeft + graphWidth / 2}
            y={chartHeight - 5}
            textAnchor="middle"
            style={{ fontSize: '12px' }}
            fill="#6b7280"
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

          {/* Borrow rate points */}
          {borrowPoints.map((p, i) => {
            const t = tranches[i];
            const supplyRate = t.supplyRate !== null ? productiveDebtRate + t.supplyRate : null;
            return (
              <g key={`borrow-${i}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoverInfo?.lltv === t.lltv ? 8 : 5}
                  fill="#f97316"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoverInfo({
                    x: p.x,
                    y: p.y,
                    lltv: t.lltv,
                    borrowRate: p.totalRate,
                    supplyRate,
                    type: 'borrow'
                  })}
                  onMouseLeave={() => setHoverInfo(null)}
                />
              </g>
            );
          })}

          {/* Supply rate points */}
          {supplyPoints.map((p, i) => {
            const originalIdx = tranches.findIndex((_, idx) => {
              const sr = tranches[idx].supplyRate;
              return sr !== null && productiveDebtRate + sr === p.totalRate;
            });
            const t = tranches[originalIdx] || tranches[i];
            return (
              <g key={`supply-${i}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoverInfo?.lltv === t.lltv ? 8 : 5}
                  fill="#14b8a6"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoverInfo({
                    x: p.x,
                    y: p.y,
                    lltv: t.lltv,
                    borrowRate: productiveDebtRate + t.borrowRate,
                    supplyRate: p.totalRate,
                    type: 'supply'
                  })}
                  onMouseLeave={() => setHoverInfo(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoverInfo && (
          <div
            className="absolute bg-lotus-grey-900 border border-lotus-grey-600 rounded-lg px-3 py-2 shadow-xl text-sm pointer-events-none z-10"
            style={{
              left: `${(hoverInfo.x / chartWidth) * 100}%`,
              top: `${(hoverInfo.y / chartHeight) * 100}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="font-medium text-lotus-grey-100 mb-1">{hoverInfo.lltv}% LLTV</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-lotus-grey-300">Borrow:</span>
              <span className="font-mono text-orange-400">{formatPercent(hoverInfo.borrowRate)}</span>
            </div>
            {hoverInfo.supplyRate !== null && (
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="text-lotus-grey-300">Supply:</span>
                <span className="font-mono text-teal-400">{formatPercent(hoverInfo.supplyRate)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RateChart;
