import { useState, useMemo } from 'react';
import { DynamicInsight } from './DynamicInsight';
import { TermDefinition } from './TermDefinition';
import { ContextZone } from './ContextZone';
import { InteractiveZone } from './InteractiveZone';
import { DetailZone } from './DetailZone';
import { AppCTA } from './AppCTA';
import { analytics } from '../analytics';
import { content } from '../content';

const { vaults: vContent } = content;

interface VaultsProps {
  tranches: { lltv: number; supplyRate: number | null; borrowRate: number }[];
  productiveDebtRate: number;
}

interface AllocationStrategy {
  name: string;
  description: string;
  allocations: { lltv: number; percent: number }[];
  riskScore: number;
}

interface LaunchMarket {
  title: string;
  subtitle: string;
  logo: string;
}

const DEFAULT_STRATEGIES: AllocationStrategy[] = [
  {
    name: vContent.strategies.conservative.name,
    description: vContent.strategies.conservative.description,
    allocations: [
      { lltv: 75, percent: 60 },
      { lltv: 80, percent: 20 },
      { lltv: 85, percent: 15 },
      { lltv: 90, percent: 5 },
      { lltv: 95, percent: 0 },
    ],
    riskScore: 2,
  },
  {
    name: vContent.strategies.balanced.name,
    description: vContent.strategies.balanced.description,
    allocations: [
      { lltv: 75, percent: 30 },
      { lltv: 80, percent: 25 },
      { lltv: 85, percent: 25 },
      { lltv: 90, percent: 15 },
      { lltv: 95, percent: 5 },
    ],
    riskScore: 5,
  },
  {
    name: vContent.strategies.boost.name,
    description: vContent.strategies.boost.description,
    allocations: [
      { lltv: 75, percent: 10 },
      { lltv: 80, percent: 15 },
      { lltv: 85, percent: 25 },
      { lltv: 90, percent: 30 },
      { lltv: 95, percent: 20 },
    ],
    riskScore: 8,
  },
];

const LAUNCH_MARKETS: LaunchMarket[] = [
  {
    title: 'ETH / USD',
    subtitle: 'wstETH/LotusUSD',
    logo: 'wstETH.png',
  },
  {
    title: 'BTC / USD',
    subtitle: 'cbBTC/LotusUSD',
    logo: 'cbBTC.png',
  },
];

