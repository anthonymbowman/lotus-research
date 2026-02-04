import { content } from '../content';

const { protocolExplainer } = content;

export function ProtocolExplainer() {
  const { problem } = protocolExplainer;

  return (
    <div className="bg-gradient-to-b from-lotus-grey-800 to-lotus-grey-900 rounded-2xl border border-lotus-grey-700 overflow-hidden shadow-xl">
      <div className="px-5 py-3 border-b border-lotus-grey-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
            {problem.badge}
          </div>
        </div>
        <h3 className="text-sm font-semibold text-lotus-grey-100">{problem.heading}</h3>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="text-sm text-lotus-grey-200 leading-relaxed">
          <p className="mb-4">
            {problem.intro[0]}
          </p>
          <p>
            {problem.intro[1]}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problem.points.map((point, index) => (
            <div key={point.title} className="bg-lotus-grey-900/50 rounded-lg px-4 py-4 border border-lotus-grey-700">
              <div className="text-[10px] uppercase tracking-wide text-lotus-grey-500 mb-1">
                Problem {index + 1}
              </div>
              <h4 className="text-sm font-semibold text-lotus-grey-100 mb-1">{point.title}</h4>
              <p className="text-sm text-lotus-grey-300">{point.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LotusSolution() {
  const { solution } = protocolExplainer;

  return (
    <div className="bg-gradient-to-b from-lotus-grey-800 to-lotus-grey-900 rounded-2xl border border-lotus-grey-700 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-3 border-b border-lotus-grey-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
            {solution.badge}
          </div>
        </div>
        <h3 className="text-sm font-semibold text-lotus-grey-100">{solution.heading}</h3>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Overview */}
        <div className="text-sm text-lotus-grey-200 leading-relaxed">
          <p className="mb-4">
            <span className="text-lotus-purple-400 font-semibold">Lotus</span> is an onchain lending protocol that lets lenders and borrowers meet on a risk curve inside a single market. Instead of creating separate pools for every risk setting, Lotus uses <span className="text-emerald-400 font-medium">tranches</span> to offer multiple risk levels while keeping liquidity connected.
          </p>
          <p>
            {solution.overview[1]}
          </p>
          <div className="mt-4 bg-lotus-grey-900/50 rounded-lg px-4 py-3 border border-lotus-grey-700">
            <p className="text-xs text-lotus-grey-300">
              <span className="font-semibold text-lotus-grey-200">Terminology note:</span> {solution.terminologyNote}
            </p>
          </div>
        </div>

        {/* Tranche visualization */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[
            { lltv: 75, color: 'bg-emerald-500', label: 'Senior' },
            { lltv: 80, color: 'bg-emerald-400' },
            { lltv: 85, color: 'bg-amber-500' },
            { lltv: 90, color: 'bg-orange-500' },
            { lltv: 95, color: 'bg-red-500', label: 'Junior' },
          ].map((t, i) => (
            <div key={t.lltv} className="flex flex-col items-center gap-1">
              {i === 0 && <span className="text-xs text-emerald-400 font-semibold">Senior</span>}
              {i === 4 && <span className="text-xs text-red-400 font-semibold">Junior</span>}
              {i !== 0 && i !== 4 && <span className="text-xs text-transparent">-</span>}
              <div className={`${t.color} rounded-lg px-3 py-2`}>
                <span className="font-mono text-sm font-bold text-white">{t.lltv}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interest and Loss Allocation */}
        <div className="text-sm text-lotus-grey-200 leading-relaxed">
          <p>
            {solution.interestNote}
          </p>
        </div>

        {/* LotusUSD Section */}
        <div className="bg-lotus-purple-900/20 rounded-xl p-5 border border-lotus-purple-700/50">
          <h4 className="text-sm font-semibold text-lotus-purple-300 mb-3">{solution.lotusUSD.heading}</h4>
          <p className="text-sm text-lotus-grey-200 leading-relaxed">
            In USD-denominated Lotus markets, the loan asset is <span className="text-lotus-purple-400 font-medium">LotusUSD</span>. LotusUSD is a vault token backed by USDC and tokenized short-term US Treasuries. Its goal is to earn a rate that is close to the risk-free rate on deployed assets while maintaining onchain liquidity. Using a yield-bearing token as the loan asset is called <span className="text-emerald-400 font-medium">"productive debt"</span>.
          </p>
        </div>

        {/* Productive Debt Benefits moved to Stable Backing */}
      </div>
    </div>
  );
}

export default ProtocolExplainer;
