/**
 * Define Genome with Full Type Safety
 * 
 * This module provides the defineGenome function with complete type safety
 * for genome definitions, including autocompletion for module IDs and parameter validation.
 */

import { Genome, GenomeModule, Module, GenomeMarketplace } from './recipe.js';

// ModuleId is marketplace-specific and should come from marketplace-generated types
// Removed: export type ModuleId = string;

// Enhanced Genome interface with type safety
export type TypedGenomeModule = Module;

export interface TypedGenome {
  version: string;
  project: {
    name: string;
    framework: string;
    path?: string;
    description?: string;
    version?: string;
    author?: string;
    license?: string;
  };
  modules: TypedGenomeModule[];
  options?: Record<string, any>;
  marketplace?: GenomeMarketplace;
}

/**
 * Define a genome with full type safety
 * 
 * @param genome - The genome configuration with type safety
 * @returns The genome with validated types
 * 
 * @example
 * ```typescript
 * import { defineGenome } from '@thearchitech.xyz/types';
 * 
 * const genome = defineGenome({
 *   version: '1.0',
 *   project: {
 *     name: 'my-app',
 *     framework: 'nextjs'
 *   },
 *   modules: [
 *     {
 *       id: 'adapter:database/drizzle', // ✅ Autocompletion works
 *       parameters: {
 *         features: {
 *           migrations: true, // ✅ Type-safe parameters
 *           studio: false
 *         }
 *       }
 *     }
 *   ]
 * });
 * ```
 */
export function defineGenome<T extends TypedGenome>(genome: T): T {
  genome.modules = genome.modules.map((module) => {
    const normalized: Module = { ...module };
    normalized.category = normalized.category || normalized.id.split('/')[0] || 'module';
    normalized.version = normalized.version || 'latest';
    normalized.parameters = normalized.parameters || {};
    normalized.features = normalized.features || {};
    normalized.externalFiles = normalized.externalFiles || [];
    return normalized;
  });

  return genome;
}

// Re-export for convenience
export { Genome, GenomeModule } from './recipe.js';
