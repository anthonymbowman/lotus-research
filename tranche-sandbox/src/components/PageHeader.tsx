interface PageHeaderProps {
  whatYoullLearn: string[];
  tryThis?: string;
}

export function PageHeader({ whatYoullLearn, tryThis }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {/* Learning objectives */}
      {whatYoullLearn.length > 0 && (
        <div className="bg-lotus-grey-800/50 border border-lotus-grey-700 rounded-lg p-5 mb-6">
          <h4 className="text-sm font-medium text-lotus-purple-400 uppercase tracking-wide mb-3">
            What you'll learn
          </h4>
          <ul className="space-y-2">
            {whatYoullLearn.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-lotus-grey-200">
                <svg className="w-5 h-5 text-lotus-purple-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Try this prompt */}
      {tryThis && (
        <div className="flex items-start gap-3 bg-lotus-purple-900/20 border border-lotus-purple-800/50 rounded-lg p-4">
          <div className="w-8 h-8 bg-lotus-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-lotus-purple-300 mb-1">Try this</h4>
            <p className="text-lotus-grey-200">{tryThis}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PageHeader;
