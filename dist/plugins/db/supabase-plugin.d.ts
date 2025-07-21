/**
 * Supabase Plugin - Pure Technology Implementation
 *
 * Provides Supabase integration for both database and authentication services.
 * Supabase is a powerful open-source alternative to Firebase with PostgreSQL database
 * and built-in authentication, real-time subscriptions, and edge functions.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../types/plugin.js';
export declare class SupabasePlugin implements IPlugin {
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
    private initializeSupabaseConfig;
    private createDatabaseFiles;
    private createAuthConfiguration;
    private createAPIRoutes;
    private createSupabaseClient;
    private generateUnifiedInterfaceFiles;
    private generateSupabaseConfig;
    private generateInitialMigration;
    private generateSupabaseClient;
    private generateTypes;
    private generateDatabaseClient;
    private generateAuthUtilities;
    private generateAuthCallbackRoute;
    private generateSchemaTypes;
    private generateUnifiedIndex;
    private createErrorResult;
}
