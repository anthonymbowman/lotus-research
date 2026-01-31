import { useState, useMemo, useCallback, useEffect } from 'react';
import type { TrancheInput } from './types';
import { computeAllTranches } from './math/lotusAccounting';
import { createDefaultTranches } from './presets';
import { Sidebar, type Section } from './components/Sidebar';
import { SectionWrapper } from './components/SectionWrapper';
import { GuidedTour } from './components/GuidedTour';
import { WelcomeModal } from './components/WelcomeModal';
import { Introduction } from './components/Introduction';
import { ProductiveDebt } from './components/ProductiveDebt';
import { LotusUSDAllocation } from './components/LotusUSDAllocation';
import { TrancheLiquidity } from './components/TrancheLiquidity';
import { Liquidations } from './components/Liquidations';
import { InterestSimulator } from './components/InterestSimulator';
import { IsolatedComparison } from './components/IsolatedComparison';
import { FundingMatrix } from './components/FundingMatrix';
import { RateChart } from './components/RateChart';
import { Vaults } from './components/Vaults';

const STORAGE_KEY = 'lotus-docs-visited';
const TOUR_KEY = 'lotus-docs-tour-completed';

function App() {
  // Navigation state
  const [activeSection, setActiveSection] = useState<Section>('intro');
  const [visitedSections, setVisitedSections] = useState<Set<Section>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set<Section>();
  });

  // Tour state
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem(TOUR_KEY);
  });
  const [showTour, setShowTour] = useState(false);

  // LotusUSD Allocation state
  const [treasuryAllocation, setTreasuryAllocation] = useState(0.8);
  const [treasuryRate, setTreasuryRate] = useState(0.0375);

  // Derived productive debt rate
  const productiveDebtRate = useMemo(() => {
    return treasuryRate * treasuryAllocation;
  }, [treasuryRate, treasuryAllocation]);

  // Liquidity Sandbox state
  const [tranches, setTranches] = useState<TrancheInput[]>(createDefaultTranches);

  // Productive Debt state
  const [spread, setSpread] = useState(0.02);
  const [utilization, setUtilization] = useState(0.7);

  // Compute all derived values
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

  // Navigation handler
  const handleSectionChange = useCallback((section: Section) => {
    setActiveSection(section);
    setVisitedSections(prev => {
      const updated = new Set(prev);
      updated.add(section);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...updated]));
      return updated;
    });
    // Update URL hash
    window.location.hash = section;
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle URL hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Section;
      if (hash && ['intro', 'vaults', 'lotususd', 'productive-debt', 'tranches', 'interest-cascade', 'liquidations', 'advanced'].includes(hash)) {
        setActiveSection(hash);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Mark intro as visited on load
  useEffect(() => {
    if (!visitedSections.has('intro')) {
      handleSectionChange('intro');
    }
  }, []);

  // Tour handlers
  const handleStartTour = () => {
    setShowWelcome(false);
    setShowTour(true);
  };

  const handleSkipTour = () => {
    setShowWelcome(false);
    localStorage.setItem(TOUR_KEY, 'true');
  };

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem(TOUR_KEY, 'true');
  };

  // Section content mapping
  const sectionMeta: Record<Section, { number: string; title: string; subtitle: string; learningPoints: string[]; next?: { id: Section; label: string } }> = {
    intro: {
      number: '1',
      title: 'Introduction',
      subtitle: 'Get started with Lotus Protocol',
      learningPoints: [
        'What Lotus Protocol is and how it works',
        'Key concepts: tranches, connected liquidity, productive debt',
        'How to navigate this documentation',
      ],
      next: { id: 'vaults', label: 'Vaults' },
    },
    vaults: {
      number: '2',
      title: 'Vaults',
      subtitle: 'Aggregated yield strategies',
      learningPoints: [
        'How vaults aggregate user deposits',
        'Vault manager allocation strategies',
        'Risk/reward trade-offs across strategies',
      ],
      next: { id: 'lotususd', label: 'LotusUSD' },
    },
    lotususd: {
      number: '3',
      title: 'LotusUSD',
      subtitle: 'Understanding treasury backing and base rates',
      learningPoints: [
        'How LotusUSD is backed by USDC and US Treasuries',
        'How the treasury allocation generates yield',
        'The productive debt rate calculation',
      ],
      next: { id: 'productive-debt', label: 'Productive Debt' },
    },
    'productive-debt': {
      number: '4',
      title: 'Productive Debt',
      subtitle: 'Benefits of treasury-backed lending',
      learningPoints: [
        'How the base rate benefits lenders and borrowers',
        'Spread compression mechanics',
        'Reduced rate volatility',
      ],
      next: { id: 'tranches', label: 'Tranches & Liquidity' },
    },
    tranches: {
      number: '5',
      title: 'Tranches & Liquidity',
      subtitle: 'The connected liquidity model',
      learningPoints: [
        'What tranches are and how they work',
        'Junior vs senior metrics',
        'Utilization calculations',
      ],
      next: { id: 'interest-cascade', label: 'Interest Cascade' },
    },
    'interest-cascade': {
      number: '6',
      title: 'Interest Cascade',
      subtitle: 'How interest flows through tranches',
      learningPoints: [
        'The cascade mechanism explained',
        'How supply rates are calculated',
        'Time-based interest accrual simulation',
      ],
      next: { id: 'liquidations', label: 'Liquidations' },
    },
    liquidations: {
      number: '7',
      title: 'Liquidations',
      subtitle: 'Understanding liquidation mechanics',
      learningPoints: [
        'What triggers liquidation',
        'Per-tranche liquidation thresholds',
        'Health factor calculator for all tranches',
        'Bad debt cascade and simulation',
      ],
      next: { id: 'advanced', label: 'Advanced Tools' },
    },
    advanced: {
      number: '8',
      title: 'Advanced Tools',
      subtitle: 'Deep dives and comparisons',
      learningPoints: [
        'Lotus vs Isolated Markets comparison',
        'Funding matrix visualization',
      ],
    },
  };

  const currentMeta = sectionMeta[activeSection];

  return (
    <div className="min-h-screen bg-lotus-grey-900">
      {/* Welcome Modal */}
      {showWelcome && (
        <WelcomeModal
          onStartTour={handleStartTour}
          onSkip={handleSkipTour}
        />
      )}

      {/* Guided Tour */}
      {showTour && (
        <GuidedTour onComplete={handleTourComplete} />
      )}

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        visitedSections={visitedSections}
      />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
          <SectionWrapper
            id={activeSection}
            number={currentMeta.number}
            title={currentMeta.title}
            subtitle={currentMeta.subtitle}
            learningPoints={currentMeta.learningPoints}
            nextSection={currentMeta.next}
            onNavigate={handleSectionChange}
          >
            {/* Section 1: Introduction */}
            {activeSection === 'intro' && (
              <Introduction onNavigate={handleSectionChange} />
            )}

            {/* Section 2: Vaults */}
            {activeSection === 'vaults' && (
              <Vaults
                tranches={computedTranches.map(t => ({
                  lltv: t.lltv,
                  supplyRate: t.supplyRate,
                  borrowRate: t.borrowRate,
                }))}
                productiveDebtRate={productiveDebtRate}
              />
            )}

            {/* Section 3: LotusUSD */}
            {activeSection === 'lotususd' && (
              <LotusUSDAllocation
                treasuryAllocation={treasuryAllocation}
                treasuryRate={treasuryRate}
                onTreasuryAllocationChange={setTreasuryAllocation}
                onTreasuryRateChange={setTreasuryRate}
              />
            )}

            {/* Section 4: Productive Debt */}
            {activeSection === 'productive-debt' && (
              <ProductiveDebt
                baseRate={productiveDebtRate}
                spread={spread}
                utilization={utilization}
                onSpreadChange={setSpread}
                onUtilizationChange={setUtilization}
              />
            )}

            {/* Section 5: Tranches & Liquidity */}
            {activeSection === 'tranches' && (
              <TrancheLiquidity
                tranches={computedTranches}
                productiveDebtRate={productiveDebtRate}
                onTrancheChange={handleTrancheChange}
              />
            )}

            {/* Section 6: Interest Cascade */}
            {activeSection === 'interest-cascade' && (
              <div className="space-y-8">
                <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
                  <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Interest Accrual Simulation</h3>
                  <p className="text-lotus-grey-400 mb-6">
                    See how interest flows through tranches over different time periods.
                    The cascade mechanism allocates interest based on supply utilization at each level.
                  </p>
                  <InterestSimulator tranches={computedTranches} productiveDebtRate={productiveDebtRate} />
                </div>

                <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
                  <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Rates by LLTV</h3>
                  <RateChart tranches={computedTranches} productiveDebtRate={productiveDebtRate} />
                </div>
              </div>
            )}

            {/* Section 7: Liquidations */}
            {activeSection === 'liquidations' && (
              <Liquidations
                tranches={computedTranches.map(t => ({ lltv: t.lltv }))}
                computedTranches={computedTranches}
              />
            )}

            {/* Section 8: Advanced Tools */}
            {activeSection === 'advanced' && (
              <div className="space-y-8">
                <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
                  <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Lotus vs Isolated Markets</h3>
                  <p className="text-lotus-grey-400 mb-6">
                    Compare connected liquidity to traditional isolated lending pools.
                  </p>
                  <IsolatedComparison tranches={computedTranches} productiveDebtRate={productiveDebtRate} />
                </div>

                <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
                  <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Dynamic Loan Mix</h3>
                  <p className="text-lotus-grey-400 mb-6">
                    Visualize how each lender's supply is allocated across borrower tranches.
                  </p>
                  <FundingMatrix tranches={computedTranches} includePendingInterest={false} />
                </div>
              </div>
            )}
          </SectionWrapper>
        </div>

        {/* Footer */}
        <footer className="border-t border-lotus-grey-800 py-6 px-4 lg:px-8">
          <div className="max-w-6xl mx-auto text-center text-sm text-lotus-grey-500">
            <p>
              This is an interactive educational simulator.
              See the{' '}
              <a
                href="https://docs.lotus.finance"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lotus-purple-400 hover:text-lotus-purple-300 transition-colors"
              >
                full documentation
              </a>{' '}
              for complete technical details.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
