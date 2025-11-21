/**
 * V2 Genome Structure
 * 
 * The new V2 architecture uses a federated composition model where:
 * - Marketplaces are versioned recipe databases
 * - Packages are business-level capabilities
 * - Apps declare dependencies on packages
 * - CLI resolves everything into a lock file
 */

// ============================================================================
// V2 GENOME
// ============================================================================

export interface V2Genome {
  workspace: {
    name: string;
    description?: string;
  };

  marketplaces: Record<string, MarketplaceConfig>;

  packages: Record<string, PackageConfig>;

  apps: Record<string, AppConfig>;
}

export interface MarketplaceConfig {
  type: 'npm' | 'git' | 'local';
  package?: string;      // For npm: '@thearchitech/marketplace-react@1.0.0'
  url?: string;          // For git: 'github:org/repo'
  ref?: string;          // For git: 'main', 'v1.0.0', etc.
  path?: string;         // For local: './marketplace'
}

export interface PackageConfig {
  from: string;          // Marketplace name
  provider?: string;     // Provider name (defaults to defaultProvider from recipe)
  parameters?: Record<string, any>;
}

export interface AppConfig {
  type: 'web' | 'mobile' | 'api' | 'desktop' | 'worker';  // App type (required)
  framework?: string;
  package: string;       // Path (e.g., 'apps/web')
  dependencies: string[];  // Package names
  parameters?: Record<string, any>;
}

// ============================================================================
// RECIPE BOOK
// ============================================================================

export interface RecipeBook {
  version: string;
  packages: Record<string, PackageRecipe>;
}

export interface PackageRecipe {
  defaultProvider: string;
  packageStructure?: PackageStructure;
  providers: Record<string, ProviderRecipe>;
}

export interface ProviderRecipe {
  modules: RecipeModule[];
  dependencies: {
    packages: string[];
  };
}

export interface ModuleReference {
  id: string;
  version: string;
}

/**
 * Enhanced module definition in recipe book with targeting information
 */
export interface RecipeModule {
  id: string;
  version: string;
  /**
   * Target package for this module (e.g., "auth", "db", "ui")
   * null = app-specific (generates in apps/{appId})
   */
  targetPackage?: string | null;
  /**
   * Which apps this module targets (for app-specific modules)
   * Only used when targetPackage is null
   */
  targetApps?: string[];
  /**
   * Required framework for this module (e.g., "nextjs", "hono", "expo")
   * Used for framework compatibility filtering
   * If not specified, module is framework-agnostic
   */
  requiredFramework?: string;
  /**
   * Required app types for this module (e.g., ["web"], ["mobile"], ["web", "api"])
   * Used for app type compatibility filtering
   * If not specified, module works with all app types
   */
  requiredAppTypes?: ('web' | 'mobile' | 'api' | 'desktop' | 'worker')[];
  /**
   * Module dependency declarations
   * CLI resolves abstract capabilities to concrete packages based on genome
   */
  dependencies?: ModuleDependencies;
}

/**
 * Package structure metadata from recipe book
 * Defines how a package should be generated (name, directory, dependencies, exports)
 */
export interface PackageStructure {
  /**
   * Package name (e.g., "auth", "db", "ui")
   */
  name: string;
  /**
   * Directory path relative to project root (e.g., "packages/auth")
   */
  directory: string;
  /**
   * Runtime dependencies
   * Can include placeholders like "@{projectName}/db" which will be resolved
   */
  dependencies: Record<string, string>;
  /**
   * Development dependencies
   */
  devDependencies?: Record<string, string>;
  /**
   * Package exports (subpath exports)
   * Maps export paths to file paths
   */
  exports?: Record<string, string>;
  /**
   * Package scripts
   */
  scripts?: Record<string, string>;
}

/**
 * Abstract capability dependencies
 * CLI resolves these to concrete npm packages based on genome
 */
export type DependencyCapability = 
  | 'auth'           // → better-auth, supabase, clerk
  | 'database'       // → drizzle-orm, prisma, typeorm
  | 'ui'             // → tamagui, shadcn
  | 'email'          // → resend, sendgrid
  | 'storage'        // → @aws-sdk/client-s3, etc.
  | 'data-fetching'  // → @tanstack/react-query, swr
  | 'state'          // → zustand, redux
  | 'api'            // → trpc, graphql
  | 'jobs'           // → inngest, bullmq
  | 'monitoring'     // → sentry, posthog
  | 'payment';       // → stripe, lemon-squeezy

/**
 * Module dependency declaration
 */
export interface ModuleDependencies {
  /**
   * Required capabilities - generation fails if not in genome
   */
  required?: DependencyCapability[];
  
  /**
   * Optional capabilities - warns if missing, doesn't fail
   */
  optional?: DependencyCapability[];
  
  /**
   * Direct npm packages - always installed (no resolution)
   */
  direct?: string[];
  
  /**
   * Framework-specific packages - only if app uses framework
   */
  framework?: {
    [framework: string]: string[];
  };
  
  /**
   * Dev dependencies
   */
  dev?: string[];
}

/**
 * Resolved dependency (after CLI resolution)
 */
export interface ResolvedDependency {
  capability: DependencyCapability;
  provider: string;              // From genome (e.g., 'drizzle')
  npmPackage: string;            // Resolved package (e.g., 'drizzle-orm')
  version: string;               // Version to install
}

/**
 * Package dependencies after resolution
 */
export interface PackageDependencies {
  runtime: Record<string, string>;    // dependencies
  dev: Record<string, string>;        // devDependencies
  workspace: Record<string, string>;  // workspace:* deps
}

// ============================================================================
// LOCK FILE
// ============================================================================

export interface LockFile {
  version: string;
  genomeHash: string;
  resolvedAt: string;
  marketplaces: Record<string, ResolvedMarketplace>;
  modules: LockFileModule[];
  executionPlan: string[];
  /**
   * Resolved dependencies map (package/app → dependencies)
   * Used during structure initialization to generate package.json files
   */
  dependencies?: Record<string, PackageDependencies>;
}

export interface ResolvedMarketplace {
  type: 'npm' | 'git' | 'local';
  package?: string;
  version?: string;
  url?: string;
  ref?: string;
  integrity: string;
}

export interface LockFileModule {
  id: string;
  version: string;
  source: {
    marketplace: string;
    type: string;
  };
  integrity: string;
  prerequisites: string[];
}

// ============================================================================
// DEPENDENCY GRAPH
// ============================================================================

export type DependencyGraph = Map<string, Set<string>>;

// ============================================================================
// MODULE WITH PREREQUISITES
// ============================================================================

export interface ModuleWithPrerequisites {
  id: string;
  version: string;
  source: {
    marketplace: string;
    type: string;
  };
  prerequisites: string[];
  parameters?: Record<string, any>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Type guard to check if a genome is V2 format
 */
export function isV2Genome(genome: any): genome is V2Genome {
  return (
    typeof genome === 'object' &&
    genome !== null &&
    'marketplaces' in genome &&
    'packages' in genome &&
    'apps' in genome &&
    'workspace' in genome
  );
}

/**
 * Define a V2 genome with type safety
 */
export function defineV2Genome(genome: V2Genome): V2Genome {
  return genome;
}

