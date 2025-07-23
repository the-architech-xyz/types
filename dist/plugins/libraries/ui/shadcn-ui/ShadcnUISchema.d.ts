/**
 * Shadcn/UI Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Shadcn/UI plugin.
 * Based on: https://ui.shadcn.com/
 */
import { ParameterSchema } from '../../../../types/plugins.js';
import { UILibrary, ComponentOption, ThemeOption } from '../../../../types/core.js';
export declare class ShadcnUISchema {
    static getParameterSchema(): ParameterSchema;
    static getUILibraries(): UILibrary[];
    static getComponentOptions(): ComponentOption[];
    static getThemeOptions(): ThemeOption[];
}
