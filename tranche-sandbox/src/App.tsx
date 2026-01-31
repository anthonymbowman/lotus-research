import { useState, useMemo, useCallback } from 'react';
import type { TrancheInput } from './types';
import { computeAllTranches } from './math/lotusAccounting';
import { createDefaultTranches } from './presets';
import { ProductiveDebt } from './components/ProductiveDebt';
import { LotusUSDAllocation } from './components/LotusUSDAllocation';
import { TrancheLiquidity } from './components/TrancheLiquidity';

type TopLevelTab = 'productiveDebt' | 'liquidity';

function App() {
  // Top-level tab state
  const [activeTab, setActiveTab] = useState<TopLevelTab>('productiveDebt');

  // LotusUSD Allocation state
  const [treasuryAllocation, setTreasuryAllocation] = useState(0.8); // 80% default
  const [treasuryRate, setTreasuryRate] = useState(0.0375); // 3.75% default

  // Derived productive debt rate (used by Productive Debt scenarios)
  const productiveDebtRate = useMemo(() => {
    return treasuryRate * treasuryAllocation;
  }, [treasuryRate, treasuryAllocation]);

  // Liquidity Sandbox state
  const [tranches, setTranches] = useState<TrancheInput[]>(createDefaultTranches);

  // Productive Debt state
  const [spread, setSpread] = useState(0.02); // 2% default spread
  const [utilization, setUtilization] = useState(0.7);

  // Compute all derived values for liquidity sandbox
  const computedTranches = useMemo(() => {
    return computeAllTranches(tranches, false);
  }, [tranches]);

  // Handle tranche input changes
  const handleTrancheChange = useCallback((
    id: number,
    field: keyof TrancheInput,
    value: number
  ) => {
    setTranches(prev => prev.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Lotus Protocol Simulators
          </h1>
          <p className="text-slate-600 mt-1">
            Interactive tools for understanding Lotus's lending mechanics.
          </p>
        </div>

        {/* Top-level Tab Navigation */}
        <div className="flex border-b border-slate-300 mb-6">
          <button
            onClick={() => setActiveTab('productiveDebt')}
            className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'productiveDebt'
                ? 'border-emerald-600 text-emerald-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Productive Debt
          </button>
          <button
            onClick={() => setActiveTab('liquidity')}
            className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'liquidity'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Tranche Liquidity
          </button>
        </div>

        {/* Productive Debt (combined with LotusUSD) */}
        {activeTab === 'productiveDebt' && (
          <>
            {/* LotusUSD Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">LotusUSD Backing</h2>
              <p className="text-slate-600 mb-4">
                LotusUSD generates yield through US Treasury allocation, creating the base rate for productive debt.
              </p>

              <LotusUSDAllocation
                treasuryAllocation={treasuryAllocation}
                treasuryRate={treasuryRate}
                onTreasuryAllocationChange={setTreasuryAllocation}
                onTreasuryRateChange={setTreasuryRate}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-slate-300 my-8"></div>

            {/* Productive Debt Section */}
            <div>
              <p className="text-slate-600 mb-4">
                See how the base rate from LotusUSD improves lending economics through spread compression and reduced rate volatility.
              </p>

              <ProductiveDebt
                baseRate={productiveDebtRate}
                spread={spread}
                utilization={utilization}
                onSpreadChange={setSpread}
                onUtilizationChange={setUtilization}
              />
            </div>

            {/* Navigation hint */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600">
                <strong>Next:</strong> Explore the tranche accounting model in{' '}
                <button
                  onClick={() => setActiveTab('liquidity')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Tranche Liquidity
                </button>
              </p>
            </div>
          </>
        )}

        {/* Liquidity Sandbox */}
        {activeTab === 'liquidity' && (
          <>
            {/* Description */}
            <p className="text-slate-600 mb-4">
              Explore how Lotus's connected-liquidity model distributes supply across tranches ordered by LLTV.
            </p>

            <TrancheLiquidity
              tranches={computedTranches}
              productiveDebtRate={productiveDebtRate}
              onTrancheChange={handleTrancheChange}
            />
          </>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>
            This simulator is for educational purposes only.
            See the{' '}
            <a
              href="https://docs.lotus.finance"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              Lotus documentation
            </a>{' '}
            for complete technical details.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
