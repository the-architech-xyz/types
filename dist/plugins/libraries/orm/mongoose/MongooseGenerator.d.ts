/**
 * Mongoose Generator
 *
 * Handles all file generation logic for the Mongoose plugin.
 * Separated from the main plugin for better organization.
 */
import { DatabasePluginConfig } from '../../../../types/plugins.js';
export interface GeneratedFile {
    path: string;
    content: string;
}
export declare class MongooseGenerator {
    generateAllFiles(config: DatabasePluginConfig): GeneratedFile[];
    generateMongooseConnection(config: DatabasePluginConfig): GeneratedFile;
    generateUserModel(config: DatabasePluginConfig): GeneratedFile;
    generateDatabaseClient(): GeneratedFile;
    generateSchemaTypes(): GeneratedFile;
    generateUnifiedIndex(): GeneratedFile;
    generatePluginsIndex(): GeneratedFile;
    generateTimestampPlugin(): GeneratedFile;
    generateSoftDeletePlugin(): GeneratedFile;
    generateEnvConfig(config: DatabasePluginConfig): Record<string, string>;
}
