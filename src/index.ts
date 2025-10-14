/**
 * The Architech Types
 * 
 * Centralized TypeScript type definitions for The Architech CLI and Marketplace
 */

// Core types
export * from './adapter.js';
export * from './artifacts.js';
export * from './blueprint-actions.js';
export * from './blueprint-context.js';
export * from './blueprint.js';
export * from './common.js';
export * from './core.js';
export * from './modifiers.js';
export * from './dependency-resolver.js';

// Base project context types
export * from './project-context.js';

// New enum types
export * from './blueprint-action-types.js';
export * from './modifier-types.js';
export * from './fallback-strategies.js';
export * from './conflict-resolution.js';

// Agent types
export * from './agent.js';
export * from './agent-base.js';

// Core CLI types
export { ProjectConfig, ExecutionResult, ExecutionOptions, Module, ModuleType, Genome } from './recipe.js';

// Marketplace types (tech-agnostic interface)
export * from './marketplace.js';
export * from './feature.js';
export * from './integration.js';

// Parameter schema types (avoiding conflict with adapter.ts)
export { ParameterDefinition as ParameterSchemaDefinition } from './parameter-schema.js';

// Constitutional Architecture types
export * from './constitutional-architecture.js';

// Define Genome function with type safety
export * from './define-genome.js';
