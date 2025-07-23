/**
 * Mongoose Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Mongoose plugin.
 * Based on: https://mongoosejs.com/
 */
import { ParameterSchema } from '../../../../types/plugins.js';
import { DatabaseProvider, ORMLibrary, DatabaseFeature } from '../../../../types/core.js';
export declare class MongooseSchema {
    static getParameterSchema(): ParameterSchema;
    static getDatabaseProviders(): DatabaseProvider[];
    static getORMOptions(): ORMLibrary[];
    static getDatabaseFeatures(): DatabaseFeature[];
}
