/**
 * Path Keys for Template Import Resolution
 * 
 * Extensible path keys system with override support.
 * Allows both standardized keys (enum) and custom keys (string).
 */

/**
 * Smart path keys for common import patterns
 * 
 * These keys are pre-computed in FrameworkContextService and available
 * in templates via `paths.{key}` and `importPath(paths.{key})`.
 */
export enum SmartPathKey {
  // tRPC paths
  TRPC_ROUTER = 'trpcRouter',
  TRPC_CLIENT = 'trpcClient',
  TRPC_SERVER = 'trpcServer',
  
  // Shared code paths
  SHARED_SCHEMAS = 'sharedSchemas',
  SHARED_TYPES = 'sharedTypes',
  SHARED_UTILS = 'sharedUtils',
  
  // Auth paths
  AUTH_CONFIG = 'authConfig',
  AUTH_HOOKS = 'authHooks',
  AUTH_TYPES = 'authTypes',
  
  // Payment paths
  PAYMENT_CONFIG = 'paymentConfig',
  PAYMENT_HOOKS = 'paymentHooks',
  PAYMENT_TYPES = 'paymentTypes',
  
  // Teams paths
  TEAMS_CONFIG = 'teamsConfig',
  TEAMS_HOOKS = 'teamsHooks',
  TEAMS_TYPES = 'teamsTypes',
  
  // Email paths
  EMAIL_CONFIG = 'emailConfig',
  EMAIL_HOOKS = 'emailHooks',
  EMAIL_TYPES = 'emailTypes',
  
  // Database paths
  DATABASE_CONFIG = 'databaseConfig',
  DATABASE_SCHEMA = 'databaseSchema',
  DATABASE_CLIENT = 'databaseClient',
  
  // State management paths
  STATE_STORES = 'stateStores',
  STATE_PROVIDERS = 'stateProviders',
  
  // API paths
  API_ROUTES = 'apiRoutes',
  API_HANDLERS = 'apiHandlers',
  API_MIDDLEWARE = 'apiMiddleware',
}

/**
 * Smart path key type - allows both standard enum values and custom strings
 */
export type SmartPath = SmartPathKey | string;

/**
 * Smart path override configuration
 * 
 * Allows frameworks, adapters, or users to override path values.
 * Warnings are issued when overrides occur.
 */
export interface SmartPathOverride {
  key: SmartPath;
  value: string;
  source: 'user' | 'framework' | 'adapter' | 'genome';
  reason?: string;
}

/**
 * Smart path registry for managing overrides
 */
export interface SmartPathRegistry {
  paths: Record<string, string>;
  overrides: SmartPathOverride[];
}

