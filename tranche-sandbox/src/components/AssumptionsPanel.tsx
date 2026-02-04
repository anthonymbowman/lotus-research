import { useState } from 'react';

interface Assumption {
  /** Short label for the assumption */
  label: string;
  /** Detailed explanation */
  description: string;
  /** Optional link to documentation */
  docLink?: string;
}

interface AssumptionsPanelProps {
  /** Title for the panel */
  title?: string;
  /** List of assumptions for this module */
  assumptions: Assumption[];
  /** Additional class names */
  className?: string;
}

/**
 * AssumptionsPanel - Collapsible panel listing module assumptions
 *
 * Renders at the bottom of each section to disclose:
 * - What is simplified vs. actual implementation
 * - What parameters are user-defined vs. on-chain
 * - Any other modeling assumptions
 */
export function AssumptionsPanel({
  title = 'Model Assumptions',
  assumptions,
  className = '',
}: AssumptionsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (assumptions.length === 0) return null;

  return (
    <div className={`mt-6 border-t border-lotus-grey-700 pt-4 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-lotus-grey-400 hover:text-lotus-grey-300 transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <svg
          className="w-4 h-4"
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
        {title}
        <span className="text-xs text-lotus-grey-500">({assumptions.length})</span>
      </button>

      {isExpanded && (
        <div className="mt-3 p-4 bg-lotus-grey-800/50 rounded-lg border border-lotus-grey-700">
          <p className="text-xs text-lotus-grey-400 mb-3">
            This simulator uses simplified models for educational purposes.
            Actual protocol behavior may differ.
          </p>
          <ul className="space-y-3">
            {assumptions.map((assumption, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <div>
                  <span className="text-sm font-medium text-lotus-grey-200">
                    {assumption.label}
                  </span>
                  <p className="text-xs text-lotus-grey-400 mt-0.5">
                    {assumption.description}
                  </p>
                  {assumption.docLink && (
                    <a
                      href={assumption.docLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-lotus-purple-400 hover:text-lotus-purple-300 transition-colors mt-1 inline-flex items-center gap-1"
                    >
                      Learn more
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Pre-defined assumptions for different modules
export const MODULE_ASSUMPTIONS = {
  trancheLiquidity: [
    {
      label: 'Base rate is user-defined',
      description: 'In production, the base rate comes from LotusUSD treasury yield. Here you can set it manually.',
    },
    {
      label: 'IRM is simplified',
      description: 'The actual Interest Rate Model has more parameters and may behave differently at extreme utilization levels.',
    },
    {
      label: 'No pending interest',
      description: 'This simulator does not account for accrued but undistributed interest, which affects available supply.',
    },
  ],
  interestSimulator: [
    {
      label: 'Linear interest accrual',
      description: 'Interest is calculated as simple interest over the time period. Actual protocol may compound differently.',
    },
    {
      label: 'Fixed borrow rates',
      description: 'Borrow rates are fixed by the scenario in this simulator. In practice, rates adjust dynamically via the IRM.',
    },
  ],
  badDebtSimulator: [
    {
      label: 'Instant absorption',
      description: 'Bad debt is absorbed immediately. In practice, there may be delays and liquidation processes.',
    },
    {
      label: 'No liquidation incentives',
      description: 'This model does not account for liquidation incentive fees that may reduce absorbed amounts.',
    },
  ],
  liquidations: [
    {
      label: 'Simplified liquidation math',
      description: 'The buffer calculations use simplified formulas. Actual liquidation modules have more complex logic.',
    },
  ],
};

export default AssumptionsPanel;
