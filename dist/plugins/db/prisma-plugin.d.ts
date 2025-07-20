/**
 * Prisma Plugin - Database Toolkit and ORM
 *
 * Provides Prisma integration using the official Prisma CLI.
 * Focuses only on technology setup and artifact generation.
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
    private createPrismaSchema;
    private generatePrismaClientCLI;
    private createDatabaseUtilities;
    private createSeedScript;
    private generatePrismaSchema;
    private generatePrismaClientContent;
    private generateDatabaseTypes;
    private generateSeedScript;
    private createErrorResult;
}
