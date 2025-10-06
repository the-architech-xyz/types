/**
 * Feature Types - V1 Enhanced with Capability Resolution
 * 
 * Feature configuration for intelligent dependency resolution
 */

export interface FeatureConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'feature';
  blueprint: string;
  prerequisites: {
    capabilities: string[]; // Required capabilities (kebab-case)
    adapters?: string[]; // Required adapter categories
    integrators?: string[]; // Required integrator types
    modules?: string[]; // Direct module dependencies
  };
  provides: {
    capabilities: string[]; // Capabilities this feature provides
  };
  parameters?: Record<string, ParameterDefinition>;
  constraints?: {
    [key: string]: string; // Version constraints (e.g., "minReactVersion": ">=18.0.0")
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

export interface Feature {
  config: FeatureConfig;
  blueprint: Blueprint;
}

export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  version?: string;
  contextualFiles?: string[];
  actions: BlueprintAction[];
}

// Import blueprint actions from adapter types
export type { BlueprintAction } from './adapter.js';