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
 * Call-to-action component for driving users to the main Lotus site.
 * Tracks clicks via analytics.
 */
export function AppCTA({ context, heading, description }: AppCTAProps) {
  const handleClick = () => {
    analytics.externalAppClick(`site_${context}`);
  };

  const defaultHeading = context === 'vaults'
    ? "Ready to learn more?"
    : "Ready to explore Lotus?";

  const defaultDescription = context === 'vaults'
    ? "Visit the Lotus Labs site to learn more about the protocol and get started."
    : "Visit Lotus Labs to discover how the protocol can work for you.";

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
        <a
          href="https://lotuslabs.net"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-lotus-purple-600 hover:bg-lotus-purple-500 rounded-lg text-white font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Visit Lotus Labs
        </a>
      </div>
    </div>
  );
}

export default AppCTA;
