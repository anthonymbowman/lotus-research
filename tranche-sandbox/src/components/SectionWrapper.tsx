import type { ReactNode } from 'react';
import type { Section } from './Sidebar';

interface SectionWrapperProps {
  id: string;
  number: string;
  title: string;
  headline: string;
  subtitle: string;
  learningPoints: string[];
  transitionText?: string;
  nextSection?: { id: Section; label: string };
  onNavigate: (section: Section) => void;
  children: ReactNode;
}

export function SectionWrapper({
  number,
  title,
  headline,
  subtitle,
  learningPoints,
  transitionText,
  nextSection,
  onNavigate,
  children,
}: SectionWrapperProps) {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-lotus-grey-700 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-medium text-lotus-purple-400 bg-lotus-purple-900/30 px-3 py-1 rounded-full">
            Section {number} · {title}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-lotus-grey-100 mb-2">{headline}</h1>
        <p className="text-lg text-lotus-grey-300">{subtitle}</p>
      </div>

      {/* Learning Points */}
      <div className="bg-lotus-grey-800/50 rounded-lg p-4 border border-lotus-grey-700">
        <h3 className="text-sm font-medium text-lotus-grey-300 mb-3">What you'll learn:</h3>
        <ul className="space-y-2">
          {learningPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-lotus-grey-300">
              <svg className="w-4 h-4 text-lotus-purple-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      {children}

      {/* Next Section Navigation */}
      {nextSection && (
        <div className="border-t border-lotus-grey-700 pt-6 mt-8">
          {transitionText && (
            <p className="text-lotus-grey-300 italic mb-4">{transitionText}</p>
          )}
          <button
            onClick={() => onNavigate(nextSection.id)}
            className="group flex items-center gap-2 text-lotus-purple-400 hover:text-lotus-purple-300 transition-colors"
          >
            <span>Next: {nextSection.label}</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
