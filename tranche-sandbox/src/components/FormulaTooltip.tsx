import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CalculationValues {
  /** The values to substitute into the formula */
  values: Record<string, number | string>;
  /** The computed result */
  result: number | string;
  /** Optional format function for the result */
  formatResult?: (val: number | string) => string;
}

interface FormulaTooltipProps {
  formula: string;
  description?: string;
  children: React.ReactNode;
  /** Optional current values to show calculation */
  currentValues?: CalculationValues;
}

export function FormulaTooltip({ formula, description, children, currentValues }: FormulaTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const showBelow = rect.top < 150;

      setTooltipPosition({
        top: showBelow ? rect.bottom + 8 : rect.top - 8,
        left: Math.min(Math.max(rect.left + rect.width / 2, 160), window.innerWidth - 160),
      });
    }
  }, [isVisible]);

  // Close on outside click when showing calculation
  useEffect(() => {
    if (!isVisible || !showCalculation) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
        setShowCalculation(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, showCalculation]);

  const formatValue = (val: number | string): string => {
    if (typeof val === 'number') {
      if (val < 1 && val > 0) {
        return (val * 100).toFixed(1) + '%';
      }
      return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return val;
  };

  const tooltip = isVisible && (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] px-3 py-2 text-sm bg-lotus-grey-900 text-white rounded-lg shadow-xl border border-lotus-grey-700"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        transform: tooltipPosition.top < 150
          ? 'translateX(-50%)'
          : 'translate(-50%, -100%)',
        maxWidth: '320px',
      }}
    >
      {/* Formula */}
      <code className="font-mono text-xs text-lotus-purple-300 block">{formula}</code>

      {/* Description */}
      {description && (
        <p className="mt-1 text-xs text-lotus-grey-300">
          {description}
        </p>
      )}

      {/* Show Calculation Toggle */}
      {currentValues && (
        <div className="mt-2 pt-2 border-t border-lotus-grey-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCalculation(!showCalculation);
            }}
            className="text-xs text-lotus-purple-400 hover:text-lotus-purple-300 transition-colors flex items-center gap-1"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showCalculation ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {showCalculation ? 'Hide calculation' : 'Show calculation'}
          </button>

          {showCalculation && (
            <div className="mt-2 p-2 bg-lotus-grey-800 rounded text-xs font-mono space-y-1">
              {/* Show substituted values */}
              {Object.entries(currentValues.values).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                  <span className="text-lotus-grey-400">{key}</span>
                  <span className="text-lotus-grey-200">{formatValue(value)}</span>
                </div>
              ))}
              {/* Show result */}
              <div className="flex justify-between gap-4 pt-1 border-t border-lotus-grey-700 font-medium">
                <span className="text-lotus-purple-400">=</span>
                <span className="text-lotus-purple-300">
                  {currentValues.formatResult
                    ? currentValues.formatResult(currentValues.result)
                    : formatValue(currentValues.result)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 border-8 border-transparent"
        style={tooltipPosition.top < 150
          ? { bottom: '100%', borderBottomColor: '#0D0A14' }
          : { top: '100%', borderTopColor: '#0D0A14' }
        }
      />
    </div>
  );

  const handleClick = (e: React.MouseEvent) => {
    if (currentValues) {
      e.preventDefault();
      setIsVisible(!isVisible);
    }
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex items-center cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => {
          if (!showCalculation) {
            setIsVisible(false);
          }
        }}
        onClick={handleClick}
      >
        {children}
        <svg
          className="ml-1 w-3.5 h-3.5 text-lotus-grey-300 hover:text-lotus-purple-400 transition-colors"
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
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  );
}

export const FORMULAS = {
  jrSupply: {
    formula: 'jrSupply[i] = Σ(supply[j]) for j ≥ i',
    description: 'Sum of supply from this tranche and all junior tranches. Includes both direct supply and cascaded supply from more junior tranches.',
  },
  cascadingSupply: {
    formula: 'cascadedSupply[i] = jrSupply[i] - supply[i]',
    description: 'Supply drawn from more junior tranches to support borrowers at this tranche.',
  },
  jrBorrow: {
    formula: 'jrBorrow[i] = Σ(borrow[j]) for j ≥ i',
    description: 'Sum of borrows from this tranche and all junior tranches.',
  },
  jrNetSupply: {
    formula: 'jrNetSupply[i] = max(0, jrSupply[i] − jrBorrow[i])',
    description: 'Unused junior supply after accounting for junior borrows.',
  },
  freeSupply: {
    formula: 'freeSupply[i] = min(jrNetSupply[j]) for j ≤ i',
    description: 'Constrained by the minimum jrNetSupply of all senior tranches.',
  },
  availableSupply: {
    formula: 'availableSupply[i] = jrNetSupply[i] + borrow[i]',
    description: 'Total supply that was available to this tranche before borrowing.',
  },
  supplyUtil: {
    formula: 'supplyUtil[i] = supply[i] / availableSupply[i]',
    description: 'Share of available supply from this tranche. Used for interest/bad debt allocation.',
  },
  borrowUtil: {
    formula: 'borrowUtil[i] = 1 − freeSupply[i] / jrSupply[i]',
    description: 'Fraction of junior supply being utilized. Used by interest rate models.',
  },
  supplyRate: {
    formula: 'Cascading: (cascade + interest) × supplyUtil → allocated',
    description: 'Interest cascades from senior to junior, allocated by supply utilization at each level.',
  },
};

export default FormulaTooltip;
