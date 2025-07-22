/**
 * Better Auth Plugin Index
 * 
 * Exports all Better Auth plugin components.
 */

export { BetterAuthPlugin } from './BetterAuthPlugin.js';
export type { BetterAuthConfig } from './BetterAuthSchema.js';
export { BetterAuthConfigSchema, BetterAuthDefaultConfig } from './BetterAuthSchema.js';
export { BetterAuthGenerator } from './BetterAuthGenerator.js';

// Default export
import { BetterAuthPlugin } from './BetterAuthPlugin.js';
export default BetterAuthPlugin; 