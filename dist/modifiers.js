/**
 * Modifier Type Definitions
 *
 * This is the SINGLE SOURCE OF TRUTH for all available modifiers in The Architech.
 * Any modifier referenced in a blueprint MUST be listed here to ensure type safety.
 */
/**
 * Type guard to check if a string is a valid modifier name
 */
export function isValidModifier(value) {
    const validModifiers = [
        'package-json-merger',
        'tsconfig-enhancer',
        'css-enhancer',
        'js-config-merger',
        'ts-module-enhancer' // ✅ NEW
    ];
    return validModifiers.includes(value);
}
