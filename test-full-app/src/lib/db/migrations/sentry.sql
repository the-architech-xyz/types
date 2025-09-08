-- Sentry Events Table
CREATE TABLE IF NOT EXISTS sentry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  project_id TEXT NOT NULL,
  environment TEXT NOT NULL,
  level TEXT NOT NULL,
  message TEXT,
  exception JSONB,
  stacktrace JSONB,
  tags JSONB,
  extra JSONB,
  user JSONB,
  context JSONB,
  breadcrumbs JSONB,
  release TEXT,
  dist TEXT,
  platform TEXT,
  sdk JSONB,
  server_name TEXT,
  url TEXT,
  method TEXT,
  status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT,
  is_resolved BOOLEAN DEFAULT FALSE NOT NULL
);

-- Sentry Transactions Table
CREATE TABLE IF NOT EXISTS sentry_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL UNIQUE,
  project_id TEXT NOT NULL,
  environment TEXT NOT NULL,
  name TEXT NOT NULL,
  op TEXT NOT NULL,
  status TEXT NOT NULL,
  duration INTEGER NOT NULL,
  start_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  end_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  tags JSONB,
  data JSONB,
  measurements JSONB,
  spans JSONB,
  user JSONB,
  context JSONB,
  release TEXT,
  dist TEXT,
  platform TEXT,
  sdk JSONB,
  server_name TEXT,
  url TEXT,
  method TEXT,
  status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Sentry User Feedback Table
CREATE TABLE IF NOT EXISTS sentry_user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT,
  project_id TEXT NOT NULL,
  environment TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  comments TEXT NOT NULL,
  user JSONB,
  context JSONB,
  tags JSONB,
  extra JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  is_processed BOOLEAN DEFAULT FALSE NOT NULL
);

-- Sentry Query Performance Table
CREATE TABLE IF NOT EXISTS sentry_query_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  environment TEXT NOT NULL,
  query TEXT NOT NULL,
  query_hash TEXT NOT NULL,
  table_name TEXT,
  operation TEXT NOT NULL,
  duration INTEGER NOT NULL,
  rows_affected INTEGER,
  rows_returned INTEGER,
  execution_plan JSONB,
  parameters JSONB,
  error TEXT,
  stack_trace TEXT,
  user JSONB,
  context JSONB,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for Sentry Events
CREATE INDEX IF NOT EXISTS sentry_events_event_id_idx ON sentry_events(event_id);
CREATE INDEX IF NOT EXISTS sentry_events_project_id_idx ON sentry_events(project_id);
CREATE INDEX IF NOT EXISTS sentry_events_environment_idx ON sentry_events(environment);
CREATE INDEX IF NOT EXISTS sentry_events_level_idx ON sentry_events(level);
CREATE INDEX IF NOT EXISTS sentry_events_created_at_idx ON sentry_events(created_at);
CREATE INDEX IF NOT EXISTS sentry_events_is_resolved_idx ON sentry_events(is_resolved);

-- Indexes for Sentry Transactions
CREATE INDEX IF NOT EXISTS sentry_transactions_transaction_id_idx ON sentry_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS sentry_transactions_project_id_idx ON sentry_transactions(project_id);
CREATE INDEX IF NOT EXISTS sentry_transactions_environment_idx ON sentry_transactions(environment);
CREATE INDEX IF NOT EXISTS sentry_transactions_name_idx ON sentry_transactions(name);
CREATE INDEX IF NOT EXISTS sentry_transactions_op_idx ON sentry_transactions(op);
CREATE INDEX IF NOT EXISTS sentry_transactions_status_idx ON sentry_transactions(status);
CREATE INDEX IF NOT EXISTS sentry_transactions_created_at_idx ON sentry_transactions(created_at);

-- Indexes for Sentry User Feedback
CREATE INDEX IF NOT EXISTS sentry_user_feedback_event_id_idx ON sentry_user_feedback(event_id);
CREATE INDEX IF NOT EXISTS sentry_user_feedback_project_id_idx ON sentry_user_feedback(project_id);
CREATE INDEX IF NOT EXISTS sentry_user_feedback_environment_idx ON sentry_user_feedback(environment);
CREATE INDEX IF NOT EXISTS sentry_user_feedback_email_idx ON sentry_user_feedback(email);
CREATE INDEX IF NOT EXISTS sentry_user_feedback_created_at_idx ON sentry_user_feedback(created_at);
CREATE INDEX IF NOT EXISTS sentry_user_feedback_is_processed_idx ON sentry_user_feedback(is_processed);

-- Indexes for Sentry Query Performance
CREATE INDEX IF NOT EXISTS sentry_query_performance_project_id_idx ON sentry_query_performance(project_id);
CREATE INDEX IF NOT EXISTS sentry_query_performance_environment_idx ON sentry_query_performance(environment);
CREATE INDEX IF NOT EXISTS sentry_query_performance_query_hash_idx ON sentry_query_performance(query_hash);
CREATE INDEX IF NOT EXISTS sentry_query_performance_table_name_idx ON sentry_query_performance(table_name);
CREATE INDEX IF NOT EXISTS sentry_query_performance_operation_idx ON sentry_query_performance(operation);
CREATE INDEX IF NOT EXISTS sentry_query_performance_created_at_idx ON sentry_query_performance(created_at);

-- Foreign Key Constraints
ALTER TABLE sentry_user_feedback 
ADD CONSTRAINT fk_sentry_user_feedback_event_id 
FOREIGN KEY (event_id) REFERENCES sentry_events(event_id) ON DELETE SET NULL;
