/**
 * TypeORM Plugin - Pure Technology Implementation
 *
 * Provides TypeORM ORM integration using the latest v0.3.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../types/plugin.js';
export declare class TypeORMPlugin implements IPlugin {
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
    private createTypeORMConfig;
    private createDatabaseStructure;
    private createBaseEntity;
    private createUserEntity;
    private createUserRepository;
    private createDatabaseConnection;
    private createInitialMigration;
    private createPackageExports;
    private generateUnifiedInterfaceFiles;
    private getTypeORMConfigContent;
    private createErrorResult;
}
