/**
 * Drizzle Generator
 *
 * Handles all file generation logic for the Drizzle plugin.
 * Separated from the main plugin for better organization.
 */
import { DatabasePluginConfig } from '../../../../types/plugin-interfaces.js';
import { PathResolver } from '../../../base/PathResolver.js';
export declare class DrizzleGenerator {
    private pathResolver;
    constructor(pathResolver: PathResolver);
    /**
     * Generate Drizzle configuration file
     */
    generateDrizzleConfig(config: DatabasePluginConfig): Promise<void>;
    /**
     * Generate database schema file
     */
    generateSchemaFile(config: DatabasePluginConfig): Promise<void>;
    /**
     * Generate database connection file
     */
    generateConnectionFile(config: DatabasePluginConfig): Promise<void>;
    /**
     * Generate unified interface file
     */
    generateUnifiedInterface(config: DatabasePluginConfig): Promise<void>;
    /**
     * Generate initial migration
     */
    generateInitialMigration(config: DatabasePluginConfig): Promise<void>;
    /**
     * Generate environment variables
     */
    generateEnvVars(config: DatabasePluginConfig): Record<string, string>;
    /**
     * Generate package.json scripts
     */
    generateScripts(config: DatabasePluginConfig): Record<string, string>;
    private generateDrizzleConfigContent;
    private generateSchemaContent;
    private generateConnectionContent;
    private generateUnifiedInterfaceContent;
    private generateMigrationContent;
    private generateSampleTables;
    private getDriverForProvider;
    private getSchemaImports;
    private getConnectionImports;
    private getConnectionSetup;
}
