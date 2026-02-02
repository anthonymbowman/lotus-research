import { useState } from 'react';

export type Section =
  | 'intro'
  | 'lotususd'
  | 'risk'
  | 'tranches'
  | 'interest-bad-debt'
  | 'vaults';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  visitedSections: Set<Section>;
}

const SECTIONS: { id: Section; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'intro',
    label: 'Get Started',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    description: 'What is Lotus Protocol?'
  },
  {
    id: 'lotususd',
    label: 'Stable Backing',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    description: 'Treasury rates & productive debt'
  },
  {
    id: 'risk',
    label: 'Risk Layers',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    description: 'Why LLTV determines risk & reward'
  },
  {
    id: 'tranches',
    label: 'Liquidity Flow',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
    description: 'Connected supply across tranches'
  },
  {
    id: 'interest-bad-debt',
    label: 'Interest & Losses',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>,
    description: 'How value and bad debt cascade'
  },
  {
    id: 'vaults',
    label: 'Your Strategy',
    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    description: 'Choose your allocation approach'
  },
];

export function Sidebar({ activeSection, onSectionChange, visitedSections }: SidebarProps) {
  // Start collapsed on mobile (under 1024px/lg breakpoint)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return true;
  });

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-lotus-grey-800 border border-lotus-grey-700 rounded-xl text-lotus-grey-100 hover:bg-lotus-grey-700 transition-colors shadow-lg"
        aria-label={isCollapsed ? 'Open navigation' : 'Close navigation'}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isCollapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-lotus-grey-800 border-r border-lotus-grey-700 z-40 transition-transform duration-300 ${
          isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
        } w-72 lg:w-64`}
      >
        {/* Logo / Header */}
        <div className="p-6 border-b border-lotus-grey-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lotus-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-lotus-grey-100 font-medium">Lotus Protocol</h1>
              <p className="text-xs text-lotus-grey-300">Interactive Docs</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100%-120px)]">
          <div className="space-y-1">
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              const isVisited = visitedSections.has(section.id);

              return (
                <button
                  key={section.id}
                  onClick={() => {
                    onSectionChange(section.id);
                    setIsCollapsed(true);
                  }}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-lotus-purple-900/50 border border-lotus-purple-500'
                      : 'hover:bg-lotus-grey-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Section icon / checkmark */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? 'bg-lotus-purple-500 text-white'
                          : isVisited
                          ? 'bg-lotus-purple-800 text-lotus-purple-300'
                          : 'bg-lotus-grey-700 text-lotus-grey-300'
                      }`}
                    >
                      {isVisited && !isActive ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        section.icon
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${
                          isActive ? 'text-lotus-purple-300' : 'text-lotus-grey-200 group-hover:text-lotus-grey-100'
                        }`}
                      >
                        {section.label}
                      </div>
                      <div className="text-xs text-lotus-grey-300 truncate mt-0.5">
                        {section.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-lotus-grey-700 bg-lotus-grey-800">
          <a
            href="https://lotus-protocol.gitbook.io/lotus/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-lotus-grey-300 hover:text-lotus-purple-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View full documentation
          </a>
        </div>
      </aside>

      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}

export default Sidebar;
