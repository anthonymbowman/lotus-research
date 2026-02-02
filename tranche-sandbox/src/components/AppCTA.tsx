import { analytics } from '../analytics';

interface AppCTAProps {
  /** Context where this CTA appears */
  context: 'intro' | 'vaults' | 'footer';
  /** Optional custom heading */
  heading?: string;
  /** Optional custom description */
  description?: string;
}

/**
 * Call-to-action component for driving users to the main Lotus app.
 * Tracks clicks via analytics.
 */
export function AppCTA({ context, heading, description }: AppCTAProps) {
  const handleAppClick = () => {
    analytics.externalAppClick(`app_${context}`);
  };

  const handleTestnetClick = () => {
    analytics.externalAppClick(`testnet_${context}`);
  };

  const defaultHeading = context === 'vaults'
    ? "Ready to start earning?"
    : "Ready to experience Lotus?";

  const defaultDescription = context === 'vaults'
    ? "Put your strategy into action. Start with testnet to learn risk-free, or jump straight into the app."
    : "Explore the protocol hands-on. Try testnet to learn without risk, or dive right in.";

  return (
    <div className="bg-gradient-to-r from-lotus-purple-900/40 to-lotus-purple-800/20 rounded-xl p-6 border border-lotus-purple-700/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-lotus-grey-100 mb-1">
            {heading || defaultHeading}
          </h3>
          <p className="text-sm text-lotus-grey-300">
            {description || defaultDescription}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://testnet.lotus.finance"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleTestnetClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-lotus-grey-700 hover:bg-lotus-grey-600 border border-lotus-grey-600 rounded-lg text-lotus-grey-200 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Try Testnet
          </a>
          <a
            href="https://app.lotus.finance"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAppClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-lotus-purple-600 hover:bg-lotus-purple-500 rounded-lg text-white font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Open App
          </a>
        </div>
      </div>
    </div>
  );
}

export default AppCTA;
