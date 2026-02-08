import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type ConstraintSeverity = 'active' | 'near' | 'info';

interface ConstraintBadgeProps {
  /** The severity of the constraint */
  severity: ConstraintSeverity;
  /** Short label for the badge (e.g., "Bound", "Cascading") */
  label: string;
  /** Tooltip content explaining the constraint */
  tooltip?: string;
  /** Additional class names */
  className?: string;
}

/**
 * ConstraintBadge - A small badge showing constraint state
 *
 * Uses amber color scheme for consistency across the app.
 * - "active": Constraint is currently binding (amber-500)
 * - "near": Approaching the constraint limit (amber-300)
 */
export function ConstraintBadge({
  severity,
  label,
  tooltip,
  className = ''
}: ConstraintBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (showTooltip && badgeRef.current && tooltip) {
      const rect = badgeRef.current.getBoundingClientRect();
      const showBelow = rect.top < 100;

      setTooltipPosition({
        top: showBelow ? rect.bottom + 6 : rect.top - 6,
        left: rect.left + rect.width / 2,
      });
    }
  }, [showTooltip, tooltip]);

  const severityStyles = {
    active: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    near: 'bg-amber-300/10 text-amber-300 border-amber-300/30',
    info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };

  const tooltipElement = showTooltip && tooltip && (
    <div
      className="fixed z-[9999] px-3 py-2 text-xs bg-lotus-grey-900 text-lotus-grey-300 rounded-lg shadow-xl border border-lotus-grey-700 max-w-xs"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        transform: tooltipPosition.top < 100 ? 'translateX(-50%)' : 'translate(-50%, -100%)',
      }}
    >
      {tooltip}
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
        className={`
          inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded border
          ${severityStyles[severity]}
          ${tooltip ? 'cursor-help' : ''}
          ${className}
        `}
        onMouseEnter={() => tooltip && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {severity === 'active' && (
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
        )}
        {severity === 'info' && (
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {label}
      </span>
      {typeof document !== 'undefined' && createPortal(tooltipElement, document.body)}
    </>
  );
}

export default ConstraintBadge;
