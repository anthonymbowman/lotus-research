import { useState, useEffect, useRef } from 'react';
import { useFocusTrap } from './useFocusTrap';

interface TourStep {
  title: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Lotus Protocol',
    description: 'This interactive documentation will help you understand how Lotus\'s lending protocol works. You can explore at your own pace.',
  },
  {
    title: 'Navigate by Section',
    description: 'Use the sidebar to jump between topics. Each section builds on the previous one, but you can explore in any order.',
  },
  {
    title: 'Start with LotusUSD',
    description: 'LotusUSD is the foundation. It generates a base rate from treasury backing that powers the entire system.',
  },
  {
    title: 'Interactive Simulators',
    description: 'Adjust values and see real-time calculations. The simulators help you understand the math behind the protocol.',
  },
  {
    title: 'Ready to Explore',
    description: 'You\'re all set! Start with the Introduction or jump to any section that interests you.',
  },
];

interface GuidedTourProps {
  onComplete: () => void;
}

export function GuidedTour({ onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setIsVisible(false);
      setTimeout(() => onComplete(), 300);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => onComplete(), 300);
  };

  useFocusTrap(modalRef, isVisible, handleSkip);

  useEffect(() => {
    if (!isVisible) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="guided-tour-title">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-lotus-grey-800 border border-lotus-grey-700 rounded-xl p-8 max-w-md w-full mx-4 shadow-lotus-lg animate-slideIn focus:outline-none"
        tabIndex={-1}
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {TOUR_STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-lotus-purple-500 w-6'
                  : index < currentStep
                  ? 'bg-lotus-purple-800'
                  : 'bg-lotus-grey-600'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-lotus-purple-900/50 border border-lotus-purple-500 rounded-2xl flex items-center justify-center">
            {currentStep === 0 && (
              <svg className="w-8 h-8 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )}
            {currentStep === 1 && (
              <svg className="w-8 h-8 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            )}
            {currentStep === 2 && (
              <svg className="w-8 h-8 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {currentStep === 3 && (
              <svg className="w-8 h-8 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
            {currentStep === 4 && (
              <svg className="w-8 h-8 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h3 id="guided-tour-title" className="text-xl font-medium text-lotus-grey-100 mb-3 font-heading">
            {step.title}
          </h3>
          <p className="text-lotus-grey-400 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="text-sm text-lotus-grey-500 hover:text-lotus-grey-300 transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-lotus-purple-500 hover:bg-lotus-purple-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isLastStep ? 'Get Started' : 'Next'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuidedTour;
