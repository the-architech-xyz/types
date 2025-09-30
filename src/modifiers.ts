/**
 * Modifier Type Definitions
 * 
 * This is the SINGLE SOURCE OF TRUTH for all available modifiers in The Architech.
 * Any modifier referenced in a blueprint MUST be listed here to ensure type safety.
 */

/**
 * Available Modifiers - Type-Safe Contract
 * 
 * Each modifier is a pure function that transforms a file's AST or content.
 * Add new modifiers to this union type to enable them across the system.
 */
export type AvailableModifier = 
  | 'package-json-merger'     // Merges dependencies, scripts, and properties into package.json (JSON-based)
  | 'tsconfig-enhancer'       // Enhances tsconfig.json with compiler options, paths, includes (JSON-based)
  | 'css-enhancer'            // Appends CSS styles to existing stylesheets (text-based)
  | 'js-config-merger'        // Deep-merges JavaScript/TypeScript config objects using AST (AST-based)
  | 'ts-module-enhancer'      // Adds imports and top-level exports to TypeScript modules (AST-based)
  | 'jsx-wrapper';            // 🚧 TODO: Wraps JSX components with provider components (AST-based) - NOT IMPLEMENTED YET

/**
 * Modifier parameter schemas for each modifier type.
 * This provides intellisense for modifier-specific parameters.
 */
export interface ModifierParams {
  // Common parameters available to all modifiers
  [key: string]: any;
}

/**
 * Package JSON Merger Parameters
 */
export interface PackageJsonMergerParams extends ModifierParams {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  engines?: Record<string, string>;
  browserslist?: string[];
}

/**
 * TSConfig Enhancer Parameters
 */
export interface TsconfigEnhancerParams extends ModifierParams {
  compilerOptions?: Record<string, any>;
  paths?: Record<string, string[]>;
  include?: string[];
  exclude?: string[];
  extends?: string;
  mergeStrategy?: 'merge' | 'replace';
}

/**
 * CSS Enhancer Parameters
 */
export interface CssEnhancerParams extends ModifierParams {
  content?: string;
  styles?: string;
}

/**
 * JS Config Merger Parameters
 */
export interface JsConfigMergerParams extends ModifierParams {
  content?: string; // Optional if targetProperties is provided
  exportName?: 'default' | 'module.exports' | 'named';
  namedExport?: string;
  mergeStrategy?: 'merge' | 'replace' | 'append';
  targetProperties?: Record<string, any>; // Alternative to content
  preserveComments?: boolean;
}

/**
 * TypeScript Module Enhancer Parameters
 */
export interface TsModuleEnhancerParams extends ModifierParams {
  importsToAdd?: Array<{
    name: string;
    from: string;
    type?: 'import' | 'type';
    isDefault?: boolean;
    isNamespace?: boolean;
  }>;
  statementsToAppend?: Array<{
    type: 'raw' | 'function' | 'const' | 'interface' | 'type';
    content: string;
  }>;
  preserveExisting?: boolean;
}

/**
 * Type guard to check if a string is a valid modifier name
 */
export function isValidModifier(value: string): value is AvailableModifier {
  const validModifiers: AvailableModifier[] = [
    'package-json-merger',
    'tsconfig-enhancer',
    'css-enhancer',
    'js-config-merger',
    'ts-module-enhancer',
    'jsx-wrapper'  // 🚧 TODO: Not implemented yet
  ];
  return validModifiers.includes(value as AvailableModifier);
}
