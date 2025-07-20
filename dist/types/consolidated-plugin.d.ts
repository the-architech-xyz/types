/**
 * Consolidated Plugin Interface
 *
 * This interface defines the structure for consolidated plugins that combine
 * plugin logic and adapters into single, self-contained modules.
 */
import { PluginContext, PluginResult, ValidationResult } from './plugin.js';
import { UnifiedAuth, UnifiedUI, UnifiedDatabase, UnifiedDeployment, UnifiedTesting, UnifiedEmail, UnifiedMonitoring } from './unified.js';
export interface PluginMetadata {
    name: string;
    version: string;
    description: string;
    category: PluginCategory;
    author?: string;
    license?: string;
    repository?: string;
    homepage?: string;
    keywords?: string[];
    dependencies: string[];
    peerDependencies?: string[];
    devDependencies?: string[];
    compatibility: string[];
    features: string[];
    configSchema?: Record<string, any>;
    downloads?: number;
    rating?: number;
    lastUpdated?: Date;
    isOfficial?: boolean;
    isDeprecated?: boolean;
}
export type PluginCategory = 'auth' | 'ui' | 'database' | 'deployment' | 'testing' | 'email' | 'monitoring' | 'framework' | 'ui-library' | 'design-system' | 'icon-library' | 'animation' | 'orm' | 'migration' | 'authentication' | 'authorization' | 'payment' | 'notification' | 'analytics' | 'ci-cd' | 'containerization' | 'code-quality' | 'linting' | 'formatting' | 'bundling' | 'mobile' | 'desktop' | 'api' | 'graphql' | 'websocket' | 'custom';
export interface BasePlugin {
    metadata: PluginMetadata;
    install(context: PluginContext): Promise<PluginResult>;
    uninstall(context: PluginContext): Promise<void>;
    validate(context: PluginContext): Promise<ValidationResult>;
    getTemplates(): Template[];
    getConfigSchema(): Record<string, any>;
    getRequiredEnvVars(): string[];
    getCapabilities(): PluginCapability[];
    getExamples(): PluginExample[];
}
export interface AuthPlugin extends BasePlugin {
    createAdapter(config: any): UnifiedAuth;
    getAuthProviders(): string[];
    getAuthFeatures(): string[];
}
export interface UIPlugin extends BasePlugin {
    createAdapter(config: any): UnifiedUI;
    getUIComponents(): string[];
    getUIThemes(): string[];
    getUIFeatures(): string[];
}
export interface DatabasePlugin extends BasePlugin {
    createAdapter(config: any): UnifiedDatabase;
    getDatabaseProviders(): string[];
    getDatabaseFeatures(): string[];
    getMigrationTools(): string[];
}
export interface DeploymentPlugin extends BasePlugin {
    createAdapter(config: any): UnifiedDeployment;
    getDeploymentPlatforms(): string[];
    getDeploymentFeatures(): string[];
    getEnvironmentTypes(): string[];
}
export interface TestingPlugin extends BasePlugin {
    createAdapter(config: any): UnifiedTesting;
    getTestingFrameworks(): string[];
    getTestingTypes(): string[];
    getTestingFeatures(): string[];
}
export interface EmailPlugin extends BasePlugin {
    createAdapter(config: any): UnifiedEmail;
    getEmailProviders(): string[];
    getEmailFeatures(): string[];
    getEmailTemplates(): string[];
}
export interface MonitoringPlugin extends BasePlugin {
    createAdapter(config: any): UnifiedMonitoring;
    getMonitoringProviders(): string[];
    getMonitoringFeatures(): string[];
    getMonitoringTypes(): string[];
}
export interface Template {
    name: string;
    description: string;
    type: 'file' | 'directory' | 'config';
    path: string;
    content?: string;
    variables?: string[];
    condition?: (context: PluginContext) => boolean;
}
export interface PluginCapability {
    name: string;
    description: string;
    category: string;
    parameters: ConfigParameter[];
    examples: string[];
}
export interface ConfigParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    required: boolean;
    default?: any;
    options?: any[];
    validation?: (value: any) => boolean | string;
}
export interface PluginExample {
    name: string;
    description: string;
    config: Record<string, any>;
    useCase: string;
    complexity: 'simple' | 'medium' | 'complex';
}
export interface PluginRegistryEntry {
    plugin: BasePlugin;
    metadata: PluginMetadata;
    installed: boolean;
    version: string;
    dependencies: string[];
    conflicts: string[];
    lastUsed?: Date;
    usageCount: number;
}
export interface PluginDependency {
    name: string;
    version: string;
    type: 'required' | 'optional' | 'peer';
    description: string;
}
export interface PluginConflict {
    plugin: string;
    reason: string;
    severity: 'warning' | 'error' | 'critical';
    resolution?: string;
}
export interface PluginValidationContext {
    projectType: string;
    targetPlatform: string[];
    existingPlugins: string[];
    projectConfig: Record<string, any>;
}
export interface PluginValidationResult {
    valid: boolean;
    errors: PluginValidationError[];
    warnings: PluginValidationWarning[];
    suggestions: string[];
}
export interface PluginValidationError {
    code: string;
    message: string;
    field?: string;
    severity: 'error' | 'critical';
}
export interface PluginValidationWarning {
    code: string;
    message: string;
    field?: string;
    suggestion?: string;
}
export interface PluginMarketplaceEntry {
    id: string;
    name: string;
    description: string;
    category: PluginCategory;
    author: string;
    version: string;
    downloads: number;
    rating: number;
    lastUpdated: Date;
    tags: string[];
    price?: number;
    isOfficial: boolean;
    isVerified: boolean;
}
export interface PluginInstallationOptions {
    version?: string;
    config?: Record<string, any>;
    dependencies?: boolean;
    templates?: boolean;
    examples?: boolean;
}
export interface PluginUpdateInfo {
    currentVersion: string;
    latestVersion: string;
    changelog: string[];
    breakingChanges: string[];
    recommended: boolean;
}
