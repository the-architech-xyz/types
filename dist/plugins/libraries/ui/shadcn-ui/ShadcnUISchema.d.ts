/**
 * Shadcn/ui Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Shadcn/ui plugin.
 * Based on: https://ui.shadcn.com/docs/installation
 */
import { ConfigSchema } from '../../../../types/plugin.js';
export interface ShadcnUIConfig {
    style: 'default' | 'new-york';
    baseColor: 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone' | 'red' | 'orange' | 'green' | 'blue' | 'yellow' | 'violet';
    cssVariables: boolean;
    tailwindCSS: boolean;
    components: string[];
    enableAnimations: boolean;
    enableDarkMode: boolean;
    enableRTL: boolean;
    enableCustomCSS: boolean;
    enableTypeScript: boolean;
    enableReact: boolean;
    enableVue: boolean;
    enableSvelte: boolean;
    enableAngular: boolean;
}
export declare const ShadcnUIConfigSchema: ConfigSchema;
export declare const ShadcnUIDefaultConfig: ShadcnUIConfig;
