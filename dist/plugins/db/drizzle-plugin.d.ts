/**
 * Drizzle ORM Plugin - Pure Technology Implementation
 *
 * Provides Drizzle ORM integration with PostgreSQL/MySQL/SQLite.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, TargetPlatform } from '../../types/plugin.js';
export declare class DrizzlePlugin implements IPlugin {
    private templateService;
    constructor();
    getMetadata(): PluginMetadata;
    install(context: PluginContext): Promise<PluginResult>;
    uninstall(context: PluginContext): Promise<PluginResult>;
    update(context: PluginContext): Promise<PluginResult>;
    validate(context: PluginContext): Promise<ValidationResult>;
    getCompatibility(): {
        frameworks: string[];
        platforms: TargetPlatform[];
        nodeVersions: string[];
        packageManagers: string[];
        databases: string[];
        conflicts: string[];
    };
    getDependencies(): string[];
    getConflicts(): string[];
    getRequirements(): {
        type: "package";
        name: string;
        version: string;
        description: string;
    }[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): {
        type: "object";
        properties: {
            provider: {
                type: "string";
                description: string;
                enum: string[];
                default: string;
            };
            connectionString: {
                type: "string";
                description: string;
                default: string;
            };
        };
        required: string[];
    };
    private getDatabaseConfig;
    private generatePackageJson;
    private generateESLintConfig;
    private generateDrizzleConfig;
    private generateDatabaseSchema;
    private generateDatabaseConnection;
    private generateMigrationUtils;
    private generateEnvConfig;
    private createErrorResult;
}
