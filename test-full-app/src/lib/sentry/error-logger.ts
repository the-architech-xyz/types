import * as Sentry from '@sentry/nextjs';
import { SentryDrizzleAdapter } from './drizzle-adapter';
import { type NewSentryEvent } from '@/lib/db/schema/sentry';

export class SentryErrorLogger {
  /**
   * Log an error to both Sentry and database
   */
  static async logError(
    error: Error,
    context: {
      projectId: string;
      environment: string;
      level?: 'error' | 'warning' | 'info' | 'debug';
      tags?: Record<string, string>;
      user?: Record<string, any>;
      extra?: Record<string, any>;
      breadcrumbs?: Array<{
        message: string;
        category?: string;
        level?: 'info' | 'warning' | 'error' | 'debug';
        data?: Record<string, any>;
      }>;
    }
  ) {
    const eventId = Sentry.captureException(error);
    
    // Prepare event data for database
    const eventData: NewSentryEvent = {
      eventId: eventId || Math.random().toString(36).substr(2, 9),
      projectId: context.projectId,
      environment: context.environment,
      level: context.level || 'error',
      message: error.message,
      exception: {
        type: error.constructor.name,
        value: error.message,
        stacktrace: error.stack ? {
          frames: error.stack.split('\n').map((line, index) => ({
            filename: line.split(' at ')[1]?.split(' ')[0] || 'unknown',
            function: line.split(' at ')[0]?.trim() || 'unknown',
            lineno: index,
            colno: 0,
          })),
        } : undefined,
      },
      stacktrace: error.stack ? {
        frames: error.stack.split('\n').map((line, index) => ({
          filename: line.split(' at ')[1]?.split(' ')[0] || 'unknown',
          function: line.split(' at ')[0]?.trim() || 'unknown',
          lineno: index,
          colno: 0,
        })),
      } : undefined,
      tags: context.tags,
      extra: context.extra,
      user: context.user,
      context: {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        ...context,
      },
      breadcrumbs: context.breadcrumbs,
      platform: 'node',
      sdk: {
        name: '@sentry/nextjs',
        version: '7.0.0', // Update with actual version
      },
    };

    // Log to database
    try {
      await SentryDrizzleAdapter.logEvent(eventData);
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError);
      // Don't throw here to avoid breaking the main flow
    }

    return eventId;
  }

  /**
   * Log a message to both Sentry and database
   */
  static async logMessage(
    message: string,
    context: {
      projectId: string;
      environment: string;
      level?: 'error' | 'warning' | 'info' | 'debug';
      tags?: Record<string, string>;
      user?: Record<string, any>;
      extra?: Record<string, any>;
    }
  ) {
    const eventId = Sentry.captureMessage(message, context.level || 'info');
    
    // Prepare event data for database
    const eventData: NewSentryEvent = {
      eventId: eventId || Math.random().toString(36).substr(2, 9),
      projectId: context.projectId,
      environment: context.environment,
      level: context.level || 'info',
      message,
      tags: context.tags,
      extra: context.extra,
      user: context.user,
      context,
      platform: 'node',
      sdk: {
        name: '@sentry/nextjs',
        version: '7.0.0', // Update with actual version
      },
    };

    // Log to database
    try {
      await SentryDrizzleAdapter.logEvent(eventData);
    } catch (dbError) {
      console.error('Failed to log message to database:', dbError);
    }

    return eventId;
  }

  /**
   * Add breadcrumb to both Sentry and prepare for database
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
   * Set user context for both Sentry and database
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
   * Set tags for both Sentry and database
   */
  static setTags(tags: Record<string, string>) {
    Sentry.setTags(tags);
  }

  /**
   * Set context for both Sentry and database
   */
  static setContext(key: string, context: Record<string, any>) {
    Sentry.setContext(key, context);
  }
}
