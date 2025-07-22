/**
 * NextAuth.js Plugin - Pure Technology Implementation
 *
 * Provides NextAuth.js authentication integration with multiple providers.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../types/plugin.js';
export declare class NextAuthPlugin implements IPlugin {
    private templateService;
    private runner;
    constructor();
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
    private installDependencies;
    private createAuthConfiguration;
    private createAPIRoutes;
    private createAuthComponents;
    private generateUnifiedInterfaceFiles;
    private generateAuthConfig;
    private generateAuthTypes;
    private generateAPIRoute;
    private generateAuthProvider;
    private generateUnifiedIndex;
    private generateEnvConfig;
    private createErrorResult;
}
