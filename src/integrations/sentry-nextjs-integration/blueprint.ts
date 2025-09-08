import { Blueprint } from '../../types/adapter.js';

const sentryNextjsIntegrationBlueprint: Blueprint = {
  id: 'sentry-nextjs-integration',
  name: 'Sentry Next.js Integration',
  description: 'Complete error monitoring and performance tracking for Next.js',
  version: '1.0.0',
  actions: [
    // Install Sentry packages
    {
      type: 'INSTALL_PACKAGES',
      packages: ['@sentry/nextjs'],
      isDev: false
    },
    // Add environment variables
    {
      type: 'ADD_ENV_VAR',
      key: 'NEXT_PUBLIC_SENTRY_DSN',
      value: 'https://...@sentry.io/...',
      description: 'Sentry DSN for error tracking'
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
      description: 'Sentry project name'
    },
    {
      type: 'ADD_ENV_VAR',
      key: 'SENTRY_AUTH_TOKEN',
      value: 'sntrys_...',
      description: 'Sentry auth token for releases'
    },
    // Update Next.js config
    {
      type: 'WRAP_CONFIG',
      path: 'next.config.js',
      condition: '{{#if integration.features.errorTracking}}',
      wrapper: 'withSentryConfig',
      options: {
        org: 'process.env.SENTRY_ORG',
        project: 'process.env.SENTRY_PROJECT',
        authToken: 'process.env.SENTRY_AUTH_TOKEN',
        silent: true,
        widenClientFileUpload: true,
        hideSourceMaps: true,
        disableLogger: true,
        automaticVercelMonitors: true,
      }
    },
    // Sentry Configuration Files
    {
      type: 'CREATE_FILE',
      path: 'src/app/sentry.client.config.ts',
      condition: '{{#if integration.features.errorTracking}}',
      content: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  beforeSend(event) {
    // Filter out non-error events in development
    if (process.env.NODE_ENV === 'development' && event.level !== 'error') {
      return null;
    }
    return event;
  },
});
`
    },
    {
      type: 'CREATE_FILE',
      path: 'src/app/sentry.server.config.ts',
      condition: '{{#if integration.features.errorTracking}}',
      content: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: undefined }),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],
  beforeSend(event) {
    // Filter out non-error events in development
    if (process.env.NODE_ENV === 'development' && event.level !== 'error') {
      return null;
    }
    return event;
  },
});
`
    },
    {
      type: 'CREATE_FILE',
      path: 'src/app/sentry.edge.config.ts',
      condition: '{{#if integration.features.errorTracking}}',
      content: `import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
  beforeSend(event) {
    // Filter out non-error events in development
    if (process.env.NODE_ENV === 'development' && event.level !== 'error') {
      return null;
    }
    return event;
  },
});
`
    },
    // Middleware
    {
      type: 'CREATE_FILE',
      path: 'src/middleware.ts',
      condition: '{{#if integration.features.middleware}}',
      content: `import * as Sentry from '@sentry/nextjs';
import { NextRequest } from 'next/server';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
});

export async function middleware(request: NextRequest) {
  return Sentry.withSentryMiddleware(request);
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
`
    },
    // Client-side utilities
    {
      type: 'CREATE_FILE',
      path: 'src/lib/sentry/client.ts',
      condition: '{{#if integration.features.errorTracking}}',
      content: `import * as Sentry from '@sentry/nextjs';

export class SentryClient {
  /**
   * Capture an exception
   */
  static captureException(error: Error, context?: Record<string, any>) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.keys(context).forEach((key) => {
          scope.setContext(key, context[key]);
        });
      }
      Sentry.captureException(error);
    });
  }

  /**
   * Capture a message
   */
  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    Sentry.captureMessage(message, level);
  }

  /**
   * Add breadcrumb
   */
  static addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'info' | 'warning' | 'error' | 'debug';
    data?: Record<string, any>;
  }) {
    Sentry.addBreadcrumb(breadcrumb);
  }

  /**
   * Set user context
   */
  static setUser(user: {
    id?: string;
    email?: string;
    username?: string;
    [key: string]: any;
  }) {
    Sentry.setUser(user);
  }

  /**
   * Set tags
   */
  static setTags(tags: Record<string, string>) {
    Sentry.setTags(tags);
  }

  /**
   * Set context
   */
  static setContext(key: string, context: Record<string, any>) {
    Sentry.setContext(key, context);
  }

  /**
   * Start a transaction
   */
  static startTransaction(name: string, op: string) {
    return Sentry.startTransaction({ name, op });
  }

  /**
   * Capture performance data
   */
  static capturePerformance(transaction: any) {
    transaction.finish();
  }
}

export { Sentry };
`
    },
    // Server-side utilities
    {
      type: 'CREATE_FILE',
      path: 'src/lib/sentry/server.ts',
      condition: '{{#if integration.features.errorTracking}}',
      content: `import * as Sentry from '@sentry/nextjs';

export class SentryServer {
  /**
   * Capture an exception on the server
   */
  static captureException(error: Error, context?: Record<string, any>) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.keys(context).forEach((key) => {
          scope.setContext(key, context[key]);
        });
      }
      Sentry.captureException(error);
    });
  }

  /**
   * Capture a message on the server
   */
  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    Sentry.captureMessage(message, level);
  }

  /**
   * Add breadcrumb on the server
   */
  static addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'info' | 'warning' | 'error' | 'debug';
    data?: Record<string, any>;
  }) {
    Sentry.addBreadcrumb(breadcrumb);
  }

  /**
   * Set user context on the server
   */
  static setUser(user: {
    id?: string;
    email?: string;
    username?: string;
    [key: string]: any;
  }) {
    Sentry.setUser(user);
  }

  /**
   * Wrap API route with Sentry
   */
  static withSentry(handler: Function) {
    return Sentry.withSentry(handler);
  }

  /**
   * Start a server transaction
   */
  static startTransaction(name: string, op: string) {
    return Sentry.startTransaction({ name, op });
  }

  /**
   * Capture performance data
   */
  static capturePerformance(transaction: any) {
    transaction.finish();
  }
}

export { Sentry };
`
    },
    // Performance monitoring
    {
      type: 'CREATE_FILE',
      path: 'src/lib/sentry/performance.ts',
      condition: '{{#if integration.features.performanceMonitoring}}',
      content: `import { SentryClient } from './client';

export class PerformanceMonitor {
  private static transactions: Map<string, any> = new Map();

  /**
   * Start monitoring a page load
   */
  static startPageLoad(pageName: string) {
    const transaction = SentryClient.startTransaction(\`page-load-\${pageName}\`, 'navigation');
    this.transactions.set(\`page-\${pageName}\`, transaction);
    return transaction;
  }

  /**
   * Finish monitoring a page load
   */
  static finishPageLoad(pageName: string) {
    const transaction = this.transactions.get(\`page-\${pageName}\`);
    if (transaction) {
      SentryClient.capturePerformance(transaction);
      this.transactions.delete(\`page-\${pageName}\`);
    }
  }

  /**
   * Start monitoring an API call
   */
  static startApiCall(endpoint: string, method: string = 'GET') {
    const transaction = SentryClient.startTransaction(\`api-\${method.toLowerCase()}-\${endpoint}\`, 'http.client');
    this.transactions.set(\`api-\${endpoint}\`, transaction);
    return transaction;
  }

  /**
   * Finish monitoring an API call
   */
  static finishApiCall(endpoint: string, statusCode?: number) {
    const transaction = this.transactions.get(\`api-\${endpoint}\`);
    if (transaction) {
      if (statusCode) {
        transaction.setData('http.status_code', statusCode);
      }
      SentryClient.capturePerformance(transaction);
      this.transactions.delete(\`api-\${endpoint}\`);
    }
  }

  /**
   * Start monitoring a database query
   */
  static startDatabaseQuery(query: string, table?: string) {
    const transaction = SentryClient.startTransaction(\`db-query-\${table || 'unknown'}\`, 'db');
    transaction.setData('db.statement', query);
    if (table) {
      transaction.setData('db.table', table);
    }
    this.transactions.set(\`db-\${query}\`, transaction);
    return transaction;
  }

  /**
   * Finish monitoring a database query
   */
  static finishDatabaseQuery(query: string, rowCount?: number) {
    const transaction = this.transactions.get(\`db-\${query}\`);
    if (transaction) {
      if (rowCount !== undefined) {
        transaction.setData('db.rows_affected', rowCount);
      }
      SentryClient.capturePerformance(transaction);
      this.transactions.delete(\`db-\${query}\`);
    }
  }

  /**
   * Track web vitals
   */
  static trackWebVitals(metric: {
    name: string;
    value: number;
    delta: number;
    id: string;
  }) {
    SentryClient.addBreadcrumb({
      message: \`Web Vital: \${metric.name}\`,
      category: 'web-vitals',
      level: 'info',
      data: {
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
      },
    });
  }

  /**
   * Track custom performance metric
   */
  static trackCustomMetric(name: string, value: number, unit: string = 'ms') {
    SentryClient.addBreadcrumb({
      message: \`Custom Metric: \${name}\`,
      category: 'performance',
      level: 'info',
      data: {
        value,
        unit,
        timestamp: Date.now(),
      },
    });
  }
}
`
    },
    // Error handling utilities
    {
      type: 'CREATE_FILE',
      path: 'src/lib/sentry/errors.ts',
      condition: '{{#if integration.features.errorTracking}}',
      content: `import { SentryClient } from './client';

export class ErrorHandler {
  /**
   * Handle API errors
   */
  static handleApiError(error: Error, context: {
    endpoint: string;
    method: string;
    statusCode?: number;
    userId?: string;
  }) {
    SentryClient.addBreadcrumb({
      message: \`API Error: \${context.method} \${context.endpoint}\`,
      category: 'api',
      level: 'error',
      data: context,
    });

    SentryClient.captureException(error, {
      api: context,
    });
  }

  /**
   * Handle database errors
   */
  static handleDatabaseError(error: Error, context: {
    query: string;
    table?: string;
    operation: string;
  }) {
    SentryClient.addBreadcrumb({
      message: \`Database Error: \${context.operation} on \${context.table || 'unknown table'}\`,
      category: 'database',
      level: 'error',
      data: context,
    });

    SentryClient.captureException(error, {
      database: context,
    });
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: Error, context: {
    userId?: string;
    action: string;
    provider?: string;
  }) {
    SentryClient.addBreadcrumb({
      message: \`Auth Error: \${context.action}\`,
      category: 'auth',
      level: 'error',
      data: context,
    });

    SentryClient.captureException(error, {
      auth: context,
    });
  }

  /**
   * Handle payment errors
   */
  static handlePaymentError(error: Error, context: {
    amount?: number;
    currency?: string;
    paymentMethod?: string;
    transactionId?: string;
  }) {
    SentryClient.addBreadcrumb({
      message: 'Payment Error',
      category: 'payment',
      level: 'error',
      data: context,
    });

    SentryClient.captureException(error, {
      payment: context,
    });
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: Error, context: {
    field: string;
    value: any;
    rule: string;
    form?: string;
  }) {
    SentryClient.addBreadcrumb({
      message: \`Validation Error: \${context.field}\`,
      category: 'validation',
      level: 'warning',
      data: context,
    });

    SentryClient.captureException(error, {
      validation: context,
    });
  }

  /**
   * Handle external service errors
   */
  static handleExternalServiceError(error: Error, context: {
    service: string;
    endpoint: string;
    statusCode?: number;
    response?: any;
  }) {
    SentryClient.addBreadcrumb({
      message: \`External Service Error: \${context.service}\`,
      category: 'external-service',
      level: 'error',
      data: context,
    });

    SentryClient.captureException(error, {
      externalService: context,
    });
  }
}
`
    },
    // User feedback
    {
      type: 'CREATE_FILE',
      path: 'src/lib/sentry/user-feedback.ts',
      condition: '{{#if integration.features.userFeedback}}',
      content: `import { SentryClient } from './client';

export interface UserFeedback {
  name: string;
  email: string;
  comments: string;
  eventId?: string;
}

export class UserFeedbackHandler {
  /**
   * Submit user feedback
   */
  static async submitFeedback(feedback: UserFeedback): Promise<{ success: boolean; eventId?: string }> {
    try {
      // Add breadcrumb for user feedback
      SentryClient.addBreadcrumb({
        message: 'User feedback submitted',
        category: 'user-feedback',
        level: 'info',
        data: {
          name: feedback.name,
          email: feedback.email,
          hasComments: !!feedback.comments,
        },
      });

      // Set user context
      SentryClient.setUser({
        email: feedback.email,
        username: feedback.name,
      });

      // Capture message with feedback
      const eventId = SentryClient.captureMessage('User Feedback', 'info');

      // Log feedback to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('User Feedback:', {
          ...feedback,
          eventId,
          timestamp: new Date().toISOString(),
        });
      }

      return {
        success: true,
        eventId,
      };
    } catch (error) {
      console.error('Failed to submit user feedback:', error);
      return {
        success: false,
      };
    }
  }

  /**
   * Submit error feedback
   */
  static async submitErrorFeedback(
    error: Error,
    feedback: Omit<UserFeedback, 'eventId'>
  ): Promise<{ success: boolean; eventId?: string }> {
    try {
      // Add breadcrumb for error feedback
      SentryClient.addBreadcrumb({
        message: 'Error feedback submitted',
        category: 'error-feedback',
        level: 'info',
        data: {
          name: feedback.name,
          email: feedback.email,
          errorMessage: error.message,
        },
      });

      // Set user context
      SentryClient.setUser({
        email: feedback.email,
        username: feedback.name,
      });

      // Capture exception with user feedback
      SentryClient.captureException(error, {
        userFeedback: {
          name: feedback.name,
          email: feedback.email,
          comments: feedback.comments,
        },
      });

      return {
        success: true,
      };
    } catch (err) {
      console.error('Failed to submit error feedback:', err);
      return {
        success: false,
      };
    }
  }

  /**
   * Get feedback form data
   */
  static getFeedbackFormData(): Partial<UserFeedback> {
    return {
      name: '',
      email: '',
      comments: '',
    };
  }
}
`
    },
    // React Components
    {
      type: 'CREATE_FILE',
      path: 'src/components/sentry/ErrorBoundary.tsx',
      condition: '{{#if integration.features.errorTracking}}',
      content: `'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      eventId: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    this.setState({ eventId });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      eventId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  An unexpected error occurred. Our team has been notified.
                  {this.state.eventId && (
                    <span className="block mt-2 text-sm">
                      Error ID: {this.state.eventId}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button onClick={this.resetError} variant="outline" className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={() => window.location.reload()} className="flex-1">
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
`
    },
    {
      type: 'CREATE_FILE',
      path: 'src/components/sentry/UserFeedback.tsx',
      condition: '{{#if integration.features.userFeedback}}',
      content: `'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import { UserFeedbackHandler, UserFeedback } from '@/lib/sentry/user-feedback';

interface UserFeedbackProps {
  eventId?: string;
  onSuccess?: (eventId: string) => void;
  onError?: (error: string) => void;
}

export function UserFeedbackComponent({ eventId, onSuccess, onError }: UserFeedbackProps) {
  const [feedback, setFeedback] = useState<Partial<UserFeedback>>({
    name: '',
    email: '',
    comments: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.name || !feedback.email || !feedback.comments) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await UserFeedbackHandler.submitFeedback({
        ...feedback as UserFeedback,
        eventId,
      });

      if (result.success) {
        setIsSuccess(true);
        setFeedback({ name: '', email: '', comments: '' });
        onSuccess?.(result.eventId || '');
      } else {
        setError('Failed to submit feedback. Please try again.');
        onError?.('Failed to submit feedback');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">Thank you for your feedback!</h3>
            <p className="text-muted-foreground">
              We've received your message and will review it shortly.
            </p>
            <Button 
              onClick={() => setIsSuccess(false)}
              variant="outline"
            >
              Submit Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Send Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={feedback.name || ''}
                onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={feedback.email || ''}
                onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="comments">Comments *</Label>
            <Textarea
              id="comments"
              value={feedback.comments || ''}
              onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
              placeholder="Tell us what happened or how we can help..."
              rows={4}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
`
    },
    {
      type: 'CREATE_FILE',
      path: 'src/components/sentry/PerformanceMonitor.tsx',
      condition: '{{#if integration.features.performanceMonitoring}}',
      content: `'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Zap, TrendingUp } from 'lucide-react';
import { PerformanceMonitor } from '@/lib/sentry/performance';

interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  webVitals: {
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
  };
}

export function PerformanceMonitorComponent() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    apiResponseTime: 0,
    webVitals: {},
  });

  useEffect(() => {
    // Track page load time
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }));
      PerformanceMonitor.trackCustomMetric('page-load-time', loadTime);
    };

    // Track web vitals
    const trackWebVitals = () => {
      // This would typically use a web vitals library
      // For demo purposes, we'll simulate the data
      const mockVitals = {
        FCP: Math.random() * 2000 + 500,
        LCP: Math.random() * 3000 + 1000,
        FID: Math.random() * 100 + 10,
        CLS: Math.random() * 0.1,
      };

      setMetrics(prev => ({ 
        ...prev, 
        webVitals: mockVitals 
      }));

      Object.entries(mockVitals).forEach(([name, value]) => {
        PerformanceMonitor.trackWebVitals({
          name,
          value,
          delta: value,
          id: Math.random().toString(36).substr(2, 9),
        });
      });
    };

    if (document.readyState === 'complete') {
      handleLoad();
      trackWebVitals();
    } else {
      window.addEventListener('load', () => {
        handleLoad();
        trackWebVitals();
      });
    }

    // Track API response times (simulated)
    const trackApiPerformance = () => {
      const apiTime = Math.random() * 1000 + 100;
      setMetrics(prev => ({ ...prev, apiResponseTime: apiTime }));
      PerformanceMonitor.trackCustomMetric('api-response-time', apiTime);
    };

    // Simulate API calls
    const interval = setInterval(trackApiPerformance, 5000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  const getPerformanceStatus = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'warning';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Page Load Time</span>
                <Badge variant="outline">
                  {metrics.pageLoadTime.toFixed(0)}ms
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={\`h-2 rounded-full \${getStatusColor(
                    getPerformanceStatus(metrics.pageLoadTime, { good: 1000, poor: 3000 })
                  )}\`}
                  style={{ width: \`\${Math.min((metrics.pageLoadTime / 3000) * 100, 100)}%\` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Response Time</span>
                <Badge variant="outline">
                  {metrics.apiResponseTime.toFixed(0)}ms
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={\`h-2 rounded-full \${getStatusColor(
                    getPerformanceStatus(metrics.apiResponseTime, { good: 200, poor: 1000 })
                  )}\`}
                  style={{ width: \`\${Math.min((metrics.apiResponseTime / 1000) * 100, 100)}%\` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics.webVitals).map(([name, value]) => (
              <div key={name} className="text-center">
                <div className="text-2xl font-bold">
                  {typeof value === 'number' ? value.toFixed(0) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">{name}</div>
                <Badge 
                  variant="outline" 
                  className="mt-1"
                >
                  {getPerformanceStatus(value, { good: 1000, poor: 2500 })}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`
    },
    // Admin Pages
    {
      type: 'CREATE_FILE',
      path: 'src/app/admin/sentry/page.tsx',
      condition: '{{#if integration.features.alerts}}',
      content: `import { PerformanceMonitorComponent } from '@/components/sentry/PerformanceMonitor';
import { UserFeedbackComponent } from '@/components/sentry/UserFeedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, MessageSquare, AlertTriangle } from 'lucide-react';

export default function SentryAdminPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sentry Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor errors, performance, and user feedback
        </p>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            User Feedback
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceMonitorComponent />
        </TabsContent>

        <TabsContent value="feedback">
          <div className="max-w-2xl">
            <UserFeedbackComponent />
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure Sentry alerts and notifications here. This would typically
                connect to your Sentry dashboard for alert management.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
`
    }
  ]
};

export const blueprint = sentryNextjsIntegrationBlueprint;
