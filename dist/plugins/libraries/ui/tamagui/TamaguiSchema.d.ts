import { ParameterSchema, UILibrary, ComponentOption, ThemeOption, StylingOption } from '../../../../types/plugin-interfaces.js';
export declare class TamaguiSchema {
    static getParameterSchema(): ParameterSchema;
    static getUILibraries(): UILibrary[];
    static getComponentOptions(): ComponentOption[];
    static getThemeOptions(): ThemeOption[];
    static getStylingOptions(): StylingOption[];
}
