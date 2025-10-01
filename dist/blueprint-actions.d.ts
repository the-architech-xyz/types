/**
 * Type-Safe Blueprint Actions
 *
 * Discriminated union types for all blueprint actions with strict type safety.
 * Each action type has its own interface with required properties.
 */
import { ImportDefinition, SchemaTable } from './adapter.js';
export interface BaseAction {
    condition?: string;
    forEach?: string;
}
export interface InstallPackagesAction extends BaseAction {
    type: 'INSTALL_PACKAGES';
    packages: string[];
    isDev?: boolean;
}
export interface AddScriptAction extends BaseAction {
    type: 'ADD_SCRIPT';
    name: string;
    command: string;
}
export interface AddEnvVarAction extends BaseAction {
    type: 'ADD_ENV_VAR';
    key: string;
    value: string;
    description?: string;
}
export interface CreateFileAction extends BaseAction {
    type: 'CREATE_FILE';
    path: string;
    content?: string;
    template?: string;
    overwrite?: boolean;
}
export interface AppendToFileAction extends BaseAction {
    type: 'APPEND_TO_FILE';
    path: string;
    content: string;
}
export interface PrependToFileAction extends BaseAction {
    type: 'PREPEND_TO_FILE';
    path: string;
    content: string;
}
export interface RunCommandAction extends BaseAction {
    type: 'RUN_COMMAND';
    command: string;
    workingDir?: string;
}
export interface MergeJsonAction extends BaseAction {
    type: 'MERGE_JSON';
    path: string;
    content: Record<string, any>;
}
export interface AddTsImportAction extends BaseAction {
    type: 'ADD_TS_IMPORT';
    path: string;
    imports: ImportDefinition[];
}
export interface EnhanceFileAction extends BaseAction {
    type: 'ENHANCE_FILE';
    path: string;
    modifier: string;
    params?: Record<string, any>;
    fallback?: 'skip' | 'error' | 'create';
}
export interface MergeConfigAction extends BaseAction {
    type: 'MERGE_CONFIG';
    path: string;
    strategy: 'deep-merge' | 'shallow-merge' | 'replace';
    config: Record<string, any>;
}
export interface WrapConfigAction extends BaseAction {
    type: 'WRAP_CONFIG';
    path: string;
    wrapper: string;
    options?: Record<string, any>;
}
export interface ExtendSchemaAction extends BaseAction {
    type: 'EXTEND_SCHEMA';
    path: string;
    tables: SchemaTable[];
    additionalImports?: string[];
}
export interface AddDependencyAction extends BaseAction {
    type: 'ADD_DEPENDENCY';
    packages: string[];
    isDev?: boolean;
}
export interface AddDevDependencyAction extends BaseAction {
    type: 'ADD_DEV_DEPENDENCY';
    packages: string[];
}
export interface SchemaColumn {
    name: string;
    type: string;
    nullable?: boolean;
    primaryKey?: boolean;
    unique?: boolean;
    defaultValue?: any;
}
export type BlueprintAction = InstallPackagesAction | AddScriptAction | AddEnvVarAction | CreateFileAction | AppendToFileAction | PrependToFileAction | RunCommandAction | MergeJsonAction | AddTsImportAction | EnhanceFileAction | MergeConfigAction | WrapConfigAction | ExtendSchemaAction | AddDependencyAction | AddDevDependencyAction;
