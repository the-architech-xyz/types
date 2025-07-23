import { BasePlugin } from './BasePlugin.js';
import { IUIPlugin, ParameterSchema, PluginContext } from '../../types/plugins.js';
import { ValidationResult } from '../../types/agents.js';
export declare abstract class BaseUIPlugin extends BasePlugin implements IUIPlugin {
    private questionGenerator;
    constructor();
    abstract getUILibraries(): string[];
    abstract getComponentOptions(): string[];
    abstract getThemeOptions(): string[];
    abstract getStylingOptions(): string[];
    abstract getLibraryLabel(library: string): string;
    abstract getComponentLabel(component: string): string;
    abstract getThemeLabel(theme: string): string;
    abstract getStylingLabel(styling: string): string;
    protected getBaseUISchema(): ParameterSchema;
    protected setupUIComponents(context: PluginContext, components: string[]): Promise<void>;
    protected generateComponentFile(componentName: string): string;
    getDynamicQuestions(context: PluginContext): any[];
    validateConfiguration(config: Record<string, any>): ValidationResult;
    getParameterSchema(): ParameterSchema;
    generateUnifiedInterface(): any;
}
