import { useState, useMemo, useCallback, useEffect } from 'react';
import type { TrancheInput } from './types';
import { computeAllTranches } from './math/lotusAccounting';
import { createDefaultTranches } from './presets';
import { Sidebar, SECTIONS, type Section } from './components/Sidebar';
import { SectionWrapper } from './components/SectionWrapper';
import { GuidedTour } from './components/GuidedTour';
import { WelcomeModal } from './components/WelcomeModal';
import { Introduction } from './components/Introduction';
import { ProductiveDebt } from './components/ProductiveDebt';
import { LotusUSDAllocation } from './components/LotusUSDAllocation';
import { BorrowerBenefits } from './components/BorrowerBenefits';
import { TrancheLiquidity } from './components/TrancheLiquidity';
import { Liquidations } from './components/Liquidations';
import { InterestSimulator } from './components/InterestSimulator';
import { Vaults } from './components/Vaults';
import { TrancheRisk } from './components/TrancheRisk';
import { SearchPalette } from './components/SearchPalette';
import { Glossary } from './components/Glossary';
import { analytics } from './analytics';
import { sectionMeta } from './content';

const STORAGE_KEY = 'lotus-docs-visited';
const TOUR_KEY = 'lotus-docs-tour-completed';
const SECTION_ORDER: Section[] = SECTIONS.map((section) => section.id);
const SECTION_SET = new Set(SECTION_ORDER);

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
  const [glossaryFocusTerm, setGlossaryFocusTerm] = useState<string | null>(null);

  // LotusUSD Allocation state
  const [treasuryAllocation, setTreasuryAllocation] = useState(0.8);
  const [treasuryRate, setTreasuryRate] = useState(0.0375);

  // Derived productive debt rate
  const productiveDebtRate = useMemo(() => {
    return treasuryRate * treasuryAllocation;
  }, [treasuryRate, treasuryAllocation]);

  // Liquidity state
  const [tranches, setTranches] = useState<TrancheInput[]>(createDefaultTranches);

  // Productive Debt state
  const [spread, setSpread] = useState(0.02);
  const [utilization, setUtilization] = useState(0.7);

  // Compute all derived values
  const computedTranches = useMemo(() => {
    return computeAllTranches(tranches, false);
  }, [tranches]);


  // Handle tranche input changes (no validation - let users explore any state)
  const handleTrancheChange = useCallback((
    id: number,
    field: keyof TrancheInput,
    value: number
  ) => {
    setTranches(prev => prev.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
  }, []);

  const markVisited = useCallback((section: Section) => {
    setVisitedSections(prev => {
      if (prev.has(section)) return prev;
      const updated = new Set(prev);
      updated.add(section);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...updated]));
      return updated;
    });
  }, []);

  // Navigation handler
  const handleSectionChange = useCallback((section: Section) => {
    analytics.navClick(section);
    setActiveSection(section);
    markVisited(section);
    if (section !== 'glossary') {
      setGlossaryFocusTerm(null);
    }
    // Update URL hash
    window.location.hash = section;
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [markVisited]);

  // Handle URL hash navigation
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.slice(1) as Section;
      if (hash && SECTION_SET.has(hash)) {
        setActiveSection(hash);
        markVisited(hash);
        return;
      }
      handleSectionChange('intro');
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, [handleSectionChange, markVisited]);

  // Tour handlers
  const handleStartTour = () => {
    analytics.tourStart();
    setShowWelcome(false);
    setShowTour(true);
  };

  const handleSkipTour = () => {
    setShowWelcome(false);
    localStorage.setItem(TOUR_KEY, 'true');
  };

  const handleTourComplete = () => {
    analytics.tourComplete();
    setShowTour(false);
    localStorage.setItem(TOUR_KEY, 'true');
  };

  const handleRestartTour = () => {
    localStorage.removeItem(TOUR_KEY);
    setShowTour(false);
    setShowWelcome(true);
  };

  const handleResetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOUR_KEY);
    setVisitedSections(new Set<Section>());
    setShowTour(false);
    setShowWelcome(true);
    setGlossaryFocusTerm(null);
    handleSectionChange('intro');
  };

  const handleGlossarySelect = (termKey: string) => {
    setGlossaryFocusTerm(termKey);
    handleSectionChange('glossary');
  };

  const currentMeta = sectionMeta[activeSection];
  const currentIndex = Math.max(0, SECTION_ORDER.indexOf(activeSection));
  const progress = {
    current: currentIndex + 1,
    total: SECTION_ORDER.length,
  };

  return (
    <div className="min-h-screen bg-lotus-gradient-subtle">
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

      {/* Search Palette */}
      <SearchPalette onNavigate={handleSectionChange} onGlossarySelect={handleGlossarySelect} />

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        visitedSections={visitedSections}
        onRestartTour={handleRestartTour}
        onResetProgress={handleResetProgress}
      />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-8 lg:pt-12 lg:px-8 lg:py-12">
          <SectionWrapper
            id={activeSection}
            title={currentMeta.title}
            headline={currentMeta.headline}
            subtitle={currentMeta.subtitle}
            transitionText={currentMeta.transitionText}
            nextSection={currentMeta.next}
            onNavigate={handleSectionChange}
            progress={progress}
          >
            {/* Section 1: Introduction */}
            {activeSection === 'intro' && (
              <Introduction />
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

            {/* Section 3: Borrower Outcomes */}
            {activeSection === 'borrower-benefits' && (
              <BorrowerBenefits
                tranches={computedTranches}
                productiveDebtRate={productiveDebtRate}
              />
            )}

            {/* Section 4: Tranche Risk */}
            {activeSection === 'risk' && (
              <TrancheRisk
                tranches={computedTranches.map(t => ({
                  lltv: t.lltv,
                  borrowRate: t.borrowRate,
                }))}
                baseRate={productiveDebtRate}
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

            {/* Section 6: Interest & Bad Debt (merged from Interest Cascade + Liquidations) */}
            {activeSection === 'interest-bad-debt' && (
              <div className="space-y-8">
                <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
                  <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">Interest Accrual Simulation</h3>
                  <p className="text-lotus-grey-400 mb-6">
                    See how interest flows through tranches. The cascade mechanism allocates
                    interest based on supply utilization at each tranche.
                  </p>
                  <InterestSimulator tranches={computedTranches} productiveDebtRate={productiveDebtRate} />
                </div>

                <Liquidations
                  tranches={computedTranches.map(t => ({ lltv: t.lltv }))}
                  computedTranches={computedTranches}
                />
              </div>
            )}

            {/* Section 7: Vaults */}
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

            {/* Section 7: Glossary */}
            {activeSection === 'glossary' && (
              <Glossary focusTerm={glossaryFocusTerm} />
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
