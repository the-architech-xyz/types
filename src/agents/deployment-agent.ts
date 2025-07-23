/**
 * Deployment Agent - Deployment Orchestrator
 * 
 * Pure orchestrator for deployment setup using unified interfaces.
 * Handles user interaction, decision making, and coordinates deployment plugins through unified interfaces.
 * No direct installation logic - delegates everything to plugins through adapters.
 */

import { AbstractAgent } from './base/abstract-agent.js';
import { PluginSystem } from '../core/plugin/plugin-system.js';
import { PluginContext, ProjectType, TargetPlatform } from '../types/plugins.js';
import {
  AgentContext,
  AgentResult,
  AgentMetadata,
  AgentCapability,
  AgentCategory,
  CapabilityCategory,
  ValidationResult,
  Artifact,
  ValidationError
} from '../types/agents.js';
import * as path from 'path';
import fsExtra from 'fs-extra';

interface DeploymentConfig {
  platform: 'vercel' | 'railway' | 'netlify' | 'aws' | 'none';
  environment: 'development' | 'staging' | 'production';
  features: {
    autoDeploy: boolean;
    previewDeployments: boolean;
    customDomain: boolean;
    ssl: boolean;
    ciCd: boolean;
  };
  domain?: string;
  region?: string;
}

export class DeploymentAgent extends AbstractAgent {
  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'Deployment Agent',
      version: '1.0.0',
      description: 'Orchestrates deployment setup using unified interfaces',
      author: 'The Architech Team',
      category: AgentCategory.DEPLOYMENT,
      tags: ['deployment', 'ci-cd', 'hosting', 'unified-interface'],
      dependencies: ['base-project', 'framework'],
      conflicts: [],
      requirements: [
        {
          type: 'package',
          name: 'fs-extra',
          description: 'File system utilities'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/the-architech/cli'
    };
  }

  protected getAgentCapabilities(): AgentCapability[] {
    return [
      {
        id: 'deployment-setup',
        name: 'Deployment Setup',
        description: 'Setup deployment with unified interfaces',
        category: CapabilityCategory.SETUP,
        parameters: [
          {
            name: 'platform',
            type: 'string',
            description: 'Deployment platform',
            required: false,
            defaultValue: 'vercel'
          },
          {
            name: 'environment',
            type: 'string',
            description: 'Deployment environment',
            required: false,
            defaultValue: 'production'
          },
          {
            name: 'autoDeploy',
            type: 'boolean',
            description: 'Enable auto-deployment',
            required: false,
            defaultValue: true
          },
          {
            name: 'previewDeployments',
            type: 'boolean',
            description: 'Enable preview deployments',
            required: false,
            defaultValue: true
          },
          {
            name: 'customDomain',
            type: 'boolean',
            description: 'Setup custom domain',
            required: false,
            defaultValue: false
          }
        ],
        examples: [
          {
            name: 'Setup Vercel deployment',
            description: 'Creates deployment setup with Vercel using unified interfaces',
            parameters: { platform: 'vercel', environment: 'production', autoDeploy: true },
            expectedResult: 'Complete deployment setup with Vercel via unified interface'
          },
          {
            name: 'Setup Railway deployment',
            description: 'Creates deployment setup with Railway using unified interfaces',
            parameters: { platform: 'railway', environment: 'staging', previewDeployments: true },
            expectedResult: 'Deployment setup with Railway via unified interface'
          }
        ]
      },
      {
        id: 'deployment-validation',
        name: 'Deployment Validation',
        description: 'Validate deployment setup',
        category: CapabilityCategory.VALIDATION,
        parameters: [],
        examples: [
          {
            name: 'Validate deployment setup',
            description: 'Validates the deployment setup using unified interfaces',
            parameters: {},
            expectedResult: 'Deployment setup validation report'
          }
        ]
      }
    ];
  }

  // ============================================================================
  // CORE EXECUTION - Pure Plugin Orchestration with Unified Interfaces
  // ============================================================================

