interface WelcomeModalProps {
  onStartTour: () => void;
  onSkip: () => void;
}

export function WelcomeModal({ onStartTour, onSkip }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-lotus-grey-800 border border-lotus-grey-700 rounded-xl max-w-lg w-full mx-4 shadow-lotus-lg animate-slideIn overflow-hidden">
        {/* Gradient header */}
        <div className="h-2 bg-gradient-to-r from-lotus-purple-800 via-lotus-purple-500 to-lotus-purple-800" />

        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-lotus-purple-900/50 border border-lotus-purple-500/50 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-medium text-lotus-grey-100 mb-3">
              Welcome to Lotus Protocol
            </h2>
            <p className="text-lotus-grey-400 leading-relaxed mb-6">
              This interactive documentation will help you understand how Lotus's
              connected-liquidity lending protocol works.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-lotus-grey-700/50 rounded-lg">
                <div className="text-lotus-purple-400 mb-1">
                  <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-xs text-lotus-grey-300">Interactive</div>
              </div>
              <div className="p-3 bg-lotus-grey-700/50 rounded-lg">
                <div className="text-lotus-purple-400 mb-1">
                  <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-xs text-lotus-grey-300">Real-time</div>
              </div>
              <div className="p-3 bg-lotus-grey-700/50 rounded-lg">
                <div className="text-lotus-purple-400 mb-1">
                  <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="text-xs text-lotus-grey-300">Educational</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={onStartTour}
              className="w-full px-6 py-3 bg-lotus-purple-500 hover:bg-lotus-purple-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Take the Tour
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={onSkip}
              className="w-full px-6 py-3 text-lotus-grey-400 hover:text-lotus-grey-200 font-medium transition-colors"
            >
              Skip, I'll explore on my own
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;
