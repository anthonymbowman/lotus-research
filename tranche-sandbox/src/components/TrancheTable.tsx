import { useState, useRef } from 'react';
import type { TrancheInput, TrancheData } from '../types';
import { formatNumber, formatPercent } from '../math/lotusAccounting';
import { FormulaTooltip, FORMULAS } from './FormulaTooltip';
import { TermDefinition } from './TermDefinition';
import { ConstraintTooltip } from './ConstraintTooltip';
import { TrancheConstraintInspector } from './TrancheConstraintInspector';
import { DefinitionBadge } from './DefinitionBadge';
import { ExportButton } from './ExportButton';

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
  const [inspectedTranche, setInspectedTranche] = useState<number | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      {/* Exportable Section */}
      <div ref={exportRef} className="export-section bg-lotus-grey-800 rounded-lg p-4 relative">
        <ExportButton targetRef={exportRef} filename="liquidity-flow-table" />

        {/* Title for standalone export */}
        <h4 className="text-lg font-semibold text-lotus-grey-100 mb-4 text-center pr-10">
          Liquidity Flow by Tranche
        </h4>

      <div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-lotus-grey-700">
              <th className="text-left py-1 px-1 font-semibold text-lotus-grey-300 bg-lotus-grey-800 border-r border-lotus-grey-700 sticky left-0 z-10">
                <TermDefinition term="lltv">LLTV</TermDefinition>
              </th>
              <th className="text-right py-1 px-1 font-semibold text-lotus-grey-300 bg-lotus-grey-800">
                Supply
              </th>
              <th className="text-right py-1 px-1 font-semibold text-lotus-grey-300 bg-lotus-grey-800">
                Borrow
              </th>
              <th className="text-right py-1 px-1 font-semibold text-lotus-purple-300 bg-lotus-purple-900/30">
                <DefinitionBadge
                  label="Credit Spread"
                  formula="Determined by IRM"
                  note="Set by the Interest Rate Model based on borrow utilization. Rates increase monotonically with risk (junior tranches always have higher rates)."
                  textColor="text-lotus-purple-300"
                />
              </th>
              <th className="text-right py-1 px-1 font-semibold text-orange-300 bg-orange-900/30">
                Borrow Rate
              </th>
              <th className="text-right py-1 px-1 font-semibold text-blue-300 bg-blue-900/30">
                <FormulaTooltip {...FORMULAS.jrSupply}>Jr Supply</FormulaTooltip>
              </th>
              <th className="text-right py-1 px-1 font-semibold text-blue-300 bg-blue-900/30">
                <FormulaTooltip {...FORMULAS.jrBorrow}>Jr Borrow</FormulaTooltip>
              </th>
              <th className="text-right py-1 px-1 font-semibold text-blue-300 bg-blue-900/30">
                <FormulaTooltip {...FORMULAS.jrNetSupply}>Jr Net</FormulaTooltip>
              </th>
              <th className="text-right py-1 px-1 font-semibold text-emerald-300 bg-emerald-900/30">
                <FormulaTooltip {...FORMULAS.freeSupply}>Free Supply</FormulaTooltip>
              </th>
              <th className="text-right py-1 px-1 font-semibold text-emerald-300 bg-emerald-900/30">
                <FormulaTooltip {...FORMULAS.availableSupply}>Available</FormulaTooltip>
              </th>
              <th className="text-right py-1 px-1 font-semibold text-lotus-purple-300 bg-lotus-purple-900/30">
                <DefinitionBadge
                  label="Supply Util"
                  formula="Supply / Available Supply"
                  note="Determines how much interest stays at this tranche vs cascading to junior tranches"
                  textColor="text-lotus-purple-300"
                />
              </th>
              <th className="text-right py-1 px-1 font-semibold text-lotus-purple-300 bg-lotus-purple-900/30">
                <DefinitionBadge
                  label="Borrow Util"
                  formula="1 - (Free Supply / Jr Supply)"
                  note="This drives IRM rates. Higher utilization = higher borrow rates."
                  textColor="text-lotus-purple-300"
                />
              </th>
              <th className="text-right py-1 px-1 font-semibold text-teal-300 bg-teal-900/30">
                <FormulaTooltip {...FORMULAS.supplyRate}>Supply Rate</FormulaTooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {tranches.map((tranche, index) => {
              const hasCascadingSupply = tranche.borrowAssets > tranche.supplyAssets;
              const isBindingConstraint = tranche.isBindingConstraint;
              // Illegal: at most junior tranche, borrow cannot exceed supply (no junior liquidity to draw from)
              // At other tranches: if Jr Net Supply is 0, the system is at capacity
              const isMostJunior = index === tranches.length - 1;
              const isOverBorrowed = isMostJunior && tranche.borrowAssets > tranche.supplyAssets;

              return (
                <tr
                  key={tranche.id}
                  className={`border-b transition-colors cursor-pointer ${
                    isOverBorrowed
                      ? 'border-red-600/50 bg-red-900/20 hover:bg-red-900/30'
                      : isBindingConstraint
                      ? 'border-amber-600/50 bg-amber-900/10 hover:bg-amber-900/20'
                      : 'border-lotus-grey-700/50 hover:bg-lotus-grey-700/30'
                  }`}
                  onClick={() => setInspectedTranche(index)}
                >
                  <td className={`py-1 px-1 border-r border-lotus-grey-700 sticky left-0 z-10 ${
                    isOverBorrowed ? 'bg-red-900/30' : isBindingConstraint ? 'bg-amber-900/20' : 'bg-lotus-grey-800'
                  }`}>
                    <span className={`font-medium ${isOverBorrowed ? 'text-red-300' : 'text-lotus-grey-200'}`}>{tranche.lltv}%</span>
                    {isOverBorrowed && <span className="ml-1 text-red-400 text-xs">!</span>}
                  </td>

                  <td className="py-1 px-1 text-right" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      value={tranche.supplyAssets}
                      onChange={(e) => onTrancheChange(tranche.id, 'supplyAssets', parseFloat(e.target.value) || 0)}
                      min={0}
                      step={100}
                      className={`w-20 px-2 py-1 text-sm text-right bg-lotus-grey-700 border rounded font-mono text-lotus-grey-100
                        focus:outline-none focus:ring-1 focus:ring-lotus-purple-500 focus:border-lotus-purple-500 ${
                        isOverBorrowed ? 'border-red-500' : 'border-lotus-grey-600'
                      }`}
                    />
                  </td>

                  <td className="py-1 px-1" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {isOverBorrowed ? (
                        <ConstraintTooltip
                          title="Illegal: Borrow Exceeds Available"
                          why="This borrow amount exceeds the available liquidity. In the real protocol, this state would not be possible."
                          scope="tranche"
                          trancheIndex={index}
                        >
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        </ConstraintTooltip>
                      ) : hasCascadingSupply && (
                        <ConstraintTooltip
                          title="Borrow Exceeds Direct Supply"
                          why="This is normal! This tranche borrows more than its direct supply by drawing from junior tranche liquidity. The actual limit is Free Supply (which includes junior liquidity), not direct supply."
                          primitive="cascadingSupply"
                          scope="tranche"
                          trancheIndex={index}
                        >
                          <span className="w-2 h-2 rounded-full bg-blue-400" title="B > S" />
                        </ConstraintTooltip>
                      )}
                      <input
                        type="number"
                        value={tranche.borrowAssets}
                        onChange={(e) => onTrancheChange(tranche.id, 'borrowAssets', parseFloat(e.target.value) || 0)}
                        min={0}
                        step={100}
                        className={`w-20 px-2 py-1 text-sm text-right bg-lotus-grey-700 border rounded font-mono
                          focus:outline-none focus:ring-1 focus:ring-lotus-purple-500 focus:border-lotus-purple-500 ${
                          isOverBorrowed ? 'border-red-500 text-red-300' : 'border-lotus-grey-600 text-lotus-grey-100'
                        }`}
                      />
                    </div>
                  </td>

                  <td className="py-1 px-1 bg-lotus-purple-900/20" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end">
                      <input
                        type="number"
                        value={Math.round(tranche.borrowRate * 1000) / 10}
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

                  <td className="py-1 px-1 text-right font-mono text-orange-400 bg-orange-900/20">
                    {formatPercent(productiveDebtRate + tranche.borrowRate, 2)}
                  </td>

                  <td className="py-1 px-1 text-right font-mono text-blue-400 bg-blue-900/20">
                    {formatNumber(tranche.jrSupply, 0)}
                  </td>

                  <td className="py-1 px-1 text-right font-mono text-blue-400 bg-blue-900/20">
                    {formatNumber(tranche.jrBorrow, 0)}
                  </td>

                  <td className={`py-1 px-1 text-right font-mono bg-blue-900/20 ${
                    isBindingConstraint ? 'text-amber-400 font-semibold' : 'text-blue-400'
                  }`}>
                    {formatNumber(tranche.jrNetSupply, 0)}
                  </td>

                  <td className="py-1 px-1 text-right font-mono text-emerald-400 bg-emerald-900/20">
                    {formatNumber(tranche.freeSupply, 0)}
                  </td>

                  <td className="py-1 px-1 text-right font-mono text-emerald-400 bg-emerald-900/20">
                    {formatNumber(tranche.availableSupply, 0)}
                  </td>

                  <td className="py-2 px-1 text-right font-mono text-lotus-purple-400 bg-lotus-purple-900/20">
                    {tranche.supplyUtilization !== null ? formatPercent(tranche.supplyUtilization, 0) : '-'}
                  </td>

                  <td className="py-2 px-1 text-right font-mono text-lotus-purple-400 bg-lotus-purple-900/20">
                    {tranche.borrowUtilization !== null ? formatPercent(tranche.borrowUtilization, 0) : '-'}
                  </td>

                  <td className="py-1 px-1 text-right font-mono text-teal-400 bg-teal-900/20">
                    {tranche.supplyRate !== null
                      ? formatPercent(productiveDebtRate + tranche.supplyRate, 2)
                      : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

        {/* Productive Debt Rate at bottom */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <span className="text-emerald-400">Productive Debt Rate (from LotusUSD):</span>
          <span className="font-mono font-semibold text-emerald-300">
            {formatPercent(productiveDebtRate, 2)}
          </span>
        </div>
      </div>{/* End exportable section */}

      {/* Constraint Inspector Modal */}
      {inspectedTranche !== null && (
        <TrancheConstraintInspector
          tranche={tranches[inspectedTranche]}
          allTranches={tranches}
          trancheIndex={inspectedTranche}
          onClose={() => setInspectedTranche(null)}
        />
      )}
    </div>
  );
}

export default TrancheTable;
