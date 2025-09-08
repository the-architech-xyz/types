import { db } from '@/lib/db';
import { webhookEvents, type NewWebhookEvent } from '@/lib/db/schema/stripe';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export class StripeWebhookLogger {
  async logEvent(event: Stripe.Event): Promise<void> {
    try {
      await db.insert(webhookEvents).values({
        stripeEventId: event.id,
        eventType: event.type,
        eventData: event as any,
        processed: false,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to log webhook event:', error);
      throw error;
    }
  }

  async markEventAsProcessed(stripeEventId: string): Promise<void> {
    try {
      await db
        .update(webhookEvents)
        .set({ processed: true })
        .where(eq(webhookEvents.stripeEventId, stripeEventId));
    } catch (error) {
      console.error('Failed to mark event as processed:', error);
      throw error;
    }
  }

  async markEventAsFailed(stripeEventId: string, error: string): Promise<void> {
    try {
      await db
        .update(webhookEvents)
        .set({ 
          processed: false,
          processingError: error
        })
        .where(eq(webhookEvents.stripeEventId, stripeEventId));
    } catch (err) {
      console.error('Failed to mark event as failed:', err);
      throw err;
    }
  }

  async getUnprocessedEvents(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.processed, false))
        .orderBy(webhookEvents.createdAt);
    } catch (error) {
      console.error('Failed to get unprocessed events:', error);
      throw error;
    }
  }

  async getEventById(stripeEventId: string): Promise<any> {
    try {
      const [event] = await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.stripeEventId, stripeEventId))
        .limit(1);
      return event;
    } catch (error) {
      console.error('Failed to get event by ID:', error);
      throw error;
    }
  }

  async getEventsByType(eventType: string, limit = 100): Promise<any[]> {
    try {
      return await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.eventType, eventType))
        .orderBy(webhookEvents.createdAt)
        .limit(limit);
    } catch (error) {
      console.error('Failed to get events by type:', error);
      throw error;
    }
  }

  async getFailedEvents(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.processingError, null))
        .orderBy(webhookEvents.createdAt);
    } catch (error) {
      console.error('Failed to get failed events:', error);
      throw error;
    }
  }
}

export const stripeWebhookLogger = new StripeWebhookLogger();
