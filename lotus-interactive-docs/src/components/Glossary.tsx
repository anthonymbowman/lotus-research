import { useMemo, useState, useEffect } from 'react';
import { GLOSSARY } from '../glossary';

interface GlossaryProps {
  focusTerm?: string | null;
}

export function Glossary({ focusTerm }: GlossaryProps) {
  const [query, setQuery] = useState('');

  const entries = useMemo(() => {
    return Object.entries(GLOSSARY)
      .map(([key, entry]) => ({
        key,
        ...entry,
        firstLetter: entry.term[0].toUpperCase(),
        searchText: [
          entry.term,
          entry.shortDef,
          entry.fullDef,
          entry.formula,
          entry.example,
          entry.related?.join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase(),
      }))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, []);

  // Get unique letters that have entries
  const availableLetters = useMemo(() => {
    const letters = new Set(entries.map(e => e.firstLetter));
    return Array.from(letters).sort();
  }, [entries]);

  useEffect(() => {
    if (!focusTerm) return;
    const entry = GLOSSARY[focusTerm];
    const nextQuery = entry?.term || focusTerm;
    setQuery(nextQuery);
    requestAnimationFrame(() => {
      const target = document.getElementById(`glossary-${focusTerm}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [focusTerm]);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? entries.filter((entry) => entry.searchText.includes(normalizedQuery))
    : entries;

  // Group filtered entries by first letter
  const groupedEntries = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(entry => {
      const letter = entry.firstLetter;
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(entry);
    });
    return groups;
  }, [filtered]);

  const scrollToLetter = (letter: string) => {
    const target = document.getElementById(`glossary-letter-${letter}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-lotus-grey-900 rounded p-6 border border-lotus-grey-700">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-lotus-grey-200 mb-2" htmlFor="glossary-search">
              Search glossary
            </label>
            <div className="relative">
              <input
                id="glossary-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search terms, formulas, or concepts..."
                className="w-full sm:w-[360px] px-3 py-2 pr-10 bg-lotus-grey-700 border border-lotus-grey-700 rounded text-lotus-grey-100 focus:border-lotus-purple-500 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-lotus-grey-400 hover:text-lotus-grey-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="text-xs text-lotus-grey-400">
            {filtered.length} of {entries.length} terms
          </div>
        </div>

        {/* Alphabetical jump links - only show when not searching */}
        {!normalizedQuery && (
          <div className="mt-4 pt-4 border-t border-lotus-grey-700">
            <div className="flex flex-wrap gap-1">
              {availableLetters.map(letter => (
                <button
                  key={letter}
                  onClick={() => scrollToLetter(letter)}
                  className="w-8 h-8 text-sm font-medium text-lotus-grey-300 hover:text-lotus-purple-400 hover:bg-lotus-purple-900/30 rounded-sm transition-colors"
                  aria-label={`Jump to ${letter}`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-lotus-grey-900 border border-lotus-grey-700 rounded p-6 text-center text-sm text-lotus-grey-400">
          No glossary matches for "{query}"
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedEntries).sort().map(letter => (
            <div key={letter} id={`glossary-letter-${letter}`}>
              {/* Letter header - only show when not searching */}
              {!normalizedQuery && (
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg font-heading font-semibold text-lotus-purple-400">{letter}</span>
                  <div className="flex-1 h-px bg-lotus-grey-700" />
                </div>
              )}
              <div className="grid grid-cols-1 gap-4">
                {groupedEntries[letter].map((entry) => (
                  <details
                    key={entry.key}
                    id={`glossary-${entry.key}`}
                    className={`bg-lotus-grey-900 border rounded p-4 ${
                      focusTerm === entry.key ? 'border-lotus-purple-500 shadow-lotus' : 'border-lotus-grey-700'
                    }`}
                    open={focusTerm === entry.key ? true : undefined}
                  >
                    <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-base font-semibold text-lotus-grey-100 font-heading">{entry.term}</h4>
                        <p className="text-sm text-lotus-grey-300 mt-1">{entry.shortDef}</p>
                      </div>
                      <span className="text-xs text-lotus-grey-400">Details</span>
                    </summary>

                    <div className="mt-4 pt-4 border-t border-lotus-grey-700 space-y-3">
                      <p className="text-sm text-lotus-grey-300">{entry.fullDef}</p>
                      {entry.formula && (
                        <div className="bg-lotus-grey-900 rounded px-3 py-2 text-xs font-mono text-lotus-purple-300">
                          {entry.formula}
                        </div>
                      )}
                      {entry.example && (
                        <p className="text-xs text-lotus-grey-400 italic">Example: {entry.example}</p>
                      )}
                      {entry.related && entry.related.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-xs text-lotus-grey-400">
                          {entry.related.map((related) => (
                            <span key={related} className="px-2 py-1 bg-lotus-grey-700 rounded">
                              {related}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Glossary;
