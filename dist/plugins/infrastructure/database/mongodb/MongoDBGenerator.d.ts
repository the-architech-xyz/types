import { MongoDBConfig } from './MongoDBSchema.js';
export declare class MongoDBGenerator {
    static generateMongoDBClient(config: MongoDBConfig): string;
    static generateEnvConfig(config: MongoDBConfig): string;
    static generatePackageJson(config: MongoDBConfig): string;
    static generateReadme(): string;
    static generateTypes(): string;
    static generateDatabaseClient(): string;
    static generateDatabaseUtils(): string;
    static generateUnifiedIndex(): string;
    static generateMonitoringUtils(): string;
}
