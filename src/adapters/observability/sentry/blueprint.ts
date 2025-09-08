/**
 * Sentry Error Monitoring Blueprint
 * 
 * Sets up complete Sentry integration for error monitoring and performance tracking
 * Creates Sentry configuration, error boundaries, and monitoring utilities
 */

import { Blueprint } from '../../../types/adapter.js';

export const sentryBlueprint: Blueprint = {
  id: 'sentry-observability-setup',
  name: 'Sentry Error Monitoring Setup',
  actions: [
    {
      type: 'INSTALL_PACKAGES',
      packages: ['@sentry/nextjs']
    },
    {
      type: 'CREATE_FILE',
      path: 'instrumentation-client.ts',
      content: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '{{module.parameters.dsn}}',
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  // tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  // replaysSessionSampleRate: 0.1,
  // replaysOnErrorSampleRate: 1.0,
});`,
    },
    {
      type: 'CREATE_FILE',
      path: 'instrumentation.ts',
      content: `import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export function onRequestError(err: unknown, request: {
  path: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
}) {
  Sentry.captureException(err, {
    contexts: {
      request: request,
    },
  });
}`,
    },
    {
      type: 'CREATE_FILE',
      path: 'sentry.server.config.ts',
      content: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
});`,
    },
    {
      type: 'CREATE_FILE',
      path: 'sentry.edge.config.ts',
      content: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
});`,
    },
    {
      type: 'CREATE_FILE',
      path: 'src/app/global-error.tsx',
      content: `'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Something went wrong
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                We&apos;re sorry, but something unexpected happened. Our team has been notified.
              </p>
              <div className="mt-4">
                <button
                  onClick={reset}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}`,
    },
    {
      type: 'CREATE_FILE',
      path: 'next.config.ts',
      content: `import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config
  serverExternalPackages: ['@sentry/nextjs'],
  outputFileTracingRoot: process.cwd(),
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
};

// Make sure adding Sentry options is the last code to run before exporting
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);`,
    },
    {
      type: 'CREATE_FILE',
      path: '{{paths.observability_config}}/sentry.ts',
      content: `import * as Sentry from '@sentry/nextjs';

// Sentry configuration
export const SENTRY_CONFIG = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
};

// Custom error reporting
export const reportError = (error: Error, context?: Record<string, unknown>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setContext(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
};

// Custom message reporting
export const reportMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  Sentry.captureMessage(message, level);
};

// Performance monitoring
export const startSpan = (name: string, op: string) => {
  return Sentry.startSpan({ name, op }, () => {});
};

// User context
export const setUserContext = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

// Breadcrumb tracking
export const addBreadcrumb = (message: string, category?: string, level?: 'info' | 'warning' | 'error') => {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: level || 'info',
  });
};`,
    },
    {
      type: 'CREATE_FILE',
      path: 'src/components/providers/sentry-provider.tsx',
      content: `'use client';

import { ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface SentryProviderProps {
  children: ReactNode;
}

/**
 * Sentry Provider Component
 * 
 * Provides Sentry error monitoring context
 * Handles error boundaries and performance monitoring
 */
export function SentryProvider({ children }: SentryProviderProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Something went wrong
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                We&apos;re sorry, but something unexpected happened. Our team has been notified.
              </p>
              <div className="mt-4">
                <button
                  onClick={resetError}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      beforeCapture={(scope, error, errorInfo) => {
        scope.setTag('errorBoundary', true);
        scope.setContext('errorInfo', { errorInfo });
        return scope;
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}`,
    },
    {
      type: 'CREATE_FILE',
      path: '{{paths.observability_config}}/performance.ts',
      content: `import * as Sentry from '@sentry/nextjs';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static transactions: Map<string, unknown> = new Map();

  /**
   * Start a performance transaction
   */
  static startSpan(name: string, op: string, description?: string) {
    return Sentry.startSpan({ name, op }, () => {});
  }

  /**
   * Finish a performance transaction
   */
  static finishTransaction(name: string) {
    const transaction = this.transactions.get(name);
    if (transaction) {
      transaction.finish();
      this.transactions.delete(name);
    }
  }

  /**
   * Add a span to a transaction
   */
  static addSpan(transactionName: string, spanName: string, op: string) {
    const transaction = this.transactions.get(transactionName);
    if (transaction) {
      return transaction.startChild({
        op,
        description: spanName,
      });
    }
    return null;
  }

  /**
   * Monitor API call performance
   */
  static async monitorApiCall<T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const span = this.startSpan(\`api.\${apiName}\`, 'http.client');
    
    try {
      const result = await apiCall();
      // Span automatically handles status
      return result;
    } catch (error) {
      // Span automatically handles error status
      throw error;
    } finally {
      this.finishTransaction(\`api.\${apiName}\`);
    }
  }

  /**
   * Monitor function execution time
   */
  static async monitorFunction<T>(
    functionName: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const span = this.startSpan(\`function.\${functionName}\`, 'function');
    
    try {
      const result = await fn();
      // Span automatically handles status
      return result;
    } catch (error) {
      // Span automatically handles error status
      throw error;
    } finally {
      this.finishTransaction(\`function.\${functionName}\`);
    }
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const startSpan = (name: string, op: string) => {
    return PerformanceMonitor.startSpan(name, op);
  };

  const finishTransaction = (name: string) => {
    PerformanceMonitor.finishTransaction(name);
  };

  const monitorApiCall = <T>(apiName: string, apiCall: () => Promise<T>) => {
    return PerformanceMonitor.monitorApiCall(apiName, apiCall);
  };

  const monitorFunction = <T>(functionName: string, fn: () => Promise<T>) => {
    return PerformanceMonitor.monitorFunction(functionName, fn);
  };

  return {
    startSpan,
    finishTransaction,
    monitorApiCall,
    monitorFunction,
  };
}`,
    },
    {
      type: 'CREATE_FILE',
      path: '{{paths.observability_config}}/analytics.ts',
      content: `import * as Sentry from '@sentry/nextjs';

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
      message: \`\${element}.\${action}\`,
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
}`,
    },
    {
      type: 'ADD_ENV_VAR',
      key: 'SENTRY_DSN',
      value: 'https://...',
      description: 'Sentry DSN for server-side error reporting'
    },
    {
      type: 'ADD_ENV_VAR',
      key: 'NEXT_PUBLIC_SENTRY_DSN',
      value: 'https://...',
      description: 'Sentry DSN for client-side error reporting'
    },
    {
      type: 'ADD_ENV_VAR',
      key: 'SENTRY_ORG',
      value: 'your-org',
      description: 'Sentry organization slug'
    },
    {
      type: 'ADD_ENV_VAR',
      key: 'SENTRY_PROJECT',
      value: 'your-project',
      description: 'Sentry project slug'
    },
    {
      type: 'ADD_ENV_VAR',
      key: 'SENTRY_RELEASE',
      value: '1.0.0',
      description: 'Sentry release version'
    }
  ]
};
