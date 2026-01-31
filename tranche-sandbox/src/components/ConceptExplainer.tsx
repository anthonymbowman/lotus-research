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
          className={`w-5 h-5 text-lotus-grey-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-3 bg-lotus-grey-800/50">
          <p className="text-sm text-lotus-grey-400">{description}</p>

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
              <p className="text-sm text-lotus-grey-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-lotus-grey-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
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

interface StackedBarProps {
  label: string;
  value: number;
  cumulativeValue: number;
  maxValue: number;
  color: string;
}

export function StackedBar({
  label,
  value,
  cumulativeValue,
  maxValue,
  color,
}: StackedBarProps) {
  const barWidth = maxValue > 0 ? (cumulativeValue / maxValue) * 100 : 0;
  const ownWidth = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const juniorWidth = barWidth - ownWidth;

  return (
    <div className="flex items-center gap-3 py-1">
      <span className="w-16 text-sm font-medium text-lotus-grey-400">
        {label}
      </span>
      <div className="flex-1 h-5 bg-lotus-grey-700 rounded overflow-hidden relative">
        {juniorWidth > 0 && (
          <div
            className="absolute left-0 top-0 h-full opacity-40"
            style={{ width: `${barWidth}%`, backgroundColor: color }}
          />
        )}
        <div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${ownWidth}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-20 text-right text-sm font-mono text-lotus-grey-300">
        {cumulativeValue.toLocaleString()}
      </span>
    </div>
  );
}

interface WaterfallItemProps {
  label: string;
  inFlow: number;
  allocated: number;
  outFlow: number;
  colorScheme: 'interest' | 'badDebt';
  isLast?: boolean;
}

export function WaterfallItem({
  label,
  inFlow,
  allocated,
  outFlow,
  colorScheme,
  isLast,
}: WaterfallItemProps) {
  const colors = colorScheme === 'interest'
    ? { bg: 'bg-emerald-900/30', border: 'border-emerald-700', text: 'text-emerald-400', accent: 'bg-emerald-500' }
    : { bg: 'bg-red-900/30', border: 'border-red-700', text: 'text-red-400', accent: 'bg-red-500' };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${colors.bg} ${colors.border} border rounded-lg p-3`}>
        <div className="text-xs text-lotus-grey-500 mb-1">{label}</div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-xs text-lotus-grey-500">In</div>
            <div className={`font-mono ${colors.text}`}>
              ${inFlow.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-lotus-grey-500">
              {colorScheme === 'interest' ? 'Keeps' : 'Absorbs'}
            </div>
            <div className="font-mono font-medium text-lotus-grey-100">
              ${allocated.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-lotus-grey-500">Out</div>
            <div className={`font-mono ${colors.text}`}>
              ${outFlow.toFixed(0)}
            </div>
          </div>
        </div>
      </div>
      {!isLast && (
        <svg className="w-6 h-6 text-lotus-grey-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );
}

export default ConceptExplainer;
