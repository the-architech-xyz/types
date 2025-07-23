/**
 * Shadcn/UI Code Generator
 *
 * Handles all code generation for Shadcn/UI library integration.
 * Based on: https://ui.shadcn.com/
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
    private generateComponentExports;
    private getComponentName;
    generateButtonComponent(config: UIPluginConfig): GeneratedFile;
    generateCardComponent(): GeneratedFile;
    generateUnifiedIndex(config: UIPluginConfig): GeneratedFile;
}
