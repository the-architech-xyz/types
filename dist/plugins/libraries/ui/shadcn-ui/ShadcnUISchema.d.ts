/**
 * Shadcn/ui Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Shadcn/ui plugin.
 * Based on: https://ui.shadcn.com/docs/installation
 */
import { ParameterSchema, UILibrary, ComponentOption } from '../../../../types/plugin-interfaces.js';
export declare class ShadcnUISchema {
    static getParameterSchema(): ParameterSchema;
    static getUILibraries(): UILibrary[];
    static getComponentOptions(): ComponentOption[];
}
