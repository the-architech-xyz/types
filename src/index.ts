/**
 * The Architech Types
 * 
 * Centralized TypeScript type definitions for The Architech CLI and Marketplace
 */

// ============================================================================
// Core Types
// ============================================================================
export * from './adapter.js';
export * from './artifacts.js';
export * from './blueprint.js';
export * from './blueprint-actions.js';
export * from './blueprint-context.js';
export * from './common.js';
export * from './core.js';
export * from './project-context.js';

// ============================================================================
// Enums & Type Guards
// ============================================================================
export * from './blueprint-action-types.js';
export * from './modifier-types.js';
export * from './modifiers.js'; // Re-exports ModifierType and AvailableModifier (deprecated)

// ============================================================================
// Strategy & Resolution Types
// ============================================================================
export * from './fallback-strategies.js';
export * from './conflict-resolution.js';

// ============================================================================
// Agent Types
// ============================================================================
export * from './agent.js';
export * from './agent-base.js';

// ============================================================================
// Genome & Recipe Types
// ============================================================================
export { 
  ProjectConfig, 
  FrameworkApp, 
  MonorepoConfig, 
  ExecutionResult, 
  ExecutionOptions, 
  Module, 
  ModuleTemplate, 
  ModuleType, 
  Genome, 
  GenomeMarketplace 
} from './recipe.js';

export type { 
  ResolvedGenome, 
  ResolvedGenomeMetadata, 
  ResolvedModule, 
  ModuleMetadata, 
  BootstrapMetadata 
} from './resolved-genome.js';

export * from './define-genome.js';

// ============================================================================
// Marketplace Types
// ============================================================================
export * from './marketplace.js';
export * from './marketplace-manifest.js';
export * from './marketplace-adapter.js';
export * from './feature.js';
export * from './integration.js';

// ============================================================================
// Parameter & Schema Types
// ============================================================================
export { ParameterDefinition as ParameterSchemaDefinition } from './parameter-schema.js';

// ============================================================================
// Path System Types
// ============================================================================
export type {
  MarketplacePathKeyDefinition,
  MarketplacePathKeys,
  MarketplacePathKeys as MarketplacePathKeySchema,
  PathKeyValueSet,
  PathResolutionContext,
} from './path-keys.js';

export type {
  BasePathKeys,
  PathMappings,
  MarketplacePathKeys as ExtendedMarketplacePathKeys,
} from './path-keys-base.js';

export {
  validatePathOverrides,
  type PathOverrideValidationResult,
} from './path-override-validator.js';

// ============================================================================
// V2 Types
// ============================================================================
export * from './v2/index.js';

// ============================================================================
// Constitutional Architecture Types
// ============================================================================
export * from './constitutional-architecture.js';

// ============================================================================
// V1 Types (Not Exported - Conflicts with V2)
// ============================================================================
// V1 dependency resolver types (conflicts with V2, so not exported)
// export * from './dependency-resolver.js';
