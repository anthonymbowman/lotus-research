import type { Section } from './Sidebar';

interface ChooseYourPathProps {
  onNavigate: (section: Section) => void;
}

interface PathCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  sections: Section[];
  color: string;
  recommended?: boolean;
}

const PATHS: PathCard[] = [
  {
    id: 'quick-start',
    title: 'Quick Overview',
    description: 'Get a high-level understanding of how Lotus works in 5 minutes. Perfect if you want the essentials.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    sections: ['intro', 'lotususd', 'vaults'],
    color: 'emerald',
    recommended: true,
  },
  {
    id: 'full-deep-dive',
    title: 'Full Deep Dive',
    description: 'Understand every aspect of the protocol: backing, risk, liquidity flow, and interest mechanics.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    sections: ['intro', 'lotususd', 'risk', 'tranches', 'interest-bad-debt', 'vaults'],
    color: 'purple',
  },
  {
    id: 'risk-focus',
    title: 'Understand Risk',
    description: 'Focus on how risk works: liquidations, bad debt, and why different tranches pay different yields.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    sections: ['risk', 'interest-bad-debt'],
    color: 'amber',
  },
  {
    id: 'vault-strategy',
    title: 'Choose a Strategy',
    description: 'Already familiar with tranches? Jump straight to vault strategies and allocation options.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    sections: ['vaults'],
    color: 'blue',
  },
];

const colorClasses: Record<string, { bg: string; border: string; icon: string; text: string; hover: string }> = {
  emerald: {
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-700/50 hover:border-emerald-500',
    icon: 'bg-emerald-900/50 text-emerald-400',
    text: 'text-emerald-400',
    hover: 'group-hover:text-emerald-300',
  },
  purple: {
    bg: 'bg-lotus-purple-900/20',
    border: 'border-lotus-purple-700/50 hover:border-lotus-purple-500',
    icon: 'bg-lotus-purple-900/50 text-lotus-purple-400',
    text: 'text-lotus-purple-400',
    hover: 'group-hover:text-lotus-purple-300',
  },
  amber: {
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/50 hover:border-amber-500',
    icon: 'bg-amber-900/50 text-amber-400',
    text: 'text-amber-400',
    hover: 'group-hover:text-amber-300',
  },
  blue: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-700/50 hover:border-blue-500',
    icon: 'bg-blue-900/50 text-blue-400',
    text: 'text-blue-400',
    hover: 'group-hover:text-blue-300',
  },
};

export function ChooseYourPath({ onNavigate }: ChooseYourPathProps) {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-lotus-grey-100 mb-3">
          Choose Your Learning Path
        </h2>
        <p className="text-lotus-grey-300">
          Whether you want a quick overview or a deep understanding,
          pick the path that fits your goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PATHS.map((path) => {
          const colors = colorClasses[path.color];
          return (
            <button
              key={path.id}
              onClick={() => onNavigate(path.sections[0])}
              className={`group relative text-left p-6 rounded-xl border-2 transition-all ${colors.bg} ${colors.border}`}
            >
              {path.recommended && (
                <span className="absolute -top-3 right-4 px-3 py-1 text-xs font-medium bg-emerald-500 text-white rounded-full">
                  Recommended
                </span>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                  {path.icon}
                </div>

                <div className="flex-1">
                  <h3 className={`text-lg font-medium text-lotus-grey-100 mb-2 ${colors.hover}`}>
                    {path.title}
                  </h3>
                  <p className="text-sm text-lotus-grey-300 mb-4">
                    {path.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-lotus-grey-400">
                        {path.sections.length} {path.sections.length === 1 ? 'section' : 'sections'}
                      </span>
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-medium ${colors.text}`}>
                      Start
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-lotus-grey-400">
          You can always switch paths or explore sections in any order using the sidebar.
        </p>
      </div>
    </div>
  );
}

export default ChooseYourPath;
