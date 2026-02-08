import { useMemo } from 'react';

export interface PieSegment {
  percent: number;
  color: string;
  label: string;
}

interface SimplePieChartProps {
  segments: PieSegment[];
  size?: number;
}

/**
 * Simple SVG pie chart using stroke-dasharray technique.
 * Segments are rendered as arcs around a circle.
 */
export function SimplePieChart({ segments, size = 72 }: SimplePieChartProps) {
  const radius = size * 0.35;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const strokeWidth = size * 0.22;

  // Filter out segments with 0% and calculate cumulative offsets
  const visibleSegments = useMemo(() => {
    const filtered = segments.filter(s => s.percent > 0.001);
    let cumulativePercent = 0;

    return filtered.map(segment => {
      const offset = cumulativePercent;
      cumulativePercent += segment.percent;
      return {
        ...segment,
        offset,
        dashArray: `${segment.percent * circumference} ${circumference}`,
        dashOffset: -offset * circumference,
      };
    });
  }, [segments, circumference]);

  if (visibleSegments.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-lotus-grey-500 text-xs"
        style={{ width: size, height: size }}
      >
        No data
      </div>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-lotus-grey-700"
      />

      {/* Segments - render in reverse order so first segment is on top */}
      {[...visibleSegments].reverse().map((segment, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={segment.color}
          strokeWidth={strokeWidth}
          strokeDasharray={segment.dashArray}
          strokeDashoffset={segment.dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-all duration-300"
        />
      ))}
    </svg>
  );
}

// Color mapping for tranche LLTVs (matching DynamicLoanMix)
export const TRANCHE_COLORS: Record<number, string> = {
  75: '#10b981', // emerald-500
  80: '#14b8a6', // teal-500
  85: '#f59e0b', // amber-500
  90: '#f97316', // orange-500
  95: '#ef4444', // red-500
};

export const TRANCHE_TEXT_COLORS: Record<number, string> = {
  75: 'text-emerald-400',
  80: 'text-teal-400',
  85: 'text-amber-400',
  90: 'text-orange-400',
  95: 'text-red-400',
};

export const IDLE_COLOR = '#4b5563'; // grey-600

export default SimplePieChart;
