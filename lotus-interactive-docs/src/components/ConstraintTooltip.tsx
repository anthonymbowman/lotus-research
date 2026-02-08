import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type ConstraintScope = 'global' | 'tranche' | 'upstream';

interface ConstraintTooltipProps {
  /** The trigger element that shows the tooltip on hover */
  children: React.ReactNode;
  /** Constraint name (e.g., "Free Supply Constraint") */
  title: string;
  /** 1-2 sentence explanation of why this constraint matters */
  why: string;
  /** The protocol primitive name (e.g., "freeSupply", "availableSupply") */
  primitive?: string;
  /** Scope of the constraint */
  scope?: ConstraintScope;
  /** Tranche index if scope is 'tranche' */
  trancheIndex?: number;
  /** Math steps to show in expandable section */
  mathSteps?: string[];
  /** Link to documentation */
  docLink?: string;
  /** Additional class names for the trigger wrapper */
  className?: string;
}

const scopeLabels: Record<ConstraintScope, string> = {
  global: 'Global',
  tranche: 'Tranche-specific',
  upstream: 'Upstream bottleneck',
};

/**
 * ConstraintTooltip - A rich tooltip explaining a constraint
 *
 * Structure:
 * - Title: Constraint name
 * - Why: 1-2 sentence explanation
 * - Primitive: Names the protocol primitive
 * - Scope: Global | Tranche i | Upstream bottleneck
 * - Optional "Show math" toggle
 * - Optional doc link
 */
export function ConstraintTooltip({
  children,
  title,
  why,
  primitive,
  scope,
  trancheIndex,
  mathSteps,
  docLink,
  className = '',
}: ConstraintTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const showBelow = rect.top < 200;

      setTooltipPosition({
        top: showBelow ? rect.bottom + 8 : rect.top - 8,
        left: Math.min(Math.max(rect.left + rect.width / 2, 180), window.innerWidth - 180),
      });
    }
  }, [isVisible]);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
        setShowMath(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  const scopeLabel = scope
    ? scope === 'tranche' && trancheIndex !== undefined
      ? `Tranche ${trancheIndex + 1}`
      : scopeLabels[scope]
    : null;

  const tooltip = isVisible && (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] p-4 text-sm bg-lotus-grey-900 rounded-lg shadow-xl border border-amber-600/50 max-w-sm"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        transform: tooltipPosition.top < 200 ? 'translateX(-50%)' : 'translate(-50%, -100%)',
      }}
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="font-medium text-amber-300">{title}</span>
      </div>

      {/* Why explanation */}
      <p className="text-lotus-grey-300 text-xs leading-relaxed mb-3">
        {why}
      </p>

      {/* Metadata row */}
      <div className="flex flex-wrap gap-2 text-xs">
        {primitive && (
          <span className="px-2 py-0.5 bg-lotus-grey-800 text-lotus-purple-300 rounded font-mono">
            {primitive}
          </span>
        )}
        {scopeLabel && (
          <span className="px-2 py-0.5 bg-lotus-grey-800 text-lotus-grey-400 rounded">
            {scopeLabel}
          </span>
        )}
      </div>

      {/* Show math toggle */}
      {mathSteps && mathSteps.length > 0 && (
        <div className="mt-3 pt-3 border-t border-lotus-grey-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMath(!showMath);
            }}
            className="text-xs text-lotus-purple-400 hover:text-lotus-purple-300 transition-colors flex items-center gap-1"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showMath ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {showMath ? 'Hide math' : 'Show math'}
          </button>

          {showMath && (
            <div className="mt-2 p-2 bg-lotus-grey-800 rounded">
              {mathSteps.map((step, i) => (
                <code key={i} className="block text-xs font-mono text-lotus-grey-300 leading-relaxed">
                  {step}
                </code>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Doc link */}
      {docLink && (
        <a
          href={docLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-xs text-lotus-purple-400 hover:text-lotus-purple-300 transition-colors flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View documentation
        </a>
      )}

      {/* Arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 border-8 border-transparent"
        style={tooltipPosition.top < 200
          ? { bottom: '100%', borderBottomColor: '#0D0A14' }
          : { top: '100%', borderTopColor: '#0D0A14' }
        }
      />
    </div>
  );

  return (
    <>
      <span
        ref={triggerRef}
        className={`cursor-help ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => {
          if (!showMath) {
            setIsVisible(false);
          }
        }}
        onClick={handleClick}
      >
        {children}
      </span>
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  );
}

export default ConstraintTooltip;
