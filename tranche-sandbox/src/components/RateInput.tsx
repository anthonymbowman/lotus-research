import { useId } from 'react';

interface RateInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function RateInput({
  label,
  value,
  onChange,
  description,
  min = 0,
  max = 1,
  step = 0.001,
}: RateInputProps) {
  const inputId = useId();
  const descriptionId = `${inputId}-description`;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-lotus-grey-300">{label}</label>
      <div className="relative">
        <input
          id={inputId}
          type="number"
          value={(value * 100).toFixed(2)}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value) / 100;
            if (!isNaN(newValue) && newValue >= min && newValue <= max) {
              onChange(newValue);
            }
          }}
          className="w-full px-3 py-2 pr-8 bg-lotus-grey-700 border border-lotus-grey-600 rounded-lg text-lotus-grey-100 font-mono focus:border-lotus-purple-500 focus:ring-1 focus:ring-lotus-purple-500 text-sm"
          step={(step * 100).toString()}
          min={(min * 100).toString()}
          max={(max * 100).toString()}
          aria-describedby={description ? descriptionId : undefined}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lotus-grey-300 text-sm">%</span>
      </div>
      {description && <p id={descriptionId} className="text-xs text-lotus-grey-300">{description}</p>}
    </div>
  );
}

interface UtilizationSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function UtilizationSlider({ value, onChange }: UtilizationSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-lotus-grey-300">Utilization</label>
        <span className="text-sm font-mono text-lotus-purple-400">{(value * 100).toFixed(1)}%</span>
      </div>
      <input
        type="range"
        value={value * 100}
        onChange={(e) => onChange(parseFloat(e.target.value) / 100)}
        min="0"
        max="100"
        step="0.5"
        className="w-full"
      />
      <div className="flex justify-between text-xs text-lotus-grey-300">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
