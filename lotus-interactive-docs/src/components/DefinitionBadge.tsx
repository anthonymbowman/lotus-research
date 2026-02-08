import { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

interface DefinitionBadgeProps {
  /** The label to display */
  label: string;
  /** The formula definition (e.g., "Supply / Available Supply") */
  formula: string;
  /** Optional additional note */
  note?: string;
  /** Additional class names */
  className?: string;
  /** Text color class (default: inherit) */
  textColor?: string;
}

/**
 * DefinitionBadge - Header badge that shows formula definition on hover
 *
 * Use this for column headers where the definition needs to be clear.
 * Shows the formula and optional note in a tooltip.
 */
export function DefinitionBadge({
  label,
  formula,
  note,
  className = '',
  textColor = '',
}: DefinitionBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const badgeRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (showTooltip && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const showBelow = rect.top < 100;

      setTooltipPosition({
        top: showBelow ? rect.bottom + 6 : rect.top - 6,
        left: Math.min(Math.max(rect.left + rect.width / 2, 140), window.innerWidth - 140),
      });
    }
  }, [showTooltip]);

  const tooltipElement = showTooltip && (
    <div
      id={tooltipId}
      role="tooltip"
      className="fixed z-[9999] px-3 py-2 bg-lotus-grey-900 rounded-lg shadow-xl border border-lotus-grey-700 max-w-xs"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        transform: tooltipPosition.top < 100 ? 'translateX(-50%)' : 'translate(-50%, -100%)',
      }}
    >
      <code className="block text-xs font-mono text-lotus-purple-300 mb-1">
        {formula}
      </code>
      {note && (
        <p className="text-xs text-lotus-grey-400 mt-1.5 pt-1.5 border-t border-lotus-grey-700">
          {note}
        </p>
      )}
      <div
        className="absolute left-1/2 -translate-x-1/2 border-6 border-transparent"
        style={tooltipPosition.top < 100
          ? { bottom: '100%', borderBottomColor: '#0D0A14' }
          : { top: '100%', borderTopColor: '#0D0A14' }
        }
      />
    </div>
  );

  return (
    <>
      <span
        ref={badgeRef}
        className={`inline-flex items-center gap-1 cursor-help ${textColor} ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowTooltip((prev) => !prev);
          }
          if (e.key === 'Escape') {
            setShowTooltip(false);
          }
        }}
        tabIndex={0}
        role="button"
        aria-describedby={showTooltip ? tooltipId : undefined}
      >
        {label}
        <svg
          className="w-3 h-3 opacity-60 hover:opacity-100 transition-opacity"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </span>
      {typeof document !== 'undefined' && createPortal(tooltipElement, document.body)}
    </>
  );
}

export default DefinitionBadge;
