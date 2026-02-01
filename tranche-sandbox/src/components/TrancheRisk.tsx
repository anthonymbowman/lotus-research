import { useState, useMemo } from 'react';
import { ConceptPrimer } from './ConceptPrimer';

interface TrancheRiskProps {
  tranches: { lltv: number; borrowRate: number }[];
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
  // Bad debt threshold = 1 - (LLTV - (1 - LIF))
  const badDebtThreshold = (1 - (lltvDecimal - (1 - lif))) * 100;
  return Math.max(0, badDebtThreshold);
}

function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// ============================================
// Section 1: Liquidation Mechanics
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

  return (
    <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
      <h3 className="text-lg font-medium text-lotus-grey-100 mb-2">How Liquidations Work</h3>
      <p className="text-sm text-lotus-grey-300 mb-6">
        When a borrower's LTV exceeds the tranche LLTV, liquidators can <strong>seize collateral</strong> and <strong>repay debt</strong>.
        The Liquidation Incentive Factor (LIF) determines how much collateral the liquidator receives per unit of debt repaid.
      </p>

      {/* LIF Formula */}
      <div className="bg-lotus-grey-900/50 rounded-lg p-4 border border-lotus-grey-700 mb-6">
        <div className="text-center mb-4">
          <div className="text-sm text-lotus-grey-400 mb-2">Liquidation Incentive Factor</div>
          <div className="font-mono text-lg text-lotus-grey-100">
            LIF = min(M, 1 / (β × LLTV + (1 - β)))
          </div>
          <div className="text-xs text-lotus-grey-500 mt-2">
            where β = 0.3, M = 1.15 (max bonus capped at 15%)
          </div>
        </div>
      </div>

      {/* Interactive LLTV selector */}
      <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-lotus-grey-300">Select Tranche LLTV</span>
          <span className="text-lg font-mono font-semibold text-lotus-grey-100">{selectedLLTV}%</span>
        </div>
        <div className="flex gap-2">
          {TRANCHE_LLTV.map((lltv) => {
            const isSelected = selectedLLTV === lltv;
            const colors = ['emerald', 'emerald', 'amber', 'orange', 'red'];
            const idx = TRANCHE_LLTV.indexOf(lltv);
            return (
              <button
                key={lltv}
                onClick={() => setSelectedLLTV(lltv)}
                className={`flex-1 py-2 rounded-lg font-mono text-sm font-medium transition-all ${
                  isSelected
                    ? `bg-${colors[idx]}-900/50 border-2 border-${colors[idx]}-500 text-${colors[idx]}-300`
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

      {/* LIF by Tranche Table */}
      <div className="mt-6">
        <div className="text-sm font-medium text-lotus-grey-300 mb-3">LIF by Tranche</div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-lotus-grey-700">
                <th className="text-left py-2 px-3 text-xs font-medium text-lotus-grey-400">LLTV</th>
                <th className="text-center py-2 px-3 text-xs font-medium text-lotus-grey-400">LIF</th>
                <th className="text-center py-2 px-3 text-xs font-medium text-lotus-grey-400">Liquidator Bonus</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-lotus-grey-400">Implication</th>
              </tr>
            </thead>
            <tbody>
              {TRANCHE_LLTV.map((lltv, i) => {
                const trancheLIF = calculateLIF(lltv);
                const bonus = (trancheLIF - 1) * 100;
                const colors = ['emerald', 'emerald', 'amber', 'orange', 'red'];
                return (
                  <tr key={lltv} className="border-b border-lotus-grey-700/50">
                    <td className="py-2 px-3">
                      <span className={`font-mono font-semibold text-${colors[i]}-400`}>{lltv}%</span>
                    </td>
                    <td className="text-center py-2 px-3 font-mono text-lotus-grey-200">
                      {trancheLIF.toFixed(3)}
                    </td>
                    <td className="text-center py-2 px-3 font-mono text-lotus-grey-200">
                      +{formatPercent(bonus)}
                    </td>
                    <td className="text-right py-2 px-3 text-xs text-lotus-grey-400">
                      {bonus > 5 ? 'Strong incentive' : bonus > 2 ? 'Moderate incentive' : 'Weak incentive'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
// Section 2: Price Drop & Bad Debt Simulator
// ============================================

function BadDebtSimulator() {
  const [priceDrop, setPriceDrop] = useState(10);

  const trancheStatus = useMemo(() => {
    return TRANCHE_LLTV.map((lltv) => {
      const lltvDecimal = lltv / 100;
      const lif = calculateLIF(lltv);
      const priceDropDecimal = priceDrop / 100;

      // At max borrow: LTV = LLTV, debt = collateral * LLTV
      // After price drop: new_collateral = collateral * (1 - drop)
      // New LTV = debt / new_collateral = LLTV / (1 - drop)
      const newLTV = lltvDecimal / (1 - priceDropDecimal);

      // Liquidation happens when LTV > LLTV (any price drop at max borrow)
      const isLiquidatable = priceDrop > 0;

      // Bad debt threshold = 1 - (LLTV - (1 - LIF))
      const badDebtThreshold = calculateBadDebtThreshold(lltv);
      const hasBadDebt = priceDrop > badDebtThreshold;

      // Calculate bad debt percentage when past threshold
      // Bad debt grows as price drops further past threshold
      let badDebtPercent = 0;
      if (hasBadDebt) {
        // Bad debt = how much of the debt can't be recovered
        // At threshold, bad debt = 0. As drop increases, bad debt increases.
        const excessDrop = priceDropDecimal - badDebtThreshold / 100;
        badDebtPercent = (excessDrop / lltvDecimal) * 100;
      }

      return {
        lltv,
        lif,
        newLTV: newLTV * 100,
        isLiquidatable,
        hasBadDebt,
        badDebtPercent: Math.min(badDebtPercent, 100),
        badDebtThreshold,
      };
    });
  }, [priceDrop]);

  const liquidatedCount = trancheStatus.filter(t => t.isLiquidatable).length;
  const badDebtCount = trancheStatus.filter(t => t.hasBadDebt).length;

  return (
    <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
      <h3 className="text-lg font-medium text-lotus-grey-100 mb-2">Price Drop & Bad Debt</h3>
      <p className="text-sm text-lotus-grey-300 mb-6">
        When collateral price drops, positions become liquidatable. If the drop is severe enough,
        liquidations may not fully cover the debt — creating <strong>bad debt</strong> that lenders absorb.
      </p>

      {/* Price Drop Slider */}
      <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-lotus-grey-300">Collateral Price Drops By</span>
          <span className={`text-2xl font-mono font-bold ${
            priceDrop >= 20 ? 'text-red-400' : priceDrop >= 10 ? 'text-amber-400' : 'text-lotus-grey-100'
          }`}>
            -{priceDrop}%
          </span>
        </div>
        <input
          type="range"
          value={priceDrop}
          onChange={(e) => setPriceDrop(parseInt(e.target.value))}
          min="0"
          max="30"
          step="1"
          className="w-full"
        />
        <div className="flex justify-between text-xs text-lotus-grey-500 mt-1">
          <span>0%</span>
          <span>-30%</span>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`rounded-lg p-4 border ${
          liquidatedCount > 0
            ? 'bg-amber-900/20 border-amber-700/50'
            : 'bg-emerald-900/20 border-emerald-700/50'
        }`}>
          <div className="text-2xl font-bold font-mono text-center mb-1">
            <span className={liquidatedCount > 0 ? 'text-amber-400' : 'text-emerald-400'}>
              {liquidatedCount}
            </span>
            <span className="text-lotus-grey-500 text-lg"> / 5</span>
          </div>
          <div className="text-xs text-center text-lotus-grey-400">Tranches Liquidatable</div>
        </div>
        <div className={`rounded-lg p-4 border ${
          badDebtCount > 0
            ? 'bg-red-900/20 border-red-700/50'
            : 'bg-emerald-900/20 border-emerald-700/50'
        }`}>
          <div className="text-2xl font-bold font-mono text-center mb-1">
            <span className={badDebtCount > 0 ? 'text-red-400' : 'text-emerald-400'}>
              {badDebtCount}
            </span>
            <span className="text-lotus-grey-500 text-lg"> / 5</span>
          </div>
          <div className="text-xs text-center text-lotus-grey-400">Tranches with Bad Debt</div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-lotus-grey-700">
              <th className="text-left py-3 px-3 text-sm font-medium text-lotus-grey-300">Tranche</th>
              <th className="text-center py-3 px-3 text-sm font-medium text-lotus-grey-300">LIF</th>
              <th className="text-center py-3 px-3 text-sm font-medium text-lotus-grey-300">New LTV</th>
              <th className="text-center py-3 px-3 text-sm font-medium text-lotus-grey-300">Status</th>
              <th className="text-right py-3 px-3 text-sm font-medium text-lotus-grey-300">Bad Debt</th>
            </tr>
          </thead>
          <tbody>
            {trancheStatus.map((tranche, i) => {
              const colors = ['emerald', 'emerald', 'amber', 'orange', 'red'];
              const labels = ['Senior', 'Senior', 'Mid', 'Junior', 'Junior'];

              return (
                <tr
                  key={tranche.lltv}
                  className={`border-b border-lotus-grey-700/50 transition-colors ${
                    tranche.hasBadDebt ? 'bg-red-900/10' : tranche.isLiquidatable ? 'bg-amber-900/10' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <span className={`font-mono font-semibold text-${colors[i]}-400`}>
                      {tranche.lltv}%
                    </span>
                    <span className="text-xs text-lotus-grey-500 ml-2">{labels[i]}</span>
                  </td>
                  <td className="text-center py-3 px-3">
                    <span className="font-mono text-lotus-grey-300 text-sm">{tranche.lif.toFixed(3)}</span>
                  </td>
                  <td className="text-center py-3 px-3">
                    <span className={`font-mono font-semibold ${
                      tranche.hasBadDebt ? 'text-red-400' : tranche.isLiquidatable ? 'text-amber-400' : 'text-lotus-grey-100'
                    }`}>
                      {tranche.newLTV.toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-3">
                    {tranche.hasBadDebt ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/40 border border-red-700 rounded-full text-xs font-medium text-red-300">
                        Bad Debt
                      </span>
                    ) : tranche.isLiquidatable ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-900/40 border border-amber-700 rounded-full text-xs font-medium text-amber-300">
                        Liquidatable
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-900/40 border border-emerald-700 rounded-full text-xs font-medium text-emerald-300">
                        Safe
                      </span>
                    )}
                  </td>
                  <td className="text-right py-3 px-3">
                    {tranche.hasBadDebt ? (
                      <span className="font-mono font-semibold text-red-400">
                        {tranche.badDebtPercent.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-lotus-grey-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bad Debt Thresholds */}
      <div className="mt-6 p-4 bg-lotus-grey-700/50 rounded-lg border border-lotus-grey-600">
        <div className="text-sm font-medium text-lotus-grey-300 mb-3">Bad Debt Threshold by Tranche</div>
        <p className="text-xs text-lotus-grey-400 mb-3">
          Price drop at which bad debt begins (assuming max borrow):
        </p>
        <div className="flex flex-wrap gap-2">
          {trancheStatus.map((tranche, i) => {
            const colors = ['emerald', 'emerald', 'amber', 'orange', 'red'];
            return (
              <div
                key={tranche.lltv}
                className={`px-3 py-2 rounded-lg bg-${colors[i]}-900/30 border border-${colors[i]}-700/50`}
              >
                <div className={`font-mono font-semibold text-${colors[i]}-400`}>{tranche.lltv}%</div>
                <div className="text-xs text-lotus-grey-300">
                  bad debt at -{formatPercent(tranche.badDebtThreshold, 1)} drop
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Insight */}
      <div className="mt-6 p-4 bg-red-900/20 rounded-lg border border-red-700/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-red-300">Bad Debt = Lender Losses</p>
            <p className="text-xs text-red-200/70 mt-1">
              When liquidations can't fully repay debt, lenders in that tranche absorb the loss.
              Higher LLTV tranches have lower LIF and smaller buffers, making bad debt more likely.
              This is why lenders at higher LLTVs demand higher spreads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Section 3: Risk-Return Connection
// ============================================

interface RiskReturnConnectionProps {
  tranches: { lltv: number; borrowRate: number }[];
}

function RiskReturnConnection({ tranches }: RiskReturnConnectionProps) {
  const trancheData = useMemo(() => {
    return TRANCHE_LLTV.map((lltv, i) => {
      const tranche = tranches.find(t => t.lltv === lltv);
      const borrowRate = tranche?.borrowRate || 0;
      const lif = calculateLIF(lltv);
      const badDebtThreshold = calculateBadDebtThreshold(lltv);
      const colors = ['emerald', 'emerald', 'amber', 'orange', 'red'];
      const labels = ['Senior', 'Senior', 'Mid', 'Junior', 'Junior'];

      // Risk score based on how quickly bad debt occurs
      const riskScore = Math.round((1 - badDebtThreshold / 30) * 5);

      return {
        lltv,
        borrowRate,
        lif,
        badDebtThreshold,
        color: colors[i],
        label: labels[i],
        riskScore,
      };
    });
  }, [tranches]);

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
            <div className="text-sm font-medium text-amber-300">Lower LIF</div>
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

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-lotus-grey-700">
              <th className="text-left py-3 px-3 text-sm font-medium text-lotus-grey-300">Tranche</th>
              <th className="text-center py-3 px-3 text-sm font-medium text-lotus-grey-300">LIF</th>
              <th className="text-center py-3 px-3 text-sm font-medium text-lotus-grey-300">Bad Debt Starts</th>
              <th className="text-center py-3 px-3 text-sm font-medium text-lotus-grey-300">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {trancheData.map((tranche) => (
              <tr key={tranche.lltv} className="border-b border-lotus-grey-700/50">
                <td className="py-3 px-3">
                  <span className={`font-mono font-semibold text-${tranche.color}-400`}>
                    {tranche.lltv}%
                  </span>
                  <span className="text-xs text-lotus-grey-500 ml-2">{tranche.label}</span>
                </td>
                <td className="text-center py-3 px-3">
                  <span className="font-mono text-lotus-grey-200">{tranche.lif.toFixed(3)}</span>
                </td>
                <td className="text-center py-3 px-3">
                  <span className={`font-mono font-medium ${
                    tranche.badDebtThreshold < 10 ? 'text-red-400' :
                    tranche.badDebtThreshold < 15 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    -{formatPercent(tranche.badDebtThreshold, 1)} drop
                  </span>
                </td>
                <td className="text-center py-3 px-3">
                  <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div
                        key={j}
                        className={`w-2 h-2 rounded-full ${
                          j < tranche.riskScore
                            ? tranche.riskScore <= 2 ? 'bg-emerald-500' :
                              tranche.riskScore <= 3 ? 'bg-amber-500' : 'bg-red-500'
                            : 'bg-lotus-grey-700'
                        }`}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            Higher LIF, larger buffer<br/>
            Lower spread, less risk
          </div>
        </div>
        <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-700/50 text-center">
          <div className="text-amber-400 font-semibold mb-1">Mid (85%)</div>
          <div className="text-xs text-amber-200/70">
            Balanced LIF and buffer<br/>
            Moderate spread and risk
          </div>
        </div>
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-700/50 text-center">
          <div className="text-red-400 font-semibold mb-1">Junior (90-95%)</div>
          <div className="text-xs text-red-200/70">
            Lower LIF, smaller buffer<br/>
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

export function TrancheRisk({ tranches }: TrancheRiskProps) {
  return (
    <div className="space-y-8">
      {/* Key Concepts Primer */}
      <ConceptPrimer concepts={['lltv', 'tranche-seniority', 'bad-debt']} />

      {/* Intro Explainer */}
      <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50">
        <p className="text-sm text-lotus-purple-200">
          Different tranches exist because lenders have different risk appetites.
          Understanding <strong>how liquidations work</strong> and <strong>when bad debt occurs</strong>
          helps you understand why higher LLTV tranches pay higher spreads.
        </p>
      </div>

      <LiquidationMechanics />
      <BadDebtSimulator />
      <RiskReturnConnection tranches={tranches} />
    </div>
  );
}

export default TrancheRisk;
