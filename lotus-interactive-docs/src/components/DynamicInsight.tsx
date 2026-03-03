import type { ReactNode } from 'react';

interface DynamicInsightProps {
  show: boolean;
  variant: 'info' | 'warning' | 'success';
  children: ReactNode;
}

const variantStyles = {
  info: {
    container: 'bg-lotus-purple-900/20 border-lotus-purple-700/50',
    icon: 'text-lotus-purple-400 bg-lotus-purple-900/50',
    text: 'text-lotus-purple-200',
  },
  warning: {
    container: 'bg-rating-b/10 border-rating-b/50',
    icon: 'text-rating-b bg-rating-b/20',
    text: 'text-rating-b',
  },
  success: {
    container: 'bg-rating-a/15 border-rating-a/50',
    icon: 'text-rating-a bg-rating-a/20',
    text: 'text-rating-a',
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
    <div className={`rounded p-4 border ${styles.container} animate-fadeIn`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
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
