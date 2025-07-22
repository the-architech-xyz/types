import { DatabasePluginConfig } from '../../../../types/plugin-interfaces.js';
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
