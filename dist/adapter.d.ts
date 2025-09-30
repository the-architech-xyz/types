/**
 * Adapter Types - V1 Enhanced with Intelligence
 *
 * Enhanced adapter structure for intelligent blueprint execution
 */
export interface Adapter {
    config: AdapterConfig;
    blueprint: Blueprint;
}
export interface AdapterConfig {
    id: string;
    name: string;
    description: string;
    category: string;
    version: string;
    blueprint: string;
    dependencies?: string[];
    capabilities?: string[];
    limitations?: string;
    parameters?: Record<string, ParameterDefinition>;
    features?: Record<string, FeatureDefinition>;
    paths?: Record<string, string>;
    tags?: string[];
    engine?: {
        cliVersion: string;
    };
}
export interface ParameterDefinition {
    type: 'string' | 'boolean' | 'number' | 'select' | 'array' | 'object';
    required: boolean;
    default?: any;
    choices?: string[];
    description: string;
    validation?: (value: any) => boolean;
}
export interface FeatureDefinition {
    id: string;
    name: string;
    description: string;
    blueprint: string;
    dependencies?: string[];
    parameters?: Record<string, ParameterDefinition>;
    category?: 'core' | 'premium' | 'integration' | 'cross-adapter';
    compatibility?: string[];
}
export interface Blueprint {
    id: string;
    name: string;
    description?: string;
    version?: string;
    contextualFiles?: string[];
    actions: BlueprintAction[];
}
export interface BlueprintAction {
    type: 'INSTALL_PACKAGES' | 'ADD_SCRIPT' | 'ADD_ENV_VAR' | 'CREATE_FILE' | 'APPEND_TO_FILE' | 'PREPEND_TO_FILE' | 'RUN_COMMAND' | 'MERGE_JSON' | 'ADD_TS_IMPORT' | 'ENHANCE_FILE' | 'MERGE_CONFIG' | 'WRAP_CONFIG' | 'EXTEND_SCHEMA';
    condition?: string;
    packages?: string[];
    isDev?: boolean;
    name?: string;
    command?: string;
    key?: string;
    value?: string;
    description?: string;
    path?: string;
    content?: string;
    template?: string;
    overwrite?: boolean;
    workingDir?: string;
    imports?: ImportDefinition[];
    modifier?: import('./modifiers.js').AvailableModifier;
    params?: Record<string, any>;
    fallback?: 'skip' | 'error' | 'create';
    strategy?: 'deep-merge' | 'shallow-merge' | 'replace';
    config?: Record<string, any>;
    wrapper?: string;
    options?: Record<string, any>;
    tables?: SchemaTable[];
    additionalImports?: string[];
    conflictResolution?: ConflictResolution;
    mergeInstructions?: MergeInstructions;
}
export interface ConflictResolution {
    strategy: 'error' | 'skip' | 'replace' | 'merge';
    mergeStrategy?: 'json' | 'css' | 'js' | 'append';
    priority?: number;
}
export interface MergeInstructions {
    modifier?: string;
    params?: Record<string, any>;
    strategy?: 'deep-merge' | 'shallow-merge' | 'replace';
}
export interface SchemaTable {
    name: string;
    definition: string;
}
export interface ImportDefinition {
    moduleSpecifier: string;
    namedImports?: string[];
    defaultImport?: string;
    namespaceImport?: string;
}
export interface ModifierDefinition {
    handler: (filePath: string, params: any, context: any) => Promise<any>;
    paramsSchema: any;
    description: string;
    supportedFileTypes: string[];
}
export interface ModifierRegistry {
    [key: string]: ModifierDefinition;
}
export interface BlueprintExecutionResult {
    success: boolean;
    files: string[];
    errors: string[];
    warnings: string[];
}
