/**
 * Core CLI Types
 * 
 * Essential types for The Architech CLI orchestration
 */

export interface ProjectConfig {
  name: string;
  path?: string;
  description?: string;
  version?: string;
  author?: string;
  license?: string;
  framework?: string; // Legacy: for backward compatibility with old genomes
  structure?: 'monorepo' | 'single-app'; // Project structure type
  monorepo?: MonorepoConfig; // Monorepo configuration
  // Multiple apps (frameworks) per project. Single source of truth.
  apps?: FrameworkApp[];
  /**
   * User-defined path overrides
   * 
   * Allows users to customize default paths defined by the marketplace.
   * Keys should match path keys defined in the marketplace's path-keys.json.
   * 
   * @example
   * ```typescript
   * {
   *   'packages.shared.src': 'src/lib',
   *   'apps.web.src': 'src'
   * }
   * ```
   * 
   * Overrides are validated against marketplace path key definitions.
   * Invalid keys will result in warnings during path initialization.
   */
  paths?: Record<string, string>;
}

export interface MonorepoConfig {
  tool: 'turborepo' | 'nx' | 'pnpm' | 'yarn' | 'pnpm-workspaces' | 'yarn-workspaces' | 'npm-workspaces' | 'none';
  packages?: {
    api?: string;      // e.g., 'packages/api'
    web?: string;      // e.g., 'apps/web'
    mobile?: string;   // e.g., 'apps/mobile'
    shared?: string;   // e.g., 'packages/shared'
    ui?: string;       // e.g., 'packages/ui'
    [key: string]: string | undefined; // Allow custom packages
  };
}

export interface FrameworkApp {
  id: string;                       // 'web' | 'mobile' | 'api' | custom
  type: 'web' | 'mobile' | 'api' | 'desktop' | 'worker';
  framework: string;                // e.g., 'nextjs', 'expo'
  package?: string;                 // monorepo package path
  router?: 'app' | 'pages';         // Next.js specific
  alias?: string;                   // e.g., '@/'
  parameters?: Record<string, unknown>; // framework-specific parameters
}

export type ModuleType = 'adapter' | 'connector' | 'feature';

export interface Module {
  id: string;
  category?: string;
  version?: string;
  parameters: Record<string, any>;
  parameterSchema?: Record<string, any>;
  parameterDefaults?: Record<string, any>;
  parameterMetadata?: Record<string, any>;
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
  source?: ModuleSource;
  manifest?: ModuleManifest;
  blueprint?: ModuleBlueprint;
  templates?: ModuleTemplate[];
  marketplace?: ModuleMarketplace;
  resolved?: ModuleResolvedPaths;
}

export interface ModuleSource {
  root: string;
  marketplace?: string;
}

export interface ModuleManifest {
  file: string;
}

export interface ModuleBlueprint {
  file: string;
  runtime: 'source' | 'compiled';
}

export interface ModuleTemplate {
  file: string;
  target?: string;
}

export interface ModuleMarketplace {
  name: string;
  root?: string;
}


export interface GenomeMarketplace {
  name: string;
  version?: string;
  root?: string;
  manifest?: string;
  types?: string;
  adapter?: string;
  overrides?: {
    core?: string;
    ui?: Record<string, string>;
    [key: string]: unknown;
  };
  ui?: Record<string, string>;
  [key: string]: unknown;
}

export interface ModuleResolvedPaths {
  root: string;
  manifest: string;
  blueprint: string;
  templates: string[];
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
  metadata?: Record<string, any>;
  marketplace?: GenomeMarketplace;
}

export type GenomeModule = Module;
