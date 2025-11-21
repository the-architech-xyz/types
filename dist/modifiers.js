/**
 * Modifier Type Definitions
 *
 * This is the SINGLE SOURCE OF TRUTH for all available modifiers in The Architech.
 * Any modifier referenced in a blueprint MUST be listed here to ensure type safety.
 */
/**
 * Re-export ModifierType enum as the single source of truth for modifier types
 */
export { ModifierType } from './modifier-types.js';
/**
 * Type guard to check if a string is a valid modifier name
 *
 * Uses ModifierType enum as the source of truth
 *
 * @deprecated Use isValidModifierType from modifier-types.ts instead
 */
import { isValidModifierType } from './modifier-types.js';
export function isValidModifier(value) {
    return isValidModifierType(value);
}
