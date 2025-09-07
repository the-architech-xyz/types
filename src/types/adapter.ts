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
  capabilities?: string[]; // What this adapter can do
  limitations?: string; // Textual description of limitations
  parameters?: Record<string, ParameterDefinition>; // Parameter definitions
  features?: Record<string, FeatureDefinition>; // V2: Modular features
  paths?: Record<string, string>; // V1: Framework-specific path declarations
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
  actions: BlueprintAction[];
}

export interface BlueprintAction {
  // High-level semantic actions (recommended)
  type: 'INSTALL_PACKAGES' | 'ADD_SCRIPT' | 'ADD_ENV_VAR' | 'CREATE_FILE' | 'UPDATE_TS_CONFIG' | 'APPEND_TO_FILE' | 'PREPEND_TO_FILE' | 'RUN_COMMAND' | 'ADD_CONTENT';
  
  // Common properties
  condition?: string; // Template condition for conditional execution
  
  // INSTALL_PACKAGES parameters
  packages?: string[]; // Array of package names
  isDev?: boolean; // Whether to install as dev dependencies
  
  // ADD_SCRIPT parameters
  name?: string; // Script name
  command?: string; // Script command
  
  // ADD_ENV_VAR parameters
  key?: string; // Environment variable key
  value?: string; // Environment variable value
  description?: string; // Optional description
  
  // CREATE_FILE parameters
  path?: string; // File path
  content?: string; // File content
  overwrite?: boolean; // Whether to overwrite existing files
  
  // UPDATE_TS_CONFIG parameters
  modifications?: Record<string, any>; // Configuration modifications
  
  // APPEND_TO_FILE / PREPEND_TO_FILE parameters
  // (uses path and content from above)
  
  // RUN_COMMAND parameters
  workingDir?: string; // Working directory for command
  
  // ADD_CONTENT parameters (legacy/advanced)
  target?: string; // File target (legacy)
  strategy?: 'merge' | 'replace' | 'append' | 'prepend' | 'merge-imports' | 'merge-config' | 'merge-schema';
  fileType?: 'typescript' | 'javascript' | 'json' | 'env' | 'auto';
  
  // Legacy merge parameters
  configObjectName?: string;
  payload?: Record<string, any>;
  imports?: ImportDefinition[];
  schema?: Record<string, any>;
  dialect?: 'drizzle' | 'prisma' | 'sequelize' | 'typeorm';
}

export interface ImportDefinition {
  moduleSpecifier: string;
  namedImports?: string[];
  defaultImport?: string;
  namespaceImport?: string;
}

export interface BlueprintExecutionResult {
  success: boolean;
  files: string[];
  errors: string[];
  warnings: string[];
}
