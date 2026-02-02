import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Section } from './Sidebar';
import { analytics } from '../analytics';

interface SearchPaletteProps {
  onNavigate: (section: Section) => void;
}

interface SearchResult {
  type: 'page';
  id: string;
  title: string;
  description: string;
  section: Section;
}

const PAGES: SearchResult[] = [
  { type: 'page', id: 'intro', title: 'Get Started', description: 'What is Lotus Protocol?', section: 'intro' },
  { type: 'page', id: 'lotususd', title: 'Stable Backing', description: 'Treasury rates & productive debt', section: 'lotususd' },
  { type: 'page', id: 'risk', title: 'Risk Layers', description: 'Why LLTV determines risk & reward', section: 'risk' },
  { type: 'page', id: 'tranches', title: 'Liquidity Flow', description: 'Connected supply across tranches', section: 'tranches' },
  { type: 'page', id: 'interest-bad-debt', title: 'Interest & Losses', description: 'How value and bad debt cascade', section: 'interest-bad-debt' },
  { type: 'page', id: 'vaults', title: 'Your Strategy', description: 'Choose your allocation approach', section: 'vaults' },
];

export function SearchPalette({ onNavigate }: SearchPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Filter results based on query
  const filteredResults = query.trim()
    ? PAGES.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase())
      )
    : PAGES;

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

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSelect = useCallback((result: SearchResult) => {
    analytics.searchUsed(query, result.title);
    onNavigate(result.section);
    setIsOpen(false);
  }, [onNavigate, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredResults[selectedIndex]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-lotus-grey-800 border border-lotus-grey-700 rounded-xl text-lotus-grey-300 hover:border-lotus-purple-500 hover:text-lotus-grey-100 transition-all shadow-lg"
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-xl mx-4 bg-lotus-grey-800 rounded-xl border border-lotus-grey-700 shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-lotus-grey-700">
          <svg className="w-5 h-5 text-lotus-grey-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-lotus-grey-100 placeholder-lotus-grey-400 outline-none text-lg"
          />
          <kbd className="px-2 py-1 text-xs bg-lotus-grey-700 text-lotus-grey-400 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-80 overflow-y-auto py-2">
          {filteredResults.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <svg className="w-10 h-10 mx-auto text-lotus-grey-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lotus-grey-400">No results for "{query}"</p>
            </div>
          ) : (
            <>
              {query.trim() === '' && (
                <div className="px-4 py-2 text-xs text-lotus-grey-400 uppercase tracking-wide">
                  Pages
                </div>
              )}
              {filteredResults.map((result, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={result.id}
                    data-index={index}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                      isSelected ? 'bg-lotus-purple-900/30' : 'hover:bg-lotus-grey-700/50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-lotus-purple-900/50 text-lotus-purple-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
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
