/**
 * Feature Types - V1 Enhanced with Capability Resolution
 * 
 * Feature configuration for intelligent dependency resolution
 */

// Import shared types from adapter
import type { BlueprintAction, Blueprint, ParameterDefinition } from './adapter.js';

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
  contract?: {
    hooks: Record<string, string>; // Hook signatures: { "useSendEmail": "UseMutationResult<...>" }
    api?: {
      endpoints: string[]; // API endpoints this feature provides
      methods: string[]; // HTTP methods supported
    };
    types?: string[]; // TypeScript types this feature provides
  };
}

export interface Feature {
  config: FeatureConfig;
  blueprint: Blueprint;
}

// Re-export shared types for convenience
export type { BlueprintAction, Blueprint, ParameterDefinition };
