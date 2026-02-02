import { useState, useEffect } from 'react';
import { GLOSSARY, type GlossaryEntry } from '../glossary';

export function Glossary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  // Handle deep linking via URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#glossary-', '');
    if (hash && GLOSSARY[hash]) {
      setExpandedTerm(hash);
      // Scroll to the term after a short delay
      setTimeout(() => {
        document.getElementById(`term-${hash}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, []);

  // Get all terms sorted alphabetically
  const allTerms = Object.entries(GLOSSARY).sort((a, b) =>
    a[1].term.toLowerCase().localeCompare(b[1].term.toLowerCase())
  );

  // Filter terms based on search
  const filteredTerms = searchQuery
    ? allTerms.filter(([_key, entry]) =>
        entry.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.shortDef.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allTerms;

  // Group terms by first letter
  const groupedTerms = filteredTerms.reduce((acc, [key, entry]) => {
    const firstLetter = entry.term[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push({ key, entry });
    return acc;
  }, {} as Record<string, { key: string; entry: GlossaryEntry }[]>);

  const handleTermClick = (key: string) => {
    setExpandedTerm(expandedTerm === key ? null : key);
    // Update URL hash for deep linking
    window.history.replaceState(null, '', `#glossary-${key}`);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-lotus-grey-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search terms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-lotus-grey-800 border border-lotus-grey-700 rounded-lg text-lotus-grey-100 placeholder-lotus-grey-400 focus:border-lotus-purple-500 focus:outline-none"
        />
      </div>

      {/* Quick jump letters */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(groupedTerms).sort().map((letter) => (
          <button
            key={letter}
            onClick={() => document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: 'smooth' })}
            className="w-8 h-8 flex items-center justify-center text-sm font-medium bg-lotus-grey-800 border border-lotus-grey-700 rounded-lg text-lotus-grey-300 hover:border-lotus-purple-500 hover:text-lotus-purple-400 transition-colors"
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Terms list */}
      <div className="space-y-8">
        {Object.entries(groupedTerms).sort(([a], [b]) => a.localeCompare(b)).map(([letter, terms]) => (
          <div key={letter} id={`letter-${letter}`}>
            <h3 className="text-xl font-semibold text-lotus-purple-400 mb-4 pb-2 border-b border-lotus-grey-700">
              {letter}
            </h3>
            <div className="space-y-3">
              {terms.map(({ key, entry }) => {
                const isExpanded = expandedTerm === key;
                return (
                  <div
                    key={key}
                    id={`term-${key}`}
                    className={`bg-lotus-grey-800 rounded-lg border transition-all ${
                      isExpanded ? 'border-lotus-purple-500' : 'border-lotus-grey-700 hover:border-lotus-grey-600'
                    }`}
                  >
                    <button
                      onClick={() => handleTermClick(key)}
                      className="w-full text-left p-4 flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-lotus-grey-100 mb-1">
                          {entry.term}
                        </h4>
                        <p className="text-sm text-lotus-grey-300">
                          {entry.shortDef}
                        </p>
                      </div>
                      <svg
                        className={`w-5 h-5 text-lotus-grey-400 flex-shrink-0 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-lotus-grey-700 mt-2">
                        <p className="text-lotus-grey-300 mb-4">
                          {entry.fullDef}
                        </p>

                        {entry.formula && (
                          <div className="mb-4">
                            <span className="text-xs text-lotus-grey-400 uppercase tracking-wide">Formula</span>
                            <code className="block mt-1 text-sm font-mono text-lotus-purple-400 bg-lotus-grey-900 px-3 py-2 rounded">
                              {entry.formula}
                            </code>
                          </div>
                        )}

                        {entry.example && (
                          <div className="mb-4">
                            <span className="text-xs text-lotus-grey-400 uppercase tracking-wide">Example</span>
                            <p className="mt-1 text-sm text-lotus-grey-300 italic">
                              {entry.example}
                            </p>
                          </div>
                        )}

                        {entry.related && entry.related.length > 0 && (
                          <div>
                            <span className="text-xs text-lotus-grey-400 uppercase tracking-wide">Related terms</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {entry.related.map((relatedKey) => {
                                const relatedEntry = GLOSSARY[relatedKey];
                                if (!relatedEntry) return null;
                                return (
                                  <button
                                    key={relatedKey}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTermClick(relatedKey);
                                      document.getElementById(`term-${relatedKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }}
                                    className="px-3 py-1 text-sm bg-lotus-grey-700 text-lotus-grey-300 rounded-full hover:bg-lotus-purple-900/50 hover:text-lotus-purple-300 transition-colors"
                                  >
                                    {relatedEntry.term}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 mx-auto text-lotus-grey-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lotus-grey-400">No terms found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}

export default Glossary;
