import { useState } from 'react';

interface ConceptExplainerProps {
  title: string;
  description: string;
  formula?: string;
  insight?: string;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
}

export function ConceptExplainer({
  title,
  description,
  formula,
  insight,
  children,
  defaultExpanded = true,
}: ConceptExplainerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-lotus-grey-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-lotus-grey-800 hover:bg-lotus-grey-700 transition-colors text-left"
      >
        <span className="font-medium text-lotus-grey-200">{title}</span>
        <svg
          className={`w-5 h-5 text-lotus-grey-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-3 bg-lotus-grey-800/50">
          <p className="text-sm text-lotus-grey-300">{description}</p>

          {formula && (
            <div className="bg-lotus-grey-900 rounded-lg px-4 py-2">
              <code className="text-sm font-mono text-lotus-purple-300">{formula}</code>
            </div>
          )}

          {insight && (
            <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg px-4 py-2">
              <p className="text-sm text-amber-300">
                <span className="font-medium">Key insight:</span> {insight}
              </p>
            </div>
          )}

          {children && <div className="mt-4">{children}</div>}
        </div>
      )}
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  description?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function CollapsibleSection({
  title,
  icon,
  description,
  children,
  defaultExpanded = false,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-lotus-grey-800 rounded-lg border border-lotus-grey-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-lotus-grey-700 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <div>
            <span className="font-semibold text-lotus-grey-100">{title}</span>
            {description && (
              <p className="text-sm text-lotus-grey-300 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-lotus-grey-300 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-lotus-grey-700">
          {children}
        </div>
      )}
    </div>
  );
}

export default ConceptExplainer;
