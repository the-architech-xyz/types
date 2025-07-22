/**
 * Prisma Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Prisma plugin.
 * Based on: https://www.prisma.io/docs/getting-started
 */
import { ConfigSchema } from '../../../../types/plugin.js';
export interface PrismaConfig {
    databaseUrl: string;
    provider: 'postgresql' | 'mysql' | 'sqlite' | 'sqlserver' | 'mongodb';
    enablePrismaStudio: boolean;
    enableSeeding: boolean;
    enableMigrations: boolean;
    enableIntrospection: boolean;
    enableGenerate: boolean;
    enableFormat: boolean;
    enableValidate: boolean;
    enablePush: boolean;
    enableDeploy: boolean;
    enableReset: boolean;
    enableSeed: boolean;
    enableStudio: boolean;
    enableDebug: boolean;
    enableLogging: boolean;
    enableMetrics: boolean;
    enableTelemetry: boolean;
    enablePreviewFeatures: string[];
}
export declare const PrismaConfigSchema: ConfigSchema;
export declare const PrismaDefaultConfig: PrismaConfig;
