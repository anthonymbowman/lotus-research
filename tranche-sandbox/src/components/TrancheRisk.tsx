import { useState, useMemo } from 'react';
import { PageHeader } from './PageHeader';
import { FailureModeCallout } from './FailureModeCallout';
import { AssumptionsPanel, MODULE_ASSUMPTIONS } from './AssumptionsPanel';
import { IRMExplainer } from './IRMExplainer';

interface TrancheRiskProps {
  tranches: { lltv: number; borrowRate: number }[]; // kept for API compatibility
  baseRate: number;
}

const TRANCHE_LLTV = [75, 80, 85, 90, 95];
const BETA = 0.3;
const MAX_LIF = 1.15;

// Calculate Liquidation Incentive Factor
function calculateLIF(lltv: number): number {
  const lltvDecimal = lltv / 100;
  return Math.min(MAX_LIF, 1 / (BETA * lltvDecimal + (1 - BETA)));
}

// Calculate bad debt threshold - price drop where bad debt starts
// Formula: 1 - LLTV × LIF (assumes health factor = 1 at liquidation)
function calculateBadDebtThreshold(lltv: number): number {
  const lif = calculateLIF(lltv);
  const lltvDecimal = lltv / 100;
  const badDebtThreshold = (1 - lltvDecimal * lif) * 100;
  return Math.max(0, badDebtThreshold);
}

function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ============================================
// Section 1: Liquidation Mechanics (Simplified)
// ============================================

// ============================================
// Combined: Liquidations & Risk-Return
// ============================================

