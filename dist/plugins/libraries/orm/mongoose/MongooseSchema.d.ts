/**
 * Mongoose Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Mongoose plugin.
 * Based on: https://mongoosejs.com/docs/typescript.html
 */
import { ConfigSchema } from '../../../../types/plugin.js';
export interface MongooseConfig {
    databaseUrl: string;
    modelsDir: string;
    enableDebug: boolean;
    enableTimestamps: boolean;
    enablePlugins: boolean;
    enableMiddleware: boolean;
    connectionPoolSize: number;
    enableCompression: boolean;
}
export declare const MongooseConfigSchema: ConfigSchema;
export declare const MongooseDefaultConfig: MongooseConfig;
