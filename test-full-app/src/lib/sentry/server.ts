import * as Sentry from '@sentry/nextjs';

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
