import type { TrancheInput, TrancheData } from '../types';
import { formatNumber, formatPercent } from '../math/lotusAccounting';
import { TrancheTable } from './TrancheTable';
import { FundingMatrix } from './FundingMatrix';
import { RateChart } from './RateChart';
import { CollapsibleSection, StackedBar } from './ConceptExplainer';
import { InterestSimulator } from './InterestSimulator';
import { BadDebtSimulator } from './BadDebtSimulator';
import { IsolatedComparison } from './IsolatedComparison';

interface TrancheLiquidityProps {
  /** Computed tranche data */
  tranches: TrancheData[];
  /** Productive debt rate (base rate) */
  productiveDebtRate: number;
  /** Callback when tranche input changes */
  onTrancheChange: (id: number, field: keyof TrancheInput, value: number) => void;
}

/**
 * Main wrapper component for the Tranche Liquidity educational flow.
 */
export function TrancheLiquidity({
  tranches,
  productiveDebtRate,
  onTrancheChange,
}: TrancheLiquidityProps) {
  // Compute max values for visualizations
  const maxJrSupply = Math.max(...tranches.map((t) => t.jrSupply));
  const maxJrBorrow = Math.max(...tranches.map((t) => t.jrBorrow));
  const maxJrNetSupply = Math.max(...tranches.map((t) => t.jrNetSupply));

  return (
    <div className="space-y-4">
      {/* Main Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <TrancheTable
          tranches={tranches}
          onTrancheChange={onTrancheChange}
          productiveDebtRate={productiveDebtRate}
        />
      </div>

      {/* Section 1: Understanding the Metrics */}
      <CollapsibleSection
        title="Understanding the Metrics"
        icon="📊"
        description="Learn what each computed value means and how it's calculated"
        defaultExpanded={false}
      >
        <div className="space-y-6">
          {/* 1a: Junior Metrics */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-700 border-b border-slate-200 pb-2">
              Junior Metrics (Jr Supply, Jr Borrow, Jr Net)
            </h4>

            {/* Jr Supply Explanation */}
            <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-medium text-blue-800">Jr Supply</h5>
                  <p className="text-sm text-blue-600 mt-1">
                    Total supply from this tranche and all junior tranches combined.
                  </p>
                </div>
                <div className="bg-blue-800 rounded px-3 py-1">
                  <code className="text-xs font-mono text-blue-200">
                    jrSupply[i] = Σ supply[j] for j ≥ i
                  </code>
                </div>
              </div>
              <div className="space-y-1">
                {tranches.map((t) => (
                  <StackedBar
                    key={t.id}
                    label={`${t.lltv}%`}
                    value={t.supplyAssets}
                    cumulativeValue={t.jrSupply}
                    maxValue={maxJrSupply}
                    color="#3b82f6"
                  />
                ))}
              </div>
              <p className="text-xs text-blue-500 mt-2">
                Dark bar = this tranche's supply. Light extension = junior tranches' supply.
              </p>
            </div>

            {/* Jr Borrow Explanation */}
            <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-medium text-orange-800">Jr Borrow</h5>
                  <p className="text-sm text-orange-600 mt-1">
                    Total borrows from this tranche and all junior tranches combined.
                  </p>
                </div>
                <div className="bg-orange-800 rounded px-3 py-1">
                  <code className="text-xs font-mono text-orange-200">
                    jrBorrow[i] = Σ borrow[j] for j ≥ i
                  </code>
                </div>
              </div>
              <div className="space-y-1">
                {tranches.map((t) => (
                  <StackedBar
                    key={t.id}
                    label={`${t.lltv}%`}
                    value={t.borrowAssets}
                    cumulativeValue={t.jrBorrow}
                    maxValue={maxJrBorrow || 1}
                    color="#f97316"
                  />
                ))}
              </div>
            </div>

            {/* Jr Net Supply Explanation */}
            <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-medium text-emerald-800">Jr Net Supply</h5>
                  <p className="text-sm text-emerald-600 mt-1">
                    Available supply after accounting for all junior borrowing.
                  </p>
                </div>
                <div className="bg-emerald-800 rounded px-3 py-1">
                  <code className="text-xs font-mono text-emerald-200">
                    jrNetSupply[i] = max(0, jrSupply[i] - jrBorrow[i])
                  </code>
                </div>
              </div>
              <div className="space-y-1">
                {tranches.map((t) => (
                  <StackedBar
                    key={t.id}
                    label={`${t.lltv}%`}
                    value={t.jrNetSupply}
                    cumulativeValue={t.jrNetSupply}
                    maxValue={maxJrNetSupply || 1}
                    color="#10b981"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 1b: Free Supply & Available Supply - Side by Side */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-700 border-b border-slate-200 pb-2">
              Free Supply & Available Supply
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Free Supply Explanation */}
              <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-100">
                <div className="mb-3">
                  <h5 className="font-medium text-purple-800">Free Supply</h5>
                  <p className="text-sm text-purple-600 mt-1">
                    Running minimum of Jr Net Supply from senior to junior.
                  </p>
                  <div className="bg-purple-800 rounded px-3 py-1 mt-2 inline-block">
                    <code className="text-xs font-mono text-purple-200">
                      freeSupply = min(jrNetSupply[0..i])
                    </code>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="text-sm">
                    <thead>
                      <tr className="border-b border-purple-200">
                        <th className="text-left py-1 pr-2 text-purple-700">Tranche</th>
                        <th className="text-right py-1 px-1 text-purple-700">Jr Net Supply</th>
                        <th className="py-1 px-1 text-purple-400">→</th>
                        <th className="text-right py-1 pl-1 text-purple-700">Free Supply</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tranches.map((t) => (
                        <tr key={t.id} className="border-b border-purple-100">
                          <td className="py-1 pr-2 font-medium text-slate-600">{t.lltv}%</td>
                          <td className="py-1 px-1 text-right font-mono text-blue-600">{formatNumber(t.jrNetSupply, 0)}</td>
                          <td className="py-1 px-1 text-purple-400">→</td>
                          <td className="py-1 pl-1 text-right font-mono font-medium text-purple-700">{formatNumber(t.freeSupply, 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Available Supply Explanation */}
              <div className="bg-teal-50/50 rounded-lg p-4 border border-teal-100">
                <div className="mb-3">
                  <h5 className="font-medium text-teal-800">Available Supply</h5>
                  <p className="text-sm text-teal-600 mt-1">
                    Supply available to borrowers before they borrowed.
                  </p>
                  <div className="bg-teal-800 rounded px-3 py-1 mt-2 inline-block">
                    <code className="text-xs font-mono text-teal-200">
                      available = jrNetSupply + borrow
                    </code>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="text-sm">
                    <thead>
                      <tr className="border-b border-teal-200">
                        <th className="text-left py-1 pr-2 text-teal-700">Tranche</th>
                        <th className="text-right py-1 px-1 text-teal-700">Jr Net</th>
                        <th className="py-1 px-1 text-teal-400">+</th>
                        <th className="text-right py-1 px-1 text-teal-700">Borrow</th>
                        <th className="py-1 px-1 text-teal-400">=</th>
                        <th className="text-right py-1 pl-1 text-teal-700">Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tranches.map((t) => (
                        <tr key={t.id} className="border-b border-teal-100">
                          <td className="py-1 pr-2 font-medium text-slate-600">{t.lltv}%</td>
                          <td className="py-1 px-1 text-right font-mono text-blue-600">{formatNumber(t.jrNetSupply, 0)}</td>
                          <td className="py-1 px-1 text-slate-400">+</td>
                          <td className="py-1 px-1 text-right font-mono text-orange-600">{formatNumber(t.borrowAssets, 0)}</td>
                          <td className="py-1 px-1 text-slate-400">=</td>
                          <td className="py-1 pl-1 text-right font-mono font-medium text-teal-700">{formatNumber(t.availableSupply, 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 1c: Utilization Metrics */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-700 border-b border-slate-200 pb-2">
              Utilization Metrics
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supply Utilization */}
              <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-100">
                <div className="mb-3">
                  <h5 className="font-medium text-indigo-800">Supply Utilization</h5>
                  <p className="text-sm text-indigo-600 mt-1">
                    Fraction of available supply from this tranche's lenders.
                  </p>
                  <div className="bg-indigo-800 rounded px-3 py-1 mt-2 inline-block">
                    <code className="text-xs font-mono text-indigo-200">
                      supplyUtil = supply ÷ availableSupply
                    </code>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="text-sm">
                    <thead>
                      <tr className="border-b border-indigo-200">
                        <th className="text-left py-1 pr-2 text-indigo-700">Tranche</th>
                        <th className="text-right py-1 px-1 text-indigo-700">Supply</th>
                        <th className="py-1 px-1 text-indigo-400">÷</th>
                        <th className="text-right py-1 px-1 text-indigo-700">Available</th>
                        <th className="py-1 px-1 text-indigo-400">=</th>
                        <th className="text-right py-1 pl-1 text-indigo-700">Supply Util</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tranches.map((t) => (
                        <tr key={t.id} className="border-b border-indigo-100">
                          <td className="py-1 pr-2 font-medium text-slate-600">{t.lltv}%</td>
                          <td className="py-1 px-1 text-right font-mono text-blue-600">{formatNumber(t.supplyAssets, 0)}</td>
                          <td className="py-1 px-1 text-indigo-400">÷</td>
                          <td className="py-1 px-1 text-right font-mono text-teal-600">{formatNumber(t.availableSupply, 0)}</td>
                          <td className="py-1 px-1 text-indigo-400">=</td>
                          <td className="py-1 pl-1 text-right font-mono font-medium text-indigo-700">{formatPercent(t.supplyUtilization, 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-indigo-500 mt-3">
                  Used to allocate interest and bad debt between local lenders and cascading flow.
                </p>
              </div>

              {/* Borrow Utilization */}
              <div className="bg-pink-50/50 rounded-lg p-4 border border-pink-100">
                <div className="mb-3">
                  <h5 className="font-medium text-pink-800">Borrow Utilization</h5>
                  <p className="text-sm text-pink-600 mt-1">
                    How much of junior supply is committed (borrowed or locked).
                  </p>
                  <div className="bg-pink-800 rounded px-3 py-1 mt-2 inline-block">
                    <code className="text-xs font-mono text-pink-200">
                      borrowUtil = 1 − (freeSupply ÷ jrSupply)
                    </code>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="text-sm">
                    <thead>
                      <tr className="border-b border-pink-200">
                        <th className="text-left py-1 pr-2 text-pink-700">Tranche</th>
                        <th className="text-right py-1 px-1 text-pink-700">Jr Supply</th>
                        <th className="py-1 px-1 text-pink-400">−</th>
                        <th className="text-right py-1 px-1 text-pink-700">Free Supply</th>
                        <th className="py-1 px-1 text-pink-400">=</th>
                        <th className="text-right py-1 pl-1 text-pink-700">Borrow Util</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tranches.map((t) => (
                        <tr key={t.id} className="border-b border-pink-100">
                          <td className="py-1 pr-2 font-medium text-slate-600">{t.lltv}%</td>
                          <td className="py-1 px-1 text-right font-mono text-blue-600">{formatNumber(t.jrSupply, 0)}</td>
                          <td className="py-1 px-1 text-pink-400">−</td>
                          <td className="py-1 px-1 text-right font-mono text-purple-600">{formatNumber(t.freeSupply, 0)}</td>
                          <td className="py-1 px-1 text-pink-400">=</td>
                          <td className="py-1 pl-1 text-right font-mono font-medium text-pink-700">{formatPercent(t.borrowUtilization, 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-pink-500 mt-3">
                  Used by interest rate models to determine borrow rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 2: How Supply Rates Work */}
      <CollapsibleSection
        title="How Supply Rates Work"
        icon="💰"
        description="Understand the cascading interest allocation model"
        defaultExpanded={false}
      >
        <div className="space-y-4">
          {/* Cascade Mechanism */}
          <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100">
            <h4 className="font-medium text-emerald-800 mb-3">The Cascade Mechanism</h4>
            <p className="text-sm text-emerald-600 mb-4">
              Interest flows from senior to junior tranches, allocated based on supply utilization at each level.
              Here's a simplified example with <strong>$100 interest generated per tranche</strong>:
            </p>

            {/* Simplified $100 example */}
            <div className="bg-white rounded border border-emerald-200 p-4 overflow-x-auto">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>Senior (75%)</span>
                <span>→ Unallocated interest cascades to junior →</span>
                <span>Junior (95%)</span>
              </div>

              {/* Use actual tranche supply utilization values */}
              {(() => {
                const intGenPerTranche = 100;

                let cascadeIn = 0;
                const results = tranches.map((t) => {
                  const supplyUtil = t.supplyUtilization ?? 1;
                  const total = cascadeIn + intGenPerTranche;
                  const keeps = total * supplyUtil;
                  const cascadeOut = total * (1 - supplyUtil);
                  const result = { lltv: t.lltv, supplyUtil, intGen: intGenPerTranche, cascadeIn, total, keeps, cascadeOut };
                  cascadeIn = cascadeOut;
                  return result;
                });

                return (
                  <table className="text-sm w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-1 pr-2 text-slate-600">Tranche</th>
                        <th className="text-right py-1 px-1 text-slate-600">Interest Generated</th>
                        <th className="py-1 px-1 text-slate-400">+</th>
                        <th className="text-right py-1 px-1 text-slate-600">Interest Cascaded In</th>
                        <th className="py-1 px-1 text-slate-400">=</th>
                        <th className="text-right py-1 px-1 text-slate-600">Total Interest</th>
                        <th className="py-1 px-1 text-slate-400">×</th>
                        <th className="text-right py-1 px-1 text-slate-600">Supply Utilization</th>
                        <th className="py-1 px-1 text-slate-400">=</th>
                        <th className="text-right py-1 px-1 text-slate-600">Interest Kept</th>
                        <th className="text-right py-1 pl-2 text-slate-600">Interest Cascaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={r.lltv} className="border-b border-slate-100">
                          <td className="py-1 pr-2 font-medium text-slate-700">{r.lltv}%</td>
                          <td className="py-1 px-1 text-right font-mono text-emerald-600">${r.intGen}</td>
                          <td className="py-1 px-1 text-slate-400">+</td>
                          <td className="py-1 px-1 text-right font-mono text-blue-600">${r.cascadeIn.toFixed(0)}</td>
                          <td className="py-1 px-1 text-slate-400">=</td>
                          <td className="py-1 px-1 text-right font-mono text-slate-700">${r.total.toFixed(0)}</td>
                          <td className="py-1 px-1 text-slate-400">×</td>
                          <td className="py-1 px-1 text-right font-mono text-indigo-600">{formatPercent(r.supplyUtil, 0)}</td>
                          <td className="py-1 px-1 text-slate-400">=</td>
                          <td className="py-1 px-1 text-right font-mono font-medium text-emerald-700">${r.keeps.toFixed(0)}</td>
                          <td className="py-1 pl-2 text-right font-mono text-orange-600">
                            {i < results.length - 1 ? `$${r.cascadeOut.toFixed(0)}` : '-'}
                          </td>
                        </tr>
                      ))}
                      {/* Total row */}
                      <tr className="border-t border-slate-300 font-medium">
                        <td className="py-1 pr-2 text-slate-600">Total</td>
                        <td className="py-1 px-1 text-right font-mono text-emerald-700">${tranches.length * 100}</td>
                        <td className="py-1 px-1"></td>
                        <td className="py-1 px-1"></td>
                        <td className="py-1 px-1"></td>
                        <td className="py-1 px-1"></td>
                        <td className="py-1 px-1"></td>
                        <td className="py-1 px-1"></td>
                        <td className="py-1 px-1"></td>
                        <td className="py-1 px-1 text-right font-mono text-emerald-700">${results.reduce((s, r) => s + r.keeps, 0).toFixed(0)}</td>
                        <td className="py-1 pl-2"></td>
                      </tr>
                    </tbody>
                  </table>
                );
              })()}
            </div>

            <p className="text-xs text-slate-500 mt-3 italic">
              For a more realistic scenario based on current data, see the Interest Accrual Simulation below.
            </p>
          </div>

          {/* Rate Calculation */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h4 className="font-medium text-slate-700 mb-2">Supply Rate Calculation</h4>
            <div className="bg-slate-800 rounded px-4 py-2 mb-3">
              <code className="text-sm font-mono text-blue-300">
                supplyRate = interestAllocated / supplyAssets
              </code>
            </div>
            <p className="text-sm text-slate-600">
              Senior tranches can earn high rates through cascades because when junior tranches have
              low supply utilization, most of the interest cascades up, concentrating on fewer lenders.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 3: Interest Accrual Simulation */}
      <CollapsibleSection
        title="Interest Accrual Simulation"
        icon="⏱️"
        description="See what happens when time passes and interest accrues"
        defaultExpanded={false}
      >
        <InterestSimulator tranches={tranches} productiveDebtRate={productiveDebtRate} />
      </CollapsibleSection>

      {/* Section 4: Bad Debt Simulation */}
      <CollapsibleSection
        title="Bad Debt Simulation"
        icon="⚠️"
        description="Explore how bad debt is absorbed by tranches"
        defaultExpanded={false}
      >
        <BadDebtSimulator tranches={tranches} />
      </CollapsibleSection>

      {/* Section 5: Lotus vs Isolated Markets */}
      <CollapsibleSection
        title="Lotus vs Isolated Markets"
        icon="⚖️"
        description="Compare connected liquidity to traditional isolated lending pools"
        defaultExpanded={false}
      >
        <IsolatedComparison tranches={tranches} productiveDebtRate={productiveDebtRate} />
      </CollapsibleSection>

      {/* Rate Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <RateChart tranches={tranches} productiveDebtRate={productiveDebtRate} />
      </div>

      {/* Funding Matrix */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <FundingMatrix tranches={tranches} includePendingInterest={false} />
      </div>
    </div>
  );
}

export default TrancheLiquidity;
