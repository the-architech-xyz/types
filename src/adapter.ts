/**
 * Adapter Types - V1 Enhanced with Intelligence
 * 
 * Enhanced adapter structure for intelligent blueprint execution
 */

export interface Adapter {
  config: AdapterConfig;
  blueprint: Blueprint;
}

export interface AdapterConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  blueprint: string;
  dependencies?: string[]; // Other adapters this adapter depends on
  prerequisites?: {
    modules?: string[]; // Required modules
    capabilities?: Array<{
      name: string;
      version?: string;
      description?: string;
    }>;
  }; // Prerequisites for this adapter
  capabilities?: string[]; // What this adapter can do
  limitations?: string; // Textual description of limitations
  parameters?: Record<string, ParameterDefinition>; // Parameter definitions
  features?: Record<string, FeatureDefinition>; // V2: Modular features
  paths?: Record<string, string>; // V1: Framework-specific path declarations
  tags?: string[]; // Tags for marketplace categorization
  engine?: {
    cliVersion: string; // Required CLI version
  };
}

export interface ParameterDefinition {
  type: 'string' | 'boolean' | 'number' | 'select' | 'array' | 'object';
  required: boolean;
  default?: any;
  choices?: string[];
  description: string;
  validation?: (value: any) => boolean;
}

export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  blueprint: string; // Path to feature blueprint
  dependencies?: string[]; // Other features this feature depends on
  parameters?: Record<string, ParameterDefinition>; // Feature-specific parameters
  category?: 'core' | 'premium' | 'integration' | 'cross-adapter'; // Feature category
  compatibility?: string[]; // Compatible adapters (for cross-adapter features)
}

export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  version?: string;
  contextualFiles?: string[]; // Files that need to be pre-loaded into VFS
  actions: BlueprintAction[];
}

// Import the new discriminated union type
import { BlueprintAction } from './blueprint-actions.js';

// Re-export for backward compatibility
export { BlueprintAction } from './blueprint-actions.js';
export type { 
  InstallPackagesAction,
  AddScriptAction,
  AddEnvVarAction,
  CreateFileAction,
  AppendToFileAction,
  PrependToFileAction,
  RunCommandAction,
  MergeJsonAction,
  AddTsImportAction,
  EnhanceFileAction,
  MergeConfigAction,
  WrapConfigAction,
  ExtendSchemaAction,
  AddDependencyAction,
  AddDevDependencyAction,
  SchemaColumn
} from './blueprint-actions.js';

export interface ConflictResolution {
  strategy: 'error' | 'skip' | 'replace' | 'merge';
  mergeStrategy?: 'json' | 'css' | 'js' | 'append';
  priority?: number;
}

export interface MergeInstructions {
  modifier?: import('./modifiers.js').AvailableModifier;
  params?: Record<string, any>;
  strategy?: 'deep-merge' | 'shallow-merge' | 'replace';
}

export interface SchemaTable {
  name: string; // Table name
  definition: string; // Table definition code
}

export interface ImportDefinition {
  moduleSpecifier: string;
  namedImports?: string[];
  defaultImport?: string;
  namespaceImport?: string;
}

// Modifier system types
export interface ModifierDefinition {
  handler: (filePath: string, params: any, context: any) => Promise<any>; // ProjectContext will be imported
  paramsSchema: any; // JSONSchema for validation
  description: string;
  supportedFileTypes: string[];
}

export interface ModifierRegistry {
  [key: string]: ModifierDefinition;
}

export interface BlueprintExecutionResult {
  success: boolean;
  files: string[];
  errors: string[];
  warnings: string[];
}
