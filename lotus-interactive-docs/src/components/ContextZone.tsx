/**
 * ContextZone - Minimal context above the fold
 *
 * Provides a brief one-liner explanation without overwhelming
 * the user before they interact with the main content.
 */

interface ContextZoneProps {
  /** One-sentence explanation of what this page is about */
  context: string;
  /** Optional bullet points of what you'll learn (kept minimal) */
  whatYoullLearn?: string[];
}

export function ContextZone({ context, whatYoullLearn }: ContextZoneProps) {
  return (
    <div className="mb-6">
      <p className="text-lg text-lotus-grey-200 leading-relaxed">
        {context}
      </p>
      {whatYoullLearn && whatYoullLearn.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {whatYoullLearn.map((point, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1.5 bg-lotus-grey-800/50 border border-lotus-grey-700 rounded-sm text-lotus-grey-300"
            >
              {point}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContextZone;
