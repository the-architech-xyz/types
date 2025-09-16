/**
 * The Architech Types
 * 
 * Centralized TypeScript type definitions for The Architech CLI and Marketplace
 */

// Core types
export * from './adapter.js';
export * from './blueprint-context.js';
export * from './common.js';
export * from './core.js';
export * from './feature.js';
export * from './integration.js';
export * from './marketplace.js';

// Global Context & State Management
export * from './global-context.js';

// Agent types (avoiding Module conflict)
export * from './agent.js';
export * from './agent-base.js';

// Recipe types (avoiding Module conflict)
export { Recipe, ProjectConfig, ExecutionResult, ExecutionOptions, IntegrationConfig } from './recipe.js';
export { Module as RecipeModule } from './recipe.js';

// Parameter schema types (avoiding conflict with adapter.ts)
export { ParameterDefinition as ParameterSchemaDefinition } from './parameter-schema.js';
