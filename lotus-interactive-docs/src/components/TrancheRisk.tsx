import { useState, useMemo } from 'react';
import { ContextZone } from './ContextZone';
import { InteractiveZone } from './InteractiveZone';
import { DetailZone } from './DetailZone';
import { FailureModeCallout } from './FailureModeCallout';
import { AssumptionsPanel, MODULE_ASSUMPTIONS } from './AssumptionsPanel';
import { IRMExplainer } from './IRMExplainer';
import { content } from '../content';

const { trancheRisk: trContent } = content;

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
        { text: 'text-rating-a-plus', bg: 'bg-rating-a-plus', border: 'border-rating-a-plus' },
        { text: 'text-rating-a', bg: 'bg-rating-a', border: 'border-rating-a' },
        { text: 'text-rating-b', bg: 'bg-rating-b', border: 'border-rating-b' },
        { text: 'text-rating-c-plus', bg: 'bg-rating-c-plus', border: 'border-rating-c-plus' },
        { text: 'text-rating-c', bg: 'bg-rating-c', border: 'border-rating-c' },
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

  const lr = trContent.liquidationsAndRisk;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-2">{lr.heading}</h3>
        <p className="text-sm text-lotus-grey-300">
          {lr.description}
        </p>
      </div>

      {/* Risk Chain */}
      <div className="bg-lotus-grey-900 rounded p-4 border border-lotus-grey-700">
        <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
          <div className="bg-lotus-purple-900/30 border border-lotus-purple-600 rounded px-3 py-2">
            <span className="text-lotus-purple-300">{lr.riskChain.higherLltv}</span>
          </div>
          <span className="text-lotus-grey-500">→</span>
          <div className="bg-rating-b/20 border border-rating-b rounded px-3 py-2">
            <span className="text-rating-b">{lr.riskChain.lessBuffer}</span>
          </div>
          <span className="text-lotus-grey-500">→</span>
          <div className="bg-rating-c/20 border border-rating-c rounded px-3 py-2">
            <span className="text-rating-c">{lr.riskChain.moreRisk}</span>
          </div>
          <span className="text-lotus-grey-500">→</span>
          <div className="bg-rating-a/15 border border-rating-a rounded px-3 py-2">
            <span className="text-rating-a">{lr.riskChain.higherSpread}</span>
          </div>
        </div>
      </div>

      {/* Try this prompt */}
      <div className="flex items-center gap-3 bg-lotus-purple-900/30 border border-lotus-grey-700 rounded px-4 py-3">
        <div className="w-8 h-8 bg-lotus-purple-500 rounded-sm flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
        <div>
          <span className="text-sm font-medium text-lotus-purple-300">Try this</span>
          <p className="text-lotus-grey-200 text-sm">Click different tranches to see how liquidation bonuses and bad debt thresholds change with LLTV.</p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto mb-6 border-l-2 border-l-lotus-purple-500 pl-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-lotus-grey-700">
              <th className="text-left py-2 px-2 font-medium text-lotus-grey-300">{lr.tableHeaders.tranche}</th>
              <th className="text-center py-2 px-2 font-medium text-lotus-grey-300">{lr.tableHeaders.buffer}</th>
              <th className="text-center py-2 px-2 font-medium text-lotus-grey-300">{lr.tableHeaders.liqBonus}</th>
              <th className="text-center py-2 px-2 font-medium text-lotus-grey-300">{lr.tableHeaders.badDebtAfter}</th>
              <th className="text-center py-2 px-2 font-medium text-lotus-grey-300">{lr.tableHeaders.risk}</th>
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
                    isSelected ? 'bg-lotus-purple-900/20' : 'hover:bg-lotus-grey-700/30'
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
                      tranche.badDebtThreshold < 10 ? 'text-rating-c' :
                      tranche.badDebtThreshold < 15 ? 'text-rating-b' : 'text-rating-a'
                    }`}>
                      {tranche.badDebtThreshold.toFixed(2)}% drop
                    </span>
                  </td>
                  <td className="text-center py-2 px-2">
                    <div className="flex items-center justify-center gap-0.5" aria-label={`Risk level ${tranche.riskDots} of ${TRANCHE_LLTV.length}`}>
                      {Array.from({ length: tranche.riskDots }).map((_, j) => (
                        <div key={j} className={`w-1.5 h-1.5 rounded-sm ${tranche.colors.bg}`} />
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

      {/* Liquidation Example - Open by default so users see changes when clicking rows */}
      <details open className="bg-lotus-grey-900 rounded border border-lotus-grey-700 mb-4">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-lotus-grey-300 hover:text-lotus-grey-100">
          {lr.exampleTitle(selectedLLTV)}
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
                <span className="font-mono text-rating-a">${seizedCollateral.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lotus-grey-400">Liquidator profit:</span>
                <span className="font-mono text-rating-a">${liquidatorProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Bad Debt Calculation */}
          <div className="mt-4 pt-3 border-t border-lotus-grey-600">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-lotus-grey-400">{lr.badDebtFormula.label}</span>
              <span className="font-mono font-medium text-rating-b">{selectedData.badDebtThreshold.toFixed(2)}% price drop</span>
            </div>
            <div className="text-xs text-lotus-grey-400 space-y-1">
              <p>
                <span className="text-lotus-grey-400">Formula:</span>{' '}
                <span className="font-mono">1 - LLTV × LIF = 1 - {(selectedLLTV / 100).toFixed(2)} × {selectedData.lif.toFixed(4)} = {(selectedData.badDebtThreshold / 100).toFixed(4)}</span>
              </p>
              <p className="text-lotus-grey-400 mt-2">
                {lr.badDebtFormula.formulaNote}
              </p>
            </div>
          </div>

          <p className="text-xs text-lotus-grey-400 mt-3">
            Liquidators receive a {formatPercent(selectedData.liquidationBonus, 2)} bonus as incentive.
          </p>
        </div>
      </details>

      {/* Technical Details - Collapsible */}
      <details className="bg-lotus-grey-900 rounded border border-lotus-grey-700">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-lotus-grey-400 hover:text-lotus-grey-200">
          {lr.technicalDetails}
        </summary>
        <div className="px-4 pb-4 pt-2 space-y-2 text-xs text-lotus-grey-400">
          <div>
            <span>Liquidation Incentive Factor (LIF):</span>
            <span className="font-mono text-lotus-purple-400 ml-2">{selectedData.lif.toFixed(4)}</span>
          </div>
          <div className="text-lotus-grey-400">
            LIF = min(1.15, 1 / (0.3 × LLTV + 0.7))
          </div>
          <p>
            {lr.lifNote}
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
      {/* ═══════════════════════════════════════════════════════════════════
          CONTEXT ZONE - Minimal context above the fold
          ═══════════════════════════════════════════════════════════════════ */}
      <ContextZone
        context="Understand how risk and reward vary across Lotus tranches. Higher LLTV (loan-to-value) means less collateral buffer and more liquidation risk, but higher yields to compensate."
        whatYoullLearn={['Liquidation mechanics', 'Bad debt thresholds', 'Risk-return tradeoffs']}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          INTERACTIVE ZONE - The main event
          ═══════════════════════════════════════════════════════════════════ */}
      <InteractiveZone
        title="Risk & Liquidation Explorer"
      >
        <LiquidationsAndRisk />
      </InteractiveZone>

      {/* ═══════════════════════════════════════════════════════════════════
          DETAIL ZONE - Below the fold, for those who want to go deeper
          ═══════════════════════════════════════════════════════════════════ */}
      <DetailZone
        title="Understanding Risk Mechanics"
        teaserItems={['Interest Rate Model', 'Failure Modes', 'Model Assumptions']}
      >
        {/* IRM Explainer - How Spreads Are Determined */}
        <IRMExplainer tranches={tranches} baseRate={baseRate} />

        <FailureModeCallout title={trContent.failureMode.title}>
          <p>
            {trContent.failureMode.description}
          </p>
        </FailureModeCallout>

        {/* Simplified Model Note */}
        <div className="flex items-center gap-2 text-xs text-lotus-grey-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{trContent.simplifiedNote}</span>
        </div>

        <AssumptionsPanel assumptions={MODULE_ASSUMPTIONS.liquidations} />
      </DetailZone>
    </div>
  );
}

export default TrancheRisk;
