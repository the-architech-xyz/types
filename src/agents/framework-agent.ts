/**
 * Framework Agent - Framework Installer
 * 
 * Responsible for installing and configuring the chosen framework.
 * Context-aware: knows if it's working in monorepo (apps/web/) or single-app (root).
 * Pure orchestrator - delegates all technology implementation to plugins.
 */

import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { PluginContext, ProjectType, TargetPlatform } from '../types/plugin.js';
import {
  AgentContext,
  AgentResult,
  AgentMetadata,
  AgentCapability,
  AgentCategory,
  CapabilityCategory,
  ValidationResult,
  Artifact
} from '../types/agent.js';

export class FrameworkAgent extends AbstractAgent {
  private pluginSystem: PluginSystem;

  constructor() {
    super();
    this.pluginSystem = PluginSystem.getInstance();
  }

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'FrameworkAgent',
      version: '1.0.0',
      description: 'Installs and configures the chosen framework using plugin orchestration',
      author: 'The Architech Team',
      category: AgentCategory.FOUNDATION,
      tags: ['framework', 'installation', 'orchestrator', 'plugin-coordinator'],
      dependencies: ['base-project'],
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
        name: 'install-framework',
        description: 'Install framework using appropriate plugin',
        parameters: [
          {
            name: 'framework',
            type: 'string',
            required: true,
            description: 'Framework to install (nextjs, react, vue)'
          },
          {
            name: 'structure',
            type: 'string',
            required: true,
            description: 'Project structure (single-app or monorepo)'
          }
        ],
        examples: [
          {
            name: 'Install Next.js in monorepo',
            description: 'Install Next.js in apps/web/ directory',
            parameters: {
              framework: 'nextjs-14',
              structure: 'monorepo'
            },
            expectedResult: 'Next.js installed in apps/web/'
          }
        ],
        category: CapabilityCategory.SETUP
      }
    ];
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  async validate(context: AgentContext): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: string[] = [];

    context.logger.info(`🔍 FrameworkAgent: Validation - projectStructure:`, context.projectStructure);
    context.logger.info(`🔍 FrameworkAgent: Validation - config.template:`, context.config.template);
    context.logger.info(`🔍 FrameworkAgent: Validation - config:`, context.config);

    // Validate framework
    const framework = context.projectStructure?.template || context.config.template as string;
    context.logger.info(`🔍 FrameworkAgent: Validation - resolved framework: ${framework}`);
    
    if (!framework) {
      context.logger.error(`🔍 FrameworkAgent: Validation - No framework found!`);
      errors.push({
        field: 'template',
        message: 'Framework/template is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    } else if (!['nextjs', 'nextjs-14', 'react', 'vue'].includes(framework)) {
      context.logger.error(`🔍 FrameworkAgent: Validation - Unsupported framework: ${framework}`);
      errors.push({
        field: 'template',
        message: `Unsupported framework: ${framework}`,
        code: 'UNSUPPORTED_FRAMEWORK',
        severity: 'error'
      });
    }

    // Validate project structure exists
    if (!context.projectStructure) {
      context.logger.error(`🔍 FrameworkAgent: Validation - No project structure found!`);
      errors.push({
        field: 'projectStructure',
        message: 'Project structure information is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    // Check if framework plugin is available
    const pluginId = framework === 'nextjs-14' ? 'nextjs' : framework;
    const frameworkPlugin = this.pluginSystem.getRegistry().get(pluginId);
    context.logger.info(`🔍 FrameworkAgent: Validation - Framework plugin found: ${frameworkPlugin ? 'YES' : 'NO'}`);
    
    if (!frameworkPlugin) {
      context.logger.error(`🔍 FrameworkAgent: Validation - Plugin not found for framework: ${framework} (looked for: ${pluginId})`);
      errors.push({
        field: 'plugin',
        message: `${framework} plugin not found in registry`,
        code: 'PLUGIN_NOT_FOUND',
        severity: 'error'
      });
    }

    context.logger.info(`🔍 FrameworkAgent: Validation - Result: ${errors.length === 0 ? 'SUCCESS' : 'FAILED'} with ${errors.length} errors`);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // CORE EXECUTION - Framework Installation
  // ============================================================================

  protected async executeInternal(context: AgentContext): Promise<AgentResult> {
    const { projectName, projectPath, projectStructure } = context;
    
    const framework = projectStructure?.template || context.config.template as string;
    const structure = projectStructure?.type || context.config.structure as 'single-app' | 'monorepo';
    
    context.logger.info(`🔍 FrameworkAgent: Starting execution for ${framework} in ${structure} structure`);
    context.logger.info(`🔍 FrameworkAgent: Project path: ${projectPath}`);
    context.logger.info(`🔍 FrameworkAgent: Project structure:`, projectStructure);

    try {
      // Start spinner for actual work
      await this.startSpinner(`🚀 Installing ${framework} framework...`, context);

      // Step 1: Determine installation path based on structure
      const installPath = this.getInstallPath(context, structure);
      context.logger.info(`🔍 FrameworkAgent: Install path: ${installPath}`);
      
      // Step 2: Execute framework plugin
      context.logger.info(`🔍 FrameworkAgent: About to execute framework plugin: ${framework}`);
      const pluginResult = await this.executeFrameworkPlugin(context, framework, installPath);
      context.logger.info(`🔍 FrameworkAgent: Plugin execution completed successfully`);

      // Step 3: Post-process installation if needed
      if (structure === 'single-app') {
        await this.postProcessSingleApp(context, installPath);
      }

      await this.succeedSpinner(`✅ Framework installation completed`);

      return {
        success: true,
        data: {
          projectName,
          framework,
          structure,
          installPath,
          plugin: framework,
          artifacts: pluginResult.artifacts.length,
          dependencies: pluginResult.dependencies.length
        },
        artifacts: pluginResult.artifacts,
        warnings: pluginResult.warnings,
        duration: Date.now() - this.startTime
      };

    } catch (error) {
      await this.failSpinner(`❌ Framework installation failed`);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`🔍 FrameworkAgent: Error during execution: ${errorMessage}`, error instanceof Error ? error : undefined);
      if (error instanceof Error) {
        context.logger.debug(`🔍 FrameworkAgent: Error stack: ${error.stack}`);
      }
      return this.createErrorResult(
        'FRAMEWORK_INSTALLATION_FAILED',
        `Failed to install framework: ${errorMessage}`,
        [],
        this.startTime,
        error
      );
    }
  }

  // ============================================================================
  // PRIVATE METHODS - Framework Installation
  // ============================================================================

  private getInstallPath(context: AgentContext, structure: 'single-app' | 'monorepo'): string {
    if (structure === 'monorepo') {
      return path.join(context.projectPath, 'apps', 'web');
    }
    return context.projectPath;
  }

  private async executeFrameworkPlugin(
    context: AgentContext, 
    framework: string, 
    installPath: string
  ): Promise<any> {
    context.logger.info(`🔍 FrameworkAgent: executeFrameworkPlugin called with framework: ${framework}, installPath: ${installPath}`);
    
    // Get the framework plugin (map nextjs-14 to nextjs)
    const pluginId = framework === 'nextjs-14' ? 'nextjs' : framework;
    const frameworkPlugin = this.pluginSystem.getRegistry().get(pluginId);
    context.logger.info(`🔍 FrameworkAgent: Framework plugin found: ${frameworkPlugin ? 'YES' : 'NO'} (looked for: ${pluginId})`);
    
    if (!frameworkPlugin) {
      throw new Error(`${framework} plugin not found in registry (looked for: ${pluginId})`);
    }

    // Prepare plugin context with correct install path
    const pluginContext: PluginContext = {
      ...context,
      projectPath: installPath,
      pluginId: framework,
      pluginConfig: this.getPluginConfig(context, framework, installPath),
      installedPlugins: [],
      projectType: this.getProjectType(framework),
      targetPlatform: [TargetPlatform.WEB]
    };
    
    context.logger.info(`🔍 FrameworkAgent: Plugin context prepared, about to validate plugin`);

    // Validate plugin compatibility
    const validation = await frameworkPlugin.validate(pluginContext);
    context.logger.info(`🔍 FrameworkAgent: Plugin validation result: ${validation.valid ? 'SUCCESS' : 'FAILED'}`);
    if (!validation.valid) {
      context.logger.error(`🔍 FrameworkAgent: Validation errors: ${JSON.stringify(validation.errors)}`);
      throw new Error(`${framework} plugin validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Execute the plugin
    context.logger.info(`🔍 FrameworkAgent: Executing ${framework} plugin in ${installPath}...`);
    const result = await frameworkPlugin.install(pluginContext);
    context.logger.info(`🔍 FrameworkAgent: Plugin execution result: ${result.success ? 'SUCCESS' : 'FAILED'}`);

    if (!result.success) {
      context.logger.error(`🔍 FrameworkAgent: Plugin execution failed: ${JSON.stringify(result.errors)}`);
      throw new Error(`${framework} plugin execution failed: ${result.errors.map(e => e.message).join(', ')}`);
    }

    return result;
  }

  private async postProcessSingleApp(context: AgentContext, installPath: string): Promise<void> {
    context.logger.info('Post-processing single-app installation...');
    
    // For single-app, the framework is installed in the root
    // We can add any single-app specific customizations here
    // For now, just log that post-processing is complete
    context.logger.success('Single-app post-processing completed');
  }

  private getProjectType(framework: string): ProjectType {
    switch (framework) {
      case 'nextjs':
      case 'nextjs-14':
        return ProjectType.NEXTJS;
      case 'react':
        return ProjectType.REACT;
      case 'vue':
        return ProjectType.VUE;
      default:
        return ProjectType.NEXTJS;
    }
  }

  private getPluginConfig(context: AgentContext, framework: string, installPath: string): Record<string, any> {
    return {
      projectName: path.basename(installPath),
      template: framework,
      typescript: true,
      tailwind: true,
      eslint: true,
      srcDir: false,
      importAlias: '@/*',
      appRouter: framework === 'nextjs-14',
      useMonorepo: context.projectStructure?.type === 'monorepo'
    };
  }
} 