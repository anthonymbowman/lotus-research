import { useState } from 'react';

const TRANCHE_LLTV = [75, 80, 85, 90, 95];

// Example rate calculation for visualization
// In reality, the IRM computes this from utilization
function getExampleSpread(lltv: number, utilization: number): number {
  // Base spread increases with LLTV (monotonicity)
  const baseSpread = {
    75: 1.0,
    80: 1.5,
    85: 2.5,
    90: 4.0,
    95: 6.0,
  }[lltv] || 2.0;

  // Utilization multiplier (kink effect)
  const targetUtil = 0.9;
  if (utilization <= targetUtil) {
    // Gentle slope below target
    return baseSpread * (0.5 + 0.5 * (utilization / targetUtil));
  } else {
    // Steep slope above target
    const excess = (utilization - targetUtil) / (1 - targetUtil);
    return baseSpread * (1 + excess * 2);
  }
}

export function IRMExplainer() {
  const [utilization, setUtilization] = useState(0.7);
  const baseRate = 3.0; // Example base rate from productive debt

  return (
    <div className="space-y-6">
      {/* What is an IRM */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-3">Interest Rate Models (IRMs)</h3>
        <p className="text-sm text-lotus-grey-300 mb-4">
          Each tranche has its own <strong className="text-lotus-grey-100">credit spread</strong> determined by its
          local <strong className="text-lotus-purple-300">borrow utilization</strong>. Higher utilization at a tranche
          means higher spreads for that tranche.
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
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-lotus-grey-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Simplified model. Actual IRM (Adaptive Linear Kink) has additional parameters.</span>
        </div>
      </div>

      {/* Monotonicity */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-2">Rate Monotonicity</h3>
        <p className="text-sm text-lotus-grey-300 mb-4">
          Rates <strong className="text-lotus-grey-100">always increase with LLTV</strong>. Junior tranches (higher LLTV)
          have higher rates than senior tranches because lenders face more risk and need compensation.
        </p>

        {/* Monotonicity visualization */}
        <div className="space-y-2">
          {TRANCHE_LLTV.map((lltv, i) => {
            const spread = getExampleSpread(lltv, utilization);
            const totalRate = baseRate + spread;
            const maxRate = baseRate + getExampleSpread(95, 1.0);
            const barWidth = (totalRate / maxRate) * 100;

            const colors = [
              { bg: 'bg-emerald-500', text: 'text-emerald-400' },
              { bg: 'bg-teal-500', text: 'text-teal-400' },
              { bg: 'bg-amber-500', text: 'text-amber-400' },
              { bg: 'bg-orange-500', text: 'text-orange-400' },
              { bg: 'bg-red-500', text: 'text-red-400' },
            ][i];

            return (
              <div key={lltv} className="flex items-center gap-3">
                <div className="w-12 text-sm font-mono text-lotus-grey-300">{lltv}%</div>
                <div className="flex-1 h-6 bg-lotus-grey-700 rounded overflow-hidden">
                  <div
                    className={`h-full ${colors.bg} flex items-center justify-end pr-2 transition-all duration-300`}
                    style={{ width: `${barWidth}%` }}
                  >
                    <span className="text-xs font-mono text-white/90">{totalRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className={`w-16 text-xs font-mono ${colors.text} text-right`}>
                  +{spread.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-lotus-grey-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-emerald-500 rounded" />
            <span>Lower risk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span>Higher risk</span>
          </div>
          <span className="text-lotus-grey-500">|</span>
          <span>Spreads shown on right</span>
        </div>
      </div>

      {/* Utilization → Rate (Kink Curve) */}
      <div className="bg-lotus-grey-800 rounded-lg p-6 border border-lotus-grey-700">
        <h3 className="text-lg font-medium text-lotus-grey-100 mb-2">Utilization Drives Spreads</h3>
        <p className="text-sm text-lotus-grey-300 mb-4">
          Each tranche's spread is set by its own <strong className="text-lotus-purple-300">borrow utilization</strong>.
          Higher utilization means more demand, so spreads increase—especially above the
          <strong className="text-amber-300"> target utilization</strong> (~90%).
        </p>

        {/* Utilization slider */}
        <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-lotus-grey-300">Borrow Utilization</span>
            <span className="text-lg font-mono font-semibold text-lotus-grey-100">
              {(utilization * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={utilization * 100}
            onChange={(e) => setUtilization(Number(e.target.value) / 100)}
            className="w-full accent-lotus-purple-500"
          />
          <div className="flex justify-between text-xs text-lotus-grey-500 mt-1">
            <span>0%</span>
            <span className="text-amber-400">90% target</span>
            <span>100%</span>
          </div>
        </div>

        {/* Kink curve visualization */}
        <div className="relative h-32 bg-lotus-grey-900 rounded-lg overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0">
            <div className="absolute left-[90%] top-0 bottom-0 border-l border-dashed border-amber-500/30" />
            <div className="absolute left-[90%] bottom-2 text-[10px] text-amber-400 -translate-x-1/2">target</div>
          </div>

          {/* Curve */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="90%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            {/* Gentle slope (0-90%) */}
            <line
              x1="0%"
              y1="90%"
              x2="90%"
              y2="50%"
              stroke="url(#curveGradient)"
              strokeWidth="3"
            />
            {/* Steep slope (90-100%) */}
            <line
              x1="90%"
              y1="50%"
              x2="100%"
              y2="5%"
              stroke="#ef4444"
              strokeWidth="3"
            />
          </svg>

          {/* Current utilization marker */}
          <div
            className="absolute bottom-0 w-0.5 bg-lotus-purple-400 transition-all duration-200"
            style={{
              left: `${utilization * 100}%`,
              height: '100%'
            }}
          />
          <div
            className="absolute w-3 h-3 bg-lotus-purple-400 rounded-full border-2 border-white transition-all duration-200"
            style={{
              left: `${utilization * 100}%`,
              bottom: utilization <= 0.9
                ? `${10 + (utilization / 0.9) * 40}%`
                : `${50 + ((utilization - 0.9) / 0.1) * 45}%`,
              transform: 'translate(-50%, 50%)'
            }}
          />

          {/* Labels */}
          <div className="absolute left-2 top-2 text-[10px] text-lotus-grey-500">Rate</div>
          <div className="absolute right-2 bottom-2 text-[10px] text-lotus-grey-500">Utilization</div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
          <div className="bg-emerald-900/20 rounded p-2 border border-emerald-700/50">
            <div className="text-emerald-400 font-medium">Below Target (0-90%)</div>
            <div className="text-emerald-300/70">Gentle rate increase</div>
          </div>
          <div className="bg-red-900/20 rounded p-2 border border-red-700/50">
            <div className="text-red-400 font-medium">Above Target (90-100%)</div>
            <div className="text-red-300/70">Steep rate increase</div>
          </div>
        </div>
      </div>

      {/* Adaptive behavior - collapsible */}
      <details className="bg-lotus-grey-800 rounded-lg border border-lotus-grey-700">
        <summary className="px-6 py-4 cursor-pointer text-lg font-medium text-lotus-grey-100 hover:bg-lotus-grey-700/30">
          About the Actual IRM
        </summary>
        <div className="px-6 pb-6 pt-2 space-y-4">
          <p className="text-sm text-lotus-grey-300">
            Lotus uses the <strong className="text-lotus-purple-300">Adaptive Linear Kink</strong> IRM,
            which automatically adjusts parameters based on observed utilization. The visualization above
            is simplified—the real model includes additional features:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
              <h4 className="text-sm font-medium text-lotus-grey-200 mb-2">Auto-Adjustment</h4>
              <p className="text-xs text-lotus-grey-400">
                Parameters update on each rate query based on how utilization compares to target.
                This keeps rates responsive without manual intervention.
              </p>
            </div>
            <div className="bg-lotus-grey-700/50 rounded-lg p-4 border border-lotus-grey-600">
              <h4 className="text-sm font-medium text-lotus-grey-200 mb-2">Guardrails</h4>
              <p className="text-xs text-lotus-grey-400">
                Rate changes are bounded to prevent sudden jumps. Grace periods for new markets
                and minimum update intervals provide additional stability.
              </p>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}

export default IRMExplainer;
