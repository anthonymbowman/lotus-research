import type { TrancheInput, TrancheData } from '../types';
import { formatNumber, formatPercent } from '../math/lotusAccounting';
import { FormulaTooltip, FORMULAS } from './FormulaTooltip';
import { TermDefinition } from './TermDefinition';

interface TrancheTableProps {
  tranches: TrancheData[];
  onTrancheChange: (id: number, field: keyof TrancheInput, value: number) => void;
  productiveDebtRate: number;
}

export function TrancheTable({
  tranches,
  onTrancheChange,
  productiveDebtRate,
}: TrancheTableProps) {
  return (
    <div>
      <div className="mb-4 p-3 bg-emerald-900/30 rounded-lg border border-emerald-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-300">
            Productive Debt Rate (from LotusUSD)
          </span>
          <span className="text-lg font-mono font-semibold text-emerald-400">
            {formatPercent(productiveDebtRate, 2)}
          </span>
        </div>
        <p className="text-xs text-emerald-500 mt-1">
          This base rate is added to the spread to get the total borrow rate.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-lotus-grey-700">
              <th className="text-left py-2 px-2 font-semibold text-lotus-grey-300 bg-lotus-grey-800 border-r border-lotus-grey-700 sticky left-0 z-10">
                <TermDefinition term="lltv">LLTV</TermDefinition>
              </th>
              <th className="text-right py-2 px-2 font-semibold text-lotus-grey-300 bg-lotus-grey-800">
                Supply
              </th>
              <th className="text-right py-2 px-2 font-semibold text-lotus-grey-300 bg-lotus-grey-800">
                Borrow
              </th>
              <th className="text-right py-2 px-2 font-semibold text-lotus-purple-300 bg-lotus-purple-900/30">
                Credit Spread
              </th>
              <th className="text-right py-2 px-2 font-semibold text-orange-300 bg-orange-900/30">
                Borrow Rate
              </th>
              <th className="text-right py-2 px-2 font-semibold text-blue-300 bg-blue-900/30">
                <FormulaTooltip {...FORMULAS.jrSupply}>Jr Supply</FormulaTooltip>
              </th>
              <th className="text-right py-2 px-2 font-semibold text-blue-300 bg-blue-900/30">
                <FormulaTooltip {...FORMULAS.jrBorrow}>Jr Borrow</FormulaTooltip>
              </th>
              <th className="text-right py-2 px-2 font-semibold text-blue-300 bg-blue-900/30">
                <FormulaTooltip {...FORMULAS.jrNetSupply}>Jr Net</FormulaTooltip>
              </th>
              <th className="text-right py-2 px-2 font-semibold text-emerald-300 bg-emerald-900/30">
                <FormulaTooltip {...FORMULAS.freeSupply}>Free Supply</FormulaTooltip>
              </th>
              <th className="text-right py-2 px-2 font-semibold text-emerald-300 bg-emerald-900/30">
                <FormulaTooltip {...FORMULAS.availableSupply}>Available</FormulaTooltip>
              </th>
              <th className="text-right py-2 px-2 font-semibold text-lotus-purple-300 bg-lotus-purple-900/30">
                <FormulaTooltip {...FORMULAS.supplyUtil}>Supply Util</FormulaTooltip>
              </th>
              <th className="text-right py-2 px-2 font-semibold text-lotus-purple-300 bg-lotus-purple-900/30">
                <FormulaTooltip {...FORMULAS.borrowUtil}>Borrow Util</FormulaTooltip>
              </th>
              <th className="text-right py-2 px-2 font-semibold text-teal-300 bg-teal-900/30">
                <FormulaTooltip {...FORMULAS.supplyRate}>Supply Rate</FormulaTooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {tranches.map((tranche) => (
              <tr
                key={tranche.id}
                className="border-b border-lotus-grey-700/50 hover:bg-lotus-grey-700/30 transition-colors"
              >
                <td className="py-2 px-2 bg-lotus-grey-800 border-r border-lotus-grey-700 sticky left-0 z-10">
                  <span className="font-medium text-lotus-grey-200">{tranche.lltv}%</span>
                </td>

                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={tranche.supplyAssets}
                    onChange={(e) => onTrancheChange(tranche.id, 'supplyAssets', parseFloat(e.target.value) || 0)}
                    min={0}
                    step={100}
                    className="w-20 px-2 py-1 text-sm text-right bg-lotus-grey-700 border border-lotus-grey-600 rounded font-mono text-lotus-grey-100
                      focus:outline-none focus:ring-1 focus:ring-lotus-purple-500 focus:border-lotus-purple-500"
                  />
                </td>

                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={tranche.borrowAssets}
                    onChange={(e) => onTrancheChange(tranche.id, 'borrowAssets', parseFloat(e.target.value) || 0)}
                    min={0}
                    step={100}
                    className="w-20 px-2 py-1 text-sm text-right bg-lotus-grey-700 border border-lotus-grey-600 rounded font-mono text-lotus-grey-100
                      focus:outline-none focus:ring-1 focus:ring-lotus-purple-500 focus:border-lotus-purple-500"
                  />
                </td>

                <td className="py-2 px-2 bg-lotus-purple-900/20">
                  <div className="flex items-center justify-end">
                    <input
                      type="number"
                      value={(tranche.borrowRate * 100).toFixed(1)}
                      onChange={(e) => onTrancheChange(tranche.id, 'borrowRate', (parseFloat(e.target.value) || 0) / 100)}
                      min={0}
                      max={100}
                      step={0.5}
                      className="w-16 px-2 py-1 text-sm text-right bg-lotus-grey-700 border border-lotus-purple-600 rounded font-mono text-lotus-purple-200
                        focus:outline-none focus:ring-1 focus:ring-lotus-purple-500 focus:border-lotus-purple-500"
                    />
                    <span className="ml-1 text-lotus-grey-300">%</span>
                  </div>
                </td>

                <td className="py-2 px-2 text-right font-mono text-orange-400 bg-orange-900/20">
                  {formatPercent(productiveDebtRate + tranche.borrowRate, 2)}
                </td>

                <td className="py-2 px-2 text-right font-mono text-blue-400 bg-blue-900/20">
                  {formatNumber(tranche.jrSupply, 0)}
                </td>

                <td className="py-2 px-2 text-right font-mono text-blue-400 bg-blue-900/20">
                  {formatNumber(tranche.jrBorrow, 0)}
                </td>

                <td className="py-2 px-2 text-right font-mono text-blue-400 bg-blue-900/20">
                  {formatNumber(tranche.jrNetSupply, 0)}
                </td>

                <td className="py-2 px-2 text-right font-mono text-emerald-400 bg-emerald-900/20">
                  {formatNumber(tranche.freeSupply, 0)}
                </td>

                <td className="py-2 px-2 text-right font-mono text-emerald-400 bg-emerald-900/20">
                  {formatNumber(tranche.availableSupply, 0)}
                </td>

                <td className="py-2 px-2 text-right bg-lotus-purple-900/20">
                  <UtilizationBar value={tranche.supplyUtilization} color="purple" />
                </td>

                <td className="py-2 px-2 text-right bg-lotus-purple-900/20">
                  <UtilizationBar value={tranche.borrowUtilization} color="blue" />
                </td>

                <td className="py-2 px-2 text-right font-mono text-teal-400 bg-teal-900/20">
                  {tranche.supplyRate !== null
                    ? formatPercent(productiveDebtRate + tranche.supplyRate, 2)
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 px-3 py-2 bg-lotus-grey-800 rounded text-xs text-lotus-grey-300">
        <span className="font-medium">Lower LLTV = More Senior</span> |
        Higher LLTV = More Junior (higher risk, higher yield)
      </div>
    </div>
  );
}

function UtilizationBar({ value, color = 'purple' }: { value: number | null; color?: 'purple' | 'blue' }) {
  if (value === null) {
    return <span className="text-lotus-grey-600">-</span>;
  }

  const percent = value * 100;
  const getColor = (p: number) => {
    if (p >= 90) return 'bg-red-500';
    if (p >= 70) return 'bg-amber-500';
    return color === 'purple' ? 'bg-lotus-purple-500' : 'bg-blue-500';
  };

  const textColor = color === 'purple' ? 'text-lotus-purple-400' : 'text-blue-400';

  return (
    <div className="flex items-center gap-1">
      <div className="w-8 h-1.5 bg-lotus-grey-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(percent)} transition-all duration-200`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <span className={`font-mono ${textColor}`}>
        {formatPercent(value, 0)}
      </span>
    </div>
  );
}

export default TrancheTable;
