import { useMemo, useState } from 'react';
import type { TrancheData, TrancheInput } from '../types';
import { TrancheTable } from './TrancheTable';
import { CollapsibleSection } from './ConceptExplainer';
import { RoleDiagramCompact } from './RoleDiagram';
import { RateChart } from './RateChart';
import { DynamicLoanMix } from './DynamicLoanMix';
import { FailureModeCallout } from './FailureModeCallout';
import { TeachingPrompt } from './TeachingPrompt';
import { ContextZone } from './ContextZone';
import { InteractiveZone } from './InteractiveZone';
import { DetailZone } from './DetailZone';
import { content } from '../content';

const { trancheLiquidity: tlContent } = content;

/**
 * FreeSupplyWhyButton - Inline explainer for the Free Supply concept
 */
function FreeSupplyWhyButton() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-lotus-purple-400 hover:text-lotus-purple-300 transition-colors flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Why?
      </button>

      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 z-20 w-80 bg-lotus-grey-800 border border-lotus-grey-700 rounded shadow-xl p-4">
          <div className="flex items-start justify-between mb-2">
            <h5 className="font-medium text-rating-a-plus">{tlContent.supplyMetrics.freeSupply.whyButton.heading}</h5>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-lotus-grey-400 hover:text-lotus-grey-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-3 text-xs text-lotus-grey-300">
            <p>
              <strong className="text-rating-a-plus">{tlContent.supplyMetrics.freeSupply.whyButton.explanation}</strong>
            </p>
            <p>
              It's limited by the <strong className="text-rating-b">tightest junior net supply</strong> along the senior path.
              {tlContent.supplyMetrics.freeSupply.whyButton.detail.split("Even if")[1] && ` Even if${tlContent.supplyMetrics.freeSupply.whyButton.detail.split("Even if")[1]}`}
            </p>
            <div className="bg-rating-b/20 border border-rating-b/30 rounded p-2 mt-2">
              <p className="text-rating-b">
                <strong>Why can borrow &gt; supply?</strong> {tlContent.supplyMetrics.freeSupply.whyButton.borrowNote.split("This is valid")[1] ? `This is valid${tlContent.supplyMetrics.freeSupply.whyButton.borrowNote.split("This is valid")[1]}` : tlContent.supplyMetrics.freeSupply.whyButton.borrowNote}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════════════════
          CONTEXT ZONE - Minimal context above the fold
          ═══════════════════════════════════════════════════════════════════ */}
      <ContextZone
        context="See how Lotus connects liquidity across risk levels. Senior tranches can draw from junior tranches, creating a unified market where every lender's capital contributes to overall depth."
        whatYoullLearn={[
          'Supply & borrow cascade',
          'Rate determination',
          'Tranche interactions'
        ]}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          INTERACTIVE ZONE - The main event
          ═══════════════════════════════════════════════════════════════════ */}
      <InteractiveZone
        tryThis={tlContent.pageHeader.tryThis}
        title="Liquidity Table"
      >
        <div className="space-y-4">
          {/* Primary interactive element: The Table */}
          <div className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6">
            <TrancheTable
              tranches={tranches}
              productiveDebtRate={productiveDebtRate}
              onTrancheChange={onTrancheChange}
            />
          </div>

          {/* Cascade indicator - shows changes flow to charts below */}
          <div className="flex items-center justify-center gap-2 text-xs text-lotus-grey-400 py-2">
            <svg className="w-4 h-4 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span>Your changes update the charts below in real-time</span>
          </div>

          {/* How to read this table - collapsible, right here where it's useful */}
          <details className="bg-lotus-grey-900 rounded border border-lotus-grey-700">
            <summary className="px-4 py-2 cursor-pointer list-none flex items-center gap-2 text-sm text-lotus-grey-300 hover:text-lotus-grey-100 transition-colors">
              <svg className="w-4 h-4 text-lotus-grey-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>How to read this table</span>
            </summary>
            <div className="px-4 pb-3 pt-2 border-t border-lotus-grey-700 font-mono text-xs">
              <table className="w-full">
                <tbody>
                  {tlContent.tableGuide.columns.map((col) => (
                    <tr key={col.name} className="border-b border-lotus-grey-700/50 last:border-0">
                      <td className="py-1.5 pr-4 text-lotus-purple-300 whitespace-nowrap align-top w-28">{col.name}</td>
                      <td className="py-1.5 text-lotus-grey-400">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 pt-2 border-t border-lotus-grey-700/50 text-lotus-grey-400">
                Click any row to inspect constraints.
              </p>
            </div>
          </details>
        </div>
      </InteractiveZone>

      {/* Secondary interactive: Rate visualization */}
      <div className="bg-lotus-grey-950 rounded-none p-6 border border-lotus-grey-700">
        <div className="flex items-center gap-2 text-xs text-lotus-purple-300 mb-4">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          <span>Updates from your table settings above</span>
        </div>
        <RateChart tranches={tranches} productiveDebtRate={productiveDebtRate} />
      </div>

      {/* Tertiary interactive: Dynamic Loan Mix */}
      <div className="bg-lotus-grey-950 rounded-none p-6 border border-lotus-grey-700">
        <div className="flex items-center gap-2 text-xs text-lotus-purple-300 mb-4">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          <span>Updates from your table settings above</span>
        </div>
        <DynamicLoanMix tranches={tranches} />
      </div>

      {/* Key takeaway - visible before detail zone */}
      <TeachingPrompt title="Key takeaway:">
        {tlContent.keyTakeaway}
      </TeachingPrompt>

      {/* ═══════════════════════════════════════════════════════════════════
          DETAIL ZONE - Below the fold, for those who want to go deeper
          ═══════════════════════════════════════════════════════════════════ */}
      <DetailZone
        title="Understand the Mechanics"
        teaserItems={['How Roles Work', 'Liquidity Cascade', 'Junior Metrics', 'Supply Metrics', 'Utilization']}
        defaultOpen
      >
        {/* Role Diagram - How lenders and borrowers interact */}
        <div className="bg-lotus-grey-900 rounded p-6 border border-lotus-grey-700">
          <h3 className="text-base font-medium text-lotus-grey-200 mb-4">{tlContent.roleCards.heading}</h3>
          <RoleDiagramCompact />
        </div>

        {/* Liquidity Cascade Explanation - Collapsible */}
        <CollapsibleSection
          title={tlContent.cascadeBenefits.heading}
          icon="→"
          description={tlContent.cascadeBenefits.description}
        >
          {/* Key Insight Cards - muted, monochrome */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-lotus-grey-900 rounded p-3 border border-lotus-grey-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-sm bg-lotus-grey-600 flex items-center justify-center text-xs text-lotus-grey-300">1</span>
                <span className="font-medium text-lotus-grey-200 text-sm">{tlContent.cascadeBenefits.cards[0].title}</span>
              </div>
              <p className="text-xs text-lotus-grey-400">
                {tlContent.cascadeBenefits.cards[0].description}
              </p>
            </div>
            <div className="bg-lotus-grey-900 rounded p-3 border border-lotus-grey-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-sm bg-lotus-grey-600 flex items-center justify-center text-xs text-lotus-grey-300">2</span>
                <span className="font-medium text-lotus-grey-200 text-sm">{tlContent.cascadeBenefits.cards[1].title}</span>
              </div>
              <p className="text-xs text-lotus-grey-400">
                {tlContent.cascadeBenefits.cards[1].description}
              </p>
            </div>
            <div className="bg-lotus-grey-900 rounded p-3 border border-lotus-grey-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-sm bg-lotus-grey-600 flex items-center justify-center text-xs text-lotus-grey-300">3</span>
                <span className="font-medium text-lotus-grey-200 text-sm">{tlContent.cascadeBenefits.cards[2].title}</span>
              </div>
              <p className="text-xs text-lotus-grey-400">
                {tlContent.cascadeBenefits.cards[2].description}
              </p>
            </div>
          </div>

          <h4 className="text-sm font-medium text-lotus-grey-300 mt-6 mb-3">{tlContent.cascadeBenefits.howItWorks.heading}</h4>
          <div className="space-y-3 text-sm text-lotus-grey-400">
            <p><strong className="text-lotus-grey-300">{tlContent.cascadeBenefits.howItWorks.steps[0].label}</strong> {tlContent.cascadeBenefits.howItWorks.steps[0].description}</p>
            <p><strong className="text-lotus-grey-300">{tlContent.cascadeBenefits.howItWorks.steps[1].label}</strong> {tlContent.cascadeBenefits.howItWorks.steps[1].description}</p>
            <p><strong className="text-lotus-grey-300">{tlContent.cascadeBenefits.howItWorks.steps[2].label}</strong> {tlContent.cascadeBenefits.howItWorks.steps[2].description}</p>
          </div>

          {/* Important clarification about bad debt - muted */}
          <div className="mt-6 p-3 bg-lotus-grey-900 rounded border border-lotus-grey-700/50">
            <p className="text-xs text-lotus-grey-400">
              <strong className="text-lotus-grey-300">Note:</strong> {tlContent.cascadeBenefits.badDebtNote}
            </p>
          </div>
        </CollapsibleSection>

        {/* Advanced Metrics - Collapsible sections */}
        <CollapsibleSection
          title={tlContent.juniorMetrics.title}
          icon="[]"
          description={tlContent.juniorMetrics.description}
        >
          <div className="space-y-4">
            <div className="bg-lotus-grey-900 rounded p-4 border border-lotus-grey-700">
              <h4 className="font-medium text-lotus-grey-100 mb-2">{tlContent.juniorMetrics.juniorSupply.heading}</h4>
              <p className="text-sm text-lotus-grey-300 mb-3">
                {tlContent.juniorMetrics.juniorSupply.description}
              </p>
              {/* Legend for stacked bars */}
              <div className="flex gap-4 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rating-a rounded" />
                  <span className="text-lotus-grey-300">{tlContent.juniorMetrics.juniorSupply.directLegend}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rating-a/50 rounded" />
                  <span className="text-lotus-grey-300">{tlContent.juniorMetrics.juniorSupply.cascadedLegend}</span>
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
                        <div
                          className="h-full bg-rating-a transition-all"
                          style={{ width: `${directPercent}%` }}
                        />
                        <div
                          className="h-full bg-rating-a/50 transition-all"
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

            <div className="bg-lotus-grey-900 rounded p-4 border border-lotus-grey-700">
              <h4 className="font-medium text-lotus-grey-100 mb-2">{tlContent.juniorMetrics.juniorBorrow.heading}</h4>
              <p className="text-sm text-lotus-grey-300 mb-3">
                {tlContent.juniorMetrics.juniorBorrow.description}
              </p>
              <div className="flex gap-4 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rating-c-plus rounded" />
                  <span className="text-lotus-grey-300">{tlContent.juniorMetrics.juniorBorrow.directLegend}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rating-c-plus/50 rounded" />
                  <span className="text-lotus-grey-300">{tlContent.juniorMetrics.juniorBorrow.cascadedLegend}</span>
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
                        <div
                          className="h-full bg-rating-c-plus transition-all"
                          style={{ width: `${directPercent}%` }}
                        />
                        <div
                          className="h-full bg-rating-c-plus/50 transition-all"
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

            <div className="bg-lotus-grey-900 rounded p-4 border border-lotus-grey-700">
              <h4 className="font-medium text-lotus-grey-100 mb-2">{tlContent.juniorMetrics.juniorNetSupply.heading}</h4>
              <p className="text-sm text-lotus-grey-300 mb-3">
                {tlContent.juniorMetrics.juniorNetSupply.description}
              </p>
              <div className="space-y-2">
                {tranches.map((t) => {
                  const isPositive = t.jrNetSupply >= 0;
                  return (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className="text-xs text-lotus-grey-300 w-12">{t.lltv}%</span>
                      <span className="text-xs font-mono text-rating-a w-14 text-right">{t.jrSupply.toLocaleString()}</span>
                      <span className="text-xs text-lotus-grey-300">−</span>
                      <span className="text-xs font-mono text-rating-c-plus w-14 text-right">{t.jrBorrow.toLocaleString()}</span>
                      <span className="text-xs text-lotus-grey-300">=</span>
                      <span className={`text-xs font-mono w-14 text-right font-medium ${isPositive ? 'text-rating-a-plus' : 'text-rating-d'}`}>
                        {t.jrNetSupply.toLocaleString()}
                      </span>
                      <div className="flex-1 h-4 bg-lotus-grey-700 rounded overflow-hidden relative">
                        <div
                          className={`h-full transition-all ${isPositive ? 'bg-rating-a-plus' : 'bg-rating-d'}`}
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

        <CollapsibleSection
          title={tlContent.supplyMetrics.title}
          icon="{}"
          description={tlContent.supplyMetrics.description}
        >
          <div className="space-y-4">
            <div className="bg-lotus-grey-900 rounded p-4 border border-lotus-grey-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-lotus-grey-100">{tlContent.supplyMetrics.freeSupply.heading}</h4>
                <FreeSupplyWhyButton />
              </div>
              <p className="text-sm text-lotus-grey-300 mb-3">
                The amount of liquidity that can be <strong className="text-rating-a-plus">borrowed or withdrawn</strong> from the tranche.
              </p>
              <p className="text-xs text-lotus-grey-400 mb-4">
                <span className="font-mono bg-lotus-grey-800 px-2 py-1 rounded">{tlContent.supplyMetrics.freeSupply.formula}</span>
              </p>

              <div className="flex gap-4 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rating-a rounded" />
                  <span className="text-lotus-grey-300">Jr Net Supply</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rating-a-plus rounded" />
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
                        <div
                          className="absolute h-full bg-rating-a/60 transition-all"
                          style={{ width: `${maxJrNet > 0 ? (Math.max(0, t.jrNetSupply) / maxJrNet) * 100 : 0}%` }}
                        />
                        <div
                          className="absolute h-full bg-rating-a-plus transition-all"
                          style={{ width: `${maxJrNet > 0 ? (t.freeSupply / maxJrNet) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex gap-2 w-32 justify-end">
                        <span className="text-xs font-mono text-rating-a">
                          {Math.max(0, t.jrNetSupply).toLocaleString()}
                        </span>
                        <span className="text-xs text-lotus-grey-300">/</span>
                        <span className="text-xs font-mono text-rating-a-plus">
                          {t.freeSupply.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              <p className="text-xs text-lotus-grey-400 mt-3 italic">
                {tlContent.supplyMetrics.freeSupply.note}
              </p>
            </div>

            <div className="bg-lotus-grey-900 rounded p-4 border border-lotus-grey-700">
              <h4 className="font-medium text-lotus-grey-100 mb-2">{tlContent.supplyMetrics.availableSupply.heading}</h4>
              <p className="text-sm text-lotus-grey-300 mb-3">
                {tlContent.supplyMetrics.availableSupply.description}
              </p>
              <p className="text-xs text-lotus-grey-400 mb-4">
                <span className="font-mono bg-lotus-grey-800 px-2 py-1 rounded">{tlContent.supplyMetrics.availableSupply.formula}</span>
              </p>

              <div className="flex gap-4 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rating-a rounded" />
                  <span className="text-lotus-grey-300">Jr Net Supply</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rating-c-plus rounded" />
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
                          <div
                            className="h-full bg-rating-a transition-all"
                            style={{ width: `${jrNetPercent}%` }}
                          />
                          <div
                            className="h-full bg-rating-c-plus transition-all"
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
          title={tlContent.utilizationMetrics.title}
          icon="%"
          description={tlContent.utilizationMetrics.description}
        >
          <div className="space-y-6">
            <div className="bg-lotus-purple-900/20 rounded p-4 border border-lotus-purple-700/50">
              <h4 className="font-medium text-lotus-purple-200 mb-3">{tlContent.utilizationMetrics.supplyUtil.heading}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-lotus-purple-700/50">
                      <th className="text-left py-2 px-3 text-lotus-grey-200 font-medium">LLTV</th>
                      <th className="text-right py-2 px-3 text-rating-a font-medium">Supply</th>
                      <th className="text-center py-2 px-1 text-lotus-grey-300">÷</th>
                      <th className="text-right py-2 px-3 text-rating-a-plus font-medium">Available</th>
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
                          <td className="py-2 px-3 text-right font-mono text-rating-a">{t.supplyAssets.toLocaleString()}</td>
                          <td className="text-center text-lotus-grey-300">÷</td>
                          <td className="py-2 px-3 text-right font-mono text-rating-a-plus">{t.availableSupply.toLocaleString()}</td>
                          <td className="text-center text-lotus-grey-300">=</td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-lotus-purple-200">{(supplyUtil * 100).toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-lotus-grey-400 mt-2">
                {tlContent.utilizationMetrics.supplyUtil.note}
              </p>
            </div>

            <div className="bg-rating-c-plus/20 rounded p-4 border border-rating-c-plus/30">
              <h4 className="font-medium text-rating-c-plus mb-3">{tlContent.utilizationMetrics.borrowUtil.heading}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rating-c-plus/30">
                      <th className="text-left py-2 px-3 text-lotus-grey-200 font-medium">LLTV</th>
                      <th className="text-center py-2 px-1 text-lotus-grey-300">1 −</th>
                      <th className="text-right py-2 px-3 text-rating-a-plus font-medium">Free Supply</th>
                      <th className="text-center py-2 px-1 text-lotus-grey-300">÷</th>
                      <th className="text-right py-2 px-3 text-rating-a font-medium">Jr Supply</th>
                      <th className="text-center py-2 px-1 text-lotus-grey-300">=</th>
                      <th className="text-right py-2 px-3 text-rating-c-plus font-medium">Borrow Util</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tranches.map((t) => {
                      const borrowUtil = t.jrSupply > 0 ? 1 - (t.freeSupply / t.jrSupply) : 0;
                      return (
                        <tr key={t.id} className="border-b border-rating-c-plus/20 hover:bg-rating-c-plus/20">
                          <td className="py-2 px-3 font-medium text-white">{t.lltv}%</td>
                          <td className="text-center text-lotus-grey-300">1 −</td>
                          <td className="py-2 px-3 text-right font-mono text-rating-a-plus">{t.freeSupply.toLocaleString()}</td>
                          <td className="text-center text-lotus-grey-300">÷</td>
                          <td className="py-2 px-3 text-right font-mono text-rating-a">{t.jrSupply.toLocaleString()}</td>
                          <td className="text-center text-lotus-grey-300">=</td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-rating-c-plus">{(borrowUtil * 100).toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-lotus-grey-400 mt-2">
                {tlContent.utilizationMetrics.borrowUtil.note}
              </p>
            </div>
          </div>
        </CollapsibleSection>

        <FailureModeCallout title={tlContent.failureMode.title}>
          <p>
            {tlContent.failureMode.description}
          </p>
        </FailureModeCallout>
      </DetailZone>
    </div>
  );
}

export default TrancheLiquidity;
