import { useEffect, useState, useRef } from 'react';

interface HighlightedValueProps {
  /** The current value to display */
  value: number | string;
  /** Format function for the value */
  format?: (val: number | string) => string;
  /** Whether this value is currently affected by an input change */
  isAffected?: boolean;
  /** The previous value (for calculating delta) */
  prevValue?: number;
  /** Whether to show delta arrows */
  showDelta?: boolean;
  /** Duration of highlight effect in ms */
  highlightDuration?: number;
  /** Additional class names */
  className?: string;
  /** Text color class */
  textColor?: string;
}

/**
 * HighlightedValue - Shows value changes with visual feedback
 *
 * Features:
 * - Shows delta arrow (▲/▼) when value changes
 * - Applies highlight class when delta ≠ 0
 * - Fades non-affected outputs during active interaction
 * - Auto-clears highlight after timeout
 */
export function HighlightedValue({
  value,
  format = (v) => String(v),
  isAffected = false,
  prevValue,
  showDelta = true,
  highlightDuration = 2000,
  className = '',
  textColor = 'text-lotus-grey-100',
}: HighlightedValueProps) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [delta, setDelta] = useState<number | null>(null);
  const prevValueRef = useRef<number | undefined>(prevValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate delta when value changes
  useEffect(() => {
    if (typeof value === 'number' && typeof prevValueRef.current === 'number') {
      const newDelta = value - prevValueRef.current;
      if (Math.abs(newDelta) > 0.0001) {
        setDelta(newDelta);
        setIsHighlighted(true);

        // Clear highlight after duration
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setIsHighlighted(false);
          setDelta(null);
        }, highlightDuration);
      }
    }
    prevValueRef.current = typeof value === 'number' ? value : undefined;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, highlightDuration]);

  // Update prevValue ref when prop changes
  useEffect(() => {
    if (prevValue !== undefined) {
      prevValueRef.current = prevValue;
    }
  }, [prevValue]);

  const formattedValue = format(value);

  const getDeltaDisplay = () => {
    if (!showDelta || delta === null) return null;

    if (delta > 0) {
      return (
        <span className="text-emerald-400 text-xs ml-1 animate-pulse">
          ▲
        </span>
      );
    } else if (delta < 0) {
      return (
        <span className="text-red-400 text-xs ml-1 animate-pulse">
          ▼
        </span>
      );
    }
    return null;
  };

  return (
    <span
      className={`
        inline-flex items-center transition-all duration-300
        ${isHighlighted ? 'ring-1 ring-lotus-purple-500/50 bg-lotus-purple-900/20 rounded px-1 -mx-1' : ''}
        ${!isAffected && isHighlighted ? 'opacity-50' : ''}
        ${textColor}
        ${className}
      `}
    >
      <span className="font-mono">{formattedValue}</span>
      {getDeltaDisplay()}
    </span>
  );
}

export default HighlightedValue;
