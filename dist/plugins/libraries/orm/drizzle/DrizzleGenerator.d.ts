/**
 * Drizzle Generator
 *
 * Handles all file generation logic for the Drizzle plugin.
 * Separated from the main plugin for better organization.
 */
import { DatabasePluginConfig } from '../../../../types/plugin-interfaces.js';
/**
 * Defines a file artifact to be generated, containing its relative path and content.
 */
export interface GeneratedFile {
    path: string;
    content: string;
}
export declare class DrizzleGenerator {
    /**
     * Generate all necessary files for the Drizzle plugin.
     * @returns An array of GeneratedFile objects.
     */
    generateAllFiles(config: DatabasePluginConfig): GeneratedFile[];
    /**
     * Generate Drizzle configuration file content.
     */
    generateDrizzleConfig(config: DatabasePluginConfig): GeneratedFile;
    /**
     * Generate database schema file content.
     */
    generateSchemaFile(config: DatabasePluginConfig): GeneratedFile;
    /**
     * Generate database connection file content.
     */
    generateConnectionFile(config: DatabasePluginConfig): GeneratedFile;
    /**
     * Generate unified interface file content.
     */
    generateUnifiedInterface(config: DatabasePluginConfig): GeneratedFile;
    /**
     * Generate initial migration file content.
     */
    generateInitialMigration(config: DatabasePluginConfig): GeneratedFile;
    /**
     * Generate environment variables.
     */
    generateEnvVars(config: DatabasePluginConfig): Record<string, string>;
    /**
     * Generate package.json scripts.
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
