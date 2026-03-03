import { ResetButton } from './ResetButton';

/**
 * InteractiveZone - Visual wrapper that signals "this content is interactive"
 *
 * Provides a distinct visual treatment for interactive elements, making it
 * immediately clear what can be manipulated on a page.
 */

interface InteractiveZoneProps {
  children: React.ReactNode;
  /** "Try this" prompt displayed above the interactive content */
  tryThis?: string;
  /** Optional title for the zone */
  title?: string;
  /** Optional reset callback - shows reset button when provided */
  onReset?: () => void;
  /** Label for reset button */
  resetLabel?: string;
}

export function InteractiveZone({ children, tryThis, title, onReset, resetLabel }: InteractiveZoneProps) {
  return (
    <div className="relative">
      {/* Try this prompt - directly connected to the interactive content */}
      {tryThis && (
        <div className="flex items-center gap-3 mb-4 bg-lotus-purple-900/30 border border-lotus-grey-700 rounded px-4 py-3">
          <div className="w-8 h-8 bg-lotus-purple-500 rounded-sm flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-medium text-lotus-purple-300">Try this</span>
            <p className="text-lotus-grey-200 text-sm">{tryThis}</p>
          </div>
        </div>
      )}

      {/* Interactive content wrapper with visual affordance - main structural frame = 0px */}
      <div className="bg-lotus-grey-950 rounded-none border border-lotus-grey-700 overflow-hidden">
        {(title || onReset) && (
          <div className="px-4 sm:px-6 py-3 border-b border-lotus-grey-700 bg-lotus-purple-900/20 flex items-center justify-between">
            {title && (
              <h3 className="text-sm font-medium text-lotus-purple-300 uppercase tracking-wide">{title}</h3>
            )}
            {onReset && (
              <ResetButton onReset={onReset} label={resetLabel} />
            )}
          </div>
        )}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default InteractiveZone;
