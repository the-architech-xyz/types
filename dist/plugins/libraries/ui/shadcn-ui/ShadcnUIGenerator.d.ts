/**
 * Shadcn/ui Code Generator
 *
 * Handles all code generation for Shadcn/ui design system integration.
 * Based on: https://ui.shadcn.com/docs/installation
 */
import { ShadcnUIConfig } from './ShadcnUISchema.js';
export declare class ShadcnUIGenerator {
    static generateTailwindConfig(config: ShadcnUIConfig): string;
    static generateCSSVariables(config: ShadcnUIConfig): string;
    static generateUtilsFile(): string;
    static generateButtonComponent(): string;
    static generateCardComponent(): string;
    static generateUnifiedIndex(): string;
    static generateEnvConfig(config: ShadcnUIConfig): string;
}