function LiquidationsAndRisk() {
  const [selectedLLTV, setSelectedLLTV] = useState(85);

  const trancheData = useMemo(() => {
    return TRANCHE_LLTV.map((lltv, i) => {
      const lif = calculateLIF(lltv);
      const buffer = 100 - lltv;
      const liquidationBonus = (lif - 1) * 100;
      const badDebtThreshold = calculateBadDebtThreshold(lltv);
      const riskDots = i + 1;

      const colorClasses = [
        { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500' },
        { text: 'text-teal-400', bg: 'bg-teal-500', border: 'border-teal-500' },
        { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500' },
        { text: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500' },
        { text: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500' },
      ];

      return { lltv, buffer, liquidationBonus, badDebtThreshold, riskDots, colors: colorClasses[i], lif };
    });
  }, []);

  const selectedData = trancheData.find(t => t.lltv === selectedLLTV)!;

  // Example calculation
  const collateralValue = 1000;
  const debtAtMaxBorrow = collateralValue * (selectedLLTV / 100);
  const seizedCollateral = debtAtMaxBorrow * selectedData.lif;
  const liquidatorProfit = seizedCollateral - debtAtMaxBorrow;

  return (
    <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
      <h3 className="text-lg font-medium text-lotus-grey-100 mb-2">Liquidations & Risk</h3>
      <p className="text-sm text-lotus-grey-300 mb-6">
        When a borrower's LTV exceeds the tranche LLTV, liquidators seize collateral and repay debt.
        Higher LLTV tranches have less buffer, meaning bad debt occurs sooner—so they pay higher spreads.
      </p>

      {/* Risk Chain */}
      <div className="bg-lotus-grey-900/50 rounded-lg p-4 border border-lotus-grey-700 mb-6">
        <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
          <div className="bg-lotus-purple-900/30 border border-lotus-purple-600 rounded px-3 py-2">
            <span className="text-lotus-purple-300">Higher LLTV</span>
          </div>
          <span className="text-lotus-grey-500">→</span>
          <div className="bg-amber-900/30 border border-amber-600 rounded px-3 py-2">
            <span className="text-amber-300">Less Buffer</span>
          </div>
          <span className="text-lotus-grey-500">→</span>
          <div className="bg-red-900/30 border border-red-600 rounded px-3 py-2">
            <span className="text-red-300">More Risk</span>
          </div>
          <span className="text-lotus-grey-500">→</span>
          <div className="bg-emerald-900/30 border border-emerald-600 rounded px-3 py-2">
            <span className="text-emerald-300">Higher Spread</span>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-lotus-grey-700">
              <th className="text-left py-2 px-2 font-medium text-lotus-grey-300">Tranche</th>
              <th className="text-center py-2 px-2 font-medium text-lotus-grey-300">Buffer</th>
              <th className="text-center py-2 px-2 font-medium text-lotus-grey-300">Liq. Bonus</th>
              <th className="text-center py-2 px-2 font-medium text-lotus-grey-300">Bad Debt After</th>
              <th className="text-center py-2 px-2 font-medium text-lotus-grey-300">Risk</th>
            </tr>
          </thead>
          <tbody>
            {trancheData.map((tranche) => {
              const isSelected = tranche.lltv === selectedLLTV;
              return (
                <tr
                  key={tranche.lltv}
                  onClick={() => setSelectedLLTV(tranche.lltv)}
                  className={`border-b border-lotus-grey-700/50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-lotus-grey-700/50' : 'hover:bg-lotus-grey-700/30'
                  }`}
                >
                  <td className="py-2 px-2">
                    <span className={`font-mono font-semibold ${tranche.colors.text}`}>
                      {tranche.lltv}%
                    </span>
                  </td>
                  <td className="text-center py-2 px-2 font-mono text-lotus-grey-200">
                    {tranche.buffer}%
                  </td>
                  <td className="text-center py-2 px-2 font-mono text-lotus-grey-200">
                    +{formatPercent(tranche.liquidationBonus)}
                  </td>
                  <td className="text-center py-2 px-2">
                    <span className={`font-mono font-medium ${
                      tranche.badDebtThreshold < 10 ? 'text-red-400' :
                      tranche.badDebtThreshold < 15 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {tranche.badDebtThreshold.toFixed(2)}% drop
                    </span>
                  </td>
                  <td className="text-center py-2 px-2">
                    <div className="flex items-center justify-center gap-0.5" aria-label={`Risk level ${tranche.riskDots} of ${TRANCHE_LLTV.length}`}>
                      {Array.from({ length: tranche.riskDots }).map((_, j) => (
                        <div key={j} className={`w-1.5 h-1.5 rounded-full ${tranche.colors.bg}`} />
                      ))}
                      <span className="sr-only">Risk {tranche.riskDots} of {TRANCHE_LLTV.length}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Liquidation Example - Collapsible */}
      <details className="bg-lotus-grey-700/30 rounded-lg border border-lotus-grey-600 mb-4">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-lotus-grey-300 hover:text-lotus-grey-100">
          Example: Liquidation at {selectedLLTV}% LLTV
        </summary>
        <div className="px-4 pb-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-lotus-grey-400">Collateral:</span>
                <span className="font-mono text-lotus-grey-200">${collateralValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lotus-grey-400">Debt ({selectedLLTV}% LLTV):</span>
                <span className="font-mono text-lotus-grey-200">${debtAtMaxBorrow.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-lotus-grey-400">Seized by liquidator:</span>
                <span className="font-mono text-emerald-400">${seizedCollateral.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lotus-grey-400">Liquidator profit:</span>
                <span className="font-mono text-emerald-400">${liquidatorProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Bad Debt Calculation */}
          <div className="mt-4 pt-3 border-t border-lotus-grey-600">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-lotus-grey-400">Bad debt starts after:</span>
              <span className="font-mono font-medium text-amber-400">{selectedData.badDebtThreshold.toFixed(2)}% price drop</span>
            </div>
            <div className="text-xs text-lotus-grey-500 space-y-1">
              <p>
                <span className="text-lotus-grey-400">Formula:</span>{' '}
                <span className="font-mono">1 - LLTV × LIF = 1 - {(selectedLLTV / 100).toFixed(2)} × {selectedData.lif.toFixed(4)} = {(selectedData.badDebtThreshold / 100).toFixed(4)}</span>
              </p>
              <p className="text-lotus-grey-500 mt-2">
                This assumes the loan's health factor is 1 (at the liquidation threshold) and that gas conditions enable a profitable liquidation.
                In practice, oracle lag or high gas costs may delay liquidations, increasing bad debt risk.
              </p>
            </div>
          </div>

          <p className="text-xs text-lotus-grey-500 mt-3">
            Liquidators receive a {formatPercent(selectedData.liquidationBonus, 2)} bonus as incentive.
          </p>
        </div>
      </details>

      {/* Technical Details - Collapsible */}
      <details className="bg-lotus-grey-700/30 rounded-lg border border-lotus-grey-600">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-lotus-grey-400 hover:text-lotus-grey-200">
          Technical Details
        </summary>
        <div className="px-4 pb-4 pt-2 space-y-2 text-xs text-lotus-grey-400">
          <div>
            <span>Liquidation Incentive Factor (LIF):</span>
            <span className="font-mono text-lotus-purple-400 ml-2">{selectedData.lif.toFixed(4)}</span>
          </div>
          <div className="text-lotus-grey-500">
            LIF = min(1.15, 1 / (0.3 × LLTV + 0.7))
          </div>
          <p>
            Higher LLTV = less collateral buffer = less room for liquidation bonus.
            This is why junior tranches have lower bonus and higher bad debt risk.
          </p>
        </div>
      </details>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function TrancheRisk({ tranches, baseRate }: TrancheRiskProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Tranche Risk"
        whatYoullLearn={[
          "How liquidations protect lenders",
          "Why higher LTV means higher risk for lenders and higher potential returns",
          "How risk level connects to the spread lenders earn",
        ]}
      />

      <LiquidationsAndRisk />

      {/* IRM Explainer - How Spreads Are Determined */}
      <IRMExplainer tranches={tranches} baseRate={baseRate} />

      <FailureModeCallout title="Stress Scenario: Oracle Lag & Liquidation Delays">
        <p>
          In volatile markets, oracle price updates may lag behind actual market prices.
          If collateral value drops faster than oracles report, positions may become
          undercollateralized before liquidators can act. Additionally, high gas prices
          during market stress can make small liquidations unprofitable, especially for
          junior tranches with lower liquidation bonus. This delay increases the
          risk of bad debt formation.
        </p>
      </FailureModeCallout>

      {/* Simplified Model Note */}
      <div className="flex items-center gap-2 text-xs text-lotus-grey-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Simplified model for educational purposes. Actual liquidation modules have additional parameters.</span>
      </div>

      <AssumptionsPanel assumptions={MODULE_ASSUMPTIONS.liquidations} />
    </div>
  );
}

export default TrancheRisk;