export function Vaults({ tranches, productiveDebtRate }: VaultsProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('Balanced');

  const activeAllocations = useMemo(() => {
    const strategy = DEFAULT_STRATEGIES.find(s => s.name === selectedStrategy);
    return strategy?.allocations || [];
  }, [selectedStrategy]);

  const expectedAPY = useMemo(() => {
    let weightedRate = 0;
    for (const allocation of activeAllocations) {
      const tranche = tranches.find(t => t.lltv === allocation.lltv);
      if (tranche && tranche.supplyRate !== null) {
        const totalRate = productiveDebtRate + tranche.supplyRate;
        weightedRate += totalRate * (allocation.percent / 100);
      }
    }
    return weightedRate;
  }, [activeAllocations, tranches, productiveDebtRate]);

  const riskScore = useMemo(() => {
    return DEFAULT_STRATEGIES.find(s => s.name === selectedStrategy)?.riskScore || 5;
  }, [selectedStrategy]);

  const riskLabel = useMemo(() => {
    if (riskScore <= 3) return vContent.riskLabels.low;
    if (riskScore <= 6) return vContent.riskLabels.medium;
    return vContent.riskLabels.high;
  }, [riskScore]);

  const handleStrategySelect = (name: string) => {
    analytics.strategySelected(name);
    setSelectedStrategy(name);
  };

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════════════════
          CONTEXT ZONE - Minimal context above the fold
          ═══════════════════════════════════════════════════════════════════ */}
      <ContextZone
        context="Vaults simplify lending by automatically allocating your deposits across tranches. Choose a risk strategy and see expected returns."
        whatYoullLearn={['Risk-return tradeoffs', 'Auto-allocation', 'Expected yields']}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          INTERACTIVE ZONE - The main event (Strategy Selector)
          ═══════════════════════════════════════════════════════════════════ */}
      <InteractiveZone
        tryThis={vContent.pageHeader.tryThis}
        title="Strategy Simulator"
      >
        <div className="space-y-6">
        <p className="text-lotus-grey-300">
          {vContent.strategies.description}
        </p>

        {/* Strategy Cards with Visual Allocation Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {DEFAULT_STRATEGIES.map((strategy) => {
            const isSelected = selectedStrategy === strategy.name;
            const strategyAPY = strategy.allocations.reduce((acc, alloc) => {
              const tranche = tranches.find(t => t.lltv === alloc.lltv);
              if (tranche && tranche.supplyRate !== null) {
                const totalRate = productiveDebtRate + tranche.supplyRate;
                return acc + totalRate * (alloc.percent / 100);
              }
              return acc;
            }, 0);

            return (
              <button
                key={strategy.name}
                onClick={() => handleStrategySelect(strategy.name)}
                className={`p-6 rounded border-2 text-left transition-all ${
                  isSelected
                    ? 'bg-lotus-purple-900/30 border-lotus-purple-500 shadow-lg shadow-lotus-purple-500/20'
                    : 'bg-lotus-grey-700/30 border-lotus-grey-700 hover:border-lotus-purple-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-lotus-grey-100">{strategy.name}</h4>
                  {isSelected && (
                    <div className="w-6 h-6 bg-lotus-purple-500 rounded-sm flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Expected APY prominently displayed */}
                <div className="mb-4">
                  <div className="text-2xl font-mono font-bold text-rating-a">
                    {(strategyAPY * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-lotus-grey-300">{vContent.expectedApyLabel}</div>
                </div>

                {/* Visual allocation bar */}
                <div className="mb-3">
                  <div className="flex h-4 rounded overflow-hidden">
                    {strategy.allocations.map((alloc, i) => {
                      const colors = ['bg-rating-a-plus', 'bg-rating-a', 'bg-rating-b', 'bg-rating-c-plus', 'bg-rating-c'];
                      if (alloc.percent === 0) return null;
                      return (
                        <div
                          key={alloc.lltv}
                          className={`${colors[i]} transition-all`}
                          style={{ width: `${alloc.percent}%` }}
                          title={`${alloc.lltv}% LLTV: ${alloc.percent}%`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Risk indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-lotus-grey-300">Risk</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                      strategy.riskScore <= 3 ? 'text-rating-a' : strategy.riskScore <= 6 ? 'text-rating-b' : 'text-rating-d'
                    }`}>
                      {strategy.riskScore <= 3 ? 'Low' : strategy.riskScore <= 6 ? 'Medium' : 'High'}
                    </span>
                    <div className="flex items-center gap-1" aria-label={`Risk level ${strategy.riskScore} out of 10`}>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-sm ${
                            i < strategy.riskScore
                              ? strategy.riskScore <= 3
                                ? 'bg-rating-a'
                                : strategy.riskScore <= 6
                                ? 'bg-rating-b'
                                : 'bg-rating-d'
                              : 'bg-lotus-grey-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-lotus-grey-300 mt-3">{strategy.description}</p>
              </button>
            );
          })}
        </div>

        {/* Detailed Allocation View */}
        <div className="bg-lotus-grey-900 rounded p-6 border border-lotus-grey-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-semibold text-lotus-grey-100 mb-1">
                {vContent.breakdownTitle(selectedStrategy)}
              </h4>
              <p className="text-xs text-lotus-grey-300">{vContent.breakdownSubtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded text-sm font-mono font-semibold bg-lotus-grey-700 text-lotus-grey-300 border border-lotus-grey-600">
                100% allocated
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {[75, 80, 85, 90, 95].map((lltv, i) => {
              const allocation = activeAllocations.find(a => a.lltv === lltv)?.percent || 0;
              const tranche = tranches.find(t => t.lltv === lltv);
              const supplyRate = tranche?.supplyRate !== null
                ? (productiveDebtRate + (tranche?.supplyRate || 0)) * 100
                : 0;
              const barColors = ['bg-rating-a-plus', 'bg-rating-a', 'bg-rating-b', 'bg-rating-c-plus', 'bg-rating-c'];
              const textColors = ['text-rating-a-plus', 'text-rating-a', 'text-rating-b', 'text-rating-c-plus', 'text-rating-c'];
              const labels = ['Senior', 'Senior', 'Mid', 'Junior', 'Junior'];

              return (
                <div key={lltv} className="flex items-center gap-4">
                  <div className="w-20">
                    <div className={`text-sm font-medium ${textColors[i]}`}>{lltv}%</div>
                    <div className="text-xs text-lotus-grey-400">{labels[i]}</div>
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-lotus-grey-700 rounded overflow-hidden">
                      <div
                        className={`h-full ${barColors[i]} transition-all flex items-center justify-end pr-2`}
                        style={{ width: `${allocation}%` }}
                      >
                        {allocation > 10 && (
                          <span className="text-xs font-mono font-semibold text-lotus-grey-900">{allocation}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {allocation <= 10 && (
                    <div className="w-12 text-left">
                      <span className="text-sm font-mono font-semibold text-lotus-grey-300">{allocation}%</span>
                    </div>
                  )}
                  <div className="w-20 text-right">
                    <span className="text-sm font-mono text-rating-a">{supplyRate.toFixed(2)}%</span>
                    <div className="text-xs text-lotus-grey-400">APY</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Insight for High Risk */}
        <DynamicInsight show={riskScore > 7} variant="warning">
          <strong>High Risk Allocation:</strong> {vContent.insights.highRisk.replace('High Risk Allocation: ', '')}
        </DynamicInsight>

        <DynamicInsight show={riskScore <= 3 && expectedAPY > 0} variant="success">
          <strong>Core Approach:</strong> {vContent.insights.conservative.replace('Core Approach: ', '')}
        </DynamicInsight>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-rating-a/15 rounded p-6 border border-rating-a/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-rating-a/20 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-rating-a" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-rating-a">{vContent.expectedApyLabel}</div>
                <div className="text-3xl font-mono font-bold text-rating-a">
                  {(expectedAPY * 100).toFixed(2)}%
                </div>
              </div>
            </div>
            <p className="text-xs text-rating-a/60">
              {vContent.expectedApyNote}
            </p>
          </div>

          <div className="bg-lotus-grey-900 rounded p-6 border border-lotus-grey-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-lotus-grey-700 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-lotus-grey-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
            <div className="text-sm text-lotus-grey-300">{vContent.riskScoreLabel}</div>
            <div className={`text-3xl font-mono font-bold ${
              riskScore <= 3 ? 'text-rating-a' : riskScore <= 6 ? 'text-rating-b' : 'text-rating-d'
            }`}>
              {riskScore.toFixed(1)}/10
            </div>
            <div className="text-xs text-lotus-grey-400 mt-1">Overall risk: {riskLabel}</div>
          </div>
            </div>
            <div className="h-3 bg-lotus-grey-700 rounded overflow-hidden">
              <div
                className={`h-full transition-all ${
                  riskScore <= 3 ? 'bg-rating-a' : riskScore <= 6 ? 'bg-rating-b' : 'bg-rating-d'
                }`}
                style={{ width: `${riskScore * 10}%` }}
              />
            </div>
          </div>
        </div>
        </div>
      </InteractiveZone>

      {/* ═══════════════════════════════════════════════════════════════════
          DETAIL ZONE - Below the fold, for those who want to go deeper
          ═══════════════════════════════════════════════════════════════════ */}
      <DetailZone
        title="How Vaults Work"
        teaserItems={['Deposit Flow', 'Vault Manager Role', 'Launch Markets']}
      >
        {/* How Vaults Work */}
        <div className="bg-lotus-grey-900 rounded p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">{vContent.howVaultsWork.heading}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {vContent.howVaultsWork.steps.map((step, i) => (
            <div key={i} className="bg-lotus-grey-900 rounded p-4 border border-lotus-grey-700">
              <div className="w-10 h-10 bg-lotus-purple-900/50 rounded flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {i === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />}
                  {i === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                  {i === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                </svg>
              </div>
              <h4 className="font-medium text-lotus-grey-100 mb-1">{step.title}</h4>
              <p className="text-sm text-lotus-grey-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded border border-rating-b/50 bg-rating-b/10 p-3 text-xs text-rating-b">
          {vContent.howVaultsWork.withdrawalWarning}
        </div>

        {/* Flow Diagram - Vertical Layout */}
        <div className="bg-lotus-grey-900 rounded p-6 border border-lotus-grey-700">
          <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
            {/* Step 1: User Deposits USDC */}
            <div className="w-full bg-lotus-purple-900/30 border-2 border-lotus-purple-600 rounded p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-6 h-6 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-lg font-semibold text-lotus-purple-300">{vContent.howVaultsWork.flowDiagram.userDeposit}</span>
              </div>
              <p className="text-sm text-lotus-purple-200/70">{vContent.howVaultsWork.flowDiagram.autoConverted}</p>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-lotus-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Step 2: Vault */}
            <div className="w-full bg-lotus-purple-900/30 border-2 border-lotus-purple-600 rounded p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-6 h-6 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span className="text-lg font-semibold text-lotus-purple-300">{vContent.howVaultsWork.flowDiagram.vault}</span>
              </div>
              <p className="text-sm text-lotus-purple-200/70">{vContent.howVaultsWork.flowDiagram.aggregates}</p>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-lotus-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Step 3: Vault Manager */}
            <div className="w-full bg-rating-b/10 border-2 border-rating-b rounded p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-6 h-6 text-rating-b" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-lg font-semibold text-rating-b">{vContent.howVaultsWork.flowDiagram.vaultManager}</span>
              </div>
              <p className="text-sm text-rating-b/70">{vContent.howVaultsWork.flowDiagram.allocates}</p>
              <p className="text-xs text-rating-b/50 mt-1">{vContent.howVaultsWork.flowDiagram.rolesNote}</p>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-lotus-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Step 4: Tranches */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-rating-a-plus"><TermDefinition term="tranche-seniority">Senior</TermDefinition> {vContent.howVaultsWork.flowDiagram.seniorLabel.replace('Senior ', '')}</span>
                <span className="text-sm font-medium text-rating-c">{vContent.howVaultsWork.flowDiagram.juniorLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                {[75, 80, 85, 90, 95].map((lltv, i) => {
                  const colors = [
                    'bg-rating-a-plus/20 border-rating-a-plus',
                    'bg-rating-a/20 border-rating-a',
                    'bg-rating-b/20 border-rating-b',
                    'bg-rating-c-plus/20 border-rating-c-plus',
                    'bg-rating-c/20 border-rating-c',
                  ];
                  const textColors = ['text-rating-a-plus', 'text-rating-a', 'text-rating-b', 'text-rating-c-plus', 'text-rating-c'];
                  return (
                    <div key={lltv} className={`flex-1 py-3 rounded border-2 text-center ${colors[i]}`}>
                      <div className={`font-mono font-semibold ${textColors[i]}`}>{lltv}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="text-xs text-lotus-grey-400 mt-4 text-center">
            {vContent.howVaultsWork.flowDiagram.footnote}
          </p>
        </div>
      </div>

        {/* Launch Markets */}
        <div className="bg-lotus-grey-900 rounded p-6 border border-lotus-grey-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-lotus-grey-100">{vContent.launchMarkets.heading}</h3>
            <span className="text-xs text-lotus-grey-500 uppercase tracking-wide">{vContent.launchMarkets.badge}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LAUNCH_MARKETS.map((market) => (
              <div
                key={market.title}
                className="bg-lotus-grey-900 rounded p-4 border border-lotus-grey-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-sm bg-lotus-grey-900 border border-lotus-grey-700 flex items-center justify-center overflow-hidden">
                    <img
                      src={`${import.meta.env.BASE_URL}${market.logo}`}
                      alt={market.title}
                      className="w-9 h-9 object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-lotus-grey-100">{market.title}</div>
                    <div className="text-xs text-lotus-grey-400">{market.subtitle}</div>
                  </div>
                </div>
                <div className="text-[10px] text-lotus-grey-500 uppercase tracking-wide">Launch</div>
              </div>
            ))}
          </div>
        </div>
      </DetailZone>

      {/* CTA */}
      <AppCTA context="vaults" />
    </div>
  );
}

export default Vaults;
