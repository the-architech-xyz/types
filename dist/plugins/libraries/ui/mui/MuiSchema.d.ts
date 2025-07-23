/**
 * MUI Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the MUI plugin.
 * Based on: https://mui.com/
 */
import { ParameterSchema } from '../../../../types/plugins.js';
import { UILibrary, ComponentOption, ThemeOption } from '../../../../types/core.js';
export declare class MuiSchema {
    static getParameterSchema(): ParameterSchema;
    static getUILibraries(): UILibrary[];
    static getComponentOptions(): ComponentOption[];
    static getThemeOptions(): ThemeOption[];
}
