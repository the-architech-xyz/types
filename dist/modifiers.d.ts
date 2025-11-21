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
 * @deprecated Use ModifierType enum instead. This string union type is kept for backward compatibility.
 * Will be removed in a future version.
 *
 * This type matches all ModifierType enum values to maintain compatibility with existing code
 * that uses string literals instead of enum values.
 */
export type AvailableModifier = 'package-json-merger' | 'tsconfig-enhancer' | 'js-config-merger' | 'js-export-wrapper' | 'json-merger' | 'jsx-children-wrapper' | 'ts-module-enhancer' | 'yaml-merger' | 'env-merger' | 'css-enhancer' | 'dockerfile-merger' | 'dockerignore-merger' | 'readme-merger' | 'ts-interface-merger' | 'ts-import-merger' | 'css-class-merger' | 'html-attribute-merger';
/**
 * Modifier parameter schemas for each modifier type.
 * This provides intellisense for modifier-specific parameters.
 */
export interface ModifierParams {
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
    content?: string;
    exportName?: 'default' | 'module.exports' | 'named';
    namedExport?: string;
    mergeStrategy?: 'merge' | 'replace' | 'append';
    targetProperties?: Record<string, any>;
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
 * JSON Merger Parameters
 */
export interface JsonMergerParams extends ModifierParams {
    merge: Record<string, any>;
    strategy?: 'deep' | 'shallow';
    arrayMergeStrategy?: 'concat' | 'replace' | 'unique';
}
/**
 * JS Export Wrapper Parameters
 */
export interface JsExportWrapperParams extends ModifierParams {
    wrapperFunction: string;
    wrapperImport: {
        name: string;
        from: string;
        isDefault?: boolean;
    };
    wrapperOptions?: Record<string, any>;
}
/**
 * JSX Children Wrapper Parameters
 */
export interface JsxChildrenWrapperParams extends ModifierParams {
    providers: Array<{
        component: string;
        import: {
            name: string;
            from: string;
            isDefault?: boolean;
        };
        props?: Record<string, string | boolean | number>;
    }>;
    targetElement?: string;
}
export declare function isValidModifier(value: string): value is AvailableModifier;
