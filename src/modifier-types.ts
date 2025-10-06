/**
 * Modifier Type Enums
 * 
 * Type-safe enums for all modifier types currently implemented in the CLI.
 * This provides compile-time validation and IntelliSense for modifier types.
 */

/**
 * Supported Modifier Types
 * 
 * Only includes modifiers that have corresponding implementations in the CLI.
 * Add new modifier types here when new modifiers are implemented.
 */
export enum ModifierType {
  PACKAGE_JSON_MERGER = 'package-json-merger',
  TSCONFIG_ENHANCER = 'tsconfig-enhancer',
  JS_CONFIG_MERGER = 'js-config-merger',
  JS_EXPORT_WRAPPER = 'js-export-wrapper',
  JSON_MERGER = 'json-merger',
  JSX_CHILDREN_WRAPPER = 'jsx-children-wrapper',
  TS_MODULE_ENHANCER = 'ts-module-enhancer',
  YAML_MERGER = 'yaml-merger'
}

/**
 * Type guard to check if a string is a valid modifier type
 */
export function isValidModifierType(value: string): value is ModifierType {
  return Object.values(ModifierType).includes(value as ModifierType);
}

/**
 * Get all supported modifier types
 */
export function getSupportedModifierTypes(): ModifierType[] {
  return Object.values(ModifierType);
}
