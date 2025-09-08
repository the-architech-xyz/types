import * as Sentry from '@sentry/nextjs';

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
