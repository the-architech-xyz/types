import * as Sentry from '@sentry/nextjs';
import { SentryDrizzleAdapter } from './drizzle-adapter';
import { type NewSentryTransaction } from '@/lib/db/schema/sentry';

export class SentryPerformanceTracker {
  private static transactions: Map<string, any> = new Map();

  /**
   * Start a transaction and track it
   */
  static startTransaction(
    name: string,
    op: string,
    context: {
      projectId: string;
      environment: string;
      tags?: Record<string, string>;
      user?: Record<string, any>;
      data?: Record<string, any>;
    }
  ) {
    const transaction = Sentry.startTransaction({ name, op });
    
    // Store transaction for database logging
    this.transactions.set(transaction.spanId, {
      transactionId: transaction.traceId,
      projectId: context.projectId,
      environment: context.environment,
      name,
      op,
      tags: context.tags,
      user: context.user,
      data: context.data,
      startTimestamp: new Date(),
    });

    return transaction;
  }

  /**
   * Finish a transaction and log to database
   */
  static finishTransaction(
    transaction: any,
    status: 'ok' | 'cancelled' | 'aborted' | 'internal_error' = 'ok'
  ) {
    transaction.setStatus(status);
    transaction.finish();

    // Get stored transaction data
    const storedData = this.transactions.get(transaction.spanId);
    if (storedData) {
      const endTimestamp = new Date();
      const duration = endTimestamp.getTime() - storedData.startTimestamp.getTime();

      // Prepare transaction data for database
      const transactionData: NewSentryTransaction = {
        transactionId: storedData.transactionId,
        projectId: storedData.projectId,
        environment: storedData.environment,
        name: storedData.name,
        op: storedData.op,
        status,
        duration,
        startTimestamp: storedData.startTimestamp,
        endTimestamp,
        tags: storedData.tags,
        data: storedData.data,
        user: storedData.user,
        context: {
          transaction: {
            spanId: transaction.spanId,
            traceId: transaction.traceId,
            parentSpanId: transaction.parentSpanId,
          },
        },
        platform: 'node',
        sdk: {
          name: '@sentry/nextjs',
          version: '7.0.0', // Update with actual version
        },
      };

      // Log to database
      SentryDrizzleAdapter.logTransaction(transactionData).catch((error) => {
        console.error('Failed to log transaction to database:', error);
      });

      // Clean up stored data
      this.transactions.delete(transaction.spanId);
    }
  }

  /**
   * Track API performance
   */
  static trackApiPerformance(
    endpoint: string,
    method: string,
    context: {
      projectId: string;
      environment: string;
      statusCode?: number;
      user?: Record<string, any>;
    }
  ) {
    const transaction = this.startTransaction(
      `api-${method.toLowerCase()}-${endpoint}`,
      'http.client',
      {
        ...context,
        data: {
          endpoint,
          method,
          statusCode: context.statusCode,
        },
      }
    );

    return {
      finish: (statusCode?: number) => {
        this.finishTransaction(transaction, 'ok');
      },
      error: () => {
        this.finishTransaction(transaction, 'internal_error');
      },
    };
  }

  /**
   * Track database performance
   */
  static trackDatabasePerformance(
    query: string,
    operation: string,
    context: {
      projectId: string;
      environment: string;
      tableName?: string;
      user?: Record<string, any>;
    }
  ) {
    const transaction = this.startTransaction(
      `db-${operation.toLowerCase()}-${context.tableName || 'unknown'}`,
      'db',
      {
        ...context,
        data: {
          query,
          operation,
          tableName: context.tableName,
        },
      }
    );

    return {
      finish: (rowCount?: number) => {
        transaction.setData('db.rows_affected', rowCount);
        this.finishTransaction(transaction, 'ok');
      },
      error: () => {
        this.finishTransaction(transaction, 'internal_error');
      },
    };
  }

  /**
   * Track page load performance
   */
  static trackPageLoad(
    pageName: string,
    context: {
      projectId: string;
      environment: string;
      user?: Record<string, any>;
    }
  ) {
    const transaction = this.startTransaction(
      `page-load-${pageName}`,
      'navigation',
      {
        ...context,
        data: {
          pageName,
        },
      }
    );

    return {
      finish: () => {
        this.finishTransaction(transaction, 'ok');
      },
      error: () => {
        this.finishTransaction(transaction, 'internal_error');
      },
    };
  }

  /**
   * Track custom performance metric
   */
  static trackCustomMetric(
    name: string,
    value: number,
    unit: string,
    context: {
      projectId: string;
      environment: string;
      user?: Record<string, any>;
    }
  ) {
    const transaction = this.startTransaction(
      `custom-${name}`,
      'custom',
      {
        ...context,
        data: {
          metricName: name,
          value,
          unit,
        },
      }
    );

    // Finish immediately for custom metrics
    this.finishTransaction(transaction, 'ok');
  }
}
