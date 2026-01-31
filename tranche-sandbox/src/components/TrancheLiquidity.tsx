import { useMemo } from 'react';
import type { TrancheData, TrancheInput } from '../types';
import { TrancheTable } from './TrancheTable';
import { CollapsibleSection } from './ConceptExplainer';
import { RoleDiagramCompact } from './RoleDiagram';

interface TrancheLiquidityProps {
  tranches: TrancheData[];
  productiveDebtRate: number;
  onTrancheChange: (id: number, field: keyof TrancheInput, value: number) => void;
}

export function TrancheLiquidity({
  tranches,
  productiveDebtRate,
  onTrancheChange,
}: TrancheLiquidityProps) {
  const maxJrSupply = useMemo(() => Math.max(...tranches.map(t => t.jrSupply)), [tranches]);
  const maxJrBorrow = useMemo(() => Math.max(...tranches.map(t => t.jrBorrow)), [tranches]);
  const maxJrNetSupply = useMemo(() => Math.max(...tranches.map(t => Math.abs(t.jrNetSupply))), [tranches]);

  return (
    <div className="space-y-6">
      <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50">
        <p className="text-sm text-lotus-purple-200">
          Tranches allow lenders to choose their risk/reward profile. Lower LLTV = more senior (safer),
          higher LLTV = more junior (higher yield). Liquidity flows between tranches, creating connected markets.
        </p>
      </div>

      {/* Role Cards */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">How Lenders & Borrowers Use Tranches</h3>
        <RoleDiagramCompact />
      </div>

      {/* Liquidity Cascade Explanation */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">The Liquidity Cascade</h3>
        <p className="text-lotus-grey-400 mb-4">
          Unlike isolated pools, Lotus tranches share liquidity through a cascade mechanism:
        </p>

        {/* Cascade Flow Diagram */}
        <div className="bg-lotus-grey-900/50 rounded-lg p-4 border border-lotus-grey-700 mb-4">
          <div className="space-y-4">
            {/* Supply flows UP */}
            <div className="flex items-center gap-3">
              <div className="w-24 text-right">
                <span className="text-sm text-emerald-400 font-medium">Supply</span>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="px-3 py-1 bg-red-900/30 border border-red-700 rounded text-red-400 text-xs">Junior 95%</div>
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="px-3 py-1 bg-orange-900/30 border border-orange-700 rounded text-orange-400 text-xs">Junior 90%</div>
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="px-3 py-1 bg-amber-900/30 border border-amber-700 rounded text-amber-400 text-xs">Mid 85%</div>
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="px-3 py-1 bg-emerald-900/30 border border-emerald-700 rounded text-emerald-400 text-xs">Senior</div>
              </div>
              <div className="w-24">
                <span className="text-xs text-emerald-500">cascades UP</span>
              </div>
            </div>

            {/* Interest flows DOWN */}
            <div className="flex items-center gap-3">
              <div className="w-24 text-right">
                <span className="text-sm text-blue-400 font-medium">Interest</span>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="px-3 py-1 bg-emerald-900/30 border border-emerald-700 rounded text-emerald-400 text-xs">Senior</div>
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="px-3 py-1 bg-amber-900/30 border border-amber-700 rounded text-amber-400 text-xs">Mid 85%</div>
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="px-3 py-1 bg-orange-900/30 border border-orange-700 rounded text-orange-400 text-xs">Junior 90%</div>
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="px-3 py-1 bg-red-900/30 border border-red-700 rounded text-red-400 text-xs">Junior 95%</div>
              </div>
              <div className="w-24">
                <span className="text-xs text-blue-500">flows DOWN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-700/50">
            <div className="text-xs text-emerald-400 font-medium mb-1">Unused Junior Supply</div>
            <p className="text-xs text-emerald-300">
              Automatically supports senior borrowers, maximizing capital efficiency.
            </p>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700/50">
            <div className="text-xs text-blue-400 font-medium mb-1">Interest Distribution</div>
            <p className="text-xs text-blue-300">
              Interest flows to all suppliers whose liquidity was used, proportionally.
            </p>
          </div>
          <div className="bg-lotus-purple-900/20 rounded-lg p-3 border border-lotus-purple-700/50">
            <div className="text-xs text-lotus-purple-400 font-medium mb-1">Junior Lender Benefit</div>
            <p className="text-xs text-lotus-purple-300">
              Junior lenders can earn from multiple tranches when their liquidity cascades up.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700 overflow-x-auto">
        <TrancheTable
          tranches={tranches}
          productiveDebtRate={productiveDebtRate}
          onTrancheChange={onTrancheChange}
        />
      </div>

      <CollapsibleSection
        title="Understanding Junior Metrics"
        icon="📊"
        description="How supply and borrow cascade across tranches"
      >
        <div className="space-y-4">
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-grey-100 mb-2">Junior Supply</h4>
            <p className="text-sm text-lotus-grey-400 mb-3">
              Junior Supply at tranche i = Sum of all supply from this tranche and more junior tranches.
            </p>
            <div className="space-y-2">
              {tranches.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <span className="text-xs text-lotus-grey-500 w-12">{t.lltv}%</span>
                  <div className="flex-1 h-4 bg-lotus-grey-700 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${maxJrSupply > 0 ? (t.jrSupply / maxJrSupply) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-lotus-grey-300 w-16 text-right">
                    {t.jrSupply.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-grey-100 mb-2">Junior Borrow</h4>
            <p className="text-sm text-lotus-grey-400 mb-3">
              Junior Borrow at tranche i = Sum of all borrows at or above this risk level.
            </p>
            <div className="space-y-2">
              {tranches.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <span className="text-xs text-lotus-grey-500 w-12">{t.lltv}%</span>
                  <div className="flex-1 h-4 bg-lotus-grey-700 rounded overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${maxJrBorrow > 0 ? (t.jrBorrow / maxJrBorrow) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-lotus-grey-300 w-16 text-right">
                    {t.jrBorrow.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-grey-100 mb-2">Junior Net Supply</h4>
            <p className="text-sm text-lotus-grey-400 mb-3">
              Jr Net = Jr Supply - Jr Borrow. This shows the "excess" supply available at each level.
            </p>
            <div className="space-y-2">
              {tranches.map((t) => {
                const isPositive = t.jrNetSupply >= 0;
                return (
                  <div key={t.id} className="flex items-center gap-2">
                    <span className="text-xs text-lotus-grey-500 w-12">{t.lltv}%</span>
                    <div className="flex-1 h-4 bg-lotus-grey-700 rounded overflow-hidden relative">
                      <div
                        className={`h-full transition-all ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${maxJrNetSupply > 0 ? (Math.abs(t.jrNetSupply) / maxJrNetSupply) * 100 : 0}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono w-16 text-right ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.jrNetSupply.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Utilization Metrics"
        icon="📈"
        description="How supply and borrow utilization are calculated"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-purple-300 mb-2">Supply Utilization</h4>
            <div className="bg-lotus-grey-900 rounded-lg px-3 py-2 mb-2">
              <code className="text-xs font-mono text-lotus-grey-300">
                SupplyUtil = JrBorrow / JrSupply
              </code>
            </div>
            <p className="text-sm text-lotus-grey-400">
              How much of the available junior supply is being borrowed.
              Higher = more of the supply is earning interest.
            </p>
          </div>

          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-purple-300 mb-2">Borrow Utilization</h4>
            <div className="bg-lotus-grey-900 rounded-lg px-3 py-2 mb-2">
              <code className="text-xs font-mono text-lotus-grey-300">
                BorrowUtil = OwnBorrow / JrBorrow
              </code>
            </div>
            <p className="text-sm text-lotus-grey-400">
              This tranche's share of the total borrows.
              Used to calculate what portion of interest stays at this level.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg">
          <p className="text-sm text-amber-300">
            <span className="font-medium">Key insight:</span> Supply utilization determines how much
            interest stays at this tranche vs cascading to more junior tranches.
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
}

export default TrancheLiquidity;
