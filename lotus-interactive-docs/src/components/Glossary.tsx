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

  return (
    <div className="space-y-6">
      <div className="bg-lotus-grey-800/70 rounded-xl p-5 border border-lotus-grey-700">
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
                className="w-full sm:w-[360px] px-3 py-2 pr-10 bg-lotus-grey-700 border border-lotus-grey-600 rounded-lg text-lotus-grey-100 focus:border-lotus-purple-500 focus:outline-none"
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
      </div>

      {filtered.length === 0 ? (
        <div className="bg-lotus-grey-800/60 border border-lotus-grey-700 rounded-xl p-6 text-center text-sm text-lotus-grey-400">
          No glossary matches for "{query}"
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((entry) => (
            <details
              key={entry.key}
              id={`glossary-${entry.key}`}
              className={`bg-lotus-grey-800/60 border rounded-xl p-4 ${
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
                  <div className="bg-lotus-grey-900 rounded-lg px-3 py-2 text-xs font-mono text-lotus-purple-300">
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
      )}
    </div>
  );
}

export default Glossary;
