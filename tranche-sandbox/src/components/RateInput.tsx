interface RateInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Input component for rate values (displays as percentage)
 */
export function RateInput({
  label,
  value,
  onChange,
  description,
  min = 0,
  max = 1,
  step = 0.001,
}: RateInputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={(value * 100).toFixed(1)}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value) / 100;
            if (!isNaN(newValue) && newValue >= min && newValue <= max) {
              onChange(newValue);
            }
          }}
          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          step={(step * 100).toString()}
          min={(min * 100).toString()}
          max={(max * 100).toString()}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
      </div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}

interface UtilizationSliderProps {
  value: number;
  onChange: (value: number) => void;
}

/**
 * Slider component for utilization
 */
export function UtilizationSlider({ value, onChange }: UtilizationSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">Utilization</label>
        <span className="text-sm font-mono text-indigo-600">{(value * 100).toFixed(1)}%</span>
      </div>
      <input
        type="range"
        value={value * 100}
        onChange={(e) => onChange(parseFloat(e.target.value) / 100)}
        min="0"
        max="100"
        step="0.5"
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
