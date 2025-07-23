/**
 * Better Auth Code Generator
 *
 * Handles all code generation for Better Auth authentication integration.
 * Based on: https://better-auth.com/docs
 */
import { AuthPluginConfig } from '../../../../types/plugins.js';
export interface GeneratedFile {
    path: string;
    content: string;
}
export declare class BetterAuthGenerator {
    generateAllFiles(config: AuthPluginConfig): GeneratedFile[];
    generateAuthConfig(config: AuthPluginConfig): GeneratedFile;
    generateAuthUtils(): GeneratedFile;
    generateAuthComponents(): GeneratedFile;
    generateUnifiedIndex(): GeneratedFile;
    generateDatabaseSchema(): GeneratedFile;
    generateEnvConfig(config: AuthPluginConfig): Record<string, string>;
}
