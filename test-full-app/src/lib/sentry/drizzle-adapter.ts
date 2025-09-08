import { db } from '@/lib/db';
import { 
  sentryEvents, 
  sentryTransactions, 
  sentryUserFeedback, 
  sentryQueryPerformance,
  type NewSentryEvent,
  type NewSentryTransaction,
  type NewSentryUserFeedback,
  type NewSentryQueryPerformance
} from '@/lib/db/schema/sentry';
import { eq, and, gte, lte, desc, count } from 'drizzle-orm';

export class SentryDrizzleAdapter {
  /**
   * Log a Sentry event to the database
   */
  static async logEvent(event: NewSentryEvent) {
    try {
      const [insertedEvent] = await db
        .insert(sentryEvents)
        .values(event)
        .returning();
      
      return insertedEvent;
    } catch (error) {
      console.error('Failed to log Sentry event to database:', error);
      throw error;
    }
  }

  /**
   * Log a Sentry transaction to the database
   */
  static async logTransaction(transaction: NewSentryTransaction) {
    try {
      const [insertedTransaction] = await db
        .insert(sentryTransactions)
        .values(transaction)
        .returning();
      
      return insertedTransaction;
    } catch (error) {
      console.error('Failed to log Sentry transaction to database:', error);
      throw error;
    }
  }

  /**
   * Log user feedback to the database
   */
  static async logUserFeedback(feedback: NewSentryUserFeedback) {
    try {
      const [insertedFeedback] = await db
        .insert(sentryUserFeedback)
        .values(feedback)
        .returning();
      
      return insertedFeedback;
    } catch (error) {
      console.error('Failed to log user feedback to database:', error);
      throw error;
    }
  }

  /**
   * Log query performance to the database
   */
  static async logQueryPerformance(performance: NewSentryQueryPerformance) {
    try {
      const [insertedPerformance] = await db
        .insert(sentryQueryPerformance)
        .values(performance)
        .returning();
      
      return insertedPerformance;
    } catch (error) {
      console.error('Failed to log query performance to database:', error);
      throw error;
    }
  }

  /**
   * Get events by project and environment
   */
  static async getEvents(projectId: string, environment: string, limit: number = 50) {
    try {
      return await db
        .select()
        .from(sentryEvents)
        .where(
          and(
            eq(sentryEvents.projectId, projectId),
            eq(sentryEvents.environment, environment)
          )
        )
        .orderBy(desc(sentryEvents.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Failed to get events from database:', error);
      throw error;
    }
  }

  /**
   * Get unresolved events
   */
  static async getUnresolvedEvents(projectId: string, environment: string) {
    try {
      return await db
        .select()
        .from(sentryEvents)
        .where(
          and(
            eq(sentryEvents.projectId, projectId),
            eq(sentryEvents.environment, environment),
            eq(sentryEvents.isResolved, false)
          )
        )
        .orderBy(desc(sentryEvents.createdAt));
    } catch (error) {
      console.error('Failed to get unresolved events from database:', error);
      throw error;
    }
  }

  /**
   * Resolve an event
   */
  static async resolveEvent(eventId: string, resolvedBy: string) {
    try {
      return await db
        .update(sentryEvents)
        .set({
          isResolved: true,
          resolvedAt: new Date(),
          resolvedBy,
        })
        .where(eq(sentryEvents.eventId, eventId))
        .returning();
    } catch (error) {
      console.error('Failed to resolve event in database:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  static async getPerformanceMetrics(
    projectId: string, 
    environment: string, 
    startDate: Date, 
    endDate: Date
  ) {
    try {
      const transactions = await db
        .select()
        .from(sentryTransactions)
        .where(
          and(
            eq(sentryTransactions.projectId, projectId),
            eq(sentryTransactions.environment, environment),
            gte(sentryTransactions.createdAt, startDate),
            lte(sentryTransactions.createdAt, endDate)
          )
        )
        .orderBy(desc(sentryTransactions.createdAt));

      return transactions;
    } catch (error) {
      console.error('Failed to get performance metrics from database:', error);
      throw error;
    }
  }

  /**
   * Get error statistics
   */
  static async getErrorStats(projectId: string, environment: string, days: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await db
        .select({
          level: sentryEvents.level,
          count: count(),
        })
        .from(sentryEvents)
        .where(
          and(
            eq(sentryEvents.projectId, projectId),
            eq(sentryEvents.environment, environment),
            gte(sentryEvents.createdAt, startDate)
          )
        )
        .groupBy(sentryEvents.level);

      return stats;
    } catch (error) {
      console.error('Failed to get error stats from database:', error);
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
      return await db
        .select()
        .from(sentryQueryPerformance)
        .where(
          and(
            eq(sentryQueryPerformance.projectId, projectId),
            eq(sentryQueryPerformance.environment, environment),
            gte(sentryQueryPerformance.duration, minDuration)
          )
        )
        .orderBy(desc(sentryQueryPerformance.duration))
        .limit(limit);
    } catch (error) {
      console.error('Failed to get slow queries from database:', error);
      throw error;
    }
  }

  /**
   * Clean up old data
   */
  static async cleanupOldData(projectId: string, daysToKeep: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Delete old events
      const deletedEvents = await db
        .delete(sentryEvents)
        .where(
          and(
            eq(sentryEvents.projectId, projectId),
            lte(sentryEvents.createdAt, cutoffDate)
          )
        );

      // Delete old transactions
      const deletedTransactions = await db
        .delete(sentryTransactions)
        .where(
          and(
            eq(sentryTransactions.projectId, projectId),
            lte(sentryTransactions.createdAt, cutoffDate)
          )
        );

      // Delete old query performance data
      const deletedQueries = await db
        .delete(sentryQueryPerformance)
        .where(
          and(
            eq(sentryQueryPerformance.projectId, projectId),
            lte(sentryQueryPerformance.createdAt, cutoffDate)
          )
        );

      return {
        deletedEvents: deletedEvents.rowCount || 0,
        deletedTransactions: deletedTransactions.rowCount || 0,
        deletedQueries: deletedQueries.rowCount || 0,
      };
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
      throw error;
    }
  }
}
