/**
 * Prisma Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Prisma plugin.
 * Based on: https://www.prisma.io/docs/getting-started
 */
import { ParameterSchema, DatabaseProvider } from '../../../../types/plugin-interfaces.js';
export declare class PrismaSchema {
    static getParameterSchema(): ParameterSchema;
    static getDatabaseProviders(): DatabaseProvider[];
}
