import type { TrancheData } from '../types';
import { BadDebtSimulator } from './BadDebtSimulator';
import { TermDefinition } from './TermDefinition';
import { FailureModeCallout } from './FailureModeCallout';
import { InteractiveZone } from './InteractiveZone';
import { DetailZone } from './DetailZone';

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
      {/* Interactive Zone - Bad Debt Simulator */}
      {computedTranches && (
        <InteractiveZone
          tryThis="Enter bad debt amounts in different tranches to see how losses cascade from senior to junior."
          title="Bad Debt Simulation"
        >
          <BadDebtSimulator tranches={computedTranches} />
        </InteractiveZone>
      )}

      {/* Detail Zone - Explanations */}
      <DetailZone
        title="Understanding Bad Debt"
        teaserItems={['What is Bad Debt', 'Why Junior Absorbs More']}
      >
        {/* Bad Debt Explanation */}
        <div className="bg-rating-d/10 rounded p-4 border border-rating-d/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-rating-d/20 rounded flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-rating-d" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-rating-d mb-1">What is <TermDefinition term="bad-debt">Bad Debt</TermDefinition>?</h4>
              <p className="text-sm text-rating-d/80">
                Bad debt occurs when a position's collateral value is less than the debt owed after liquidation.
                This shortfall is allocated to the tranches that funded the borrow, proportional to their funding share,
                and cascades to more junior tranches as needed.
              </p>
            </div>
          </div>
        </div>

        <FailureModeCallout title="Why Bad Debt Skews Junior">
          <p>
            Bad debt originates wherever a liquidation shortfall occurs and cascades to more junior tranches
            based on supply utilization weights. Junior tranches absorb a proportionally larger share because
            their supply utilization is higher — the same mechanism that allocates them more interest.
            Higher LLTV tranches also have less collateral buffer and lower liquidation incentives, making
            bad debt more likely to originate there. See the Risk Layers section for how LLTV and
            liquidation bonuses shape this tradeoff.
          </p>
        </FailureModeCallout>
      </DetailZone>
    </div>
  );
}

export default Liquidations;
