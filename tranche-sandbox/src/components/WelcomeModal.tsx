interface WelcomeModalProps {
  onStartTour: () => void;
  onSkip: () => void;
}

export function WelcomeModal({ onStartTour, onSkip }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-lotus-grey-800 rounded-xl p-8 max-w-md mx-4 border border-lotus-grey-700 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-lotus-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-lotus-grey-100 mb-2">Welcome to Lotus Protocol</h2>
          <p className="text-lotus-grey-400">
            Learn how tranches, connected liquidity, and productive debt work together.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onStartTour}
            className="w-full py-3 px-4 bg-lotus-purple-600 hover:bg-lotus-purple-500 text-white font-medium rounded-lg transition-colors"
          >
            Take the Guided Tour
          </button>
          <button
            onClick={onSkip}
            className="w-full py-3 px-4 bg-lotus-grey-700 hover:bg-lotus-grey-600 text-lotus-grey-300 font-medium rounded-lg transition-colors"
          >
            Skip and Explore
          </button>
        </div>
      </div>
    </div>
  );
}
