/**
 * Core CLI Types
 * 
 * Essential types for The Architech CLI orchestration
 */

export interface ProjectConfig {
  name: string;
  framework: string;
  path?: string;
  description?: string;
  version?: string;
  author?: string;
  license?: string;
  structure?: 'monorepo' | 'single-app'; // Project structure type
  monorepo?: MonorepoConfig; // Monorepo configuration
}

export interface MonorepoConfig {
  tool: 'turborepo' | 'nx' | 'pnpm-workspaces' | 'yarn-workspaces';
  packages: {
    api?: string;      // e.g., 'packages/api'
    web?: string;      // e.g., 'apps/web'
    mobile?: string;   // e.g., 'apps/mobile'
    shared?: string;   // e.g., 'packages/shared'
    [key: string]: string | undefined; // Allow custom packages
  };
}

export type ModuleType = 'adapter' | 'connector' | 'feature';

export interface Module {
  id: string;
  category?: string;
  version?: string;
  parameters: Record<string, any>;
  features?: {
    [key: string]: boolean | string | string[];
  };
  externalFiles?: string[];
  config?: {
    id: string;
    name: string;
    description: string;
    version: string;
    category: string;
    capabilities?: Record<string, any>;
    prerequisites?: {
      modules?: string[];
      capabilities?: string[];
    };
    provides?: {
      capabilities?: string[];
      files?: string[];
      components?: string[];
      pages?: string[];
    };
    [key: string]: any; // Allow additional config properties
  };
}

export interface ExecutionOptions {
  skipInstall?: boolean;
  skipGit?: boolean;
  verbose?: boolean;
}

export interface ExecutionResult {
  success: boolean;
  modulesExecuted: number;
  errors?: string[];
  warnings?: string[];
}

// Core Genome interface - the primary type for CLI orchestration
export interface Genome {
  version: string;
  project: ProjectConfig;
  modules: GenomeModule[];
  features?: string[]; // Feature IDs to resolve
  options?: ExecutionOptions; // Execution options
}

// Enhanced Genome module interface with Constitutional Architecture support
export interface GenomeModule {
  id: string; // Will be constrained by ModuleId type in generated types
  targetPackage?: string; // For monorepo: which package this module should be executed in
  parameters?: Record<string, any>; // Constitutional Architecture parameters
  features?: Record<string, boolean | string | string[]>; // Legacy features support
  externalFiles?: string[];
  config?: {
    id: string;
    name: string;
    description: string;
    version: string;
    category: string;
    capabilities?: Record<string, any>;
    prerequisites?: {
      modules?: string[];
      capabilities?: string[];
    };
    provides?: {
      capabilities?: string[];
      files?: string[];
      components?: string[];
      pages?: string[];
    };
    [key: string]: any; // Allow additional config properties
  };
}
