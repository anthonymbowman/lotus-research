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
import { Vaults } from './components/Vaults';
import { TrancheRisk } from './components/TrancheRisk';

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
      if (hash && ['intro', 'lotususd', 'risk', 'tranches', 'interest-bad-debt', 'vaults'].includes(hash)) {
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
  const sectionMeta: Record<Section, { number: string; title: string; headline: string; subtitle: string; learningPoints: string[]; transitionText?: string; next?: { id: Section; label: string } }> = {
    intro: {
      number: '1',
      title: 'Welcome',
      headline: 'Welcome to Lotus Protocol',
      subtitle: 'Get started with Lotus Protocol',
      learningPoints: [],
      transitionText: "Let's start with the foundation: LotusUSD and productive debt...",
      next: { id: 'lotususd', label: 'LotusUSD & Productive Debt' },
    },
    lotususd: {
      number: '2',
      title: 'LotusUSD & Productive Debt',
      headline: 'LotusUSD & Productive Debt',
      subtitle: 'Treasury backing, base rates, and spread compression',
      learningPoints: [],
      transitionText: "Now let's understand why tranches have different risk levels...",
      next: { id: 'risk', label: 'Tranche Risk' },
    },
    risk: {
      number: '3',
      title: 'Tranche Risk',
      headline: 'Understanding Tranche Risk',
      subtitle: 'Why higher LLTV means higher risk',
      learningPoints: [],
      transitionText: "With risk understood, let's see how liquidity connects tranches...",
      next: { id: 'tranches', label: 'Tranches & Liquidity' },
    },
    tranches: {
      number: '4',
      title: 'Tranches',
      headline: 'Tranches & Connected Liquidity',
      subtitle: 'The connected liquidity model',
      learningPoints: [],
      transitionText: "Interest flows through these tranches. Let's trace it...",
      next: { id: 'interest-bad-debt', label: 'Interest & Bad Debt' },
    },
    'interest-bad-debt': {
      number: '5',
      title: 'Interest & Bad Debt',
      headline: 'Interest Cascade & Bad Debt',
      subtitle: 'How interest flows and what happens when things go wrong',
      learningPoints: [],
      transitionText: 'Now you understand how the protocol works. Ready to choose your strategy?',
      next: { id: 'vaults', label: 'Vaults' },
    },
    vaults: {
      number: '6',
      title: 'Vaults',
      headline: 'Choose Your Strategy',
      subtitle: 'Now that you understand tranches, choose how to allocate',
      learningPoints: [],
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
            headline={currentMeta.headline}
            subtitle={currentMeta.subtitle}
            learningPoints={currentMeta.learningPoints}
            transitionText={currentMeta.transitionText}
            nextSection={currentMeta.next}
            onNavigate={handleSectionChange}
          >
            {/* Section 1: Introduction */}
            {activeSection === 'intro' && (
              <Introduction onNavigate={handleSectionChange} />
            )}

            {/* Section 2: LotusUSD & Productive Debt (combined) */}
            {activeSection === 'lotususd' && (
              <div className="space-y-12">
                <LotusUSDAllocation
                  treasuryAllocation={treasuryAllocation}
                  treasuryRate={treasuryRate}
                  onTreasuryAllocationChange={setTreasuryAllocation}
                  onTreasuryRateChange={setTreasuryRate}
                />

                <div className="border-t border-lotus-grey-700 pt-8">
                  <h2 className="text-2xl font-semibold text-lotus-grey-100 mb-6">Productive Debt Benefits</h2>
                  <ProductiveDebt
                    baseRate={productiveDebtRate}
                    spread={spread}
                    utilization={utilization}
                    onSpreadChange={setSpread}
                    onUtilizationChange={setUtilization}
                  />
                </div>
              </div>
            )}

            {/* Section 3: Tranche Risk */}
            {activeSection === 'risk' && (
              <TrancheRisk
                tranches={computedTranches.map(t => ({
                  lltv: t.lltv,
                  borrowRate: t.borrowRate,
                }))}
              />
            )}

            {/* Section 4: Tranches & Liquidity */}
            {activeSection === 'tranches' && (
              <TrancheLiquidity
                tranches={computedTranches}
                productiveDebtRate={productiveDebtRate}
                onTrancheChange={handleTrancheChange}
              />
            )}

            {/* Section 5: Interest & Bad Debt (merged from Interest Cascade + Liquidations) */}
            {activeSection === 'interest-bad-debt' && (
              <div className="space-y-8">
                <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
                  <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Interest Accrual Simulation</h3>
                  <p className="text-lotus-grey-400 mb-6">
                    See how interest flows through tranches. The cascade mechanism allocates
                    interest based on supply utilization at each level.
                  </p>
                  <InterestSimulator tranches={computedTranches} productiveDebtRate={productiveDebtRate} />
                </div>

                <Liquidations
                  tranches={computedTranches.map(t => ({ lltv: t.lltv }))}
                  computedTranches={computedTranches}
                />
              </div>
            )}

            {/* Section 6: Vaults */}
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
          </SectionWrapper>
        </div>

        {/* Footer */}
        <footer className="border-t border-lotus-grey-800 py-6 px-4 lg:px-8">
          <div className="max-w-6xl mx-auto text-center text-sm text-lotus-grey-500">
            <p>
              This is an interactive educational simulator.
              See the{' '}
              <a
                href="https://lotus-protocol.gitbook.io/lotus/"
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
