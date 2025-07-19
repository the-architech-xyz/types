/**
 * Plugin System Types
 *
 * Defines the interface for registering and managing technology stack plugins.
 * This enables true modularity where any UI library, database, framework, or feature
 * can be added as a plugin without modifying core code.
 */
import { AgentContext, ValidationResult } from './agent.js';
export type { ValidationResult } from './agent.js';
export interface IPlugin {
    getMetadata(): PluginMetadata;
    install(context: PluginContext): Promise<PluginResult>;
    uninstall(context: PluginContext): Promise<PluginResult>;
    update(context: PluginContext): Promise<PluginResult>;
    validate(context: PluginContext): Promise<ValidationResult>;
    getCompatibility(): CompatibilityMatrix;
    getDependencies(): string[];
    getConflicts(): string[];
    getRequirements(): PluginRequirement[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): ConfigSchema;
}
export interface PluginMetadata {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    category: PluginCategory;
    tags: string[];
    license: string;
    repository?: string;
    homepage?: string;
    documentation?: string;
    changelog?: string;
}
export declare enum PluginCategory {
    FRAMEWORK = "framework",
    UI_LIBRARY = "ui-library",
    DESIGN_SYSTEM = "design-system",
    ICON_LIBRARY = "icon-library",
    ANIMATION = "animation",
    DATABASE = "database",
    ORM = "orm",
    MIGRATION = "migration",
    AUTHENTICATION = "authentication",
    AUTHORIZATION = "authorization",
    PAYMENT = "payment",
    EMAIL = "email",
    NOTIFICATION = "notification",
    ANALYTICS = "analytics",
    MONITORING = "monitoring",
    TESTING = "testing",
    DEPLOYMENT = "deployment",
    CI_CD = "ci-cd",
    CONTAINERIZATION = "containerization",
    CODE_QUALITY = "code-quality",
    LINTING = "linting",
    FORMATTING = "formatting",
    BUNDLING = "bundling",
    MOBILE = "mobile",
    DESKTOP = "desktop",
    PWA = "pwa",
    API = "api",
    GRAPHQL = "graphql",
    WEBSOCKET = "websocket",
    CUSTOM = "custom"
}
export interface PluginContext extends AgentContext {
    pluginId: string;
    pluginConfig: Record<string, any>;
    installedPlugins: string[];
    projectType: ProjectType;
    targetPlatform: TargetPlatform[];
}
export interface PluginResult {
    success: boolean;
    artifacts: PluginArtifact[];
    dependencies: DependencyInfo[];
    scripts: ScriptInfo[];
    configs: ConfigInfo[];
    errors: PluginError[];
    warnings: string[];
    duration: number;
}
export interface PluginArtifact {
    type: 'file' | 'directory' | 'template' | 'config';
    path: string;
    content?: string;
    template?: string;
    variables?: Record<string, any>;
    permissions?: string;
}
export interface DependencyInfo {
    name: string;
    version: string;
    type: 'production' | 'development' | 'peer';
    category: PluginCategory;
    optional?: boolean;
}
export interface ScriptInfo {
    name: string;
    command: string;
    description: string;
    category: 'dev' | 'build' | 'test' | 'deploy' | 'custom';
}
export interface ConfigInfo {
    file: string;
    content: string;
    mergeStrategy: 'replace' | 'merge' | 'append';
}
export interface PluginError {
    code: string;
    message: string;
    details?: any;
    severity: 'error' | 'warning' | 'info';
}
export interface CompatibilityMatrix {
    frameworks: string[];
    platforms: TargetPlatform[];
    nodeVersions: string[];
    packageManagers: string[];
    databases?: string[];
    uiLibraries?: string[];
    conflicts: string[];
}
export declare enum TargetPlatform {
    WEB = "web",
    MOBILE = "mobile",
    DESKTOP = "desktop",
    SERVER = "server",
    CLI = "cli"
}
export declare enum ProjectType {
    NEXTJS = "nextjs",
    REACT = "react",
    VUE = "vue",
    NUXT = "nuxt",
    SVELTE = "svelte",
    ANGULAR = "angular",
    EXPO = "expo",
    REACT_NATIVE = "react-native",
    ELECTRON = "electron",
    TAURI = "tauri",
    NODE = "node",
    EXPRESS = "express",
    FASTIFY = "fastify",
    NESTJS = "nestjs",
    CUSTOM = "custom"
}
export interface PluginRequirement {
    type: 'package' | 'binary' | 'service' | 'config';
    name: string;
    description: string;
    version?: string;
    optional?: boolean;
}
export interface ConfigSchema {
    type: 'object';
    properties: Record<string, ConfigProperty>;
    required?: string[];
    additionalProperties?: boolean;
}
export interface ConfigProperty {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    default?: any;
    enum?: any[];
    pattern?: string;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    items?: ConfigProperty;
    properties?: Record<string, ConfigProperty>;
}
export interface PluginRegistry {
    register(plugin: IPlugin): void;
    unregister(pluginId: string): void;
    get(pluginId: string): IPlugin | undefined;
    getAll(): IPlugin[];
    getByCategory(category: PluginCategory): IPlugin[];
    getCompatible(projectType: ProjectType, platform: TargetPlatform[]): IPlugin[];
    validateCompatibility(plugins: string[]): ValidationResult;
}
export interface PluginManager {
    installPlugin(pluginId: string, context: PluginContext): Promise<PluginResult>;
    uninstallPlugin(pluginId: string, context: PluginContext): Promise<PluginResult>;
    updatePlugin(pluginId: string, context: PluginContext): Promise<PluginResult>;
    installPlugins(pluginIds: string[], context: PluginContext): Promise<PluginResult[]>;
    uninstallPlugins(pluginIds: string[], context: PluginContext): Promise<PluginResult[]>;
    discoverPlugins(): Promise<IPlugin[]>;
    validatePlugin(plugin: IPlugin): Promise<ValidationResult>;
    getPluginConfig(pluginId: string): Record<string, any>;
    setPluginConfig(pluginId: string, config: Record<string, any>): void;
    resolveDependencies(pluginIds: string[]): Promise<DependencyResolution>;
    checkConflicts(pluginIds: string[]): Promise<ConflictInfo[]>;
}
export interface DependencyResolution {
    plugins: string[];
    order: string[];
    conflicts: ConflictInfo[];
    missing: string[];
}
export interface ConflictInfo {
    plugin1: string;
    plugin2: string;
    reason: string;
    severity: 'error' | 'warning';
    resolution?: string;
}
