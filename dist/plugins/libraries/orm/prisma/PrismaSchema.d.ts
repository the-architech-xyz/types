/**
 * Prisma Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Prisma plugin.
 * Based on: https://www.prisma.io/
 */
import { ParameterSchema } from '../../../../types/plugins.js';
import { DatabaseProvider, ORMLibrary, DatabaseFeature } from '../../../../types/core.js';
export declare class PrismaSchema {
    static getParameterSchema(): ParameterSchema;
    static getDatabaseProviders(): DatabaseProvider[];
    static getORMOptions(): ORMLibrary[];
    static getDatabaseFeatures(): DatabaseFeature[];
}
