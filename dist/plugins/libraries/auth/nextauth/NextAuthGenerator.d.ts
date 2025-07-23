/**
 * NextAuth Code Generator
 *
 * Handles all code generation for NextAuth authentication integration.
 * Based on: https://next-auth.js.org/configuration
 */
import { AuthPluginConfig } from '../../../../types/plugins.js';
export interface GeneratedFile {
    path: string;
    content: string;
}
export declare class NextAuthGenerator {
    generateAllFiles(config: AuthPluginConfig): GeneratedFile[];
    generateAuthConfig(config: AuthPluginConfig): GeneratedFile;
    generateAuthUtils(): GeneratedFile;
    generateAuthComponents(): GeneratedFile;
    generateUnifiedIndex(): GeneratedFile;
    generateDatabaseSchema(): GeneratedFile;
    generatePrismaSchema(): GeneratedFile;
    generateEnvConfig(config: AuthPluginConfig): Record<string, string>;
}
