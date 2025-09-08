import * as Sentry from '@sentry/nextjs';

// Analytics and event tracking
export class Analytics {
  /**
   * Track user events
   */
  static trackEvent(eventName: string, properties?: Record<string, unknown>) {
    Sentry.addBreadcrumb({
      message: eventName,
      category: 'user-action',
      level: 'info',
      data: properties,
    });

    // You can also send to other analytics services here
    console.log('Event tracked:', eventName, properties);
  }

  /**
   * Track page views
   */
  static trackPageView(page: string, properties?: Record<string, unknown>) {
    Sentry.addBreadcrumb({
      message: 'page-view',
      category: 'navigation',
      level: 'info',
      data: { page, ...properties },
    });

    console.log('Page view tracked:', page, properties);
  }

  /**
   * Track user interactions
   */
  static trackInteraction(element: string, action: string, properties?: Record<string, unknown>) {
    Sentry.addBreadcrumb({
      message: `${element}.${action}`,
      category: 'user-interaction',
      level: 'info',
      data: properties,
    });

    console.log('Interaction tracked:', element, action, properties);
  }

  /**
   * Track errors with context
   */
  static trackError(error: Error, context?: Record<string, unknown>) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.keys(context).forEach((key) => {
          scope.setContext(key, context[key]);
        });
      }
      scope.setTag('error-source', 'analytics');
      Sentry.captureException(error);
    });
  }

  /**
   * Set user properties
   */
  static setUserProperties(user: {
    id: string;
    email?: string;
    username?: string;
    properties?: Record<string, unknown>;
  }) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    if (user.properties) {
      Sentry.setContext('user-properties', user.properties);
    }
  }
}

// React hook for analytics
export function useAnalytics() {
  const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
    Analytics.trackEvent(eventName, properties);
  };

  const trackPageView = (page: string, properties?: Record<string, unknown>) => {
    Analytics.trackPageView(page, properties);
  };

  const trackInteraction = (element: string, action: string, properties?: Record<string, unknown>) => {
    Analytics.trackInteraction(element, action, properties);
  };

  const trackError = (error: Error, context?: Record<string, unknown>) => {
    Analytics.trackError(error, context);
  };

  const setUserProperties = (user: {
    id: string;
    email?: string;
    username?: string;
    properties?: Record<string, unknown>;
  }) => {
    Analytics.setUserProperties(user);
  };

  return {
    trackEvent,
    trackPageView,
    trackInteraction,
    trackError,
    setUserProperties,
  };
}