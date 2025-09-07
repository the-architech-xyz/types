/**
 * Integration Feature Types
 * 
 * Defines the structure for integration features that connect adapters
 * with specific frameworks or other adapters
 */

import { Blueprint } from './adapter.js';

export interface IntegrationAdapter {
  id: string;
  name: string;
  description: string;
  category: 'integration';
  tech_stack: {
    framework: string;
    adapters: string[];
  };
  requirements: {
    modules: string[];
    dependencies: string[];
  };
  provides: {
    files: string[];
    components: string[];
    pages: string[];
  };
  sub_features: {
    [key: string]: {
      name: string;
      description: string;
      type: 'boolean' | 'string' | 'array';
      default?: boolean | string | string[];
      options?: string[];
    };
  };
  blueprint: Blueprint;
}

// Legacy alias for backward compatibility
export type IntegrationFeature = IntegrationAdapter;

export interface IntegrationFeatureConfig {
  id: string;
  name: string;
  description: string;
  category: 'integration';
  tech_stack: {
    framework: string;
    adapters: string[];
  };
  requirements: {
    modules: string[];
    dependencies: string[];
  };
  provides: {
    files: string[];
    components: string[];
    pages: string[];
  };
  blueprint: string; // Path to blueprint file
}

export interface IntegrationFeatureRegistry {
  [key: string]: IntegrationFeature;
}
