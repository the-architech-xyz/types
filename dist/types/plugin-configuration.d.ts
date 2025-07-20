/**
 * Plugin Configuration Schema System
 *
 * Defines the structure for plugin configuration schemas, parameter collection,
 * and validation. This enables any developer to create plugins with their own
 * configuration requirements.
 */
import { PluginCategory } from './plugin.js';
export interface PluginConfigurationSchema {
    pluginId: string;
    pluginName: string;
    pluginCategory: PluginCategory;
    schema: ConfigSchema;
    defaults: Record<string, any>;
    validation: ValidationRules;
    documentation: PluginDocumentation;
    requirements: PluginRequirements;
}
export interface ConfigSchema {
    type: 'object';
    properties: Record<string, ConfigProperty>;
    required?: string[];
    additionalProperties?: boolean;
}
export interface ConfigProperty {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    title?: string;
    description: string;
    default?: any;
    enum?: any[];
    items?: {
        type: 'string' | 'number' | 'boolean';
        enum?: any[];
    };
    properties?: Record<string, ConfigProperty>;
    required?: string[];
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: 'email' | 'url' | 'uri' | 'date-time' | 'date' | 'time';
    examples?: any[];
}
export interface ValidationRules {
    customValidators?: CustomValidator[];
    crossFieldValidation?: CrossFieldValidation[];
    conditionalValidation?: ConditionalValidation[];
}
export interface CustomValidator {
    name: string;
    description: string;
    validate: (value: any, config: Record<string, any>) => ValidationResult;
}
export interface CrossFieldValidation {
    fields: string[];
    rule: string;
    message: string;
    validate: (config: Record<string, any>) => ValidationResult;
}
export interface ConditionalValidation {
    condition: (config: Record<string, any>) => boolean;
    validations: ValidationRule[];
}
export interface ValidationRule {
    field: string;
    rule: string;
    message: string;
    validate: (value: any) => boolean;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: string[];
}
export interface ValidationError {
    field: string;
    message: string;
    code: string;
    severity: 'error' | 'warning';
}
export interface PluginDocumentation {
    name: string;
    description: string;
    version: string;
    author: string;
    overview: string;
    features: string[];
    benefits: string[];
    useCases: string[];
    configurationGuide: string;
    parameterDescriptions: Record<string, ParameterDescription>;
    examples: ConfigurationExample[];
    integrationGuide: string;
    compatibilityNotes: string[];
    troubleshooting: TroubleshootingItem[];
    website?: string;
    repository?: string;
    documentation?: string;
    changelog?: string;
}
export interface ParameterDescription {
    name: string;
    description: string;
    type: string;
    required: boolean;
    default?: any;
    examples: any[];
    notes?: string;
}
export interface ConfigurationExample {
    name: string;
    description: string;
    configuration: Record<string, any>;
    useCase: string;
}
export interface TroubleshootingItem {
    problem: string;
    solution: string;
    code?: string;
}
export interface PluginRequirements {
    system: SystemRequirements;
    dependencies: DependencyRequirement[];
    peerDependencies: DependencyRequirement[];
    devDependencies: DependencyRequirement[];
    runtime: RuntimeRequirements;
    platforms: PlatformRequirement[];
    versionConstraints: VersionConstraint[];
}
export interface SystemRequirements {
    nodeVersion?: string;
    npmVersion?: string;
    yarnVersion?: string;
    pnpmVersion?: string;
    os?: string[];
    architecture?: string[];
    memory?: number;
    diskSpace?: number;
}
export interface DependencyRequirement {
    name: string;
    version: string;
    description: string;
    required: boolean;
    category: 'production' | 'development' | 'peer';
}
export interface RuntimeRequirements {
    environment: string[];
    features: string[];
    permissions: string[];
    ports?: number[];
}
export interface PlatformRequirement {
    platform: string;
    supported: boolean;
    notes?: string;
    requirements?: Record<string, any>;
}
export interface VersionConstraint {
    dependency: string;
    constraint: string;
    reason: string;
}
export interface ParameterCollectionContext {
    pluginId: string;
    pluginName: string;
    projectType: string;
    existingConfig?: Record<string, any> | undefined;
    userPreferences?: Record<string, any> | undefined;
}
export interface ParameterCollectionResult {
    configuration: Record<string, any>;
    validation: ValidationResult;
    metadata: ParameterCollectionMetadata;
}
export interface ParameterCollectionMetadata {
    collectedAt: Date;
    source: 'interactive' | 'defaults' | 'existing' | 'auto-detected';
    userProvided: string[];
    autoDetected: string[];
    usedDefaults: string[];
}
export interface PluginConfigurationManager {
    registerSchema(schema: PluginConfigurationSchema): void;
    getSchema(pluginId: string): PluginConfigurationSchema | undefined;
    getAllSchemas(): PluginConfigurationSchema[];
    getSchemasByCategory(category: PluginCategory): PluginConfigurationSchema[];
    getDefaultConfiguration(pluginId: string): Record<string, any>;
    validateConfiguration(pluginId: string, config: Record<string, any>): ValidationResult;
    mergeConfigurations(base: Record<string, any>, override: Record<string, any>): Record<string, any>;
    collectParameters(pluginId: string, context: ParameterCollectionContext): Promise<ParameterCollectionResult>;
    getDocumentation(pluginId: string): PluginDocumentation | undefined;
    generateConfigurationGuide(pluginId: string): string;
}
export declare const DATABASE_PLUGIN_SCHEMAS: Record<string, PluginConfigurationSchema>;
export declare const AUTH_PLUGIN_SCHEMAS: Record<string, PluginConfigurationSchema>;
export declare const UI_PLUGIN_SCHEMAS: Record<string, PluginConfigurationSchema>;
