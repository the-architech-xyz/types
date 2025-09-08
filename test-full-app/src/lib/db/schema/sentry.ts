import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Sentry Events Table
export const sentryEvents = pgTable('sentry_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: text('event_id').notNull().unique(),
  projectId: text('project_id').notNull(),
  environment: text('environment').notNull(),
  level: text('level').notNull(), // error, warning, info, debug
  message: text('message'),
  exception: jsonb('exception'),
  stacktrace: jsonb('stacktrace'),
  tags: jsonb('tags'),
  extra: jsonb('extra'),
  user: jsonb('user'),
  context: jsonb('context'),
  breadcrumbs: jsonb('breadcrumbs'),
  release: text('release'),
  dist: text('dist'),
  platform: text('platform'),
  sdk: jsonb('sdk'),
  serverName: text('server_name'),
  url: text('url'),
  method: text('method'),
  statusCode: integer('status_code'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: text('resolved_by'),
  isResolved: boolean('is_resolved').default(false).notNull(),
}, (table) => ({
  eventIdIdx: index('sentry_events_event_id_idx').on(table.eventId),
  projectIdIdx: index('sentry_events_project_id_idx').on(table.projectId),
  environmentIdx: index('sentry_events_environment_idx').on(table.environment),
  levelIdx: index('sentry_events_level_idx').on(table.level),
  createdAtIdx: index('sentry_events_created_at_idx').on(table.createdAt),
  isResolvedIdx: index('sentry_events_is_resolved_idx').on(table.isResolved),
}));

export type SentryEvent = typeof sentryEvents.$inferSelect;
export type NewSentryEvent = typeof sentryEvents.$inferInsert;

// Performance Transactions Table
export const sentryTransactions = pgTable('sentry_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: text('transaction_id').notNull().unique(),
  projectId: text('project_id').notNull(),
  environment: text('environment').notNull(),
  name: text('name').notNull(),
  op: text('op').notNull(), // navigation, http, db, etc.
  status: text('status').notNull(), // ok, cancelled, aborted, internal_error, etc.
  duration: integer('duration').notNull(), // in milliseconds
  startTimestamp: timestamp('start_timestamp').notNull(),
  endTimestamp: timestamp('end_timestamp').notNull(),
  tags: jsonb('tags'),
  data: jsonb('data'),
  measurements: jsonb('measurements'),
  spans: jsonb('spans'),
  user: jsonb('user'),
  context: jsonb('context'),
  release: text('release'),
  dist: text('dist'),
  platform: text('platform'),
  sdk: jsonb('sdk'),
  serverName: text('server_name'),
  url: text('url'),
  method: text('method'),
  statusCode: integer('status_code'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  transactionIdIdx: index('sentry_transactions_transaction_id_idx').on(table.transactionId),
  projectIdIdx: index('sentry_transactions_project_id_idx').on(table.projectId),
  environmentIdx: index('sentry_transactions_environment_idx').on(table.environment),
  nameIdx: index('sentry_transactions_name_idx').on(table.name),
  opIdx: index('sentry_transactions_op_idx').on(table.op),
  statusIdx: index('sentry_transactions_status_idx').on(table.status),
  createdAtIdx: index('sentry_transactions_created_at_idx').on(table.createdAt),
}));

// User Feedback Table
export const sentryUserFeedback = pgTable('sentry_user_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: text('event_id'),
  projectId: text('project_id').notNull(),
  environment: text('environment').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  comments: text('comments').notNull(),
  user: jsonb('user'),
  context: jsonb('context'),
  tags: jsonb('tags'),
  extra: jsonb('extra'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
  isProcessed: boolean('is_processed').default(false).notNull(),
}, (table) => ({
  eventIdIdx: index('sentry_user_feedback_event_id_idx').on(table.eventId),
  projectIdIdx: index('sentry_user_feedback_project_id_idx').on(table.projectId),
  environmentIdx: index('sentry_user_feedback_environment_idx').on(table.environment),
  emailIdx: index('sentry_user_feedback_email_idx').on(table.email),
  createdAtIdx: index('sentry_user_feedback_created_at_idx').on(table.createdAt),
  isProcessedIdx: index('sentry_user_feedback_is_processed_idx').on(table.isProcessed),
}));

// Database Query Performance Table
export const sentryQueryPerformance = pgTable('sentry_query_performance', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: text('project_id').notNull(),
  environment: text('environment').notNull(),
  query: text('query').notNull(),
  queryHash: text('query_hash').notNull(),
  tableName: text('table_name'),
  operation: text('operation').notNull(), // SELECT, INSERT, UPDATE, DELETE
  duration: integer('duration').notNull(), // in milliseconds
  rowsAffected: integer('rows_affected'),
  rowsReturned: integer('rows_returned'),
  executionPlan: jsonb('execution_plan'),
  parameters: jsonb('parameters'),
  error: text('error'),
  stackTrace: text('stack_trace'),
  user: jsonb('user'),
  context: jsonb('context'),
  tags: jsonb('tags'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index('sentry_query_performance_project_id_idx').on(table.projectId),
  environmentIdx: index('sentry_query_performance_environment_idx').on(table.environment),
  queryHashIdx: index('sentry_query_performance_query_hash_idx').on(table.queryHash),
  tableNameIdx: index('sentry_query_performance_table_name_idx').on(table.tableName),
  operationIdx: index('sentry_query_performance_operation_idx').on(table.operation),
  createdAtIdx: index('sentry_query_performance_created_at_idx').on(table.createdAt),
}));

// Relations
export const sentryEventsRelations = relations(sentryEvents, ({ many }) => ({
  userFeedback: many(sentryUserFeedback),
}));

export const sentryUserFeedbackRelations = relations(sentryUserFeedback, ({ one }) => ({
  event: one(sentryEvents, {
    fields: [sentryUserFeedback.eventId],
    references: [sentryEvents.eventId],
  }),
}));

// Types
export type SentryTransaction = typeof sentryTransactions.$inferSelect;
export type NewSentryTransaction = typeof sentryTransactions.$inferInsert;
export type SentryUserFeedback = typeof sentryUserFeedback.$inferSelect;
export type NewSentryUserFeedback = typeof sentryUserFeedback.$inferInsert;
export type SentryQueryPerformance = typeof sentryQueryPerformance.$inferSelect;
export type NewSentryQueryPerformance = typeof sentryQueryPerformance.$inferInsert;
