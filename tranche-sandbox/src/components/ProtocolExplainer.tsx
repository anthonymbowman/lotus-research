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
          <p className="mb-4">
            {problem.intro[1]}
          </p>
          <p>
            {problem.intro[2]}{' '}
            <a
              href={problem.learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lotus-purple-400 hover:text-lotus-purple-300 underline"
            >
              Learn more
            </a>.
          </p>
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
            <span className="text-lotus-purple-400 font-semibold">Lotus</span> is an onchain lending protocol that lets lenders and borrowers meet on a risk curve inside a single market. Instead of creating separate markets for every risk setting, Lotus uses <span className="text-emerald-400 font-medium">tranches</span> to offer multiple risk-return options while keeping liquidity connected.
          </p>
          <p className="mb-4">
            {solution.overview[1]} {solution.interestNote}
          </p>
          <p className="mb-4">
            {solution.overview[2]}
          </p>
          <details className="bg-blue-900/20 rounded-lg border border-blue-700/40 group hover:border-blue-600/50 transition-colors">
            <summary className="px-4 py-3 cursor-pointer list-none flex items-center gap-3 text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors">
              <svg
                className="w-5 h-5 text-blue-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="flex-1">{solution.terminologyNote.title}</span>
              <svg
                className="w-4 h-4 text-blue-400 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 pb-4 space-y-3 text-sm text-lotus-grey-300 leading-relaxed border-t border-lotus-grey-700/50 pt-3">
              {solution.terminologyNote.paragraphs.map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </details>
        </div>

        {/* Tranche visualization */}
        <div className="bg-lotus-grey-900/50 rounded-xl border border-lotus-grey-700 p-4">
          <div className="flex items-center justify-center gap-6">
            <span className="text-xs text-emerald-400 font-medium whitespace-nowrap">Senior<br/><span className="text-lotus-grey-300 font-normal">Lower LLTV</span></span>
            <div className="flex items-center gap-1.5">
              {[
                { lltv: 75, color: 'bg-emerald-500' },
                { lltv: 80, color: 'bg-emerald-400' },
                { lltv: 85, color: 'bg-amber-500' },
                { lltv: 90, color: 'bg-orange-500' },
                { lltv: 95, color: 'bg-red-500' },
              ].map((t) => (
                <div key={t.lltv} className={`${t.color} rounded px-2.5 py-1.5`}>
                  <span className="font-mono text-xs font-bold text-white">{t.lltv}%</span>
                </div>
              ))}
            </div>
            <span className="text-xs text-red-400 font-medium whitespace-nowrap text-right">Junior<br/><span className="text-lotus-grey-300 font-normal">Higher LLTV</span></span>
          </div>
          <p className="text-center text-xs text-lotus-grey-300 mt-3">Tranches in a single market · wstETH / LotusUSD</p>
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
