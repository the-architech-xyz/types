/**
 * Shadcn/ui Code Generator
 *
 * Handles all code generation for Shadcn/ui design system integration.
 * Based on: https://ui.shadcn.com/docs/installation
 */
import { UIPluginConfig } from '../../../../types/plugins.js';
export interface GeneratedFile {
    path: string;
    content: string;
}
export declare class ShadcnUIGenerator {
    generateAllFiles(config: UIPluginConfig): GeneratedFile[];
    generateTailwindConfig(config: UIPluginConfig): GeneratedFile;
    generateCSSVariables(config: UIPluginConfig): GeneratedFile;
    generateUtilsFile(): GeneratedFile;
    generateComponentsJson(config: UIPluginConfig): GeneratedFile;
    generateButtonComponent(): GeneratedFile;
    generateCardComponent(): GeneratedFile;
    generateUnifiedIndex(): GeneratedFile;
}
