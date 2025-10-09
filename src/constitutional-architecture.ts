/**
 * Constitutional Architecture Types
 * 
 * Types for the "Defaults are Implicit, Overrides are Explicit" system
 */

export interface InternalStructure {
  [capabilityName: string]: CapabilityDefinition;
}

export interface CapabilityDefinition {
  provides: string[]; // Capabilities this provides
  prerequisites?: string[]; // Required capabilities
  templates: string[]; // Template files for this capability
  dependencies?: string[]; // Module dependencies
}

export interface ConstitutionalModule {
  id: string;
  name: string;
  description: string;
  version: string;
  provides: string[]; // Conditional capabilities
  parameters: {
    features: {
      [featureName: string]: {
        description: string;
        default: boolean;
        type?: 'boolean' | 'string' | 'number' | 'array';
        options?: any[];
        required?: boolean;
      };
    };
  };
  internal_structure: InternalStructure;
  constraints?: Record<string, string>;
}

export interface MergedConfiguration {
  activeFeatures: string[];
  resolvedCapabilities: string[];
  executionOrder: string[];
  conflicts: ConfigurationConflict[];
  templateContext?: Record<string, any>; // Global template context
}

export interface ConfigurationConflict {
  type: 'missing_prerequisite' | 'circular_dependency' | 'version_mismatch';
  message: string;
  affectedCapabilities: string[];
  resolution?: string;
}

export interface ConstitutionalExecutionContext {
  activeFeatures: Map<string, string[]>; // moduleId -> active features
  mergedConfigurations: Map<string, MergedConfiguration>; // moduleId -> merged config
  capabilityRegistry: Map<string, CapabilityDefinition>; // capability -> definition
}

// Template context merging helper
export interface BlueprintTemplateContext {
  features: string[]; // Active features for this template
  [key: string]: any; // Additional context properties
}

// Enhanced action context for template rendering
export interface ActionTemplateContext extends BlueprintTemplateContext {
  actionContext?: Record<string, any>; // Action-specific context
  globalContext?: Record<string, any>; // Global project context
}
