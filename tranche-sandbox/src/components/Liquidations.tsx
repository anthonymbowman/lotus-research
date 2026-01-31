import { useState, useMemo } from 'react';

interface LiquidationsProps {
  tranches: { lltv: number }[];
}

/**
 * Liquidations section - explains basic liquidation mechanics
 */
export function Liquidations({ tranches }: LiquidationsProps) {
  // Health factor calculator state
  const [collateralValue, setCollateralValue] = useState(10000);
  const [debtValue, setDebtValue] = useState(6000);
  const [selectedLltv, setSelectedLltv] = useState(0.80); // 80% LLTV

  const calculations = useMemo(() => {
    const currentLtv = debtValue / collateralValue;
    const maxLtv = selectedLltv;
    const distanceToLiquidation = maxLtv - currentLtv;
    const healthFactor = maxLtv / currentLtv;
    const maxBorrow = collateralValue * selectedLltv;
    const remainingBorrowCapacity = maxBorrow - debtValue;
    const priceDropToLiquidation = ((1 - currentLtv / maxLtv) * 100);

    return {
      currentLtv,
      maxLtv,
      distanceToLiquidation,
      healthFactor,
      maxBorrow,
      remainingBorrowCapacity,
      priceDropToLiquidation,
      isHealthy: healthFactor > 1,
      isWarning: healthFactor <= 1.2 && healthFactor > 1,
      isLiquidatable: healthFactor <= 1,
    };
  }, [collateralValue, debtValue, selectedLltv]);

  const getHealthColor = () => {
    if (calculations.isLiquidatable) return 'bg-red-500';
    if (calculations.isWarning) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getHealthTextColor = () => {
    if (calculations.isLiquidatable) return 'text-red-400';
    if (calculations.isWarning) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="space-y-8">
      {/* What triggers liquidation */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">What Triggers Liquidation?</h3>
        <p className="text-lotus-grey-300 mb-6">
          Liquidation occurs when a borrower's Loan-to-Value (LTV) ratio exceeds their tranche's
          Liquidation LTV (LLTV) threshold. This happens when:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <div className="text-lotus-purple-400 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <h4 className="font-medium text-lotus-grey-100 mb-1">Collateral Drops</h4>
            <p className="text-sm text-lotus-grey-400">
              If the collateral asset's price falls, the LTV ratio increases automatically.
            </p>
          </div>

          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <div className="text-lotus-purple-400 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-lotus-grey-100 mb-1">Interest Accrues</h4>
            <p className="text-sm text-lotus-grey-400">
              As interest is added to the debt, the total owed increases, raising the LTV.
            </p>
          </div>

          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <div className="text-lotus-purple-400 mb-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 className="font-medium text-lotus-grey-100 mb-1">Threshold Breach</h4>
            <p className="text-sm text-lotus-grey-400">
              When LTV &gt; LLTV, the position becomes eligible for liquidation.
            </p>
          </div>
        </div>

        {/* Visual formula */}
        <div className="bg-lotus-grey-900/50 rounded-lg p-4 border border-lotus-grey-700">
          <div className="flex items-center justify-center gap-4 flex-wrap text-center">
            <div className="px-4 py-2 bg-lotus-grey-700 rounded-lg">
              <div className="text-xs text-lotus-grey-500 mb-1">Current LTV</div>
              <div className="font-mono text-lotus-grey-100">Debt / Collateral</div>
            </div>
            <span className="text-lotus-grey-500 text-xl">&gt;</span>
            <div className="px-4 py-2 bg-lotus-purple-900/30 border border-lotus-purple-700 rounded-lg">
              <div className="text-xs text-lotus-purple-400 mb-1">LLTV Threshold</div>
              <div className="font-mono text-lotus-purple-300">75% - 95%</div>
            </div>
            <span className="text-lotus-grey-500 text-xl">=</span>
            <div className="px-4 py-2 bg-red-900/30 border border-red-700 rounded-lg">
              <div className="text-xs text-red-400 mb-1">Result</div>
              <div className="font-mono text-red-300">Liquidatable</div>
            </div>
          </div>
        </div>
      </div>

      {/* Per-tranche thresholds */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Per-Tranche Liquidation Thresholds</h3>
        <p className="text-lotus-grey-300 mb-6">
          Each tranche has a different LLTV threshold. Higher-risk tranches allow higher leverage
          but are first to absorb bad debt.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-lotus-grey-700">
                <th className="text-left py-3 px-4 text-lotus-grey-400 font-medium">Tranche</th>
                <th className="text-center py-3 px-4 text-lotus-grey-400 font-medium">LLTV Threshold</th>
                <th className="text-center py-3 px-4 text-lotus-grey-400 font-medium">Max Leverage</th>
                <th className="text-center py-3 px-4 text-lotus-grey-400 font-medium">Risk Level</th>
                <th className="text-left py-3 px-4 text-lotus-grey-400 font-medium">Collateral Drop to Liquidation*</th>
              </tr>
            </thead>
            <tbody>
              {tranches.map((tranche, index) => {
                const leverage = 1 / (1 - tranche.lltv / 100);
                const priceDropAt80LTV = ((1 - (0.8 * 100 / tranche.lltv))) * 100;
                const riskLevel = index < 2 ? 'Lower' : index < 4 ? 'Medium' : 'Higher';
                const riskColor = index < 2 ? 'text-emerald-400' : index < 4 ? 'text-amber-400' : 'text-red-400';

                return (
                  <tr key={tranche.lltv} className="border-b border-lotus-grey-700/50 hover:bg-lotus-grey-700/30">
                    <td className="py-3 px-4 font-medium text-lotus-grey-100">{tranche.lltv}% LLTV</td>
                    <td className="py-3 px-4 text-center font-mono text-lotus-purple-400">{tranche.lltv}%</td>
                    <td className="py-3 px-4 text-center font-mono text-lotus-grey-200">{leverage.toFixed(1)}x</td>
                    <td className={`py-3 px-4 text-center ${riskColor}`}>{riskLevel}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-lotus-grey-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-lotus-purple-500"
                            style={{ width: `${priceDropAt80LTV}%` }}
                          />
                        </div>
                        <span className="font-mono text-lotus-grey-300 text-xs w-12 text-right">
                          {priceDropAt80LTV.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-lotus-grey-500 mt-3">
          *Assuming starting position at 80% LTV within that tranche
        </p>
      </div>

      {/* Health Factor Calculator */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Health Factor Calculator</h3>
        <p className="text-lotus-grey-300 mb-6">
          Enter your position details to see how close you are to liquidation.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-lotus-grey-300 mb-2">
                Collateral Value (USD)
              </label>
              <input
                type="number"
                value={collateralValue}
                onChange={(e) => setCollateralValue(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2 bg-lotus-grey-700 border border-lotus-grey-600 rounded-lg text-lotus-grey-100 font-mono focus:border-lotus-purple-500 focus:ring-1 focus:ring-lotus-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-lotus-grey-300 mb-2">
                Debt Value (USD)
              </label>
              <input
                type="number"
                value={debtValue}
                onChange={(e) => setDebtValue(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2 bg-lotus-grey-700 border border-lotus-grey-600 rounded-lg text-lotus-grey-100 font-mono focus:border-lotus-purple-500 focus:ring-1 focus:ring-lotus-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-lotus-grey-300 mb-2">
                Tranche LLTV
              </label>
              <select
                value={selectedLltv}
                onChange={(e) => setSelectedLltv(Number(e.target.value))}
                className="w-full px-4 py-2 bg-lotus-grey-700 border border-lotus-grey-600 rounded-lg text-lotus-grey-100 focus:border-lotus-purple-500 focus:ring-1 focus:ring-lotus-purple-500"
              >
                {tranches.map((t) => (
                  <option key={t.lltv} value={t.lltv / 100}>
                    {t.lltv}% LLTV
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Health Bar */}
            <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-lotus-grey-400">Position Health</span>
                <span className={`font-mono font-medium ${getHealthTextColor()}`}>
                  {calculations.isLiquidatable ? 'Liquidatable' : calculations.isWarning ? 'At Risk' : 'Healthy'}
                </span>
              </div>
              <div className="h-4 bg-lotus-grey-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getHealthColor()}`}
                  style={{
                    width: `${Math.min(100, Math.max(0, calculations.healthFactor * 50))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-lotus-grey-500">
                <span>Liquidation</span>
                <span>Safe Zone</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-lotus-grey-700/50 rounded-lg p-3 border border-lotus-grey-600">
                <div className="text-xs text-lotus-grey-500 mb-1">Current LTV</div>
                <div className={`text-xl font-mono font-medium ${getHealthTextColor()}`}>
                  {(calculations.currentLtv * 100).toFixed(1)}%
                </div>
              </div>

              <div className="bg-lotus-grey-700/50 rounded-lg p-3 border border-lotus-grey-600">
                <div className="text-xs text-lotus-grey-500 mb-1">LLTV Threshold</div>
                <div className="text-xl font-mono font-medium text-lotus-purple-400">
                  {(calculations.maxLtv * 100).toFixed(1)}%
                </div>
              </div>

              <div className="bg-lotus-grey-700/50 rounded-lg p-3 border border-lotus-grey-600">
                <div className="text-xs text-lotus-grey-500 mb-1">Health Factor</div>
                <div className={`text-xl font-mono font-medium ${getHealthTextColor()}`}>
                  {calculations.healthFactor.toFixed(2)}
                </div>
              </div>

              <div className="bg-lotus-grey-700/50 rounded-lg p-3 border border-lotus-grey-600">
                <div className="text-xs text-lotus-grey-500 mb-1">Buffer to Liquidation</div>
                <div className={`text-xl font-mono font-medium ${calculations.distanceToLiquidation > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(calculations.distanceToLiquidation * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Price drop warning */}
            {calculations.priceDropToLiquidation > 0 && (
              <div className={`rounded-lg p-3 border ${
                calculations.priceDropToLiquidation < 10
                  ? 'bg-red-900/20 border-red-700'
                  : calculations.priceDropToLiquidation < 25
                    ? 'bg-amber-900/20 border-amber-700'
                    : 'bg-lotus-grey-700/50 border-lotus-grey-600'
              }`}>
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 ${
                    calculations.priceDropToLiquidation < 10
                      ? 'text-red-400'
                      : calculations.priceDropToLiquidation < 25
                        ? 'text-amber-400'
                        : 'text-lotus-grey-400'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-lotus-grey-300">
                    A <span className="font-mono font-medium">{calculations.priceDropToLiquidation.toFixed(1)}%</span> drop in collateral price would trigger liquidation.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How liquidation protects lenders */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">How Liquidation Protects Lenders</h3>
        <p className="text-lotus-grey-300 mb-6">
          Liquidation is a safety mechanism that ensures lenders can recover their funds when
          borrower positions become risky.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-lotus-grey-700/30 rounded-lg">
            <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lotus-purple-400 font-medium">1</span>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-100 mb-1">Position Detected</h4>
              <p className="text-sm text-lotus-grey-400">
                When LTV exceeds LLTV, the position is flagged for liquidation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-lotus-grey-700/30 rounded-lg">
            <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lotus-purple-400 font-medium">2</span>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-100 mb-1">Collateral Seized</h4>
              <p className="text-sm text-lotus-grey-400">
                Liquidators repay the debt and receive the collateral at a discount.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-lotus-grey-700/30 rounded-lg">
            <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lotus-purple-400 font-medium">3</span>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-100 mb-1">Debt Repaid</h4>
              <p className="text-sm text-lotus-grey-400">
                The borrower's debt is cleared from the protocol, protecting lenders.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-lotus-grey-700/30 rounded-lg">
            <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lotus-purple-400 font-medium">4</span>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-100 mb-1">Bad Debt Absorbed</h4>
              <p className="text-sm text-lotus-grey-400">
                Any shortfall is absorbed by junior tranches first, protecting senior lenders.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bad Debt Section */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Understanding Bad Debt</h3>

        {/* Definition */}
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-700/50 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-red-300 mb-1">What is Bad Debt?</h4>
              <p className="text-sm text-red-200">
                Bad debt occurs when a position's collateral value is less than the debt owed after liquidation.
                This shortfall must be absorbed by the protocol's lenders.
              </p>
            </div>
          </div>
        </div>

        {/* Causes */}
        <div className="mb-6">
          <h4 className="font-medium text-lotus-grey-200 mb-4">Common Causes of Bad Debt</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
              <div className="text-lotus-purple-400 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <h5 className="font-medium text-lotus-grey-100 mb-1">Rapid Price Drops</h5>
              <p className="text-sm text-lotus-grey-400">
                When collateral price falls faster than liquidators can act, the collateral may not cover the debt.
              </p>
            </div>

            <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
              <div className="text-lotus-purple-400 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h5 className="font-medium text-lotus-grey-100 mb-1">Oracle Delays</h5>
              <p className="text-sm text-lotus-grey-400">
                Price oracle updates may lag behind actual market prices during high volatility.
              </p>
            </div>

            <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
              <div className="text-lotus-purple-400 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h5 className="font-medium text-lotus-grey-100 mb-1">Low Liquidator Incentive</h5>
              <p className="text-sm text-lotus-grey-400">
                If the liquidation bonus doesn't cover gas and risk, liquidators may not act quickly.
              </p>
            </div>
          </div>
        </div>

        {/* Bad Debt Cascade */}
        <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
          <h4 className="font-medium text-lotus-grey-200 mb-4">How Bad Debt is Absorbed (Cascade)</h4>
          <p className="text-sm text-lotus-grey-400 mb-4">
            Bad debt cascades through tranches based on supply utilization, with junior tranches absorbing first:
          </p>

          <div className="bg-lotus-grey-900/50 rounded-lg p-4 border border-lotus-grey-700">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="text-center">
                <div className="px-4 py-2 bg-red-900/30 border border-red-700 rounded-lg">
                  <div className="text-xs text-red-400 mb-1">Bad Debt Event</div>
                  <div className="font-mono text-red-300 text-sm">$10,000</div>
                </div>
              </div>

              <svg className="w-6 h-6 text-lotus-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>

              <div className="text-center">
                <div className="px-4 py-2 bg-red-900/30 border border-red-700 rounded-lg">
                  <div className="text-xs text-red-400 mb-1">95% LLTV (Junior)</div>
                  <div className="font-mono text-red-300 text-sm">Absorbs First</div>
                </div>
              </div>

              <svg className="w-6 h-6 text-lotus-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>

              <div className="text-center">
                <div className="px-4 py-2 bg-amber-900/30 border border-amber-700 rounded-lg">
                  <div className="text-xs text-amber-400 mb-1">85% LLTV (Mid)</div>
                  <div className="font-mono text-amber-300 text-sm">If Remaining</div>
                </div>
              </div>

              <svg className="w-6 h-6 text-lotus-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>

              <div className="text-center">
                <div className="px-4 py-2 bg-emerald-900/30 border border-emerald-700 rounded-lg">
                  <div className="text-xs text-emerald-400 mb-1">75% LLTV (Senior)</div>
                  <div className="font-mono text-emerald-300 text-sm">Last Resort</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key insight */}
          <div className="mt-4 p-3 bg-lotus-purple-900/20 border border-lotus-purple-700/50 rounded-lg">
            <p className="text-sm text-lotus-purple-200">
              <span className="font-medium text-lotus-purple-300">Key insight:</span> Senior lenders are protected
              because junior tranches absorb losses first. This is why junior tranches earn higher yields — they
              take on more risk in exchange for higher returns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Liquidations;
