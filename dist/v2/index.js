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
// HELPER FUNCTIONS
// ============================================================================
/**
 * Type guard to check if a genome is V2 format
 */
export function isV2Genome(genome) {
    return (typeof genome === 'object' &&
        genome !== null &&
        'marketplaces' in genome &&
        'packages' in genome &&
        'apps' in genome &&
        'workspace' in genome);
}
/**
 * Define a V2 genome with type safety
 */
export function defineV2Genome(genome) {
    return genome;
}
