import { useState, useMemo, useCallback } from 'react';
import type { TrancheInput } from './types';
import { computeAllTranches } from './math/lotusAccounting';
import { PRESETS, createDefaultTranches, presetToTranches } from './presets';
import { TrancheTable } from './components/TrancheTable';
import { FundingMatrix } from './components/FundingMatrix';
import { RateChart } from './components/RateChart';

function App() {
  const [tranches, setTranches] = useState<TrancheInput[]>(createDefaultTranches);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Compute all derived values (pendingInterest is always 0 now)
  const computedTranches = useMemo(() => {
    return computeAllTranches(tranches, false);
  }, [tranches]);

  // Handle tranche input changes
  const handleTrancheChange = useCallback((
    id: number,
    field: keyof TrancheInput,
    value: number
  ) => {
    setTranches(prev => prev.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
    setSelectedPreset(null); // Clear preset on manual change
  }, []);

  // Load a preset
  const handleLoadPreset = useCallback((presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setTranches(presetToTranches(preset));
      setSelectedPreset(presetKey);
    }
  }, []);

  // Reset to default
  const handleReset = useCallback(() => {
    setTranches(createDefaultTranches());
    setSelectedPreset(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Lotus Tranche Stack Liquidity Sandbox
          </h1>
          <p className="text-slate-600 mt-1">
            Explore how Lotus's connected-liquidity model distributes supply across tranches ordered by LLTV.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-600">Presets:</span>
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handleLoadPreset(key)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors
                    ${selectedPreset === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  title={preset.description}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800
                hover:bg-slate-100 rounded-md transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Preset description */}
          {selectedPreset && PRESETS[selectedPreset] && (
            <div className="mt-3 text-sm text-slate-500 italic">
              {PRESETS[selectedPreset].description}
            </div>
          )}
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
          <TrancheTable
            tranches={computedTranches}
            onTrancheChange={handleTrancheChange}
          />
        </div>

        {/* Rate Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
          <RateChart tranches={computedTranches} />
        </div>

        {/* Funding Matrix */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <FundingMatrix
            tranches={computedTranches}
            includePendingInterest={false}
          />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>
            This simulator is for educational purposes only.
            See the{' '}
            <a
              href="https://docs.lotus.finance"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              Lotus documentation
            </a>{' '}
            for complete technical details.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
