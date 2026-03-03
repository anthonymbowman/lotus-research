import { useId } from 'react';

// Stepper button component for increment/decrement
function StepperButton({
  direction,
  onClick,
  disabled = false
}: {
  direction: 'up' | 'down';
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-sm transition-colors touch-manipulation
        ${disabled
          ? 'bg-lotus-grey-700 text-lotus-grey-500 cursor-not-allowed'
          : 'bg-lotus-grey-700 text-lotus-grey-300 hover:bg-lotus-purple-600 hover:text-white active:bg-lotus-purple-700'
        }`}
      aria-label={direction === 'up' ? 'Increase' : 'Decrease'}
    >
      <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        {direction === 'up' ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        )}
      </svg>
    </button>
  );
}

interface RateInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  showSteppers?: boolean;
}

export function RateInput({
  label,
  value,
  onChange,
  description,
  min = 0,
  max = 1,
  step = 0.001,
  showSteppers = false,
}: RateInputProps) {
  const inputId = useId();
  const descriptionId = `${inputId}-description`;

  const handleStep = (direction: 'up' | 'down') => {
    const newValue = direction === 'up' ? value + step : value - step;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-lotus-grey-300">{label}</label>
      <div className={`flex items-center ${showSteppers ? 'gap-2' : ''}`}>
        {showSteppers && (
          <StepperButton
            direction="down"
            onClick={() => handleStep('down')}
            disabled={value <= min}
          />
        )}
        <div className="relative flex-1">
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
            className="w-full px-3 py-2 pr-8 bg-lotus-grey-900 border-2 border-lotus-purple-500/40 rounded-sm text-lotus-grey-100 font-mono text-sm
              hover:border-lotus-purple-400 hover:bg-lotus-grey-800
              focus:outline-none focus:ring-2 focus:ring-lotus-purple-500/50 focus:border-lotus-purple-500 focus:bg-lotus-grey-800
              transition-colors cursor-text text-center"
            step={(step * 100).toString()}
            min={(min * 100).toString()}
            max={(max * 100).toString()}
            aria-describedby={description ? descriptionId : undefined}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lotus-grey-400 text-sm">%</span>
        </div>
        {showSteppers && (
          <StepperButton
            direction="up"
            onClick={() => handleStep('up')}
            disabled={value >= max}
          />
        )}
      </div>
      {description && <p id={descriptionId} className="text-xs text-lotus-grey-400">{description}</p>}
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
        aria-label="Utilization percentage"
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
