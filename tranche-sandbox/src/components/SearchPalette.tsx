import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { Section } from './Sidebar';
import { analytics } from '../analytics';
import { getGlossaryEntry, getGlossaryTerms } from '../glossary';
import { useFocusTrap } from './useFocusTrap';

interface SearchPaletteProps {
  onNavigate: (section: Section) => void;
  onGlossarySelect?: (termKey: string) => void;
}

interface SearchResult {
  type: 'page' | 'glossary';
  id: string;
  title: string;
  description: string;
  section: Section;
  termKey?: string;
  searchText: string;
}

const PAGES: SearchResult[] = [
  { type: 'page', id: 'intro', title: 'Get Started', description: 'What is Lotus Protocol?', section: 'intro', searchText: 'get started introduction lotus protocol' },
  { type: 'page', id: 'lotususd', title: 'Stable Backing', description: 'Treasury rates & productive debt', section: 'lotususd', searchText: 'stable backing lotususd productive debt treasury rate' },
  { type: 'page', id: 'borrower-benefits', title: 'Borrower Outcomes', description: 'Lower rates & more access', section: 'borrower-benefits', searchText: 'borrower outcomes lower rates access capacity efficiency' },
  { type: 'page', id: 'risk', title: 'Risk Layers', description: 'Why LLTV determines risk & reward', section: 'risk', searchText: 'risk layers lltv liquidation risk reward' },
  { type: 'page', id: 'tranches', title: 'Liquidity Flow', description: 'Connected supply across tranches', section: 'tranches', searchText: 'liquidity flow connected supply cascade tranches' },
  { type: 'page', id: 'interest-bad-debt', title: 'Interest & Losses', description: 'How value and bad debt cascade', section: 'interest-bad-debt', searchText: 'interest bad debt cascade losses liquidation' },
  { type: 'page', id: 'vaults', title: 'Your Strategy', description: 'Choose your allocation approach', section: 'vaults', searchText: 'vaults strategy allocation risk apy' },
  { type: 'page', id: 'glossary', title: 'Glossary', description: 'Definitions of key protocol terms', section: 'glossary', searchText: 'glossary definitions terms' },
];

export function SearchPalette({ onNavigate, onGlossarySelect }: SearchPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  useFocusTrap(paletteRef, isOpen, () => setIsOpen(false));

  const glossaryResults = useMemo<SearchResult[]>(() => {
    return getGlossaryTerms().map((key) => {
      const entry = getGlossaryEntry(key);
      if (!entry) return null;
      const searchText = [
        entry.term,
        entry.shortDef,
        entry.fullDef,
        entry.formula,
        entry.example,
        entry.related?.join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return {
        type: 'glossary',
        id: `glossary-${key}`,
        title: entry.term,
        description: entry.shortDef,
        section: 'glossary',
        termKey: key,
        searchText,
      } as SearchResult;
    }).filter(Boolean).sort((a, b) => a!.title.localeCompare(b!.title)) as SearchResult[];
  }, []);

  const allResults = useMemo(() => [...PAGES, ...glossaryResults], [glossaryResults]);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredResults = useMemo(() => {
    if (!normalizedQuery) return allResults;
    return allResults.filter((result) =>
      result.searchText.includes(normalizedQuery) ||
      result.title.toLowerCase().includes(normalizedQuery) ||
      result.description.toLowerCase().includes(normalizedQuery)
    );
  }, [allResults, normalizedQuery]);

  const pageResults = useMemo(() => filteredResults.filter((r) => r.type === 'page'), [filteredResults]);
  const glossaryMatches = useMemo(() => filteredResults.filter((r) => r.type === 'glossary'), [filteredResults]);
  const flatResults = useMemo(() => [...pageResults, ...glossaryMatches], [pageResults, glossaryMatches]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, flatResults.length]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSelect = useCallback((result: SearchResult) => {
    analytics.searchUsed(query, result.title);
    if (result.type === 'glossary' && result.termKey) {
      if (onGlossarySelect) {
        onGlossarySelect(result.termKey);
      } else {
        onNavigate('glossary');
      }
    } else {
      onNavigate(result.section);
    }
    setIsOpen(false);
  }, [onNavigate, onGlossarySelect, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(flatResults[selectedIndex]);
    }
  };

  const activeDescendantId = flatResults[selectedIndex]
    ? `search-result-${selectedIndex}`
    : undefined;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-lotus-grey-800 border border-lotus-grey-700 rounded-xl text-lotus-grey-300 hover:border-lotus-purple-500 hover:text-lotus-grey-100 transition-all shadow-lg"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="search-palette"
        aria-label="Open search"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-sm">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-lotus-grey-700 rounded">
          <span className="text-lotus-grey-400">⌘</span>K
        </kbd>
      </button>
    );
  }

  const palette = (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label="Search">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div
        ref={paletteRef}
        id="search-palette"
        className="relative w-full max-w-xl mx-4 bg-lotus-grey-800 rounded-xl border border-lotus-grey-700 shadow-2xl overflow-hidden focus:outline-none"
        tabIndex={-1}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-lotus-grey-700">
          <svg className="w-5 h-5 text-lotus-grey-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages and glossary..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-lotus-grey-100 placeholder-lotus-grey-400 outline-none text-lg"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-expanded={isOpen}
            aria-activedescendant={activeDescendantId}
            aria-label="Search documentation"
          />
          <kbd className="px-2 py-1 text-xs bg-lotus-grey-700 text-lotus-grey-400 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          id="search-results"
          role="listbox"
          aria-label="Search results"
          className="max-h-80 overflow-y-auto py-2"
        >
          <div className="sr-only" aria-live="polite">
            {flatResults.length} results
          </div>
          {flatResults.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <svg className="w-10 h-10 mx-auto text-lotus-grey-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lotus-grey-400">No results for "{query}"</p>
            </div>
          ) : (
            <>
              {(() => {
                let indexCounter = 0;
                const renderGroup = (label: string, results: SearchResult[], icon: JSX.Element) => {
                  if (results.length === 0) return null;
                  return (
                    <div key={label}>
                      <div className="px-4 py-2 text-xs text-lotus-grey-400 uppercase tracking-wide flex items-center gap-2">
                        {icon}
                        {label}
                      </div>
                      {results.map((result) => {
                        const index = indexCounter++;
                        const isSelected = index === selectedIndex;
                        return (
                          <button
                            key={result.id}
                            id={`search-result-${index}`}
                            data-index={index}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                              isSelected ? 'bg-lotus-purple-900/30' : 'hover:bg-lotus-grey-700/50'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-lotus-purple-900/50 text-lotus-purple-400">
                              {result.type === 'glossary' ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium truncate ${isSelected ? 'text-lotus-grey-100' : 'text-lotus-grey-200'}`}>
                                {result.title}
                              </div>
                              <div className="text-sm text-lotus-grey-400 truncate">
                                {result.description}
                              </div>
                            </div>
                            {isSelected && (
                              <kbd className="px-2 py-1 text-xs bg-lotus-grey-700 text-lotus-grey-400 rounded self-center">
                                ↵
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                };

                return (
                  <>
                    {renderGroup(
                      'Pages',
                      pageResults,
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {renderGroup(
                      'Glossary',
                      glossaryMatches,
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-lotus-grey-700 flex items-center justify-between text-xs text-lotus-grey-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-lotus-grey-700 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-lotus-grey-700 rounded">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-lotus-grey-700 rounded">↵</kbd>
              select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-lotus-grey-700 rounded">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(palette, document.body);
}

export default SearchPalette;
