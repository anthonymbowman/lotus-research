import { useState } from 'react';
import { getGlossaryEntry } from '../glossary';

interface ConceptPrimerProps {
  concepts: string[];
  defaultExpanded?: boolean;
}

export function ConceptPrimer({ concepts, defaultExpanded = false }: ConceptPrimerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const entries = concepts
    .map(key => getGlossaryEntry(key))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);

  if (entries.length === 0) return null;

  return (
    <div className="bg-lotus-grey-800/50 rounded-lg border border-lotus-grey-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-lotus-grey-800/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-lotus-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium text-lotus-grey-300">
            Key Concepts ({entries.length})
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-lotus-grey-300 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {entries.map((entry) => (
            <div key={entry.term} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-lotus-purple-400 mt-2 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-lotus-purple-300">
                  {entry.term}:
                </span>{' '}
                <span className="text-sm text-lotus-grey-300">
                  {entry.shortDef}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConceptPrimer;
