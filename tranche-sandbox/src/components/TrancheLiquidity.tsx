import { useMemo } from 'react';
import type { TrancheData, TrancheInput } from '../types';
import { TrancheTable } from './TrancheTable';
import { CollapsibleSection } from './ConceptExplainer';
import { RoleDiagramCompact } from './RoleDiagram';
import { TermDefinition } from './TermDefinition';
import { RateChart } from './RateChart';
import { DynamicLoanMix } from './DynamicLoanMix';

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
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Benefits of Cascading Liquidity</h3>
        <p className="text-lotus-grey-300 mb-6">
          Unlike isolated pools, Lotus tranches share liquidity through a cascade mechanism.
        </p>

        {/* Bullet point explanation */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-emerald-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-emerald-400 text-sm font-bold">1</span>
            </div>
            <div>
              <p className="text-sm text-lotus-grey-200">
                <strong className="text-emerald-400">Liquidity cascades upward:</strong> Unused supply from junior tranches (higher LLTV)
                flows to more senior tranches (lower LLTV) to support borrowers there.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-400 text-sm font-bold">2</span>
            </div>
            <div>
              <p className="text-sm text-lotus-grey-200">
                <strong className="text-blue-400">Interest cascades downward:</strong> Interest generated at senior tranches flows down
                to junior tranches based on supply utilization at each level.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-lotus-purple-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-lotus-purple-400 text-sm font-bold">3</span>
            </div>
            <div>
              <p className="text-sm text-lotus-grey-200">
                <strong className="text-lotus-purple-400">No idle capital:</strong> Your supply earns yield even when borrowers at your
                tranche level aren't active, because it supports borrowers at more senior tranches.
              </p>
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
              <span className="font-medium text-lotus-purple-300">Higher Risk = Higher Yield</span>
            </div>
            <p className="text-sm text-lotus-purple-200/80">
              Junior lenders underwrite higher-risk LLTVs and earn higher yields to compensate.
            </p>
          </div>
        </div>

        {/* Important clarification about bad debt */}
        <div className="mt-6 p-4 bg-amber-900/20 rounded-lg border border-amber-700/50">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm text-amber-200">
                <strong>Important:</strong> Bad debt is allocated proportionally to lenders who provided the liquidity
                that was borrowed. Junior lenders earn higher yields because they underwrite riskier (higher LLTV) loans,
                not because they "absorb losses first."
              </p>
            </div>
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

      {/* Rates by LLTV - moved up to be right after main table */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Rates by LLTV</h3>
        <RateChart tranches={tranches} productiveDebtRate={productiveDebtRate} />
      </div>

      {/* Dynamic Loan Mix */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-2">Dynamic Loan Mix</h3>
        <p className="text-sm text-lotus-grey-400 mb-4">
          See how each tranche's capital is allocated across the system. The mix changes dynamically based on supply and borrow activity.
        </p>
        <DynamicLoanMix tranches={tranches} />
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
            {/* Legend for stacked bars */}
            <div className="flex gap-4 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-lotus-grey-300">Direct supply (this tranche)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400/50 rounded" />
                <span className="text-lotus-grey-300">Cascaded from junior</span>
              </div>
            </div>
            <div className="space-y-2">
              {tranches.map((t) => {
                const cascadedSupply = t.jrSupply - t.supplyAssets;
                const directPercent = maxJrSupply > 0 ? (t.supplyAssets / maxJrSupply) * 100 : 0;
                const cascadedPercent = maxJrSupply > 0 ? (cascadedSupply / maxJrSupply) * 100 : 0;
                return (
                  <div key={t.id} className="flex items-center gap-2">
                    <span className="text-xs text-lotus-grey-300 w-12">{t.lltv}%</span>
                    <div className="flex-1 h-4 bg-lotus-grey-700 rounded overflow-hidden flex">
                      {/* Direct supply bar */}
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${directPercent}%` }}
                      />
                      {/* Cascaded supply bar */}
                      <div
                        className="h-full bg-blue-400/50 transition-all"
                        style={{ width: `${cascadedPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-lotus-grey-300 w-16 text-right">
                      {t.jrSupply.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-grey-100 mb-2">Junior Borrow</h4>
            <p className="text-sm text-lotus-grey-300 mb-3">
              Junior Borrow at tranche i = Sum of all borrows at or above this risk level.
            </p>
            {/* Legend for stacked bars */}
            <div className="flex gap-4 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded" />
                <span className="text-lotus-grey-300">Direct borrow (this tranche)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400/50 rounded" />
                <span className="text-lotus-grey-300">Cascaded from senior</span>
              </div>
            </div>
            <div className="space-y-2">
              {tranches.map((t) => {
                const cascadedBorrow = t.jrBorrow - t.borrowAssets;
                const directPercent = maxJrBorrow > 0 ? (t.borrowAssets / maxJrBorrow) * 100 : 0;
                const cascadedPercent = maxJrBorrow > 0 ? (cascadedBorrow / maxJrBorrow) * 100 : 0;
                return (
                  <div key={t.id} className="flex items-center gap-2">
                    <span className="text-xs text-lotus-grey-300 w-12">{t.lltv}%</span>
                    <div className="flex-1 h-4 bg-lotus-grey-700 rounded overflow-hidden flex">
                      {/* Direct borrow bar (this tranche, appears first/left) */}
                      <div
                        className="h-full bg-orange-500 transition-all"
                        style={{ width: `${directPercent}%` }}
                      />
                      {/* Cascaded borrow bar (from senior) */}
                      <div
                        className="h-full bg-orange-400/50 transition-all"
                        style={{ width: `${cascadedPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-lotus-grey-300 w-16 text-right">
                      {t.jrBorrow.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-grey-100 mb-2">Junior Net Supply</h4>
            <p className="text-sm text-lotus-grey-300 mb-3">
              Jr Net = Jr Supply − Jr Borrow. This shows the "excess" supply available at each level.
            </p>
            {/* Math columns display */}
            <div className="space-y-2">
              {tranches.map((t) => {
                const isPositive = t.jrNetSupply >= 0;
                return (
                  <div key={t.id} className="flex items-center gap-2">
                    <span className="text-xs text-lotus-grey-300 w-12">{t.lltv}%</span>
                    {/* Inline math: Jr Supply - Jr Borrow = Jr Net Supply */}
                    <span className="text-xs font-mono text-blue-400 w-14 text-right">{t.jrSupply.toLocaleString()}</span>
                    <span className="text-xs text-lotus-grey-300">−</span>
                    <span className="text-xs font-mono text-orange-400 w-14 text-right">{t.jrBorrow.toLocaleString()}</span>
                    <span className="text-xs text-lotus-grey-300">=</span>
                    <span className={`text-xs font-mono w-14 text-right font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.jrNetSupply.toLocaleString()}
                    </span>
                    <div className="flex-1 h-4 bg-lotus-grey-700 rounded overflow-hidden relative">
                      <div
                        className={`h-full transition-all ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${maxJrNetSupply > 0 ? (Math.abs(t.jrNetSupply) / maxJrNetSupply) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Understanding Supply Metrics - CollapsibleSection style matching Utilization Metrics */}
      <CollapsibleSection
        title="Understanding Supply Metrics"
        icon="📦"
        description="Free Supply and Available Supply explained"
      >
        <div className="space-y-4">
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-grey-100 mb-2">Free Supply</h4>
            <p className="text-sm text-lotus-grey-300 mb-3">
              The amount of liquidity that can be <strong className="text-emerald-400">borrowed or withdrawn</strong> from the tranche.
            </p>
            <p className="text-xs text-lotus-grey-400 mb-4">
              <span className="font-mono bg-lotus-grey-800 px-2 py-1 rounded">FreeSupply = min(JrNetSupply at this tranche and all more senior tranches)</span>
            </p>

            {/* Legend */}
            <div className="flex gap-4 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-lotus-grey-300">Jr Net Supply</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded" />
                <span className="text-lotus-grey-300">Free Supply</span>
              </div>
            </div>

            <div className="space-y-2">
              {(() => {
                const maxJrNet = Math.max(...tranches.map(tr => Math.max(0, tr.jrNetSupply)));
                return tranches.map((t) => (
                  <div key={t.id} className="flex items-center gap-2">
                    <span className="text-xs text-lotus-grey-300 w-12">{t.lltv}%</span>
                    <div className="flex-1 h-5 bg-lotus-grey-700 rounded overflow-hidden relative">
                      {/* Jr Net Supply bar (blue) */}
                      <div
                        className="absolute h-full bg-blue-500/60 transition-all"
                        style={{ width: `${maxJrNet > 0 ? (Math.max(0, t.jrNetSupply) / maxJrNet) * 100 : 0}%` }}
                      />
                      {/* Free Supply bar (emerald, overlaid) */}
                      <div
                        className="absolute h-full bg-emerald-500 transition-all"
                        style={{ width: `${maxJrNet > 0 ? (t.freeSupply / maxJrNet) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex gap-2 w-32 justify-end">
                      <span className="text-xs font-mono text-blue-400">
                        {Math.max(0, t.jrNetSupply).toLocaleString()}
                      </span>
                      <span className="text-xs text-lotus-grey-300">/</span>
                      <span className="text-xs font-mono text-emerald-400">
                        {t.freeSupply.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </div>

            <p className="text-xs text-lotus-grey-400 mt-3 italic">
              Free supply is constrained by the minimum Jr Net Supply at all more senior tranches.
              Even if a junior tranche has excess liquidity, it can only be withdrawn if senior tranches also have liquidity available.
            </p>
          </div>

          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <h4 className="font-medium text-lotus-grey-100 mb-2">Available Supply</h4>
            <p className="text-sm text-lotus-grey-300 mb-3">
              The total supply available for borrowers at this tranche. Equals Jr Net Supply plus existing borrows at the tranche.
            </p>
            <p className="text-xs text-lotus-grey-400 mb-4">
              <span className="font-mono bg-lotus-grey-800 px-2 py-1 rounded">AvailableSupply = JrNetSupply + BorrowsAtTranche</span>
            </p>

            {/* Legend */}
            <div className="flex gap-4 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-lotus-grey-300">Jr Net Supply</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded" />
                <span className="text-lotus-grey-300">Borrows at Tranche</span>
              </div>
            </div>

            <div className="space-y-2">
              {(() => {
                const maxAvailable = Math.max(...tranches.map(tr => tr.availableSupply));
                return tranches.map((t) => {
                  const jrNetPercent = maxAvailable > 0 ? (Math.max(0, t.jrNetSupply) / maxAvailable) * 100 : 0;
                  const borrowPercent = maxAvailable > 0 ? (t.borrowAssets / maxAvailable) * 100 : 0;
                  return (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className="text-xs text-lotus-grey-300 w-12">{t.lltv}%</span>
                      <div className="flex-1 h-5 bg-lotus-grey-700 rounded overflow-hidden flex">
                        {/* Jr Net Supply bar (blue) */}
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${jrNetPercent}%` }}
                        />
                        {/* Borrows at tranche bar (orange) */}
                        <div
                          className="h-full bg-orange-500 transition-all"
                          style={{ width: `${borrowPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-lotus-grey-300 w-20 text-right">
                        {t.availableSupply.toLocaleString()}
                      </span>
                    </div>
                  );
                });
              })()}
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
          {/* Supply Utilization Table */}
          <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50">
            <h4 className="font-medium text-lotus-purple-200 mb-3">Supply Utilization by Tranche</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-lotus-purple-700/50">
                    <th className="text-left py-2 px-3 text-lotus-grey-200 font-medium">LLTV</th>
                    <th className="text-right py-2 px-3 text-blue-300 font-medium">Supply</th>
                    <th className="text-center py-2 px-1 text-lotus-grey-300">÷</th>
                    <th className="text-right py-2 px-3 text-emerald-300 font-medium">Available</th>
                    <th className="text-center py-2 px-1 text-lotus-grey-300">=</th>
                    <th className="text-right py-2 px-3 text-lotus-purple-300 font-medium">Supply Util</th>
                  </tr>
                </thead>
                <tbody>
                  {tranches.map((t) => {
                    const supplyUtil = t.availableSupply > 0 ? (t.supplyAssets / t.availableSupply) : 0;
                    return (
                      <tr key={t.id} className="border-b border-lotus-purple-800/30 hover:bg-lotus-purple-900/20">
                        <td className="py-2 px-3 font-medium text-white">{t.lltv}%</td>
                        <td className="py-2 px-3 text-right font-mono text-blue-200">{t.supplyAssets.toLocaleString()}</td>
                        <td className="text-center text-lotus-grey-300">÷</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-200">{t.availableSupply.toLocaleString()}</td>
                        <td className="text-center text-lotus-grey-300">=</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-lotus-purple-200">{(supplyUtil * 100).toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-lotus-grey-400 mt-2">
              Supply utilization determines how much interest stays at this tranche vs cascading to more junior tranches. Higher supply utilization means more of the interest is kept at this level.
            </p>
          </div>

          {/* Borrow Utilization Table */}
          <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-700/50">
            <h4 className="font-medium text-orange-200 mb-3">Borrow Utilization by Tranche</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-orange-700/50">
                    <th className="text-left py-2 px-3 text-lotus-grey-200 font-medium">LLTV</th>
                    <th className="text-center py-2 px-1 text-lotus-grey-300">1 −</th>
                    <th className="text-right py-2 px-3 text-emerald-300 font-medium">Free Supply</th>
                    <th className="text-center py-2 px-1 text-lotus-grey-300">÷</th>
                    <th className="text-right py-2 px-3 text-blue-300 font-medium">Jr Supply</th>
                    <th className="text-center py-2 px-1 text-lotus-grey-300">=</th>
                    <th className="text-right py-2 px-3 text-orange-300 font-medium">Borrow Util</th>
                  </tr>
                </thead>
                <tbody>
                  {tranches.map((t) => {
                    const borrowUtil = t.jrSupply > 0 ? 1 - (t.freeSupply / t.jrSupply) : 0;
                    return (
                      <tr key={t.id} className="border-b border-orange-800/30 hover:bg-orange-900/20">
                        <td className="py-2 px-3 font-medium text-white">{t.lltv}%</td>
                        <td className="text-center text-lotus-grey-300">1 −</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-200">{t.freeSupply.toLocaleString()}</td>
                        <td className="text-center text-lotus-grey-300">÷</td>
                        <td className="py-2 px-3 text-right font-mono text-blue-200">{t.jrSupply.toLocaleString()}</td>
                        <td className="text-center text-lotus-grey-300">=</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-orange-200">{(borrowUtil * 100).toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-lotus-grey-400 mt-2">
              Borrow utilization is used to determine interest rates according to the Interest Rate Model (IRM). Higher utilization leads to higher borrow rates.
            </p>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

export default TrancheLiquidity;
