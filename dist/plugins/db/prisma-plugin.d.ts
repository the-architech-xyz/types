/**
 * Prisma ORM Plugin - Pure Technology Implementation
 *
 * Provides Prisma ORM integration with any database provider.
 * Focuses only on ORM technology setup and artifact generation.
 * Database provider setup is handled by separate database plugins.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../types/plugin.js';
export declare class PrismaPlugin implements IPlugin {
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
    private initializePrisma;
    private createDatabaseFiles;
    private generatePrismaClient;
    private generateUnifiedInterfaceFiles;
    private generatePrismaSchema;
    private generateDatabaseClient;
    private generateSeedFile;
    private generateUnifiedIndex;
    private generateSchemaTypes;
    private generateEnvConfig;
    private createErrorResult;
}
