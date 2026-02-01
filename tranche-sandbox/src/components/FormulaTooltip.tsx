import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface FormulaTooltipProps {
  formula: string;
  description?: string;
  children: React.ReactNode;
}

export function FormulaTooltip({ formula, description, children }: FormulaTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const showBelow = rect.top < 120;

      setTooltipPosition({
        top: showBelow ? rect.bottom + 8 : rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isVisible]);

  const tooltip = isVisible && (
    <div
      className="fixed z-[9999] px-3 py-2 text-sm bg-lotus-grey-900 text-white rounded-lg shadow-xl max-w-xs border border-lotus-grey-700"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        transform: tooltipPosition.top < 120
          ? 'translateX(-50%)'
          : 'translate(-50%, -100%)',
      }}
    >
      <code className="font-mono text-xs text-lotus-purple-300 block">{formula}</code>
      {description && (
        <p className="mt-1 text-xs text-lotus-grey-300">
          {description}
        </p>
      )}
      <div
        className="absolute left-1/2 -translate-x-1/2 border-8 border-transparent"
        style={tooltipPosition.top < 120
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
        className="inline-flex items-center cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
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
    description: 'Sum of supply from this tranche and all junior tranches.',
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
