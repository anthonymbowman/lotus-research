import type { Section } from './Sidebar';

export interface SectionWrapperProps {
  id: Section;
  title: string;
  headline?: string;
  subtitle?: string;
  transitionText?: string;
  children: React.ReactNode;
  nextSection?: { id: Section; label: string };
  onNavigate?: (section: Section) => void;
  progress?: { current: number; total: number };
}

export function SectionWrapper({
  id,
  title,
  headline,
  subtitle,
  transitionText,
  children,
  nextSection,
  onNavigate,
  progress,
}: SectionWrapperProps) {
  const progressPercent = progress ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div id={id} className="animate-fadeIn">
      <div className="rounded-2xl border border-lotus-grey-800 bg-lotus-grey-900/40 p-6 sm:p-8 shadow-lotus">
        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="text-xs font-semibold text-lotus-purple-300 bg-lotus-purple-900/40 px-2.5 py-1 rounded-full uppercase tracking-wide">
              {title}
            </span>
            {progress && (
              <div className="text-xs text-lotus-grey-400">
                Step {progress.current} of {progress.total}
              </div>
            )}
          </div>
          {progress && (
            <div
              className="h-1.5 bg-lotus-grey-800 rounded-full overflow-hidden mb-4"
              role="progressbar"
              aria-valuenow={progress.current}
              aria-valuemin={1}
              aria-valuemax={progress.total}
              aria-label="Section progress"
            >
              <div
                className="h-full bg-lotus-purple-500 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
          <h2 className="text-3xl font-semibold text-lotus-grey-100 mb-2 font-heading">{headline || title}</h2>
          {subtitle && (
            <p className="text-lotus-grey-300 text-lg">{subtitle}</p>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {children}
        </div>

        {/* Next Section CTA */}
        {nextSection && onNavigate && (
          <div className="mt-16 pt-8 border-t border-lotus-grey-700">
            {transitionText && (
              <p className="text-lotus-grey-300 text-base mb-6 text-center max-w-2xl mx-auto">{transitionText}</p>
            )}
            <button
              onClick={() => onNavigate(nextSection.id)}
              className="group flex items-center justify-center gap-3 w-full py-5 px-6 bg-lotus-purple-600 hover:bg-lotus-purple-500 text-white font-medium text-lg rounded-xl transition-all shadow-lg shadow-lotus-purple-900/30 hover:shadow-lotus-purple-900/50"
            >
              <span>Continue to {nextSection.label}</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SectionWrapper;
