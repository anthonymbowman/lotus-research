import { useMemo } from 'react';
import { RateInput, UtilizationSlider } from './RateInput';
import { OutputTable, SingleValueRow } from './OutputTable';
import { PDRateChart } from './PDRateChart';
import { computeScenario1, generateScenario1ChartData } from '../math/scenario1';

interface Scenario1Props {
  borrowRate: number;
  baseRate: number;
  utilization: number;
  onBorrowRateChange: (value: number) => void;
  onBaseRateChange: (value: number) => void;
  onUtilizationChange: (value: number) => void;
}

/**
 * Scenario 1: Spread Compression (hold borrow rate constant)
 */
export function Scenario1({
  borrowRate,
  baseRate,
  utilization,
  onBorrowRateChange,
  onBaseRateChange,
  onUtilizationChange,
}: Scenario1Props) {
  const result = useMemo(
    () => computeScenario1({ borrowRate, baseRate, utilization }),
    [borrowRate, baseRate, utilization]
  );

  const chartData = useMemo(
    () => generateScenario1ChartData(borrowRate, baseRate),
    [borrowRate, baseRate]
  );

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
        <p className="text-sm text-indigo-800">
          Borrowers pay a fixed borrow rate. Productive debt lets idle liquidity earn the base rate,
          so lenders don't rely entirely on utilization to earn yield. This compresses the wedge
          between borrower and lender rates.
        </p>
      </div>

      {/* Warning for edge case */}
      {result.baseExceedsBorrow && (
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Base rate exceeds borrow rate — spread is clamped to 0.
            Supply rate with PD equals the base rate.
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
                label="Borrow Rate (R)"
                value={borrowRate}
                onChange={onBorrowRateChange}
                description="Total borrow rate paid by borrowers"
              />
              <RateInput
                label="Base Rate (Rb)"
                value={baseRate}
                onChange={onBaseRateChange}
                description="Yield from productive asset (e.g., LotusUSD strategy)"
              />
              <UtilizationSlider value={utilization} onChange={onUtilizationChange} />
            </div>
          </div>

          {/* Derived values */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Derived Values</h3>
            <SingleValueRow
              label="Spread (S)"
              value={formatPercent(result.spread)}
              description="max(R - Rb, 0)"
            />
          </div>
        </div>

        {/* Chart */}
        <div>
          <PDRateChart
            data={chartData}
            currentUtilization={utilization}
            showBorrowRates={false}
            title="Supply Rates vs Utilization"
          />
        </div>
      </div>

      {/* Output Table */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Comparison</h3>
        <OutputTable
          rows={[
            {
              label: 'Borrow Rate',
              pdValue: formatPercent(result.borrowRate),
              noPdValue: formatPercent(result.borrowRate),
            },
            {
              label: 'Supply Rate',
              pdValue: formatPercent(result.supplyRatePD),
              noPdValue: formatPercent(result.supplyRateNoPD),
              highlight: true,
            },
            {
              label: 'Wedge (Borrow - Supply)',
              pdValue: formatPercent(result.wedgePD),
              noPdValue: formatPercent(result.wedgeNoPD),
            },
          ]}
        />

        <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-emerald-800">Wedge Reduction (Benefit)</span>
            <span className="text-lg font-mono font-semibold text-emerald-700">
              {formatPercent(result.wedgeReduction)}
            </span>
          </div>
          <p className="text-xs text-emerald-600 mt-1">
            = Rb × (1 - u) = {formatPercent(baseRate)} × {(1 - utilization).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Formulas */}
      <details className="bg-gray-50 rounded-lg border border-gray-200">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-100">
          Show Formulas
        </summary>
        <div className="px-4 pb-4 text-sm text-gray-600 font-mono space-y-2">
          <p>S = max(R - Rb, 0) = max({formatPercent(borrowRate)} - {formatPercent(baseRate)}, 0) = {formatPercent(result.spread)}</p>
          <p>Supply_PD = Rb + S × u = {formatPercent(baseRate)} + {formatPercent(result.spread)} × {utilization.toFixed(2)} = {formatPercent(result.supplyRatePD)}</p>
          <p>Supply_noPD = R × u = {formatPercent(borrowRate)} × {utilization.toFixed(2)} = {formatPercent(result.supplyRateNoPD)}</p>
          <p>Wedge_PD = R - Supply_PD = {formatPercent(borrowRate)} - {formatPercent(result.supplyRatePD)} = {formatPercent(result.wedgePD)}</p>
          <p>Wedge_noPD = R - Supply_noPD = {formatPercent(borrowRate)} - {formatPercent(result.supplyRateNoPD)} = {formatPercent(result.wedgeNoPD)}</p>
        </div>
      </details>
    </div>
  );
}
