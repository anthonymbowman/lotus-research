import type { Section } from './Sidebar';

export interface SectionWrapperProps {
  id: Section;
  number: string;
  title: string;
  headline?: string;
  subtitle?: string;
  learningPoints?: string[]; // Kept for API compatibility but no longer rendered
  transitionText?: string;
  children: React.ReactNode;
  nextSection?: { id: Section; label: string };
  onNavigate?: (section: Section) => void;
}

export function SectionWrapper({
  number,
  title,
  headline,
  subtitle,
  transitionText,
  children,
  nextSection,
  onNavigate,
}: SectionWrapperProps) {
  return (
    <div className="animate-fadeIn">
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-medium text-lotus-purple-400 bg-lotus-purple-900/30 px-2.5 py-0.5 rounded-full">
            Section {number}
          </span>
        </div>
        <h2 className="text-2xl font-medium text-lotus-grey-100 mb-2">{headline || title}</h2>
        {subtitle && (
          <p className="text-lotus-grey-400 text-lg">{subtitle}</p>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {children}
      </div>

      {/* Next Section Link */}
      {nextSection && onNavigate && (
        <div className="mt-12 pt-8 border-t border-lotus-grey-700">
          {transitionText && (
            <p className="text-lotus-grey-400 text-sm mb-4">{transitionText}</p>
          )}
          <button
            onClick={() => onNavigate(nextSection.id)}
            className="group flex items-center justify-between w-full p-4 bg-lotus-grey-800 hover:bg-lotus-grey-700 border border-lotus-grey-700 hover:border-lotus-purple-500 rounded-lg transition-all"
          >
            <div>
              <span className="text-xs text-lotus-grey-500 uppercase tracking-wide">Next</span>
              <div className="text-lg font-medium text-lotus-grey-100 group-hover:text-lotus-purple-300 transition-colors">
                {nextSection.label}
              </div>
            </div>
            <svg className="w-6 h-6 text-lotus-grey-500 group-hover:text-lotus-purple-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default SectionWrapper;
