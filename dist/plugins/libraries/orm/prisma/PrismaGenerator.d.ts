/**
 * Prisma Code Generator
 *
 * Handles all code generation for Prisma ORM integration.
 * Based on: https://www.prisma.io/docs/getting-started
 */
import { DatabasePluginConfig } from '../../../../types/plugins.js';
export interface GeneratedFile {
    path: string;
    content: string;
}
export declare class PrismaGenerator {
    generateAllFiles(config: DatabasePluginConfig): GeneratedFile[];
    generatePrismaSchema(config: DatabasePluginConfig): GeneratedFile;
    generateSeedFile(): GeneratedFile;
    generatePrismaClient(): GeneratedFile;
    generateDatabaseUtils(): GeneratedFile;
    generateUnifiedIndex(): GeneratedFile;
    generateEnvConfig(config: DatabasePluginConfig): Record<string, string>;
    generateScripts(config: DatabasePluginConfig): Record<string, string>;
}