  protected async executeInternal(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Setting up deployment for project: ' + context.projectName);

      // Get deployment configuration
      const deploymentConfig = await this.getDeploymentConfig(context);

      // Skip if deployment is disabled
      if (!deploymentConfig.platform || deploymentConfig.platform === 'none') {
        context.logger.info('Deployment disabled, skipping setup');
        return {
          success: true,
          data: { deployment: 'disabled' },
          artifacts: [],
          warnings: ['Deployment setup skipped'],
          duration: Date.now() - startTime
        };
      }

      // Select deployment plugin based on user preferences or project requirements
      const selectedPlugin = await this.selectDeploymentPlugin(context, deploymentConfig);

      // Execute deployment plugin through unified interface
      context.logger.info(`Executing ${selectedPlugin} plugin through unified interface...`);
      const result = await this.executeDeploymentPluginUnified(context, selectedPlugin, deploymentConfig);

      // Validate the setup using unified interface
      await this.validateDeploymentSetupUnified(context, selectedPlugin);

      const duration = Date.now() - startTime;
      
      return {
        success: true,
        artifacts: result.artifacts || [],
        data: {
          plugin: selectedPlugin,
          platform: deploymentConfig.platform,
          environment: deploymentConfig.environment,
          features: deploymentConfig.features,
          unifiedInterface: true
        },
        errors: [],
        warnings: result.warnings || [],
        duration
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Deployment setup failed: ${errorMessage}`);
      
      return this.createErrorResult(
        'DEPLOYMENT_SETUP_FAILED',
        `Failed to setup deployment: ${errorMessage}`,
        [],
        startTime,
        error
      );
    }
  }

  // ============================================================================
  // UNIFIED INTERFACE EXECUTION
  // ============================================================================

  private async executeDeploymentPluginUnified(
    context: AgentContext,
    pluginName: string,
    deploymentConfig: DeploymentConfig
  ): Promise<any> {
    try {
      context.logger.info(`Starting unified execution of ${pluginName} plugin...`);
      
      // Get the selected plugin
      const plugin = this.pluginSystem.getRegistry().get(pluginName);
      if (!plugin) {
        throw new Error(`${pluginName} plugin not found in registry`);
      }

      context.logger.info(`Found ${pluginName} plugin in registry`);

      // Prepare plugin context
      const pluginContext: PluginContext = {
        ...context,
        pluginId: pluginName,
        pluginConfig: this.getPluginConfig(deploymentConfig, pluginName),
        installedPlugins: [],
        projectType: ProjectType.NEXTJS,
        targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
      };

      context.logger.info(`Plugin context prepared for ${pluginName}`);

      // Validate plugin compatibility
      context.logger.info(`Validating ${pluginName} plugin...`);
      const validation = await plugin.validate(pluginContext);
      if (!validation.valid) {
        throw new Error(`${pluginName} plugin validation failed: ${validation.errors.map((e: ValidationError) => e.message).join(', ')}`);
      }

      context.logger.info(`${pluginName} plugin validation passed`);

      // Execute the plugin
      context.logger.info(`Executing ${pluginName} plugin...`);
      const result = await plugin.install(pluginContext);

      if (!result.success) {
        throw new Error(`${pluginName} plugin execution failed: ${result.errors.map((e: any) => e.message).join(', ')}`);
      }

      context.logger.info(`${pluginName} plugin execution completed successfully`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to execute deployment plugin ${pluginName}: ${errorMessage}`);
    }
  }

  private async validateDeploymentSetupUnified(
    context: AgentContext,
    pluginName: string
  ): Promise<void> {
    try {
      context.logger.info(`Validating deployment setup using unified interface for ${pluginName}...`);

      // Get the plugin and validate it
      const plugin = this.pluginSystem.getRegistry().get(pluginName);
      if (!plugin) {
        throw new Error(`Deployment plugin not found: ${pluginName}`);
      }

      const pluginContext: PluginContext = {
        ...context,
        pluginId: pluginName,
        pluginConfig: {},
        installedPlugins: [],
        projectType: ProjectType.NEXTJS,
        targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
      };

      const validation = await plugin.validate(pluginContext);
      if (!validation.valid) {
        const errorMessages = validation.errors.map((e: any) => e.message).join(', ');
        throw new Error(`Deployment plugin validation failed: ${errorMessages}`);
      }

      context.logger.success(`Deployment plugin ${pluginName} validation passed`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Deployment plugin validation failed: ${errorMessage}`);
    }
  }

  // ============================================================================
  // PLUGIN SELECTION
  // ============================================================================

  private async selectDeploymentPlugin(context: AgentContext, deploymentConfig: DeploymentConfig): Promise<string> {
    // Get plugin selection from context to determine which deployment to use
    const pluginSelection = context.state.get('pluginSelection') as any;
    const selectedDeployment = pluginSelection?.deployment?.platform;
    
    if (selectedDeployment && selectedDeployment !== 'none') {
      context.logger.info(`Using user selection for deployment: ${selectedDeployment}`);
      return selectedDeployment;
    }
    
    // Check if user has specified a preference
    const userPreference = context.state.get('deploymentPlatform');
    if (userPreference) {
      context.logger.info(`Using user preference for deployment: ${userPreference}`);
      return userPreference;
    }

    // Check if project has specified deployment platform
    const projectDeployment = context.config.deployment?.platform;
    if (projectDeployment) {
      context.logger.info(`Using project deployment platform: ${projectDeployment}`);
      return projectDeployment;
    }

    // Default to Vercel for Next.js projects
    context.logger.info('Using default deployment platform: vercel');
    return 'vercel';
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  async validate(context: AgentContext): Promise<ValidationResult> {
    const baseValidation = await super.validate(context);
    
    if (!baseValidation.valid) {
      return baseValidation;
    }

    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Check if deployment plugins are available
    const availablePlugins = ['vercel', 'railway', 'netlify'];
    for (const pluginName of availablePlugins) {
      const plugin = this.pluginSystem.getRegistry().get(pluginName);
      if (!plugin) {
        warnings.push(`${pluginName} deployment plugin not found in registry`);
      }
    }

    // Check if project is ready for deployment
    const packageJsonPath = path.join(context.projectPath, 'package.json');
    if (!await fsExtra.pathExists(packageJsonPath)) {
      errors.push({
        field: 'project',
        message: 'Project package.json not found',
        code: 'PROJECT_NOT_READY',
        severity: 'error'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // PRIVATE METHODS - Deployment Setup
  // ============================================================================

  private async getDeploymentConfig(context: AgentContext): Promise<DeploymentConfig> {
    // Get configuration from context or use defaults
    const userConfig = context.config.deployment || {};
    const pluginSelection = context.state.get('pluginSelection') as any;
    const deploymentSelection = pluginSelection?.deployment;
    
    return {
      platform: deploymentSelection?.platform || userConfig.platform || 'vercel',
      environment: deploymentSelection?.environment || userConfig.environment || 'production',
      features: {
        autoDeploy: deploymentSelection?.features?.autoDeploy ?? userConfig.autoDeploy ?? true,
        previewDeployments: deploymentSelection?.features?.previewDeployments ?? userConfig.previewDeployments ?? true,
        customDomain: deploymentSelection?.features?.customDomain ?? userConfig.customDomain ?? false,
        ssl: deploymentSelection?.features?.ssl ?? userConfig.ssl ?? true,
        ciCd: deploymentSelection?.features?.ciCd ?? userConfig.ciCd ?? true
      },
      domain: userConfig.domain,
      region: userConfig.region
    };
  }

  private getPluginConfig(deploymentConfig: DeploymentConfig, pluginName: string): Record<string, any> {
    const config: Record<string, any> = {
      platform: deploymentConfig.platform,
      environment: deploymentConfig.environment,
      features: deploymentConfig.features,
      domain: deploymentConfig.domain,
      region: deploymentConfig.region
    };

    // Add specific plugin-specific configurations if needed
    if (pluginName === 'vercel') {
      config.framework = 'nextjs';
      config.buildCommand = 'npm run build';
      config.outputDirectory = '.next';
    } else if (pluginName === 'railway') {
      config.startCommand = 'npm start';
      config.healthCheckPath = '/api/health';
    } else if (pluginName === 'netlify') {
      config.buildCommand = 'npm run build';
      config.publishDirectory = 'out';
    }

    return config;
  }

  // ============================================================================
  // ROLLBACK
  // ============================================================================

  async rollback(context: AgentContext): Promise<void> {
    context.logger.warn('Rolling back deployment setup...');

    try {
      // Get the deployment plugin for uninstallation
      const deploymentConfig = await this.getDeploymentConfig(context);
      const pluginName = await this.selectDeploymentPlugin(context, deploymentConfig);
      
      const plugin = this.pluginSystem.getRegistry().get(pluginName);
      if (plugin) {
        const pluginContext: PluginContext = {
          ...context,
          pluginId: pluginName,
          pluginConfig: this.getPluginConfig(deploymentConfig, pluginName),
          installedPlugins: [],
          projectType: ProjectType.NEXTJS,
          targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
        };

        await plugin.uninstall(pluginContext);
      }

      context.logger.success('Deployment setup rollback completed');
    } catch (error) {
      context.logger.error('Deployment rollback failed', error as Error);
    }
  }
} 