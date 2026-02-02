interface FailureModeCalloutProps {
  title: string;
  children: React.ReactNode;
}

export function FailureModeCallout({ title, children }: FailureModeCalloutProps) {
  return (
    <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-700/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-amber-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h4 className="font-medium text-amber-300 mb-1">{title}</h4>
          <div className="text-sm text-amber-200/80">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FailureModeCallout;
