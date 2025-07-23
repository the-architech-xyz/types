import { BasePlugin } from './BasePlugin.js';
import { PluginContext } from '../../types/plugins.js';
import { FrameworkPluginConfig, FrameworkOption, BuildOption, DeploymentOption, ParameterSchema } from '../../types/plugins.js';
export declare abstract class BaseFrameworkPlugin extends BasePlugin {
    abstract getFrameworkOptions(): FrameworkOption[];
    abstract getBuildOptions(): BuildOption[];
    abstract getDeploymentOptions(): DeploymentOption[];
    getBaseFrameworkSchema(): ParameterSchema;
    generateFrameworkConfig(config: FrameworkPluginConfig): Record<string, any>;
    addFrameworkScripts(config: FrameworkPluginConfig): Record<string, string>;
    getDynamicQuestions(context: PluginContext): any[];
    validateConfiguration(config: Record<string, any>): any;
}
