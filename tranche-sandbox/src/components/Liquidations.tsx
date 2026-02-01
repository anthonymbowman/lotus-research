import { useState, useMemo } from 'react';
import type { TrancheData } from '../types';
import { BadDebtSimulator } from './BadDebtSimulator';
import { TeachingPrompt } from './TeachingPrompt';
import { DynamicInsight } from './DynamicInsight';

interface LiquidationsProps {
  tranches: { lltv: number }[];
  computedTranches?: TrancheData[];
}

/**
 * Liquidations section - explains liquidation mechanics with all-tranche health calculator
 */
export function Liquidations({ tranches, computedTranches }: LiquidationsProps) {
  // Health factor calculator state
  const [collateralValue, setCollateralValue] = useState(10000);
  const [debtValue, setDebtValue] = useState(7500);

  // Calculate health metrics for ALL tranches at once
  const allTrancheCalculations = useMemo(() => {
    return tranches.map((tranche) => {
      const lltv = tranche.lltv / 100;
      const currentLtv = debtValue / collateralValue;
      const healthFactor = lltv / currentLtv;
      const maxBorrow = collateralValue * lltv;
      const remainingBorrowCapacity = maxBorrow - debtValue;
      const liquidationPrice = (debtValue / lltv / collateralValue) * collateralValue;
      const priceDropToLiquidation = Math.max(0, ((1 - currentLtv / lltv) * 100));
      const leverage = 1 / (1 - lltv);

      return {
        lltv: tranche.lltv,
        currentLtv,
        healthFactor,
        maxBorrow,
        remainingBorrowCapacity,
        liquidationPrice,
        priceDropToLiquidation,
        leverage,
        isHealthy: healthFactor > 1,
        isWarning: healthFactor <= 1.2 && healthFactor > 1,
        isLiquidatable: healthFactor <= 1,
      };
    });
  }, [collateralValue, debtValue, tranches]);

  const getHealthColor = (healthFactor: number) => {
    if (healthFactor <= 1) return 'text-red-400';
    if (healthFactor <= 1.2) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getHealthBgColor = (healthFactor: number) => {
    if (healthFactor <= 1) return 'bg-red-900/20 border-red-700';
    if (healthFactor <= 1.2) return 'bg-amber-900/20 border-amber-700';
    return 'bg-emerald-900/20 border-emerald-700';
  };

  return (
    <div className="space-y-8">
      {/* What triggers liquidation - Simplified */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">What Triggers Liquidation?</h3>
        <p className="text-lotus-grey-300 mb-6">
          Liquidation occurs when your position's Loan-to-Value (LTV) ratio exceeds the tranche's LLTV threshold.
        </p>

        {/* Simple formula visualization */}
        <div className="bg-lotus-grey-900/50 rounded-xl p-6 border border-lotus-grey-700">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            {/* LTV Box */}
            <div className="text-center">
              <div className="px-8 py-4 bg-lotus-grey-700 rounded-xl border border-lotus-grey-600">
                <div className="text-sm text-lotus-grey-400 mb-2">Your LTV</div>
                <div className="text-3xl font-mono font-bold text-lotus-grey-100">
                  <span className="text-lotus-purple-400">Debt</span>
                  <span className="mx-2 text-lotus-grey-500">/</span>
                  <span className="text-blue-400">Collateral</span>
                </div>
              </div>
            </div>

            {/* Comparison */}
            <div className="text-4xl font-bold text-lotus-grey-500">&gt;</div>

            {/* LLTV Box */}
            <div className="text-center">
              <div className="px-8 py-4 bg-lotus-purple-900/30 rounded-xl border-2 border-lotus-purple-600">
                <div className="text-sm text-lotus-purple-400 mb-2">Tranche LLTV</div>
                <div className="text-3xl font-mono font-bold text-lotus-purple-300">75% - 95%</div>
              </div>
            </div>

            {/* Result */}
            <div className="text-4xl font-bold text-lotus-grey-500">=</div>

            {/* Liquidatable */}
            <div className="text-center">
              <div className="px-8 py-4 bg-red-900/30 rounded-xl border-2 border-red-600">
                <div className="text-sm text-red-400 mb-2">Result</div>
                <div className="text-2xl font-bold text-red-300">Liquidatable</div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-lotus-grey-400">
            This can happen when <span className="text-lotus-purple-300">collateral price drops</span> or <span className="text-lotus-purple-300">interest accrues on debt</span>
          </div>
        </div>
      </div>

      {/* Per-tranche thresholds - Visual Spectrum */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Per-Tranche Liquidation Thresholds</h3>
        <p className="text-lotus-grey-300 mb-6">
          Each tranche has a different LLTV threshold. Higher LLTV means more leverage but less buffer before liquidation.
        </p>

        {/* Visual Spectrum */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-emerald-400 font-medium">Lower Risk / Lower Leverage</span>
            <span className="text-red-400 font-medium">Higher Risk / Higher Leverage</span>
          </div>
          <div className="h-4 bg-gradient-to-r from-emerald-600 via-amber-500 to-red-600 rounded-full"></div>
          <div className="flex justify-between mt-1">
            {tranches.map((t) => (
              <div key={t.lltv} className="text-center">
                <div className="text-xs font-mono text-lotus-grey-300">{t.lltv}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tranche Details Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-lotus-grey-700">
                <th className="text-left py-3 px-4 text-lotus-grey-400 font-medium">Tranche</th>
                <th className="text-center py-3 px-4 text-lotus-grey-400 font-medium">LLTV</th>
                <th className="text-center py-3 px-4 text-lotus-grey-400 font-medium">Max Leverage</th>
                <th className="text-center py-3 px-4 text-lotus-grey-400 font-medium">Liquidation Buffer</th>
                <th className="text-center py-3 px-4 text-lotus-grey-400 font-medium">Risk Profile</th>
              </tr>
            </thead>
            <tbody>
              {tranches.map((tranche, index) => {
                const leverage = 1 / (1 - tranche.lltv / 100);
                const buffer = 100 - tranche.lltv;
                const isLowRisk = index < 2;
                const isMidRisk = index >= 2 && index < 4;
                const riskLabel = isLowRisk ? 'Lower' : isMidRisk ? 'Medium' : 'Higher';
                const riskColor = isLowRisk ? 'text-emerald-400' : isMidRisk ? 'text-amber-400' : 'text-red-400';
                const bgColor = isLowRisk ? 'bg-emerald-900/10' : isMidRisk ? 'bg-amber-900/10' : 'bg-red-900/10';

                return (
                  <tr key={tranche.lltv} className={`border-b border-lotus-grey-700/50 ${bgColor}`}>
                    <td className="py-3 px-4 font-medium text-lotus-grey-100">{tranche.lltv}% LLTV</td>
                    <td className="py-3 px-4 text-center font-mono text-lotus-purple-400">{tranche.lltv}%</td>
                    <td className="py-3 px-4 text-center font-mono text-lotus-grey-200">{leverage.toFixed(1)}x</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-lotus-grey-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isLowRisk ? 'bg-emerald-500' : isMidRisk ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${buffer * 4}%` }}
                          />
                        </div>
                        <span className="font-mono text-lotus-grey-300 text-xs">{buffer}%</span>
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-center font-medium ${riskColor}`}>{riskLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-lotus-grey-500 mt-4">
          Liquidation buffer = 100% - LLTV. This is the maximum collateral price drop you can sustain if borrowing at max LTV.
        </p>
      </div>

      {/* Health Factor Calculator - ALL TRANCHES */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Health Factor Calculator</h3>
        <p className="text-lotus-grey-300 mb-4">
          Enter your position to see health metrics across <span className="text-lotus-purple-400 font-medium">all tranches simultaneously</span>.
        </p>

        <TeachingPrompt>
          Try the preset scenarios below, then adjust the values to see how collateral drops affect different tranches.
        </TeachingPrompt>

        {/* Scenario Presets */}
        <div className="flex flex-wrap gap-3 my-4">
          <button
            onClick={() => { setCollateralValue(10000); setDebtValue(7000); }}
            className="px-4 py-2 bg-emerald-900/30 border border-emerald-700 rounded-lg text-emerald-300 hover:bg-emerald-900/50 transition-colors text-sm font-medium"
          >
            Safe Position
          </button>
          <button
            onClick={() => { setCollateralValue(10000); setDebtValue(8200); }}
            className="px-4 py-2 bg-amber-900/30 border border-amber-700 rounded-lg text-amber-300 hover:bg-amber-900/50 transition-colors text-sm font-medium"
          >
            At Risk
          </button>
          <button
            onClick={() => { setCollateralValue(10000); setDebtValue(9200); }}
            className="px-4 py-2 bg-red-900/30 border border-red-700 rounded-lg text-red-300 hover:bg-red-900/50 transition-colors text-sm font-medium"
          >
            Liquidatable
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-lotus-grey-300 mb-2">
              Collateral Value (USD)
            </label>
            <input
              type="number"
              value={collateralValue}
              onChange={(e) => setCollateralValue(Math.max(1, Number(e.target.value)))}
              className="w-full px-4 py-3 bg-lotus-grey-700 border border-lotus-grey-600 rounded-lg text-lotus-grey-100 font-mono text-lg focus:border-lotus-purple-500 focus:ring-1 focus:ring-lotus-purple-500"
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
              className="w-full px-4 py-3 bg-lotus-grey-700 border border-lotus-grey-600 rounded-lg text-lotus-grey-100 font-mono text-lg focus:border-lotus-purple-500 focus:ring-1 focus:ring-lotus-purple-500"
            />
          </div>
        </div>

        {/* Current LTV Display */}
        <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-lotus-grey-400">Your Current LTV</span>
            <span className="text-2xl font-mono font-bold text-lotus-purple-400">
              {((debtValue / collateralValue) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* All Tranches Health Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-lotus-grey-700">
                <th className="text-left py-3 px-3 text-lotus-grey-400 font-medium">Tranche</th>
                <th className="text-center py-3 px-3 text-lotus-grey-400 font-medium">LLTV</th>
                <th className="text-center py-3 px-3 text-lotus-grey-400 font-medium">Health Factor</th>
                <th className="text-center py-3 px-3 text-lotus-grey-400 font-medium">Status</th>
                <th className="text-center py-3 px-3 text-lotus-grey-400 font-medium">Price Drop to Liquidation</th>
                <th className="text-center py-3 px-3 text-lotus-grey-400 font-medium">Buffer to LLTV</th>
              </tr>
            </thead>
            <tbody>
              {allTrancheCalculations.map((calc) => {
                const bufferPercent = ((calc.healthFactor - 1) * 100).toFixed(1);
                const statusText = calc.isLiquidatable ? 'Liquidatable' : calc.isWarning ? 'At Risk' : 'Healthy';
                const statusColor = calc.isLiquidatable ? 'text-red-400 bg-red-900/30' : calc.isWarning ? 'text-amber-400 bg-amber-900/30' : 'text-emerald-400 bg-emerald-900/30';

                return (
                  <tr key={calc.lltv} className={`border-b border-lotus-grey-700/50 ${getHealthBgColor(calc.healthFactor)}`}>
                    <td className="py-3 px-3 font-medium text-lotus-grey-100">{calc.lltv}%</td>
                    <td className="py-3 px-3 text-center font-mono text-lotus-purple-400">{calc.lltv}%</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-lg font-mono font-bold ${getHealthColor(calc.healthFactor)}`}>
                        {calc.healthFactor.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
                        {statusText}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {calc.priceDropToLiquidation > 0 ? (
                        <span className={`font-mono ${calc.priceDropToLiquidation < 10 ? 'text-red-400' : calc.priceDropToLiquidation < 25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {calc.priceDropToLiquidation.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-red-400 font-mono">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-mono ${Number(bufferPercent) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {Number(bufferPercent) > 0 ? `+${bufferPercent}%` : `${bufferPercent}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-lotus-grey-500 mt-4">
          Health Factor = LLTV / Current LTV. Values &gt; 1 are healthy, &lt; 1 means liquidatable.
        </p>

        {/* Dynamic insights based on position health */}
        <div className="mt-4 space-y-3">
          <DynamicInsight
            show={allTrancheCalculations.some(c => c.isLiquidatable)}
            variant="warning"
          >
            <strong>Liquidation Risk:</strong> At this LTV, positions in the{' '}
            {allTrancheCalculations.filter(c => c.isLiquidatable).map(c => `${c.lltv}%`).join(', ')}{' '}
            tranche(s) would be liquidatable. Junior tranches liquidate first because they have higher LLTVs.
          </DynamicInsight>

          <DynamicInsight
            show={allTrancheCalculations.every(c => c.isHealthy && !c.isWarning)}
            variant="success"
          >
            <strong>Healthy Position:</strong> This position is safe across all tranches. Even in the most aggressive 95% LLTV tranche, you have a buffer before liquidation.
          </DynamicInsight>

          <DynamicInsight
            show={allTrancheCalculations.some(c => c.isWarning) && !allTrancheCalculations.some(c => c.isLiquidatable)}
            variant="info"
          >
            <strong>Approaching Risk Zone:</strong> Some tranches are showing health factors below 1.2. Consider reducing debt or adding collateral to increase your safety margin.
          </DynamicInsight>
        </div>
      </div>

      {/* How liquidation protects lenders */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">How Liquidation Protects Lenders</h3>
        <p className="text-lotus-grey-300 mb-6">
          Liquidation ensures lenders can recover their funds when borrower positions become risky.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-3 p-4 bg-lotus-grey-700/30 rounded-lg">
            <div className="w-10 h-10 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lotus-purple-400 font-bold">1</span>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-100 mb-1">Detection</h4>
              <p className="text-sm text-lotus-grey-400">
                Position flagged when LTV exceeds LLTV
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-lotus-grey-700/30 rounded-lg">
            <div className="w-10 h-10 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lotus-purple-400 font-bold">2</span>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-100 mb-1">Collateral Seized</h4>
              <p className="text-sm text-lotus-grey-400">
                Liquidators repay debt & receive collateral at discount
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-lotus-grey-700/30 rounded-lg">
            <div className="w-10 h-10 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lotus-purple-400 font-bold">3</span>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-100 mb-1">Debt Cleared</h4>
              <p className="text-sm text-lotus-grey-400">
                Borrower's debt removed from protocol
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-lotus-grey-700/30 rounded-lg">
            <div className="w-10 h-10 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lotus-purple-400 font-bold">4</span>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-100 mb-1">Bad Debt Absorbed</h4>
              <p className="text-sm text-lotus-grey-400">
                Any shortfall absorbed by tranches via cascade
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
          <h4 className="font-medium text-lotus-grey-200 mb-4">Common Causes</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
              <svg className="w-6 h-6 text-lotus-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              <h5 className="font-medium text-lotus-grey-100 mb-1">Rapid Price Drops</h5>
              <p className="text-sm text-lotus-grey-400">
                Price falls faster than liquidators can act
              </p>
            </div>

            <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
              <svg className="w-6 h-6 text-lotus-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h5 className="font-medium text-lotus-grey-100 mb-1">Oracle Delays</h5>
              <p className="text-sm text-lotus-grey-400">
                Price feeds lag behind actual market prices
              </p>
            </div>

            <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
              <svg className="w-6 h-6 text-lotus-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h5 className="font-medium text-lotus-grey-100 mb-1">Low Liquidator Incentive</h5>
              <p className="text-sm text-lotus-grey-400">
                Bonus doesn't cover gas and risk
              </p>
            </div>
          </div>
        </div>

        {/* Bad Debt Cascade - CORRECT DIRECTION */}
        <div className="bg-lotus-grey-700/50 rounded-lg p-5 border border-lotus-grey-600">
          <h4 className="font-medium text-lotus-grey-200 mb-4">How Bad Debt is Absorbed (Cascade)</h4>
          <p className="text-sm text-lotus-grey-400 mb-4">
            Bad debt cascades <span className="text-lotus-purple-300 font-medium">from senior to junior</span> (same direction as interest).
            At each tranche, bad debt is absorbed proportionally to supply utilization.
          </p>

          {/* Vertical cascade diagram */}
          <div className="bg-lotus-grey-900/50 rounded-lg p-5 border border-lotus-grey-700">
            <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
              {/* Bad debt event */}
              <div className="w-full bg-red-900/30 border-2 border-red-600 rounded-xl p-4 text-center">
                <div className="text-red-400 font-medium mb-1">Bad Debt Event</div>
                <div className="text-sm text-red-200/70">Occurs at any tranche</div>
              </div>

              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>

              <div className="w-full bg-emerald-900/30 border border-emerald-700 rounded-lg p-3 text-center">
                <div className="text-emerald-300 font-medium">75% LLTV (Senior)</div>
                <div className="text-xs text-emerald-200/70">Absorbs based on supply utilization</div>
              </div>

              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>

              <div className="w-full bg-amber-900/30 border border-amber-700 rounded-lg p-3 text-center">
                <div className="text-amber-300 font-medium">85% LLTV (Mid)</div>
                <div className="text-xs text-amber-200/70">Remaining cascades to junior</div>
              </div>

              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>

              <div className="w-full bg-red-900/30 border-2 border-red-600 rounded-xl p-4 text-center">
                <div className="text-red-300 font-medium">95% LLTV (Junior)</div>
                <div className="text-sm text-red-200/70">Absorbs 100% of remaining bad debt</div>
              </div>
            </div>
          </div>

          {/* Key insight */}
          <div className="mt-5 p-4 bg-lotus-purple-900/20 border border-lotus-purple-700/50 rounded-lg">
            <p className="text-sm text-lotus-purple-200">
              <span className="font-medium text-lotus-purple-300">Key insight:</span> Junior tranches bear more risk because they absorb whatever bad debt cascades to them from senior tranches.
              This is why they earn higher yields — risk and reward are aligned.
            </p>
          </div>
        </div>
      </div>

      {/* Bad Debt Simulator - Now part of Liquidations section */}
      {computedTranches && (
        <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
          <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Bad Debt Simulation</h3>
          <p className="text-lotus-grey-400 mb-6">
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
