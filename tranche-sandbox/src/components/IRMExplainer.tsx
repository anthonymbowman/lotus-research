interface IRMExplainerProps {
  tranches: { lltv: number; borrowRate: number }[];
  baseRate: number;
}

export function IRMExplainer({ tranches, baseRate }: IRMExplainerProps) {
  const trancheCount = tranches.length;
  const baseRatePct = (baseRate * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* What is an IRM */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-3">Interest Rate Models (IRMs)</h3>
        <p className="text-sm text-lotus-grey-300 mb-4">
          Each tranche has a <strong className="text-lotus-grey-100">credit spread</strong> set by its own
          <strong className="text-lotus-purple-300"> borrow utilization</strong>. Higher utilization means higher spreads.
        </p>

        <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
          <div className="text-sm font-mono text-center">
            <span className="text-orange-400">Borrow Rate</span>
            <span className="text-lotus-grey-400"> = </span>
            <span className="text-emerald-400">Base Rate</span>
            <span className="text-lotus-grey-400"> + </span>
            <span className="text-lotus-purple-400">Credit Spread</span>
          </div>
          <div className="text-xs text-lotus-grey-400 text-center mt-2">
            Base Rate from productive debt | Credit Spread from tranche's borrow utilization
          </div>
          <div className="text-xs text-lotus-grey-500 text-center mt-1">
            Current base rate: {baseRatePct}% across {trancheCount} tranches
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-lotus-grey-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Simplified model for educational purposes.</span>
        </div>
      </div>

      {/* Adaptive behavior - plain language */}
      <div className="bg-lotus-grey-800 rounded-lg border border-lotus-grey-700 p-6">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-3">Adaptive Linear Kink IRM</h3>
        <p className="text-sm text-lotus-grey-300 mb-4">
          The IRM raises rates gently up to a target utilization, then ramps rates faster once utilization
          passes that target to protect liquidity. In LLTV-ordered markets, junior tranches tend to have
          higher borrow utilization, which typically results in higher credit spreads — though this is a
          market outcome, not a protocol guarantee.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-lotus-grey-300">
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <div className="font-medium text-lotus-grey-100 mb-1">Below target</div>
            <div>Rates rise gradually as utilization increases.</div>
          </div>
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <div className="font-medium text-lotus-grey-100 mb-1">Above target</div>
            <div>Rates rise more steeply to curb demand and attract supply.</div>
          </div>
          <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
            <div className="font-medium text-lotus-grey-100 mb-1">Adaptive</div>
            <div>Parameters adjust over time based on recent utilization.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IRMExplainer;
