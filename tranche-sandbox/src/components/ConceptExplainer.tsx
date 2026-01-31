import { useState } from 'react';

interface ConceptExplainerProps {
  /** Title of the concept */
  title: string;
  /** Short description */
  description: string;
  /** Formula in text format */
  formula?: string;
  /** Key insight to highlight */
  insight?: string;
  /** Children for visual content */
  children?: React.ReactNode;
  /** Default expanded state */
  defaultExpanded?: boolean;
}

/**
 * Reusable component for explaining metrics with formula, description, and visual.
 */
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
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <span className="font-medium text-slate-700">{title}</span>
        <svg
          className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-3">
          <p className="text-sm text-slate-600">{description}</p>

          {formula && (
            <div className="bg-slate-800 rounded-lg px-4 py-2">
              <code className="text-sm font-mono text-blue-300">{formula}</code>
            </div>
          )}

          {insight && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
              <p className="text-sm text-amber-800">
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

/**
 * Collapsible section wrapper for grouping related concepts.
 */
interface CollapsibleSectionProps {
  /** Section title */
  title: string;
  /** Icon name or emoji */
  icon?: string;
  /** Section description */
  description?: string;
  /** Children content */
  children: React.ReactNode;
  /** Default expanded state */
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
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <div>
            <span className="font-semibold text-slate-800">{title}</span>
            {description && (
              <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Visual component showing stacked horizontal bars for cumulative values.
 */
interface StackedBarProps {
  /** Label for the bar */
  label: string;
  /** Current value */
  value: number;
  /** Cumulative value (includes this + junior values) */
  cumulativeValue: number;
  /** Maximum value for scaling */
  maxValue: number;
  /** Bar color */
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
      <span className="w-16 text-sm font-medium text-slate-600">
        {label}
      </span>
      <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden relative">
        {/* Junior portion (lighter) */}
        {juniorWidth > 0 && (
          <div
            className="absolute left-0 top-0 h-full opacity-40"
            style={{ width: `${barWidth}%`, backgroundColor: color }}
          />
        )}
        {/* Own portion (darker) */}
        <div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${ownWidth}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-20 text-right text-sm font-mono text-slate-700">
        {cumulativeValue.toLocaleString()}
      </span>
    </div>
  );
}

/**
 * Visual component showing a waterfall diagram for interest or bad debt flow.
 */
interface WaterfallItemProps {
  /** Tranche label */
  label: string;
  /** Amount flowing in */
  inFlow: number;
  /** Amount allocated/kept */
  allocated: number;
  /** Amount flowing out (cascaded) */
  outFlow: number;
  /** Color scheme */
  colorScheme: 'interest' | 'badDebt';
  /** Whether this is the last item */
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
    ? { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'bg-emerald-500' }
    : { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', accent: 'bg-red-500' };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${colors.bg} ${colors.border} border rounded-lg p-3`}>
        <div className="text-xs text-slate-500 mb-1">{label}</div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-xs text-slate-400">In</div>
            <div className={`font-mono ${colors.text}`}>
              ${inFlow.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">
              {colorScheme === 'interest' ? 'Keeps' : 'Absorbs'}
            </div>
            <div className="font-mono font-medium text-slate-800">
              ${allocated.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Out</div>
            <div className={`font-mono ${colors.text}`}>
              ${outFlow.toFixed(0)}
            </div>
          </div>
        </div>
      </div>
      {!isLast && (
        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );
}

export default ConceptExplainer;
