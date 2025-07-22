/**
 * Base Deployment Plugin Class
 * 
 * Provides common functionality for all deployment-related plugins.
 */

import { BasePlugin } from './BasePlugin.js';
import { IUIDeploymentPlugin, DeploymentPlatform, EnvironmentOption, InfrastructureOption } from '../../types/plugin-interfaces.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
import { ValidationResult } from '../../types/agent.js';
import { PluginContext } from '../../types/plugin.js';

export abstract class BaseDeploymentPlugin extends BasePlugin implements IUIDeploymentPlugin {
    private questionGenerator: DynamicQuestionGenerator;

    constructor() {
        super();
        this.questionGenerator = new DynamicQuestionGenerator();
    }

    // --- Abstract Methods for Plugin to Implement ---
    abstract getDeploymentPlatforms(): DeploymentPlatform[];
    abstract getEnvironmentOptions(): EnvironmentOption[];
    abstract getInfrastructureOptions(): InfrastructureOption[];

    // --- Shared Logic ---
    protected async generateDeploymentConfig(config: any): Promise<void> {
        // Common logic for creating vercel.json, Dockerfile, etc.
    }

    protected addDeploymentScripts(scripts: Record<string, string>): Promise<void> {
        // Common logic for adding 'deploy' scripts to package.json
        return this.addScripts(scripts);
    }

    getDynamicQuestions(context: PluginContext): any[] {
        return this.questionGenerator.generateQuestions(this, context);
    }

    validateConfiguration(config: Record<string, any>): ValidationResult {
        // Basic validation, can be extended by child classes
        return this.validateRequiredConfig(config, ['platform']);
    }
} 