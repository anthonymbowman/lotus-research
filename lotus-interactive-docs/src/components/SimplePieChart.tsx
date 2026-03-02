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

// Color mapping for tranche LLTVs using credit rating spectrum
// Lower LLTV = safer (A+/A), Higher LLTV = riskier (C/D)
export const TRANCHE_COLORS: Record<number, string> = {
  75: '#2FFAE2', // rating-a-plus (safest)
  80: '#6BF4A0', // rating-a
  85: '#EBE283', // rating-b
  90: '#FFA5CD', // rating-c-plus
  95: '#FE3E38', // rating-d (riskiest)
};

export const TRANCHE_TEXT_COLORS: Record<number, string> = {
  75: 'text-rating-a-plus',
  80: 'text-rating-a',
  85: 'text-rating-b',
  90: 'text-rating-c-plus',
  95: 'text-rating-d',
};

export const IDLE_COLOR = '#4b5563'; // grey-600

export default SimplePieChart;
