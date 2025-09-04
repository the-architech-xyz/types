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
}

export interface ParameterDefinition {
  type: 'boolean' | 'string' | 'number' | 'array' | 'object';
  default?: any;
  description: string;
  required?: boolean;
  options?: any[]; // For enum-like parameters
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
  actions: BlueprintAction[];
}

export interface BlueprintAction {
  type: 'ADD_CONTENT' | 'RUN_COMMAND';
  target?: string;
  content?: string;
  command?: string;
}

export interface BlueprintExecutionResult {
  success: boolean;
  files: string[];
  errors: string[];
  warnings: string[];
}
