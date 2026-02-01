import type { Section } from './Sidebar';

interface SectionWrapperProps {
  id: Section;
  number: string;
  title: string;
  subtitle?: string;
  learningPoints?: string[];
  children: React.ReactNode;
  nextSection?: { id: Section; label: string };
  onNavigate?: (section: Section) => void;
}

export function SectionWrapper({
  number,
  title,
  subtitle,
  learningPoints,
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
        <h2 className="text-2xl font-medium text-lotus-grey-100 mb-2">{title}</h2>
        {subtitle && (
          <p className="text-lotus-grey-400 text-lg">{subtitle}</p>
        )}
      </div>

      {/* What you'll learn */}
      {learningPoints && learningPoints.length > 0 && (
        <div className="mb-8 p-4 bg-lotus-grey-800 rounded-lg border border-lotus-grey-700">
          <h3 className="text-sm font-medium text-lotus-grey-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            What you'll learn
          </h3>
          <ul className="space-y-2">
            {learningPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-lotus-grey-300">
                <svg className="w-4 h-4 text-lotus-purple-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {children}
      </div>

      {/* Next Section Link */}
      {nextSection && onNavigate && (
        <div className="mt-12 pt-8 border-t border-lotus-grey-700">
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
