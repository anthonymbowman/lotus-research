import type { Section } from './Sidebar';
import { RoleDiagramCompact } from './RoleDiagram';
import { ConceptPrimer } from './ConceptPrimer';
import { TermDefinition } from './TermDefinition';

interface IntroductionProps {
  onNavigate: (section: Section) => void;
}

export function Introduction({ onNavigate }: IntroductionProps) {
  return (
    <div className="space-y-8">
      {/* Key Concepts Primer */}
      <ConceptPrimer concepts={['connected-liquidity', 'productive-debt', 'tranche-seniority']} />

      {/* Lender & Borrower Role Explainer */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">
          Two Ways to Participate
        </h3>
        <RoleDiagramCompact />
      </div>

      {/* The Lotus Difference */}
      <div className="bg-lotus-purple-900/20 rounded-lg p-6 border border-lotus-purple-700/50">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">
          The Lotus Difference
        </h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="font-medium text-lotus-purple-300">
                <TermDefinition term="connected-liquidity">Connected Liquidity</TermDefinition>
              </span>
              <span className="text-lotus-grey-400"> — Unlike isolated pools, liquidity flows between tranches creating deeper markets and more efficient rates.</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="font-medium text-lotus-purple-300">
                <TermDefinition term="productive-debt">Productive Debt</TermDefinition>
              </span>
              <span className="text-lotus-grey-400"> — Idle liquidity earns yield from treasury-backed assets, compressing <TermDefinition term="spread">spreads</TermDefinition> and reducing rate volatility.</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <span className="font-medium text-lotus-purple-300">Risk-Tiered Tranches</span>
              <span className="text-lotus-grey-400"> — Choose your risk exposure. <TermDefinition term="tranche-seniority">Senior tranches</TermDefinition> offer safety, junior tranches offer higher yields.</span>
            </div>
          </li>
        </ul>
      </div>

      {/* Get Started CTA */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700 text-center">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-2">
          Ready to explore?
        </h3>
        <p className="text-lotus-grey-400 mb-6">
          Start with Vaults to see how deposits are aggregated and allocated across tranches.
        </p>
        <button
          onClick={() => onNavigate('vaults')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-lotus-purple-600 hover:bg-lotus-purple-500 text-white font-medium rounded-lg transition-colors"
        >
          <span>Start with Vaults</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Introduction;
