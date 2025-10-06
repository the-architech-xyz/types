/**
 * Type-Safe Blueprint Actions
 * 
 * Discriminated union types for all blueprint actions with strict type safety.
 * Each action type has its own interface with required properties.
 */

// Import existing types from adapter.ts
import { ImportDefinition, SchemaTable, ConflictResolution, MergeInstructions } from './adapter.js';

// Import new enums
import { BlueprintActionType } from './blueprint-action-types.js';
import { ModifierType } from './modifier-types.js';
import { EnhanceFileFallbackStrategy, CreateFileFallbackStrategy } from './fallback-strategies.js';
import { ConflictResolutionStrategy, ConflictMergeStrategy } from './conflict-resolution.js';

// Common properties shared by all actions
export interface BaseAction {
  condition?: string; // Template condition for conditional execution
  forEach?: string; // Path to array in context (e.g., "module.parameters.components") - expands action for each item with {{item}} placeholder
}

// INSTALL_PACKAGES Action
export interface InstallPackagesAction extends BaseAction {
  type: BlueprintActionType.INSTALL_PACKAGES;
  packages: string[]; // Required: Array of package names
  isDev?: boolean; // Whether to install as dev dependencies
}

// ADD_SCRIPT Action
export interface AddScriptAction extends BaseAction {
  type: BlueprintActionType.ADD_SCRIPT;
  name: string; // Required: Script name
  command: string; // Required: Script command
}

// ADD_ENV_VAR Action
export interface AddEnvVarAction extends BaseAction {
  type: BlueprintActionType.ADD_ENV_VAR;
  key: string; // Required: Environment variable key
  value: string; // Required: Environment variable value
  path?: string; // Optional: Environment file path (defaults to .env)
  description?: string; // Optional description
}

// CREATE_FILE Action
export interface CreateFileAction extends BaseAction {
  type: BlueprintActionType.CREATE_FILE;
  path: string; // Required: File path
  content?: string; // File content
  template?: string; // Template file path
  overwrite?: boolean; // Whether to overwrite existing files
  conflictResolution?: ConflictResolution; // Conflict resolution strategy
  mergeInstructions?: MergeInstructions; // Merge instructions for file content
}

// APPEND_TO_FILE Action
export interface AppendToFileAction extends BaseAction {
  type: 'APPEND_TO_FILE';
  path: string; // Required: File path
  content: string; // Required: Content to append
}

// PREPEND_TO_FILE Action
export interface PrependToFileAction extends BaseAction {
  type: 'PREPEND_TO_FILE';
  path: string; // Required: File path
  content: string; // Required: Content to prepend
}

// RUN_COMMAND Action
export interface RunCommandAction extends BaseAction {
  type: BlueprintActionType.RUN_COMMAND;
  command: string; // Required: Command to run
  workingDir?: string; // Working directory for command
}

// MERGE_JSON Action
export interface MergeJsonAction extends BaseAction {
  type: 'MERGE_JSON';
  path: string; // Required: File path
  content: Record<string, any>; // Required: JSON content to merge
}

// ADD_TS_IMPORT Action
export interface AddTsImportAction extends BaseAction {
  type: 'ADD_TS_IMPORT';
  path: string; // Required: File path
  imports: ImportDefinition[]; // Required: Import definitions
}

// ENHANCE_FILE Action
export interface EnhanceFileAction extends BaseAction {
  type: BlueprintActionType.ENHANCE_FILE;
  path: string; // Required: File path
  modifier: ModifierType; // Required: Modifier function name
  params?: Record<string, any>; // Parameters for modifier function
  fallback?: EnhanceFileFallbackStrategy; // Fallback strategy
}

// MERGE_CONFIG Action
export interface MergeConfigAction extends BaseAction {
  type: 'MERGE_CONFIG';
  path: string; // Required: File path
  strategy: 'deep-merge' | 'shallow-merge' | 'replace'; // Required: Merge strategy
  config: Record<string, any>; // Required: Configuration object to merge
}

// WRAP_CONFIG Action
export interface WrapConfigAction extends BaseAction {
  type: 'WRAP_CONFIG';
  path: string; // Required: File path
  wrapper: string; // Required: Wrapper function name
  options?: Record<string, any>;
}

// EXTEND_SCHEMA Action
export interface ExtendSchemaAction extends BaseAction {
  type: 'EXTEND_SCHEMA';
  path: string; // Required: File path
  tables: SchemaTable[]; // Required: Tables to add to schema
  additionalImports?: string[]; // Additional imports needed (if any)
}

// ADD_DEPENDENCY Action
export interface AddDependencyAction extends BaseAction {
  type: BlueprintActionType.ADD_DEPENDENCY;
  packages: string[]; // Required: Array of package names
  isDev?: boolean; // Whether to install as dev dependencies
}

// ADD_DEV_DEPENDENCY Action
export interface AddDevDependencyAction extends BaseAction {
  type: BlueprintActionType.ADD_DEV_DEPENDENCY;
  packages: string[]; // Required: Array of package names
}

// Schema column for EXTEND_SCHEMA action
export interface SchemaColumn {
  name: string; // Required: Column name
  type: string; // Required: Column type
  nullable?: boolean; // Whether column is nullable
  primaryKey?: boolean; // Whether column is primary key
  unique?: boolean; // Whether column is unique
  defaultValue?: any; // Default value
}

// Main discriminated union type
export type BlueprintAction = 
  | InstallPackagesAction
  | AddScriptAction
  | AddEnvVarAction
  | CreateFileAction
  | AppendToFileAction
  | PrependToFileAction
  | RunCommandAction
  | MergeJsonAction
  | AddTsImportAction
  | EnhanceFileAction
  | MergeConfigAction
  | WrapConfigAction
  | ExtendSchemaAction
  | AddDependencyAction
  | AddDevDependencyAction;
