/**
 * RoleDiagram - Visual diagram showing lender and borrower flows in Lotus Protocol
 */
export function RoleDiagram() {
  return (
    <div className="space-y-6">
      {/* Lenders Section */}
      <div className="bg-emerald-900/20 rounded-lg p-5 border border-emerald-700/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-emerald-900/50 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-emerald-300">Lenders</h3>
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Step 1 */}
          <div className="px-4 py-3 bg-emerald-900/30 border border-emerald-600 rounded-lg text-center min-w-[140px]">
            <div className="text-xs text-emerald-500 mb-1">Step 1</div>
            <div className="font-medium text-emerald-300 text-sm">Choose Tranche</div>
            <div className="text-xs text-emerald-400 mt-1">Select risk level</div>
          </div>

          <svg className="w-6 h-6 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>

          {/* Step 2 */}
          <div className="px-4 py-3 bg-emerald-900/30 border border-emerald-600 rounded-lg text-center min-w-[140px]">
            <div className="text-xs text-emerald-500 mb-1">Step 2</div>
            <div className="font-medium text-emerald-300 text-sm">Supply LotusUSD</div>
            <div className="text-xs text-emerald-400 mt-1">Deposit loan token</div>
          </div>

          <svg className="w-6 h-6 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>

          {/* Step 3 */}
          <div className="px-4 py-3 bg-emerald-900/30 border border-emerald-600 rounded-lg text-center min-w-[140px]">
            <div className="text-xs text-emerald-500 mb-1">Step 3</div>
            <div className="font-medium text-emerald-300 text-sm">Earn Yield</div>
            <div className="text-xs text-emerald-400 mt-1">Interest from borrowers</div>
          </div>
        </div>

        {/* Lender tranche options */}
        <div className="mt-4 pt-4 border-t border-emerald-700/30">
          <div className="text-sm text-emerald-400 mb-2 text-center">Tranche Selection Impact:</div>
          <div className="flex justify-center gap-4 text-xs">
            <div className="text-center">
              <div className="px-3 py-1 bg-emerald-800/50 rounded text-emerald-300">Lower LLTV (75-80%)</div>
              <div className="text-emerald-500 mt-1">Safer, Lower Yield</div>
            </div>
            <div className="text-center">
              <div className="px-3 py-1 bg-amber-800/50 rounded text-amber-300">Higher LLTV (90-95%)</div>
              <div className="text-amber-500 mt-1">Riskier, Higher Yield</div>
            </div>
          </div>
        </div>
      </div>

      {/* Borrowers Section */}
      <div className="bg-blue-900/20 rounded-lg p-5 border border-blue-700/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-900/50 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-blue-300">Borrowers</h3>
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Step 1 */}
          <div className="px-4 py-3 bg-blue-900/30 border border-blue-600 rounded-lg text-center min-w-[140px]">
            <div className="text-xs text-blue-500 mb-1">Step 1</div>
            <div className="font-medium text-blue-300 text-sm">Deposit Collateral</div>
            <div className="text-xs text-blue-400 mt-1">e.g., ETH, wstETH</div>
          </div>

          <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>

          {/* Step 2 */}
          <div className="px-4 py-3 bg-blue-900/30 border border-blue-600 rounded-lg text-center min-w-[140px]">
            <div className="text-xs text-blue-500 mb-1">Step 2</div>
            <div className="font-medium text-blue-300 text-sm">Choose Tranche</div>
            <div className="text-xs text-blue-400 mt-1">Select leverage level</div>
          </div>

          <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>

          {/* Step 3 */}
          <div className="px-4 py-3 bg-blue-900/30 border border-blue-600 rounded-lg text-center min-w-[140px]">
            <div className="text-xs text-blue-500 mb-1">Step 3</div>
            <div className="font-medium text-blue-300 text-sm">Borrow LotusUSD</div>
            <div className="text-xs text-blue-400 mt-1">Pay interest rate</div>
          </div>
        </div>

        {/* Borrower tranche options */}
        <div className="mt-4 pt-4 border-t border-blue-700/30">
          <div className="text-sm text-blue-400 mb-2 text-center">Tranche Selection Impact:</div>
          <div className="flex justify-center gap-4 text-xs">
            <div className="text-center">
              <div className="px-3 py-1 bg-blue-800/50 rounded text-blue-300">Higher LLTV (90-95%)</div>
              <div className="text-blue-500 mt-1">More Leverage, Higher Rate</div>
            </div>
            <div className="text-center">
              <div className="px-3 py-1 bg-emerald-800/50 rounded text-emerald-300">Lower LLTV (75-80%)</div>
              <div className="text-emerald-500 mt-1">Less Leverage, Lower Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Difference callout */}
      <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-lotus-purple-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-lotus-purple-300 mb-1">Key Insight: Risk/Reward Trade-off</h4>
            <p className="text-sm text-lotus-purple-200">
              Both lenders and borrowers choose tranches, but their perspectives differ:
            </p>
            <ul className="text-sm text-lotus-purple-200 mt-2 space-y-1">
              <li><span className="text-emerald-400">Lenders:</span> Higher LLTV = higher yield but more bad debt risk</li>
              <li><span className="text-blue-400">Borrowers:</span> Higher LLTV = more leverage but higher interest rate and liquidation risk</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version of the role diagram for inline use
 */
export function RoleDiagramCompact() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lender Card */}
        <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-emerald-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-emerald-300">Lenders</h4>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-200 mb-2">
            <span className="px-2 py-0.5 bg-emerald-900/50 rounded text-xs font-mono">USDC</span>
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span className="text-emerald-300">Deposit & earn yield</span>
          </div>
          <div className="text-xs text-emerald-400">
            Choose tranche based on desired risk/yield balance.
          </div>
        </div>

        {/* Borrower Card */}
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-blue-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h4 className="font-medium text-blue-300">Borrowers</h4>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-200 mb-2">
            <span className="text-blue-300">Borrow</span>
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span className="px-2 py-0.5 bg-blue-900/50 rounded text-xs font-mono">USDC</span>
          </div>
          <div className="text-xs text-blue-400">
            Choose tranche based on desired leverage level.
          </div>
        </div>
      </div>

      {/* USDC/LotusUSD explanation */}
      <div className="bg-lotus-grey-700/50 rounded-lg p-3 border border-lotus-grey-600">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-lotus-purple-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-lotus-grey-300">
            <span className="text-lotus-grey-300 font-medium">USDC auto-conversion:</span> When you deposit or withdraw, USDC is automatically converted to/from LotusUSD by the protocol. You always interact with USDC.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RoleDiagram;
