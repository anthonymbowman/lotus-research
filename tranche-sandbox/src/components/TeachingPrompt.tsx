import type { ReactNode } from 'react';

interface TeachingPromptProps {
  title?: string;
  children: ReactNode;
}

export function TeachingPrompt({ title = 'Try this:', children }: TeachingPromptProps) {
  return (
    <div className="bg-lotus-purple-900/20 rounded-lg p-4 border border-lotus-purple-700/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-lotus-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-lotus-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <span className="font-medium text-lotus-purple-300">{title}</span>
          <span className="text-lotus-purple-200"> {children}</span>
        </div>
      </div>
    </div>
  );
}

export default TeachingPrompt;
