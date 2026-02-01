import { useState } from 'react';

interface GuidedTourProps {
  onComplete: () => void;
}

const tourSteps = [
  {
    title: 'Navigation',
    description: 'Use the sidebar to navigate between sections. Each section builds on the previous one.',
  },
  {
    title: 'Interactive Elements',
    description: 'Adjust sliders and inputs to see how changes affect the protocol mechanics in real-time.',
  },
  {
    title: 'Learning Points',
    description: 'Each section starts with key concepts you\'ll learn. Use these to track your progress.',
  },
];

export function GuidedTour({ onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-lotus-grey-800 rounded-xl p-6 max-w-sm mx-4 border border-lotus-grey-700 shadow-2xl">
        {/* Progress indicator */}
        <div className="flex gap-1 mb-4">
          {tourSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= currentStep ? 'bg-lotus-purple-500' : 'bg-lotus-grey-600'}`}
            />
          ))}
        </div>

        <h3 className="text-lg font-semibold text-lotus-grey-100 mb-2">{step.title}</h3>
        <p className="text-sm text-lotus-grey-300 mb-6">{step.description}</p>

        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-2 px-4 text-lotus-grey-300 hover:text-lotus-grey-300 text-sm transition-colors"
          >
            Skip Tour
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-2 px-4 bg-lotus-purple-600 hover:bg-lotus-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {currentStep < tourSteps.length - 1 ? 'Next' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  );
}
