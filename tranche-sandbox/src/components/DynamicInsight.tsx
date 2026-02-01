import type { ReactNode } from 'react';

interface DynamicInsightProps {
  show: boolean;
  variant: 'info' | 'warning' | 'success';
  children: ReactNode;
}

const variantStyles = {
  info: {
    container: 'bg-blue-900/20 border-blue-700/50',
    icon: 'text-blue-400 bg-blue-900/50',
    text: 'text-blue-200',
  },
  warning: {
    container: 'bg-amber-900/20 border-amber-700/50',
    icon: 'text-amber-400 bg-amber-900/50',
    text: 'text-amber-200',
  },
  success: {
    container: 'bg-emerald-900/20 border-emerald-700/50',
    icon: 'text-emerald-400 bg-emerald-900/50',
    text: 'text-emerald-200',
  },
};

const icons = {
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function DynamicInsight({ show, variant, children }: DynamicInsightProps) {
  if (!show) return null;

  const styles = variantStyles[variant];

  return (
    <div className={`rounded-lg p-4 border ${styles.container} animate-fadeIn`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
          {icons[variant]}
        </div>
        <div className={`text-sm ${styles.text}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default DynamicInsight;
