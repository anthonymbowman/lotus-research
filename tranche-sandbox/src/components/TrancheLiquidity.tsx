import { useMemo } from 'react';
import type { TrancheData, TrancheInput } from '../types';
import { TrancheTable } from './TrancheTable';
import { CollapsibleSection } from './ConceptExplainer';
import { RoleDiagramCompact } from './RoleDiagram';
import { ConceptPrimer } from './ConceptPrimer';
import { TermDefinition } from './TermDefinition';
import { DynamicInsight } from './DynamicInsight';

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
      {/* Key Concepts Primer */}
      <ConceptPrimer concepts={['lltv', 'tranche-seniority', 'cascade', 'supply-utilization']} />

      <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50">
        <p className="text-sm text-lotus-purple-200">
          Tranches allow lenders to choose their risk/reward profile. Lower <TermDefinition term="lltv">LLTV</TermDefinition> = more <TermDefinition term="tranche-seniority">senior</TermDefinition> (safer),
          higher LLTV = more junior (higher yield). Liquidity flows between tranches, creating <TermDefinition term="connected-liquidity">connected markets</TermDefinition>.
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
        <p className="text-lotus-grey-300 mb-6">
          Unlike isolated pools, Lotus tranches share liquidity through a cascade mechanism. Liquidity cascades from junior to senior tranches, while interest flows from senior to junior.
        </p>

        {/* Vertical Cascade Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Supply Cascade (junior to senior) */}
          <div className="bg-emerald-900/10 rounded-xl p-5 border border-emerald-700/50">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <h4 className="font-semibold text-emerald-300">Liquidity Flows (Junior to Senior)</h4>
            </div>

            <div className="space-y-3">
              {/* Senior - receives supply from below */}
              <div className="bg-emerald-900/30 rounded-lg p-4 border-2 border-emerald-600">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-semibold text-emerald-300">75% LLTV</span>
                    <span className="ml-2 text-xs text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded">Most Senior</span>
                  </div>
                </div>
                <p className="text-sm text-emerald-200/70 mt-1">Can borrow from all tranches below</p>
              </div>

              <div className="flex justify-center">
                <svg className="w-6 h-6 text-emerald-500 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              <div className="bg-amber-900/30 rounded-lg p-3 border border-amber-700">
                <div className="text-amber-300 font-medium">85% LLTV</div>
                <p className="text-xs text-amber-200/70">Unused supply cascades to senior</p>
              </div>

              <div className="flex justify-center">
                <svg className="w-6 h-6 text-emerald-500 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              <div className="bg-red-900/30 rounded-lg p-3 border border-red-700">
                <div className="flex items-center justify-between">
                  <span className="text-red-300 font-medium">95% LLTV</span>
                  <span className="text-xs text-red-400 bg-red-900/50 px-2 py-0.5 rounded">Most Junior</span>
                </div>
                <p className="text-xs text-red-200/70">Supplies liquidity first</p>
              </div>
            </div>
          </div>

          {/* Interest Cascade (senior to junior) */}
          <div className="bg-blue-900/10 rounded-xl p-5 border border-blue-700/50">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <h4 className="font-semibold text-blue-300">Interest Flows (Senior to Junior)</h4>
            </div>

            <div className="space-y-3">
              <div className="bg-emerald-900/30 rounded-lg p-3 border border-emerald-700">
                <div className="text-emerald-300 font-medium">75% LLTV</div>
                <p className="text-xs text-emerald-200/70">Keeps portion based on supply utilization</p>
              </div>

              <div className="flex justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              <div className="bg-amber-900/30 rounded-lg p-3 border border-amber-700">
                <div className="text-amber-300 font-medium">85% LLTV</div>
                <p className="text-xs text-amber-200/70">Excess interest cascades to junior</p>
              </div>

              <div className="flex justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              <div className="bg-red-900/30 rounded-lg p-4 border-2 border-red-600">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-red-300">95% LLTV</span>
                </div>
                <p className="text-sm text-red-200/70 mt-1">Receives 100% of remaining interest</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="font-medium text-emerald-300">Capital Efficiency</span>
            </div>
            <p className="text-sm text-emerald-200/80">
              Unused junior supply automatically supports senior borrowers, maximizing utilization.
            </p>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-blue-300">Fair Distribution</span>
            </div>
            <p className="text-sm text-blue-200/80">
              Interest flows to all suppliers whose liquidity was used, proportionally.
            </p>
          </div>
          <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium text-lotus-purple-300">Junior Benefits</span>
            </div>
            <p className="text-sm text-lotus-purple-200/80">
              Junior lenders earn from multiple tranches when their liquidity cascades to senior tranches.
            </p>
          </div>
        </div>

        {/* Why This Matters */}
        <DynamicInsight show={true} variant="info">
          <strong>Why this matters:</strong> Unlike isolated pools where unused capital sits idle, connected liquidity means your supply can earn yield across multiple tranches. Junior tranches absorb losses first — that's why they earn higher yields to compensate for the risk.
        </DynamicInsight>
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
            <p className="text-sm text-lotus-grey-300 mb-3">
              Junior Supply at tranche i = Sum of all supply from this tranche and more junior tranches.
            </p>
            <div className="space-y-2">
              {tranches.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <span className="text-xs text-lotus-grey-300 w-12">{t.lltv}%</span>
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
            <p className="text-sm text-lotus-grey-300 mb-3">
              Junior Borrow at tranche i = Sum of all borrows at or above this risk level.
            </p>
            <div className="space-y-2">
              {tranches.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <span className="text-xs text-lotus-grey-300 w-12">{t.lltv}%</span>
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
            <p className="text-sm text-lotus-grey-300 mb-3">
              Jr Net = Jr Supply - Jr Borrow. This shows the "excess" supply available at each level.
            </p>
            <div className="space-y-2">
              {tranches.map((t) => {
                const isPositive = t.jrNetSupply >= 0;
                return (
                  <div key={t.id} className="flex items-center gap-2">
                    <span className="text-xs text-lotus-grey-300 w-12">{t.lltv}%</span>
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
        <div className="space-y-6">
          {/* Formula explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50">
              <h4 className="font-medium text-lotus-purple-200 mb-2">Supply Utilization</h4>
              <div className="bg-lotus-grey-800 rounded-lg px-3 py-2 mb-2">
                <code className="text-sm font-mono text-lotus-purple-300">
                  SupplyUtil = Supply / AvailableSupply
                </code>
              </div>
              <p className="text-sm text-lotus-grey-300">
                How much of the available supply at this tranche is being used.
                Higher = more capital deployed at this risk level.
              </p>
            </div>

            <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-700/50">
              <h4 className="font-medium text-orange-200 mb-2">Borrow Utilization</h4>
              <div className="bg-lotus-grey-800 rounded-lg px-3 py-2 mb-2">
                <code className="text-sm font-mono text-orange-300">
                  BorrowUtil = 1 - (FreeSupply / JrSupply)
                </code>
              </div>
              <p className="text-sm text-lotus-grey-300">
                How much of the junior supply is being borrowed against.
                Higher = more of the supply is earning interest.
              </p>
            </div>
          </div>

          {/* Supply Utilization Table */}
          <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50">
            <h4 className="font-medium text-lotus-purple-200 mb-3">Supply Utilization by Tranche</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-lotus-purple-700/50">
                    <th className="text-left py-2 px-3 text-lotus-grey-200 font-medium">LLTV</th>
                    <th className="text-right py-2 px-3 text-blue-300 font-medium">Supply</th>
                    <th className="text-right py-2 px-3 text-emerald-300 font-medium">Available</th>
                    <th className="text-right py-2 px-3 text-lotus-purple-300 font-medium">Supply Util</th>
                    <th className="text-left py-2 px-3 text-lotus-grey-200 font-medium">Calculation</th>
                  </tr>
                </thead>
                <tbody>
                  {tranches.map((t) => {
                    const supplyUtil = t.availableSupply > 0 ? (t.supplyAssets / t.availableSupply) : 0;
                    return (
                      <tr key={t.id} className="border-b border-lotus-purple-800/30 hover:bg-lotus-purple-900/20">
                        <td className="py-2 px-3 font-medium text-white">{t.lltv}%</td>
                        <td className="py-2 px-3 text-right font-mono text-blue-200">{t.supplyAssets.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-200">{t.availableSupply.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-lotus-purple-200">{(supplyUtil * 100).toFixed(1)}%</td>
                        <td className="py-2 px-3 text-sm text-lotus-grey-300 font-mono">
                          {t.supplyAssets.toLocaleString()} / {t.availableSupply.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Borrow Utilization Table */}
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-700/50">
            <h4 className="font-medium text-orange-200 mb-3">Borrow Utilization by Tranche</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-orange-700/50">
                    <th className="text-left py-2 px-3 text-lotus-grey-200 font-medium">LLTV</th>
                    <th className="text-right py-2 px-3 text-emerald-300 font-medium">Free Supply</th>
                    <th className="text-right py-2 px-3 text-blue-300 font-medium">Jr Supply</th>
                    <th className="text-right py-2 px-3 text-orange-300 font-medium">Borrow Util</th>
                    <th className="text-left py-2 px-3 text-lotus-grey-200 font-medium">Calculation</th>
                  </tr>
                </thead>
                <tbody>
                  {tranches.map((t) => {
                    const borrowUtil = t.jrSupply > 0 ? 1 - (t.freeSupply / t.jrSupply) : 0;
                    return (
                      <tr key={t.id} className="border-b border-orange-800/30 hover:bg-orange-900/20">
                        <td className="py-2 px-3 font-medium text-white">{t.lltv}%</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-200">{t.freeSupply.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono text-blue-200">{t.jrSupply.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-orange-200">{(borrowUtil * 100).toFixed(1)}%</td>
                        <td className="py-2 px-3 text-sm text-lotus-grey-300 font-mono">
                          1 - {t.freeSupply.toLocaleString()} / {t.jrSupply.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg">
            <p className="text-sm text-amber-300">
              <span className="font-medium">Key insight:</span> Supply utilization determines how much
              interest stays at this tranche vs cascading to more junior tranches. Higher supply utilization
              means more of the interest is kept at this level.
            </p>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

export default TrancheLiquidity;
