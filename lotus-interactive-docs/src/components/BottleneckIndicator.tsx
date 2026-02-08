import type { TrancheData } from '../types';

interface BottleneckIndicatorProps {
  /** Array of computed tranche data */
  tranches: TrancheData[];
}

/**
 * Component that highlights which tranche(s) are the binding constraint
 * on liquidity flow in the tranche stack.
 */
export function BottleneckIndicator({ tranches }: BottleneckIndicatorProps) {
  const bindingTranches = tranches.filter(t => t.isBindingConstraint);

  if (bindingTranches.length === 0) {
    return null;
  }

  const bindingLltvs = bindingTranches.map(t => `${t.lltv}%`).join(', ');
  const freeSupply = bindingTranches[0]?.freeSupply ?? 0;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-amber-500 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-amber-800 text-sm">
            Binding Constraint: {bindingLltvs} LLTV
          </h4>
          <p className="text-amber-700 text-sm mt-1">
            The <strong>{bindingLltvs}</strong> tranche has the minimum jrNetSupply,
            limiting free supply to <strong>{freeSupply.toLocaleString()}</strong> for
            all senior tranches.
          </p>
          <p className="text-amber-600 text-xs mt-2">
            Tip: Increase supply or reduce borrows in this tranche to unlock more liquidity
            for senior tranches.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BottleneckIndicator;
