import type { TrancheInput, TrancheData } from '../types';
import { formatNumber, formatPercent } from '../math/lotusAccounting';
import { FormulaTooltip, FORMULAS } from './FormulaTooltip';

interface TrancheTableProps {
  /** Computed tranche data */
  tranches: TrancheData[];
  /** Callback when a tranche input changes */
  onTrancheChange: (id: number, field: keyof TrancheInput, value: number) => void;
}

/**
 * Editable table showing tranche inputs and computed outputs.
 * Fixed 5 tranches with LLTVs: 75%, 80%, 85%, 90%, 95%
 */
export function TrancheTable({
  tranches,
  onTrancheChange,
}: TrancheTableProps) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {/* LLTV - sticky column */}
            <th className="sticky left-0 z-10 text-left py-2 px-3 font-semibold text-slate-700 bg-slate-100 border-r border-slate-200">
              LLTV
            </th>
            {/* Input columns */}
            <th className="text-right py-2 px-3 font-semibold text-slate-700 bg-slate-50">
              Supply
            </th>
            <th className="text-right py-2 px-3 font-semibold text-slate-700 bg-slate-50">
              Borrow
            </th>
            <th className="text-right py-2 px-3 font-semibold text-orange-700 bg-orange-50">
              Borrow Rate
            </th>
            {/* Computed columns */}
            <th className="text-right py-2 px-3 font-semibold text-blue-700 bg-blue-50">
              <FormulaTooltip {...FORMULAS.jrSupply}>Jr Supply</FormulaTooltip>
            </th>
            <th className="text-right py-2 px-3 font-semibold text-blue-700 bg-blue-50">
              <FormulaTooltip {...FORMULAS.jrBorrow}>Jr Borrow</FormulaTooltip>
            </th>
            <th className="text-right py-2 px-3 font-semibold text-blue-700 bg-blue-50">
              <FormulaTooltip {...FORMULAS.jrNetSupply}>Jr Net</FormulaTooltip>
            </th>
            <th className="text-right py-2 px-3 font-semibold text-emerald-700 bg-emerald-50">
              <FormulaTooltip {...FORMULAS.freeSupply}>Free Supply</FormulaTooltip>
            </th>
            <th className="text-right py-2 px-3 font-semibold text-emerald-700 bg-emerald-50">
              <FormulaTooltip {...FORMULAS.availableSupply}>Available</FormulaTooltip>
            </th>
            <th className="text-right py-2 px-3 font-semibold text-purple-700 bg-purple-50">
              <FormulaTooltip {...FORMULAS.supplyUtil}>Supply Util</FormulaTooltip>
            </th>
            <th className="text-right py-2 px-3 font-semibold text-purple-700 bg-purple-50">
              <FormulaTooltip {...FORMULAS.borrowUtil}>Borrow Util</FormulaTooltip>
            </th>
            <th className="text-right py-2 px-3 font-semibold text-teal-700 bg-teal-50">
              <FormulaTooltip {...FORMULAS.supplyRate}>Supply Rate</FormulaTooltip>
            </th>
          </tr>
        </thead>
        <tbody>
          {tranches.map((tranche) => (
            <tr
              key={tranche.id}
              className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              {/* LLTV label - sticky column */}
              <td className="sticky left-0 z-10 py-2 px-3 bg-slate-50 border-r border-slate-200">
                <span className="font-medium text-slate-700">{tranche.lltv}%</span>
              </td>

              {/* Supply input */}
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={tranche.supplyAssets}
                  onChange={(e) => onTrancheChange(tranche.id, 'supplyAssets', parseFloat(e.target.value) || 0)}
                  min={0}
                  step={100}
                  className="w-24 px-2 py-1 text-sm text-right border border-slate-200 rounded
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </td>

              {/* Borrow input */}
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={tranche.borrowAssets}
                  onChange={(e) => onTrancheChange(tranche.id, 'borrowAssets', parseFloat(e.target.value) || 0)}
                  min={0}
                  step={100}
                  className="w-24 px-2 py-1 text-sm text-right border border-slate-200 rounded
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </td>

              {/* Borrow Rate input */}
              <td className="py-2 px-3 bg-orange-50/30">
                <div className="flex items-center justify-end">
                  <input
                    type="number"
                    value={(tranche.borrowRate * 100).toFixed(1)}
                    onChange={(e) => onTrancheChange(tranche.id, 'borrowRate', (parseFloat(e.target.value) || 0) / 100)}
                    min={0}
                    max={100}
                    step={0.5}
                    className="w-16 px-2 py-1 text-sm text-right border border-orange-200 rounded
                      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <span className="ml-1 text-slate-500">%</span>
                </div>
              </td>

              {/* Computed: Jr Supply */}
              <td className="py-2 px-3 text-right font-mono text-blue-600 bg-blue-50/30">
                {formatNumber(tranche.jrSupply, 0)}
              </td>

              {/* Computed: Jr Borrow */}
              <td className="py-2 px-3 text-right font-mono text-blue-600 bg-blue-50/30">
                {formatNumber(tranche.jrBorrow, 0)}
              </td>

              {/* Computed: Jr Net Supply */}
              <td className="py-2 px-3 text-right font-mono text-blue-600 bg-blue-50/30">
                {formatNumber(tranche.jrNetSupply, 0)}
              </td>

              {/* Computed: Free Supply */}
              <td className="py-2 px-3 text-right font-mono text-emerald-600 bg-emerald-50/30">
                {formatNumber(tranche.freeSupply, 0)}
              </td>

              {/* Computed: Available Supply */}
              <td className="py-2 px-3 text-right font-mono text-emerald-600 bg-emerald-50/30">
                {formatNumber(tranche.availableSupply, 0)}
              </td>

              {/* Computed: Supply Utilization */}
              <td className="py-2 px-3 text-right bg-purple-50/30">
                <UtilizationBar value={tranche.supplyUtilization} color="purple" />
              </td>

              {/* Computed: Borrow Utilization */}
              <td className="py-2 px-3 text-right bg-purple-50/30">
                <UtilizationBar value={tranche.borrowUtilization} color="blue" />
              </td>

              {/* Computed: Supply Rate */}
              <td className="py-2 px-3 text-right font-mono text-teal-600 bg-teal-50/30">
                {formatPercent(tranche.supplyRate, 2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 px-3 py-2 bg-slate-50 rounded text-xs text-slate-500">
        <span className="font-medium">Lower LLTV = More Senior</span> |
        Higher LLTV = More Junior (higher risk, higher yield)
      </div>
    </div>
  );
}

/**
 * Small utilization bar visualization.
 */
function UtilizationBar({ value, color = 'purple' }: { value: number | null; color?: 'purple' | 'blue' }) {
  if (value === null) {
    return <span className="text-slate-400">-</span>;
  }

  const percent = value * 100;
  const getColor = (p: number) => {
    if (p >= 90) return 'bg-red-500';
    if (p >= 70) return 'bg-amber-500';
    return color === 'purple' ? 'bg-purple-500' : 'bg-blue-500';
  };

  const textColor = color === 'purple' ? 'text-purple-600' : 'text-blue-600';

  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(percent)} transition-all duration-200`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <span className={`font-mono ${textColor} text-xs w-12`}>
        {formatPercent(value)}
      </span>
    </div>
  );
}

export default TrancheTable;
