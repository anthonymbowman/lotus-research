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

const SECTIONS: { id: Section; label: string; icon: string; description: string }[] = [
  { id: 'intro', label: 'Introduction', icon: '1', description: 'What is Lotus Protocol?' },
  { id: 'lotususd', label: 'LotusUSD & Productive Debt', icon: '2', description: 'Base rate & spread compression' },
  { id: 'risk', label: 'Tranche Risk', icon: '3', description: 'Why higher LLTV = higher risk' },
  { id: 'tranches', label: 'Tranches & Liquidity', icon: '4', description: 'Connected liquidity model' },
  { id: 'interest-bad-debt', label: 'Interest & Bad Debt', icon: '5', description: 'Interest cascade & bad debt' },
  { id: 'vaults', label: 'Vaults', icon: '6', description: 'Allocation strategies' },
];

export function Sidebar({ activeSection, onSectionChange, visitedSections }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-lotus-grey-800 border border-lotus-grey-700 rounded-lg text-lotus-grey-100 hover:bg-lotus-grey-700 transition-colors"
        aria-label={isCollapsed ? 'Open navigation' : 'Close navigation'}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    {/* Step number / checkmark */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
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
