import { useMemo } from 'react';
import { RateInput, UtilizationSlider } from './RateInput';
import { OutputTable } from './OutputTable';
import { PDRateChart } from './PDRateChart';
import { computeScenario2, generateScenario2ChartData } from '../math/scenario2';

interface Scenario2Props {
  targetBorrowRate90: number;
  baseRate: number;
  utilization: number;
  onTargetRateChange: (value: number) => void;
  onBaseRateChange: (value: number) => void;
  onUtilizationChange: (value: number) => void;
}

/**
 * Scenario 2: Volatility Reduction (kink IRM applied to spread only)
 */
export function Scenario2({
  targetBorrowRate90,
  baseRate,
  utilization,
  onTargetRateChange,
  onBaseRateChange,
  onUtilizationChange,
}: Scenario2Props) {
  const result = useMemo(
    () => computeScenario2({ targetBorrowRate90, baseRate, utilization }),
    [targetBorrowRate90, baseRate, utilization]
  );

  const chartData = useMemo(
    () => generateScenario2ChartData(targetBorrowRate90, baseRate),
    [targetBorrowRate90, baseRate]
  );

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;
  const formatDeviation = (value: number | null) => {
    if (value === null) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
        <p className="text-sm text-indigo-800">
          Here the utilization curve moves the <strong>spread</strong>, not the base rate. Because
          productive debt adds a base component to the total rate, changes in spread translate into
          smaller % swings in the total rate — less perceived volatility.
        </p>
      </div>

      {/* Edge case warning */}
      {result.spreadIsZero && (
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Spread at 90% (S90) is zero. All rates with PD equal the base rate.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Inputs</h3>
            <div className="space-y-4">
              <RateInput
                label="Target Borrow Rate at 90% (R90)"
                value={targetBorrowRate90}
                onChange={onTargetRateChange}
                description="Borrow rate at target utilization"
              />
              <RateInput
                label="Base Rate (Rb)"
                value={baseRate}
                onChange={onBaseRateChange}
                description="Yield from productive asset"
              />
              <UtilizationSlider value={utilization} onChange={onUtilizationChange} />
            </div>
          </div>

          {/* Kink curve constants */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Kink Curve Constants</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Target utilization:</span>
                <span className="ml-2 font-mono">90%</span>
              </div>
              <div>
                <span className="text-gray-500">At u=0:</span>
                <span className="ml-2 font-mono">0.25×</span>
              </div>
              <div>
                <span className="text-gray-500">At u=90%:</span>
                <span className="ml-2 font-mono">1×</span>
              </div>
              <div>
                <span className="text-gray-500">At u=100%:</span>
                <span className="ml-2 font-mono">4×</span>
              </div>
            </div>
          </div>

          {/* Derived values */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Spread</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">S90 (spread at 90%):</span>
                <span className="font-mono">{formatPercent(result.spread90)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">S(u) (current spread):</span>
                <span className="font-mono">{formatPercent(result.spreadAtU)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div>
          <PDRateChart
            data={chartData}
            currentUtilization={utilization}
            showBorrowRates={true}
            title="Rates vs Utilization"
          />
        </div>
      </div>

      {/* Output Table */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Comparison at u = {formatPercent(utilization)}</h3>
        <OutputTable
          rows={[
            {
              label: 'Borrow Rate',
              pdValue: formatPercent(result.borrowRatePD),
              noPdValue: formatPercent(result.borrowRateNoPD),
            },
            {
              label: 'Supply Rate',
              pdValue: formatPercent(result.supplyRatePD),
              noPdValue: formatPercent(result.supplyRateNoPD),
            },
          ]}
        />
      </div>

      {/* Deviation metrics */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Deviation from Target (90% utilization)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Borrow Rate Deviation</h4>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">With PD:</span>
              <span className={`font-mono text-sm ${Math.abs(result.borrowDeviationPD ?? 0) < Math.abs(result.borrowDeviationNoPD ?? 0) ? 'text-emerald-600' : 'text-gray-900'}`}>
                {formatDeviation(result.borrowDeviationPD)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-700">Without PD:</span>
              <span className="font-mono text-sm text-gray-900">
                {formatDeviation(result.borrowDeviationNoPD)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Supply Rate Deviation</h4>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">With PD:</span>
              <span className={`font-mono text-sm ${Math.abs(result.supplyDeviationPD ?? 0) < Math.abs(result.supplyDeviationNoPD ?? 0) ? 'text-emerald-600' : 'text-gray-900'}`}>
                {formatDeviation(result.supplyDeviationPD)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-700">Without PD:</span>
              <span className="font-mono text-sm text-gray-900">
                {formatDeviation(result.supplyDeviationNoPD)}
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Lower absolute deviation = more stable rates. Green indicates better stability with productive debt.
        </p>
      </div>

      {/* Formulas */}
      <details className="bg-gray-50 rounded-lg border border-gray-200">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-100">
          Show Formulas
        </summary>
        <div className="px-4 pb-4 text-sm text-gray-600 font-mono space-y-2">
          <p>S90 = max(R90 - Rb, 0) = {formatPercent(result.spread90)}</p>
          <p className="text-gray-500">
            {utilization <= 0.9
              ? `S(u) = S90 × (0.25 + 0.75 × (u / 0.9)) = ${formatPercent(result.spread90)} × ${(0.25 + 0.75 * (utilization / 0.9)).toFixed(3)}`
              : `S(u) = S90 × (1 + 30 × (u - 0.9)) = ${formatPercent(result.spread90)} × ${(1 + 30 * (utilization - 0.9)).toFixed(3)}`
            }
          </p>
          <p>S(u) = {formatPercent(result.spreadAtU)}</p>
          <hr className="my-2 border-gray-300" />
          <p>Borrow_PD = Rb + S(u) = {formatPercent(baseRate)} + {formatPercent(result.spreadAtU)} = {formatPercent(result.borrowRatePD)}</p>
          <p>Borrow_noPD = S(u) = {formatPercent(result.borrowRateNoPD)}</p>
          <p>Supply_PD = Rb + S(u) × u = {formatPercent(baseRate)} + {formatPercent(result.spreadAtU)} × {utilization.toFixed(2)} = {formatPercent(result.supplyRatePD)}</p>
          <p>Supply_noPD = S(u) × u = {formatPercent(result.spreadAtU)} × {utilization.toFixed(2)} = {formatPercent(result.supplyRateNoPD)}</p>
        </div>
      </details>
    </div>
  );
}
