/**
 * DetailZone - Wrapper for below-the-fold explanatory content
 *
 * Creates a visually distinct (muted) section for deep-dive content.
 * Shows a teaser of what's inside to encourage exploration.
 */

interface DetailZoneProps {
  children: React.ReactNode;
  /** Title for the detail section */
  title?: string;
  /** Teaser items to show when collapsed */
  teaserItems?: string[];
}

export function DetailZone({
  children,
  title = 'Go Deeper',
  teaserItems = []
}: DetailZoneProps) {
  return (
    <details className="mt-12 group">
      <summary className="cursor-pointer list-none border-t border-lotus-grey-700 pt-6 pb-4 hover:bg-lotus-grey-800/30 -mx-2 px-2 rounded transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 bg-lotus-grey-700 rounded-sm flex items-center justify-center border border-lotus-grey-700">
            <svg
              className="w-3 h-3 text-lotus-grey-400 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-lotus-grey-100">{title}</h3>
          <div className="flex-1 border-t border-dashed border-lotus-grey-700" />
        </div>

        {/* Teaser items - show what's inside */}
        {teaserItems.length > 0 && (
          <div className="flex flex-wrap gap-2 ml-9 group-open:hidden">
            {teaserItems.map((item, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 bg-lotus-grey-800/80 border border-lotus-grey-700 rounded-sm text-lotus-grey-400 hover:text-lotus-grey-300 hover:border-lotus-grey-600 transition-colors"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </summary>

      {/* Muted styling for detail content */}
      <div className="pt-4 pb-2 space-y-6 opacity-95">
        {children}
      </div>
    </details>
  );
}

export default DetailZone;
