/**
 * Lightweight analytics abstraction for tracking user interactions.
 * Currently logs to console in development; can be connected to an analytics service.
 */

export type AnalyticsEvent =
  | { name: 'tour_start' }
  | { name: 'tour_complete' }
  | { name: 'nav_click'; props: { section: string } }
  | { name: 'cta_next_click'; props: { from: string; to: string } }
  | { name: 'simulator_interact'; props: { simulator: string; input: string; value: number } }
  | { name: 'search_used'; props: { query: string; result?: string } }
  | { name: 'strategy_selected'; props: { strategy: string } }
  | { name: 'bad_debt_simulated'; props: { scenario: string } }
  | { name: 'external_app_click'; props: { destination: string } }
  | { name: 'page_view'; props: { section: string } };

// Type-safe track function
export function track<T extends AnalyticsEvent>(
  eventName: T['name'],
  props?: T extends { props: infer P } ? P : never
): void {
  // In development, log to console
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${eventName}`, props || '');
  }

  // Production: Send to analytics service
  // Example integrations:
  // - window.gtag?.('event', eventName, props);
  // - window.plausible?.(eventName, { props });
  // - window.posthog?.capture(eventName, props);

  // Emit a custom event for easy integration
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('lotus-analytics', {
        detail: { event: eventName, props },
      })
    );
  }
}

// Convenience wrappers for common events
export const analytics = {
  tourStart: () => track('tour_start'),
  tourComplete: () => track('tour_complete'),
  navClick: (section: string) => track('nav_click', { section }),
  ctaNextClick: (from: string, to: string) => track('cta_next_click', { from, to }),
  simulatorInteract: (simulator: string, input: string, value: number) =>
    track('simulator_interact', { simulator, input, value }),
  searchUsed: (query: string, result?: string) => track('search_used', { query, result }),
  strategySelected: (strategy: string) => track('strategy_selected', { strategy }),
  badDebtSimulated: (scenario: string) => track('bad_debt_simulated', { scenario }),
  externalAppClick: (destination: string) => track('external_app_click', { destination }),
  pageView: (section: string) => track('page_view', { section }),
};

export default analytics;
