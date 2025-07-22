/**
 * Prisma Code Generator
 *
 * Handles all code generation for Prisma ORM integration.
 * Based on: https://www.prisma.io/docs/getting-started
 */
import { PrismaConfig } from './PrismaSchema.js';
export declare class PrismaGenerator {
    static generatePrismaSchema(config: PrismaConfig): string;
    static generateSeedFile(): string;
    static generatePrismaClient(): string;
    static generateDatabaseUtils(): string;
    static generateUnifiedIndex(): string;
    static generateEnvConfig(config: PrismaConfig): string;
}
