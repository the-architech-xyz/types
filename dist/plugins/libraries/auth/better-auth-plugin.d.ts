/**
 * Better Auth Plugin - Pure Technology Implementation
 *
 * Provides Better Auth authentication integration using the official @better-auth/cli.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../types/plugin.js';
export declare class BetterAuthPlugin implements IPlugin {
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
    private initializeBetterAuth;
    private createBetterAuthFilesManually;
    private generateDatabaseSchema;
    private createBetterAuthSchemaManually;
    private createAuthConfiguration;
    private addEnvironmentConfig;
    private generateUnifiedInterfaceFiles;
    private buildInitArgs;
    private generateAuthConfig;
    private generateEnvConfig;
    private createErrorResult;
}
