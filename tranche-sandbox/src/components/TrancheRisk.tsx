import { useState, useMemo } from 'react';

interface TrancheRiskProps {
  tranches: { lltv: number; borrowRate: number }[]; // kept for API compatibility
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
function calculateBadDebtThreshold(lltv: number): number {
  const lif = calculateLIF(lltv);
  const lltvDecimal = lltv / 100;
  const badDebtThreshold = (1 - (lltvDecimal - (1 - lif))) * 100;
  return Math.max(0, badDebtThreshold);
}

function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ============================================
// Section 1: Liquidation Mechanics (Simplified)
// ============================================

function LiquidationMechanics() {
  const [selectedLLTV, setSelectedLLTV] = useState(85);

  const lif = calculateLIF(selectedLLTV);
  const lifPercent = (lif - 1) * 100;

  // Example calculation
  const collateralValue = 1000;
  const debtAtMaxBorrow = collateralValue * (selectedLLTV / 100);
  const seizedCollateral = debtAtMaxBorrow * lif;
  const liquidatorProfit = seizedCollateral - debtAtMaxBorrow;

  // Step-by-step bad debt math
  const buffer = 100 - selectedLLTV; // 1 - LLTV as percentage
  const badDebtThreshold = calculateBadDebtThreshold(selectedLLTV);

  return (
    <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
      <h3 className="text-lg font-medium text-lotus-grey-100 mb-2">How Liquidations Work</h3>
      <p className="text-sm text-lotus-grey-300 mb-6">
        When a borrower's LTV exceeds the tranche LLTV, liquidators can <strong>seize collateral</strong> and <strong>repay debt</strong>.
        The Liquidation Incentive Factor (LIF) determines how much collateral the liquidator receives per unit of debt repaid.
      </p>

      {/* Interactive LLTV selector */}
      <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-lotus-grey-300">Select Tranche LLTV</span>
          <span className="text-lg font-mono font-semibold text-lotus-grey-100">{selectedLLTV}%</span>
        </div>
        <div className="flex gap-2">
          {TRANCHE_LLTV.map((lltv, idx) => {
            const isSelected = selectedLLTV === lltv;
            const colorClasses = [
              'bg-emerald-900/50 border-emerald-500 text-emerald-300',
              'bg-teal-900/50 border-teal-500 text-teal-300',
              'bg-amber-900/50 border-amber-500 text-amber-300',
              'bg-orange-900/50 border-orange-500 text-orange-300',
              'bg-red-900/50 border-red-500 text-red-300',
            ];
            return (
              <button
                key={lltv}
                onClick={() => setSelectedLLTV(lltv)}
                className={`flex-1 py-2 rounded-lg font-mono text-sm font-medium transition-all ${
                  isSelected
                    ? `${colorClasses[idx]} border-2`
                    : 'bg-lotus-grey-700 border border-lotus-grey-600 text-lotus-grey-300 hover:border-lotus-grey-500'
                }`}
              >
                {lltv}%
              </button>
            );
          })}
        </div>
      </div>

      {/* LIF Result & Example */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50">
          <div className="text-sm text-lotus-purple-400 mb-1">Liquidation Incentive Factor</div>
          <div className="text-3xl font-mono font-bold text-lotus-purple-300">
            {lif.toFixed(3)}
          </div>
          <div className="text-sm text-lotus-purple-200/70 mt-1">
            Liquidator gets {formatPercent(lifPercent)} bonus
          </div>
        </div>

        <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
          <div className="text-sm text-lotus-grey-400 mb-2">Example at max borrow</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-lotus-grey-400">Collateral:</span>
              <span className="font-mono text-lotus-grey-200">${collateralValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-lotus-grey-400">Debt ({selectedLLTV}% LLTV):</span>
              <span className="font-mono text-lotus-grey-200">${debtAtMaxBorrow.toFixed(0)}</span>
            </div>
            <div className="flex justify-between border-t border-lotus-grey-600 pt-1 mt-1">
              <span className="text-lotus-grey-400">Seized by liquidator:</span>
              <span className="font-mono text-emerald-400">${seizedCollateral.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-lotus-grey-400">Liquidator profit:</span>
              <span className="font-mono text-emerald-400">${liquidatorProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-step Bad Debt Math */}
      <div className="mt-6 bg-red-900/20 rounded-lg p-4 border border-red-700/50">
        <h4 className="text-sm font-medium text-red-300 mb-3">Step-by-Step: When Does Bad Debt Occur?</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-1 border-b border-red-700/30">
            <span className="text-lotus-grey-300">1. Buffer (1 - LLTV):</span>
            <span className="font-mono font-medium text-lotus-grey-100">{buffer.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-red-700/30">
            <span className="text-lotus-grey-300">2. Liquidation bonus (LIF - 1):</span>
            <span className="font-mono font-medium text-lotus-purple-300">+{lifPercent.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-lotus-grey-300">3. Drop-to-bad-debt buffer:</span>
            <span className={`font-mono font-bold ${badDebtThreshold < 10 ? 'text-red-400' : badDebtThreshold < 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {badDebtThreshold.toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-xs text-red-200/70 mt-3">
          Bad debt occurs when collateral drops more than {badDebtThreshold.toFixed(1)}% before liquidators can act.
        </p>
      </div>

      {/* Why LIF changes with LLTV */}
      <div className="mt-4 p-4 bg-lotus-purple-900/20 rounded-lg border border-lotus-purple-700/50">
        <h4 className="text-sm font-medium text-lotus-purple-300 mb-2">Why LIF Changes with LLTV</h4>
        <p className="text-sm text-lotus-purple-200/80">
          Higher LLTV means less buffer between borrow amount and collateral. With less buffer,
          there's less room for liquidation bonus while still covering debt. This is why junior
          tranches (higher LLTV) have lower LIF and higher bad debt risk.
        </p>
      </div>

      {/* Advanced - Collapsible */}
      <details className="mt-4 bg-lotus-grey-900/50 rounded-lg border border-lotus-grey-700">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-lotus-grey-300 hover:text-lotus-grey-100">
          Advanced: LIF Formula Details
        </summary>
        <div className="px-4 pb-4">
          <div className="text-center mb-4">
            <div className="font-mono text-lg text-lotus-grey-100 mb-2">
              LIF = min(M, 1 / (β × LLTV + (1 - β)))
            </div>
            <div className="text-xs text-lotus-grey-500">
              where β = 0.3, M = 1.15 (max bonus capped at 15%)
            </div>
          </div>
          <p className="text-xs text-lotus-grey-400">
            The formula ensures liquidators always have incentive (capped at 15%), while scaling
            down the bonus for higher LLTV tranches where there's less collateral buffer.
          </p>
        </div>
      </details>

      {/* Key Insight */}
      <div className="mt-6 p-4 bg-amber-900/20 rounded-lg border border-amber-700/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-900/50 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-300">Higher LLTV = Lower LIF</p>
            <p className="text-xs text-amber-200/70 mt-1">
              Junior tranches offer less profit to liquidators. This means liquidators may delay or skip
              liquidations when gas costs are high, increasing bad debt risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Section 2: Risk-Return Connection (Updated)
// ============================================

function RiskReturnConnection() {
  const trancheData = useMemo(() => {
    return TRANCHE_LLTV.map((lltv, i) => {
      const lif = calculateLIF(lltv);
      const buffer = 100 - lltv; // 1 - LLTV as percentage
      const liquidationBonus = (lif - 1) * 100;
      const badDebtThreshold = calculateBadDebtThreshold(lltv);

      // Risk dots: 1 for 75%, 2 for 80%, 3 for 85%, 4 for 90%, 5 for 95%
      const riskDots = i + 1;

      const colorClasses = [
        { text: 'text-emerald-400', bg: 'bg-emerald-500' },
        { text: 'text-teal-400', bg: 'bg-teal-500' },
        { text: 'text-amber-400', bg: 'bg-amber-500' },
        { text: 'text-orange-400', bg: 'bg-orange-500' },
        { text: 'text-red-400', bg: 'bg-red-500' },
      ];

      return {
        lltv,
        buffer,
        liquidationBonus,
        badDebtThreshold,
        riskDots,
        colors: colorClasses[i],
      };
    });
  }, []);

  return (
    <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
      <h3 className="text-lg font-medium text-lotus-grey-100 mb-2">Why Higher LLTV = Higher Spread</h3>
      <p className="text-sm text-lotus-grey-300 mb-6">
        Lenders at higher LLTVs face more bad debt risk, so they demand higher compensation.
        This is reflected in higher spreads for junior tranches.
      </p>

      {/* Risk Chain Visualization */}
      <div className="bg-lotus-grey-900/50 rounded-lg p-6 border border-lotus-grey-700 mb-6">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="bg-lotus-purple-900/30 border border-lotus-purple-600 rounded-lg px-4 py-3 text-center">
            <div className="text-sm font-medium text-lotus-purple-300">Higher LLTV</div>
          </div>
          <svg className="w-6 h-6 text-lotus-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="bg-amber-900/30 border border-amber-600 rounded-lg px-4 py-3 text-center">
            <div className="text-sm font-medium text-amber-300">Less Buffer</div>
          </div>
          <svg className="w-6 h-6 text-lotus-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="bg-red-900/30 border border-red-600 rounded-lg px-4 py-3 text-center">
            <div className="text-sm font-medium text-red-300">More Bad Debt Risk</div>
          </div>
          <svg className="w-6 h-6 text-lotus-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="bg-emerald-900/30 border border-emerald-600 rounded-lg px-4 py-3 text-center">
            <div className="text-sm font-medium text-emerald-300">Higher Spread</div>
          </div>
        </div>
      </div>

      {/* Updated Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-lotus-grey-700">
              <th className="text-left py-3 px-3 text-sm font-medium text-lotus-grey-300">Tranche</th>
              <th className="text-center py-3 px-3 text-sm font-medium text-lotus-grey-300">Buffer (1-LLTV)</th>
              <th className="text-center py-3 px-3 text-sm font-medium text-lotus-grey-300">Liquidation Bonus</th>
              <th className="text-center py-3 px-3 text-sm font-medium text-lotus-grey-300">Bad Debt Starts</th>
              <th className="text-center py-3 px-3 text-sm font-medium text-lotus-grey-300">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {trancheData.map((tranche) => (
              <tr key={tranche.lltv} className="border-b border-lotus-grey-700/50">
                <td className="py-3 px-3">
                  <span className={`font-mono font-semibold ${tranche.colors.text}`}>
                    {tranche.lltv}%
                  </span>
                </td>
                <td className="text-center py-3 px-3">
                  <span className="font-mono text-lotus-grey-200">{tranche.buffer}%</span>
                </td>
                <td className="text-center py-3 px-3">
                  <span className="font-mono text-lotus-grey-200">+{formatPercent(tranche.liquidationBonus)}</span>
                </td>
                <td className="text-center py-3 px-3">
                  <span className={`font-mono font-medium ${
                    tranche.badDebtThreshold < 10 ? 'text-red-400' :
                    tranche.badDebtThreshold < 15 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    -{formatPercent(tranche.badDebtThreshold)} drop
                  </span>
                </td>
                <td className="text-center py-3 px-3">
                  <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: tranche.riskDots }).map((_, j) => (
                      <div
                        key={j}
                        className={`w-2 h-2 rounded-full ${tranche.colors.bg}`}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rate Decomposition */}
      <div className="mt-6 bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50">
        <h4 className="text-sm font-medium text-emerald-300 mb-3">Borrow Rate = Base Rate + Credit Spread</h4>
        <p className="text-sm text-emerald-200/80 mb-4">
          Each tranche has the same base rate (from LotusUSD), but different credit spreads based on risk.
        </p>
        <div className="grid grid-cols-5 gap-2 text-xs">
          {TRANCHE_LLTV.map((lltv, i) => {
            // Example spreads that increase with LLTV
            const exampleSpread = [1.0, 1.5, 2.5, 4.0, 6.0][i];
            const baseRate = 3.0; // Example base rate
            return (
              <div key={lltv} className="bg-lotus-grey-800 rounded p-2 text-center">
                <div className="font-mono font-medium text-lotus-grey-100">{lltv}%</div>
                <div className="text-lotus-grey-400 mt-1">{baseRate}% + {exampleSpread}%</div>
                <div className="font-mono text-emerald-400 font-medium">{(baseRate + exampleSpread).toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-emerald-200/60 mt-2 italic">
          Example rates shown. Actual rates depend on market conditions.
        </p>
      </div>

      {/* Connection to Rates */}
      <div className="mt-6 p-4 bg-lotus-grey-700/50 rounded-lg border border-lotus-grey-600">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-lotus-grey-200">
              <strong>Remember from Productive Debt:</strong> Borrow Rate = Base Rate + Spread
            </p>
            <p className="text-xs text-lotus-grey-400 mt-1">
              The spread varies by tranche because lenders need compensation for different risk levels.
              A 95% LLTV lender faces bad debt at just a ~{formatPercent(calculateBadDebtThreshold(95), 0)} price drop,
              while a 75% LLTV lender has a ~{formatPercent(calculateBadDebtThreshold(75), 0)} buffer.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50 text-center">
          <div className="text-emerald-400 font-semibold mb-1">Senior (75-80%)</div>
          <div className="text-xs text-emerald-200/70">
            Larger buffer (20-25%)<br/>
            Lower spread, less risk
          </div>
        </div>
        <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-700/50 text-center">
          <div className="text-amber-400 font-semibold mb-1">Mid (85%)</div>
          <div className="text-xs text-amber-200/70">
            Moderate buffer (15%)<br/>
            Balanced spread and risk
          </div>
        </div>
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-700/50 text-center">
          <div className="text-red-400 font-semibold mb-1">Junior (90-95%)</div>
          <div className="text-xs text-red-200/70">
            Smaller buffer (5-10%)<br/>
            Higher spread, more risk
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function TrancheRisk(_props: TrancheRiskProps) {
  return (
    <div className="space-y-8">
      {/* Intro Explainer */}
      <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50">
        <p className="text-sm text-lotus-purple-200">
          Different tranches exist because lenders have different risk appetites.
          Understanding <strong>how liquidations work</strong> and <strong>when bad debt occurs</strong>
          helps you understand why higher LLTV tranches pay higher spreads.
        </p>
      </div>

      <LiquidationMechanics />
      <RiskReturnConnection />
    </div>
  );
}

export default TrancheRisk;
