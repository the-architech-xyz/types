import { SentryDrizzleAdapter } from './drizzle-adapter';
import { type NewSentryQueryPerformance } from '@/lib/db/schema/sentry';
import crypto from 'crypto';

export class SentryQueryMonitor {
  /**
   * Monitor a database query
   */
  static async monitorQuery<T>(
    queryFn: () => Promise<T>,
    context: {
      projectId: string;
      environment: string;
      query: string;
      operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
      tableName?: string;
      parameters?: any[];
      user?: Record<string, any>;
    }
  ): Promise<T> {
    const startTime = Date.now();
    const queryHash = crypto.createHash('md5').update(context.query).digest('hex');
    
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      
      // Log successful query performance
      await this.logQueryPerformance({
        ...context,
        queryHash,
        duration,
        rowsAffected: Array.isArray(result) ? result.length : undefined,
        rowsReturned: Array.isArray(result) ? result.length : undefined,
        error: null,
        stackTrace: null,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const stackTrace = error instanceof Error ? error.stack : undefined;
      
      // Log failed query performance
      await this.logQueryPerformance({
        ...context,
        queryHash,
        duration,
        error: errorMessage,
        stackTrace,
      });

      throw error;
    }
  }

  /**
   * Log query performance to database
   */
  private static async logQueryPerformance(data: {
    projectId: string;
    environment: string;
    query: string;
    queryHash: string;
    operation: string;
    tableName?: string;
    duration: number;
    rowsAffected?: number;
    rowsReturned?: number;
    parameters?: any[];
    error?: string | null;
    stackTrace?: string | null;
    user?: Record<string, any>;
  }) {
    try {
      const performanceData: NewSentryQueryPerformance = {
        projectId: data.projectId,
        environment: data.environment,
        query: data.query,
        queryHash: data.queryHash,
        tableName: data.tableName,
        operation: data.operation,
        duration: data.duration,
        rowsAffected: data.rowsAffected,
        rowsReturned: data.rowsReturned,
        parameters: data.parameters,
        error: data.error,
        stackTrace: data.stackTrace,
        user: data.user,
        context: {
          query: {
            hash: data.queryHash,
            operation: data.operation,
            tableName: data.tableName,
          },
        },
        tags: {
          operation: data.operation,
          tableName: data.tableName || 'unknown',
          hasError: data.error ? 'true' : 'false',
        },
      };

      await SentryDrizzleAdapter.logQueryPerformance(performanceData);
    } catch (error) {
      console.error('Failed to log query performance:', error);
      // Don't throw here to avoid breaking the main flow
    }
  }

  /**
   * Create a query monitor wrapper
   */
  static createQueryMonitor(context: {
    projectId: string;
    environment: string;
    user?: Record<string, any>;
  }) {
    return {
      monitor: <T>(
        queryFn: () => Promise<T>,
        queryContext: {
          query: string;
          operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
          tableName?: string;
          parameters?: any[];
        }
      ) => {
        return this.monitorQuery(queryFn, {
          ...context,
          ...queryContext,
        });
      },
    };
  }

  /**
   * Get query performance statistics
   */
  static async getQueryStats(
    projectId: string,
    environment: string,
    days: number = 7
  ) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // This would typically use more complex queries
      // For now, we'll return a simple structure
      return {
        totalQueries: 0,
        averageDuration: 0,
        slowestQueries: [],
        errorRate: 0,
        mostUsedTables: [],
      };
    } catch (error) {
      console.error('Failed to get query stats:', error);
      throw error;
    }
  }

  /**
   * Get slow queries
   */
  static async getSlowQueries(
    projectId: string,
    environment: string,
    minDuration: number = 1000,
    limit: number = 20
  ) {
    try {
      return await SentryDrizzleAdapter.getSlowQueries(
        projectId,
        environment,
        minDuration,
        limit
      );
    } catch (error) {
      console.error('Failed to get slow queries:', error);
      throw error;
    }
  }
}
