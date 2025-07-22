/**
 * Mongoose Code Generator
 *
 * Handles all code generation for Mongoose ODM integration.
 * Based on: https://mongoosejs.com/docs/typescript.html
 */
import { MongooseConfig } from './MongooseSchema.js';
export declare class MongooseGenerator {
    static generateMongooseConnection(config: MongooseConfig): string;
    static generateUserModel(config: MongooseConfig): string;
    static generateDatabaseClient(): string;
    static generateSchemaTypes(): string;
    static generateUnifiedIndex(): string;
    static generatePluginsIndex(): string;
    static generateTimestampPlugin(): string;
    static generateSoftDeletePlugin(): string;
    static generateEnvConfig(config: MongooseConfig): string;
}
