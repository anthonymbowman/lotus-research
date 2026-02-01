import { useState, useMemo } from 'react';
import { TeachingPrompt } from './TeachingPrompt';
import { DynamicInsight } from './DynamicInsight';
import { TermDefinition } from './TermDefinition';

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

const DEFAULT_STRATEGIES: AllocationStrategy[] = [
  {
    name: 'Conservative',
    description: 'Prioritizes capital preservation with majority allocation to senior tranches.',
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
    name: 'Balanced',
    description: 'Balanced exposure across tranches for moderate risk/reward.',
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
    name: 'Aggressive',
    description: 'Maximizes yield by concentrating in junior tranches.',
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

  const handleStrategySelect = (name: string) => {
    setSelectedStrategy(name);
  };

  return (
    <div className="space-y-8">
      {/* Context from Prior Learning */}
      <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-emerald-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-emerald-200">
              <strong>You now understand:</strong> How LotusUSD backing generates yield, how tranches offer different risk/reward profiles,
              how liquidity and interest cascade through the system, and how bad debt is absorbed.
              Now you're ready to see how vaults help you allocate across these tranches.
            </p>
          </div>
        </div>
      </div>

      {/* What are Vaults */}
      <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50">
        <p className="text-sm text-lotus-purple-200">
          Vaults are smart contracts that aggregate user deposits and deploy them across tranches
          according to a strategy. <TermDefinition term="vault-manager">Vault managers</TermDefinition> make allocation decisions so depositors can
          earn yield without actively managing positions.
        </p>
      </div>

      {/* How Vaults Work */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">How Vaults Work</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <div className="w-10 h-10 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h4 className="font-medium text-lotus-grey-100 mb-1">1. Deposit</h4>
            <p className="text-sm text-lotus-grey-300">
              Users deposit USDC into a vault and receive vault shares representing their position.
            </p>
          </div>

          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <div className="w-10 h-10 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="font-medium text-lotus-grey-100 mb-1">2. Allocate</h4>
            <p className="text-sm text-lotus-grey-300">
              Vault manager allocates deposits across tranches based on the vault's strategy.
            </p>
          </div>

          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <div className="w-10 h-10 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-lotus-grey-100 mb-1">3. Earn Yield</h4>
            <p className="text-sm text-lotus-grey-300">
              Interest earned accrues to the vault. Vault shares appreciate in value over time.
            </p>
          </div>
        </div>

        {/* Flow Diagram - Vertical Layout */}
        <div className="bg-lotus-grey-900/50 rounded-lg p-6 border border-lotus-grey-700">
          <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
            {/* Step 1: User Deposits USDC */}
            <div className="w-full bg-blue-900/30 border-2 border-blue-600 rounded-xl p-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-lg font-semibold text-blue-300">User Deposits USDC</span>
              </div>
              <p className="text-sm text-blue-200/70">Auto-converted to LotusUSD</p>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-lotus-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Step 2: Vault */}
            <div className="w-full bg-lotus-purple-900/30 border-2 border-lotus-purple-600 rounded-xl p-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-6 h-6 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span className="text-lg font-semibold text-lotus-purple-300">Vault</span>
              </div>
              <p className="text-sm text-lotus-purple-200/70">Aggregates all deposits</p>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-lotus-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Step 3: Vault Manager */}
            <div className="w-full bg-amber-900/30 border-2 border-amber-600 rounded-xl p-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-lg font-semibold text-amber-300">Vault Manager</span>
              </div>
              <p className="text-sm text-amber-200/70">Allocates across tranches</p>
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
                <span className="text-sm font-medium text-emerald-400"><TermDefinition term="tranche-seniority">Senior</TermDefinition> (Lower Risk)</span>
                <span className="text-sm font-medium text-red-400">Junior (Higher Yield)</span>
              </div>
              <div className="flex items-center gap-2">
                {[75, 80, 85, 90, 95].map((lltv, i) => {
                  const colors = [
                    'bg-emerald-900/40 border-emerald-600',
                    'bg-emerald-900/30 border-emerald-700',
                    'bg-amber-900/30 border-amber-700',
                    'bg-orange-900/30 border-orange-700',
                    'bg-red-900/30 border-red-700',
                  ];
                  const textColors = ['text-emerald-300', 'text-emerald-400', 'text-amber-400', 'text-orange-400', 'text-red-400'];
                  return (
                    <div key={lltv} className={`flex-1 py-3 rounded-lg border-2 text-center ${colors[i]}`}>
                      <div className={`font-mono font-semibold ${textColors[i]}`}>{lltv}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Selector */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Allocation Strategies</h3>
        <p className="text-lotus-grey-300 mb-4">
          Vault managers choose strategies based on risk tolerance. Click a strategy to see its allocation breakdown.
        </p>

        <TeachingPrompt>
          Click each strategy card to see how the allocation, APY, and risk level change.
        </TeachingPrompt>

        <div className="h-4" />

        {/* Strategy Cards with Visual Allocation Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'bg-lotus-purple-900/30 border-lotus-purple-500 shadow-lg shadow-lotus-purple-500/20'
                    : 'bg-lotus-grey-700/30 border-lotus-grey-600 hover:border-lotus-purple-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-lotus-grey-100">{strategy.name}</h4>
                  {isSelected && (
                    <div className="w-6 h-6 bg-lotus-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Expected APY prominently displayed */}
                <div className="mb-4">
                  <div className="text-2xl font-mono font-bold text-emerald-400">
                    {(strategyAPY * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-lotus-grey-300">Expected APY</div>
                </div>

                {/* Visual allocation bar */}
                <div className="mb-3">
                  <div className="flex h-4 rounded-lg overflow-hidden">
                    {strategy.allocations.map((alloc, i) => {
                      const colors = ['bg-emerald-500', 'bg-emerald-400', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'];
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
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < strategy.riskScore
                            ? strategy.riskScore <= 3
                              ? 'bg-emerald-500'
                              : strategy.riskScore <= 6
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                            : 'bg-lotus-grey-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-lotus-grey-300 mt-3">{strategy.description}</p>
              </button>
            );
          })}
        </div>

        {/* Detailed Allocation View */}
        <div className="bg-lotus-grey-700/50 rounded-xl p-5 border border-lotus-grey-600">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="font-semibold text-lotus-grey-100 mb-1">
                {selectedStrategy} Strategy Breakdown
              </h4>
              <p className="text-xs text-lotus-grey-300">Allocation across tranches</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-lg text-sm font-mono font-semibold bg-emerald-900/30 text-emerald-400 border border-emerald-700">
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
              const barColors = ['bg-emerald-500', 'bg-emerald-400', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'];
              const textColors = ['text-emerald-400', 'text-emerald-400', 'text-amber-400', 'text-orange-400', 'text-red-400'];
              const labels = ['Senior', 'Senior', 'Mid', 'Junior', 'Junior'];

              return (
                <div key={lltv} className="flex items-center gap-4">
                  <div className="w-20">
                    <div className={`text-sm font-medium ${textColors[i]}`}>{lltv}%</div>
                    <div className="text-xs text-lotus-grey-400">{labels[i]}</div>
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-lotus-grey-700 rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${barColors[i]} transition-all flex items-center justify-end pr-2`}
                        style={{ width: `${allocation}%` }}
                      >
                        {allocation > 10 && (
                          <span className="text-xs font-mono font-semibold text-white">{allocation}%</span>
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
                    <span className="text-sm font-mono text-emerald-400">{supplyRate.toFixed(2)}%</span>
                    <div className="text-xs text-lotus-grey-400">APY</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Insight for High Risk */}
        <DynamicInsight show={riskScore > 7} variant="warning">
          <strong>High Risk Allocation:</strong> With a risk score above 7, this strategy concentrates heavily in junior tranches. While yields are higher, these tranches absorb losses first during bad debt events.
        </DynamicInsight>

        <DynamicInsight show={riskScore <= 3 && expectedAPY > 0} variant="success">
          <strong>Conservative Approach:</strong> This allocation prioritizes capital preservation. Senior tranches have larger liquidation buffers and are last to absorb bad debt.
        </DynamicInsight>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-emerald-900/20 rounded-xl p-5 border border-emerald-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-emerald-400">Expected APY</div>
                <div className="text-3xl font-mono font-bold text-emerald-300">
                  {(expectedAPY * 100).toFixed(2)}%
                </div>
              </div>
            </div>
            <p className="text-xs text-emerald-200/60">
              Weighted average of tranche supply rates based on your allocation
            </p>
          </div>

          <div className="bg-lotus-grey-700/30 rounded-xl p-5 border border-lotus-grey-600">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-lotus-grey-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-lotus-grey-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-lotus-grey-300">Risk Score</div>
                <div className={`text-3xl font-mono font-bold ${
                  riskScore <= 3 ? 'text-emerald-400' : riskScore <= 6 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {riskScore.toFixed(1)}/10
                </div>
              </div>
            </div>
            <div className="h-3 bg-lotus-grey-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  riskScore <= 3 ? 'bg-emerald-500' : riskScore <= 6 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${riskScore * 10}%` }}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Vaults;
