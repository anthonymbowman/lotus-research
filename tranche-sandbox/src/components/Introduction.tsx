import type { Section } from './Sidebar';
import { RoleDiagramCompact } from './RoleDiagram';

interface IntroductionProps {
  onNavigate: (section: Section) => void;
}

export function Introduction({ onNavigate }: IntroductionProps) {
  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="text-center py-8">
        <h2 className="text-3xl font-medium text-lotus-grey-100 mb-4">
          Welcome to Lotus Protocol
        </h2>
        <p className="text-xl text-lotus-grey-400 max-w-2xl mx-auto">
          A connected-liquidity lending protocol that transforms how
          lenders and borrowers interact in DeFi.
        </p>
      </div>

      {/* Lender & Borrower Role Explainer */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">
          Two Ways to Participate
        </h3>
        <RoleDiagramCompact />
      </div>

      {/* Market & Tranche Structure */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">
          Understanding Markets & Tranches
        </h3>
        <p className="text-lotus-grey-400 mb-6">
          Lotus organizes lending into Markets and Tranches, providing flexible risk management.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Market Definition */}
          <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h4 className="font-medium text-lotus-purple-300">Market</h4>
            </div>
            <p className="text-sm text-lotus-purple-200 mb-3">
              A Market defines the loan token and core parameters:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-lotus-purple-400 rounded-full" />
                <span className="text-lotus-grey-300">Loan Token (e.g., LotusUSD)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-lotus-purple-400 rounded-full" />
                <span className="text-lotus-grey-300">Interest Rate Model (IRM)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-lotus-purple-400 rounded-full" />
                <span className="text-lotus-grey-300">Liquidation Module</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-lotus-purple-400 rounded-full" />
                <span className="text-lotus-grey-300">Connected Tranches</span>
              </div>
            </div>
          </div>

          {/* Tranche Definition */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-medium text-blue-300">Tranche</h4>
            </div>
            <p className="text-sm text-blue-200 mb-3">
              A Tranche defines collateral and risk parameters:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span className="text-lotus-grey-300">Collateral Token (e.g., wstETH)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span className="text-lotus-grey-300">Price Oracle</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span className="text-lotus-grey-300">LLTV (Liquidation LTV)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Senior vs Junior explanation */}
        <div className="mt-6 bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
          <h4 className="font-medium text-lotus-grey-200 mb-3">Senior vs Junior Tranches</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="px-2 py-1 bg-emerald-900/50 rounded text-emerald-400 text-xs font-medium">SENIOR</div>
              <div>
                <p className="text-lotus-grey-300">Lower LLTV (75-80%)</p>
                <p className="text-lotus-grey-500 text-xs mt-1">Lower risk exposure, lower yield</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="px-2 py-1 bg-red-900/50 rounded text-red-400 text-xs font-medium">JUNIOR</div>
              <div>
                <p className="text-lotus-grey-300">Higher LLTV (90-95%)</p>
                <p className="text-lotus-grey-500 text-xs mt-1">Riskier, absorbs losses first, higher yield</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key concepts grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700 hover:border-lotus-purple-500/50 transition-colors">
          <div className="w-12 h-12 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-lotus-grey-100 mb-2">Tranches</h3>
          <p className="text-lotus-grey-400 text-sm">
            Risk-tiered pools where lenders choose their risk/reward profile.
            Senior tranches are safer, junior tranches earn more.
          </p>
        </div>

        <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700 hover:border-lotus-purple-500/50 transition-colors">
          <div className="w-12 h-12 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-lotus-grey-100 mb-2">Connected Liquidity</h3>
          <p className="text-lotus-grey-400 text-sm">
            Liquidity flows between tranches, creating a unified market
            instead of fragmented isolated pools.
          </p>
        </div>

        <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700 hover:border-lotus-purple-500/50 transition-colors">
          <div className="w-12 h-12 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-lotus-grey-100 mb-2">Productive Debt</h3>
          <p className="text-lotus-grey-400 text-sm">
            Idle liquidity earns a base rate from treasury-backed assets,
            compressing spreads and reducing volatility.
          </p>
        </div>
      </div>

      {/* How to use this documentation */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">
          How to Use This Documentation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lotus-purple-400 font-medium">1</span>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-200 mb-1">Follow the Flow</h4>
              <p className="text-sm text-lotus-grey-400">
                Sections are designed to build on each other. Start with LotusUSD
                to understand the base rate, then explore tranches and beyond.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lotus-purple-400 font-medium">2</span>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-200 mb-1">Interact & Explore</h4>
              <p className="text-sm text-lotus-grey-400">
                Adjust the simulators to see how values change. The best way to
                understand the math is to experiment with it.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lotus-purple-400 font-medium">3</span>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-200 mb-1">Jump Around</h4>
              <p className="text-sm text-lotus-grey-400">
                Already know the basics? Use the sidebar to jump directly to
                advanced topics like interest cascades or liquidations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lotus-purple-400 font-medium">4</span>
            </div>
            <div>
              <h4 className="font-medium text-lotus-grey-200 mb-1">Expand Formulas</h4>
              <p className="text-sm text-lotus-grey-400">
                Click "Show formula" sections to see the exact calculations
                behind each metric and rate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-lotus-purple-900/20 rounded-lg p-6 border border-lotus-purple-700/50">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-4">
          Ready to Start?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('vaults')}
            className="flex items-center gap-3 p-4 bg-lotus-grey-800 hover:bg-lotus-grey-700 border border-lotus-grey-700 hover:border-lotus-purple-500 rounded-lg transition-all group"
          >
            <div className="w-10 h-10 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center">
              <span className="text-lotus-purple-400 font-medium">2</span>
            </div>
            <div className="text-left">
              <div className="font-medium text-lotus-grey-100 group-hover:text-lotus-purple-300 transition-colors">
                Vaults
              </div>
              <div className="text-xs text-lotus-grey-500">Recommended start</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('tranches')}
            className="flex items-center gap-3 p-4 bg-lotus-grey-800 hover:bg-lotus-grey-700 border border-lotus-grey-700 hover:border-lotus-purple-500 rounded-lg transition-all group"
          >
            <div className="w-10 h-10 bg-lotus-grey-700 rounded-lg flex items-center justify-center">
              <span className="text-lotus-grey-400 font-medium">5</span>
            </div>
            <div className="text-left">
              <div className="font-medium text-lotus-grey-100 group-hover:text-lotus-purple-300 transition-colors">
                Tranches
              </div>
              <div className="text-xs text-lotus-grey-500">Core mechanics</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('advanced')}
            className="flex items-center gap-3 p-4 bg-lotus-grey-800 hover:bg-lotus-grey-700 border border-lotus-grey-700 hover:border-lotus-purple-500 rounded-lg transition-all group"
          >
            <div className="w-10 h-10 bg-lotus-grey-700 rounded-lg flex items-center justify-center">
              <span className="text-lotus-grey-400 font-medium">8</span>
            </div>
            <div className="text-left">
              <div className="font-medium text-lotus-grey-100 group-hover:text-lotus-purple-300 transition-colors">
                Advanced
              </div>
              <div className="text-xs text-lotus-grey-500">Deep dives</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Introduction;
