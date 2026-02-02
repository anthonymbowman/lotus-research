import type { Section } from './Sidebar';

export interface SectionWrapperProps {
  id: Section;
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
            {title}
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
  );
}

export default SectionWrapper;
