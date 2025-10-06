/**
 * Conflict Resolution Enums
 * 
 * Type-safe enums for conflict resolution strategies.
 */

/**
 * Conflict resolution strategies
 */
export enum ConflictResolutionStrategy {
  ERROR = 'error',
  SKIP = 'skip',
  REPLACE = 'replace',
  MERGE = 'merge'
}

/**
 * Merge strategies for conflict resolution
 */
export enum ConflictMergeStrategy {
  JSON = 'json',
  CSS = 'css',
  JS = 'js',
  APPEND = 'append'
}

/**
 * Type guard to check if a string is a valid conflict resolution strategy
 */
export function isValidConflictResolutionStrategy(value: string): value is ConflictResolutionStrategy {
  return Object.values(ConflictResolutionStrategy).includes(value as ConflictResolutionStrategy);
}

/**
 * Type guard to check if a string is a valid conflict merge strategy
 */
export function isValidConflictMergeStrategy(value: string): value is ConflictMergeStrategy {
  return Object.values(ConflictMergeStrategy).includes(value as ConflictMergeStrategy);
}
