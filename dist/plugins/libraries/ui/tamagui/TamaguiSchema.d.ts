/**
 * Tamagui Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Tamagui plugin.
 * Based on: https://tamagui.dev/
 */
import { ParameterSchema } from '../../../../types/plugins.js';
import { UILibrary, ComponentOption, ThemeOption } from '../../../../types/core.js';
export declare class TamaguiSchema {
    static getParameterSchema(): ParameterSchema;
    static getUILibraries(): UILibrary[];
    static getComponentOptions(): ComponentOption[];
    static getThemeOptions(): ThemeOption[];
}
