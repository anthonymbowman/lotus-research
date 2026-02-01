import type { TrancheData } from '../types';
import { BadDebtSimulator } from './BadDebtSimulator';
import { TermDefinition } from './TermDefinition';

interface LiquidationsProps {
  tranches: { lltv: number }[];
  computedTranches?: TrancheData[];
}

/**
 * Liquidations section - now simplified to only show Bad Debt Simulation
 * (merged with InterestSimulator for Section 6: Interest & Bad Debt)
 */
export function Liquidations({ computedTranches }: LiquidationsProps) {
  return (
    <div className="space-y-8">
      {/* Bad Debt Explanation */}
      <div className="bg-red-900/20 rounded-lg p-4 border border-red-700/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-red-300 mb-1">What is <TermDefinition term="bad-debt">Bad Debt</TermDefinition>?</h4>
            <p className="text-sm text-red-200">
              Bad debt occurs when a position's collateral value is less than the debt owed after liquidation.
              This shortfall is absorbed by lenders through the cascade mechanism.
            </p>
          </div>
        </div>
      </div>

      {/* Bad Debt Simulator */}
      {computedTranches && (
        <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
          <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Bad Debt Simulation</h3>
          <p className="text-lotus-grey-300 mb-6">
            Explore how bad debt is absorbed by tranches. Enter bad debt amounts to see
            how losses cascade from senior to junior tranches.
          </p>
          <BadDebtSimulator tranches={computedTranches} />
        </div>
      )}
    </div>
  );
}

export default Liquidations;
