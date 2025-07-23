/**
 * Base Deployment Plugin Class
 *
 * Provides common functionality for all deployment-related plugins.
 */
import { BasePlugin } from './BasePlugin.js';
import { IUIDeploymentPlugin, DeploymentPlatform, EnvironmentOption, InfrastructureOption } from '../../types/plugin-interfaces.js';
import { ValidationResult } from '../../types/agents.js';
import { PluginContext } from '../../types/plugins.js';
export declare abstract class BaseDeploymentPlugin extends BasePlugin implements IUIDeploymentPlugin {
    private questionGenerator;
    constructor();
    abstract getDeploymentPlatforms(): DeploymentPlatform[];
    abstract getEnvironmentOptions(): EnvironmentOption[];
    abstract getInfrastructureOptions(): InfrastructureOption[];
    protected generateDeploymentConfig(config: any): Promise<void>;
    protected addDeploymentScripts(scripts: Record<string, string>): Promise<void>;
    getDynamicQuestions(context: PluginContext): any[];
    validateConfiguration(config: Record<string, any>): ValidationResult;
}
