import { useState, useMemo } from 'react';
import { CollapsibleSection } from './ConceptExplainer';

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
  const [customAllocations, setCustomAllocations] = useState<{ [lltv: number]: number }>({
    75: 30,
    80: 25,
    85: 25,
    90: 15,
    95: 5,
  });
  const [useCustom, setUseCustom] = useState(false);

  const activeAllocations = useMemo(() => {
    if (useCustom) {
      return Object.entries(customAllocations).map(([lltv, percent]) => ({
        lltv: parseInt(lltv),
        percent,
      }));
    }
    const strategy = DEFAULT_STRATEGIES.find(s => s.name === selectedStrategy);
    return strategy?.allocations || [];
  }, [useCustom, customAllocations, selectedStrategy]);

  const totalAllocation = useMemo(() => {
    return activeAllocations.reduce((sum, a) => sum + a.percent, 0);
  }, [activeAllocations]);

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
    if (useCustom) {
      let score = 0;
      for (const allocation of activeAllocations) {
        const riskFactor = (allocation.lltv - 70) / 5;
        score += riskFactor * (allocation.percent / 100);
      }
      return Math.min(10, Math.max(0, score));
    }
    return DEFAULT_STRATEGIES.find(s => s.name === selectedStrategy)?.riskScore || 5;
  }, [useCustom, activeAllocations, selectedStrategy]);

  const handleAllocationChange = (lltv: number, value: number) => {
    setUseCustom(true);
    setCustomAllocations(prev => ({
      ...prev,
      [lltv]: Math.max(0, Math.min(100, value)),
    }));
  };

  const handleStrategySelect = (name: string) => {
    setSelectedStrategy(name);
    setUseCustom(false);
    const strategy = DEFAULT_STRATEGIES.find(s => s.name === name);
    if (strategy) {
      const newAllocations: { [lltv: number]: number } = {};
      strategy.allocations.forEach(a => {
        newAllocations[a.lltv] = a.percent;
      });
      setCustomAllocations(newAllocations);
    }
  };

  return (
    <div className="space-y-8">
      {/* What are Vaults */}
      <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50">
        <p className="text-sm text-lotus-purple-200">
          Vaults are smart contracts that aggregate user deposits and deploy them across tranches
          according to a strategy. Vault managers make allocation decisions so depositors can
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
            <p className="text-sm text-lotus-grey-400">
              Users deposit loan tokens (e.g., LotusUSD) into a vault and receive vault shares.
            </p>
          </div>

          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <div className="w-10 h-10 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="font-medium text-lotus-grey-100 mb-1">2. Allocate</h4>
            <p className="text-sm text-lotus-grey-400">
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
            <p className="text-sm text-lotus-grey-400">
              Interest earned accrues to the vault. Vault shares appreciate in value over time.
            </p>
          </div>
        </div>

        {/* Flow Diagram */}
        <div className="bg-lotus-grey-900/50 rounded-lg p-6 border border-lotus-grey-700">
          <div className="flex flex-col items-center gap-4">
            {/* Users -> Vault */}
            <div className="flex items-center gap-4 w-full justify-center">
              <div className="px-4 py-3 bg-blue-900/30 border border-blue-700 rounded-lg text-center">
                <div className="text-xs text-blue-400 mb-1">Users</div>
                <div className="font-mono text-blue-300 text-sm">Deposit LotusUSD</div>
              </div>
              <svg className="w-8 h-8 text-lotus-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="px-4 py-3 bg-lotus-purple-900/30 border border-lotus-purple-700 rounded-lg text-center">
                <div className="text-xs text-lotus-purple-400 mb-1">Vault</div>
                <div className="font-mono text-lotus-purple-300 text-sm">Aggregates Deposits</div>
              </div>
            </div>

            {/* Arrow down */}
            <svg className="w-6 h-6 text-lotus-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>

            {/* Vault Manager */}
            <div className="px-4 py-3 bg-amber-900/30 border border-amber-700 rounded-lg text-center">
              <div className="text-xs text-amber-400 mb-1">Vault Manager</div>
              <div className="font-mono text-amber-300 text-sm">Allocates to Tranches</div>
            </div>

            {/* Arrow down */}
            <svg className="w-6 h-6 text-lotus-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>

            {/* Tranches */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {[75, 80, 85, 90, 95].map((lltv, i) => {
                const colors = [
                  'bg-emerald-900/30 border-emerald-700 text-emerald-400',
                  'bg-emerald-900/30 border-emerald-700 text-emerald-400',
                  'bg-amber-900/30 border-amber-700 text-amber-400',
                  'bg-orange-900/30 border-orange-700 text-orange-400',
                  'bg-red-900/30 border-red-700 text-red-400',
                ];
                const labels = ['Senior', 'Senior', 'Mid', 'Junior', 'Junior'];
                return (
                  <div key={lltv} className={`px-3 py-2 rounded-lg border ${colors[i]}`}>
                    <div className="text-xs opacity-80">{labels[i]}</div>
                    <div className="font-mono text-sm">{lltv}% LLTV</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Selector */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Allocation Strategies</h3>
        <p className="text-lotus-grey-400 mb-6">
          Vault managers choose strategies based on risk tolerance. Select a strategy to see
          how it allocates across tranches.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {DEFAULT_STRATEGIES.map((strategy) => (
            <button
              key={strategy.name}
              onClick={() => handleStrategySelect(strategy.name)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedStrategy === strategy.name && !useCustom
                  ? 'bg-lotus-purple-900/30 border-lotus-purple-500'
                  : 'bg-lotus-grey-700/50 border-lotus-grey-600 hover:border-lotus-purple-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-lotus-grey-100">{strategy.name}</h4>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-3 rounded-sm ${
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
              <p className="text-xs text-lotus-grey-400">{strategy.description}</p>
            </button>
          ))}
        </div>

        {/* Allocation Sliders */}
        <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-lotus-grey-200">Tranche Allocations</h4>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-mono ${totalAllocation === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                Total: {totalAllocation}%
              </span>
              {totalAllocation !== 100 && (
                <span className="text-xs text-amber-400">(Should be 100%)</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {[75, 80, 85, 90, 95].map((lltv) => {
              const allocation = activeAllocations.find(a => a.lltv === lltv)?.percent || 0;
              const tranche = tranches.find(t => t.lltv === lltv);
              const supplyRate = tranche?.supplyRate !== null
                ? (productiveDebtRate + (tranche?.supplyRate || 0)) * 100
                : 0;

              return (
                <div key={lltv} className="flex items-center gap-4">
                  <span className="text-sm text-lotus-grey-400 w-20">{lltv}% LLTV</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={allocation}
                    onChange={(e) => handleAllocationChange(lltv, parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-lotus-grey-200 w-12 text-right">
                    {allocation}%
                  </span>
                  <span className="text-xs text-lotus-grey-500 w-20 text-right">
                    {supplyRate.toFixed(2)}% APY
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <div className="text-sm text-lotus-grey-400 mb-1">Expected APY</div>
            <div className="text-2xl font-mono font-medium text-emerald-400">
              {(expectedAPY * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-lotus-grey-500 mt-1">
              Weighted average of tranche supply rates
            </p>
          </div>

          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <div className="text-sm text-lotus-grey-400 mb-2">Risk Score</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-lotus-grey-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    riskScore <= 3 ? 'bg-emerald-500' : riskScore <= 6 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${riskScore * 10}%` }}
                />
              </div>
              <span className={`text-lg font-mono font-medium ${
                riskScore <= 3 ? 'text-emerald-400' : riskScore <= 6 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {riskScore.toFixed(1)}/10
              </span>
            </div>
            <p className="text-xs text-lotus-grey-500 mt-1">
              Higher allocation to junior tranches = higher risk
            </p>
          </div>
        </div>
      </div>

      {/* Vault Manager Role */}
      <CollapsibleSection
        title="The Vault Manager's Role"
        icon="🎯"
        description="How vault managers optimize allocations"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
              <h4 className="font-medium text-lotus-grey-100 mb-2">Monitor & Rebalance</h4>
              <ul className="text-sm text-lotus-grey-400 space-y-1">
                <li>Track tranche utilization and rates</li>
                <li>Rebalance when conditions change</li>
                <li>Move funds to higher-yielding tranches</li>
                <li>Reduce exposure during volatile periods</li>
              </ul>
            </div>

            <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
              <h4 className="font-medium text-lotus-grey-100 mb-2">Risk Management</h4>
              <ul className="text-sm text-lotus-grey-400 space-y-1">
                <li>Set allocation limits per tranche</li>
                <li>Monitor bad debt exposure</li>
                <li>Ensure liquidity for withdrawals</li>
                <li>Follow vault's risk parameters</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg">
            <p className="text-sm text-amber-300">
              <span className="font-medium">Key insight:</span> Vault managers earn management fees
              but are responsible for maintaining the vault's risk profile and optimizing returns.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Benefits */}
      <CollapsibleSection
        title="Why Use Vaults?"
        icon="✨"
        description="Benefits for depositors"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-lotus-grey-700/30 rounded-lg">
            <div className="w-8 h-8 bg-emerald-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-100 mb-1">Passive Yield</h4>
              <p className="text-sm text-lotus-grey-400">
                Earn optimized yield without actively managing positions across tranches.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-lotus-grey-700/30 rounded-lg">
            <div className="w-8 h-8 bg-emerald-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-100 mb-1">Diversification</h4>
              <p className="text-sm text-lotus-grey-400">
                Exposure spread across multiple tranches reduces concentration risk.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-lotus-grey-700/30 rounded-lg">
            <div className="w-8 h-8 bg-emerald-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-100 mb-1">Gas Efficiency</h4>
              <p className="text-sm text-lotus-grey-400">
                Single deposit/withdrawal instead of managing multiple tranche positions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-lotus-grey-700/30 rounded-lg">
            <div className="w-8 h-8 bg-emerald-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-100 mb-1">Professional Management</h4>
              <p className="text-sm text-lotus-grey-400">
                Vault managers have expertise in risk assessment and market timing.
              </p>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

export default Vaults;
