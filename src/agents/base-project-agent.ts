/**
 * Base Project Agent - Foundation Builder
 * 
 * Responsible for creating the core project structure using the plugin system.
 * Pure orchestrator - delegates all technology implementation to plugins.
 */

import { existsSync } from 'fs';
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

export class BaseProjectAgent extends AbstractAgent {
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
      name: 'BaseProjectAgent',
      version: '2.0.0',
      description: 'Creates the foundational project structure using plugin orchestration',
      author: 'The Architech Team',
      category: AgentCategory.FOUNDATION,
      tags: ['project', 'foundation', 'orchestrator', 'plugin-coordinator'],
      dependencies: [],
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
        name: 'create-project-structure',
        description: 'Create project structure using NextJS plugin',
        parameters: [
          {
            name: 'projectName',
            type: 'string',
            required: true,
            description: 'Name of the project to create'
          },
          {
            name: 'framework',
            type: 'string',
            required: true,
            description: 'Framework to use (nextjs, nextjs-14)'
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
            name: 'Create Next.js monorepo',
            description: 'Create a Next.js monorepo using NextJS plugin',
            parameters: {
              projectName: 'my-app',
              framework: 'nextjs-14',
              structure: 'monorepo'
            },
            expectedResult: 'Project structure created successfully via plugin'
          }
        ],
        category: CapabilityCategory.SETUP
      },
      {
        name: 'validate-project-structure',
        description: 'Validate created project structure',
        parameters: [
          {
            name: 'projectPath',
            type: 'string',
            required: true,
            description: 'Path to the project directory'
          }
        ],
        examples: [
          {
            name: 'Validate monorepo structure',
            description: 'Validate that all required directories and files exist',
            parameters: {
              projectPath: './my-app'
            },
            expectedResult: 'Structure validation passed'
          }
        ],
        category: CapabilityCategory.VALIDATION
      }
    ];
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  async validate(context: AgentContext): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: string[] = [];

    // Validate project name
    if (!context.projectName || context.projectName.trim().length === 0) {
      errors.push({
        field: 'projectName',
        message: 'Project name is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    } else if (!/^[a-zA-Z0-9-_]+$/.test(context.projectName)) {
      errors.push({
        field: 'projectName',
        message: 'Project name can only contain letters, numbers, hyphens, and underscores',
        code: 'INVALID_FORMAT',
        severity: 'error'
      });
    }

    // Validate framework
    const framework = context.config.template as string;
    if (!framework) {
      errors.push({
        field: 'template',
        message: 'Framework/template is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    } else if (!['nextjs', 'nextjs-14', 'react', 'vue'].includes(framework)) {
      errors.push({
        field: 'template',
        message: `Unsupported framework: ${framework}`,
        code: 'UNSUPPORTED_FRAMEWORK',
        severity: 'error'
      });
    }

    // Validate project path
    if (existsSync(context.projectPath)) {
      errors.push({
        field: 'projectPath',
        message: `Project directory already exists: ${context.projectPath}`,
        code: 'DIRECTORY_EXISTS',
        severity: 'error'
      });
    }

    // Validate package manager
    if (!['npm', 'yarn', 'pnpm', 'bun', 'auto'].includes(context.packageManager)) {
      warnings.push(`Unsupported package manager: ${context.packageManager}`);
    }

    // Check if NextJS plugin is available
    const nextjsPlugin = this.pluginSystem.getRegistry().get('nextjs');
    if (!nextjsPlugin) {
      errors.push({
        field: 'plugin',
        message: 'NextJS plugin not found in registry',
        code: 'PLUGIN_NOT_FOUND',
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
  // CORE EXECUTION - Pure Plugin Orchestration
  // ============================================================================

  protected async executeInternal(context: AgentContext): Promise<AgentResult> {
    const { projectName, projectPath, config } = context;
    const framework = config.template as string;
    const structure = config.structure as 'single-app' | 'monorepo' || 'monorepo';
    
    context.logger.info(`Creating ${structure} structure for ${framework}: ${projectName}`);

    try {
      // Start spinner for actual work
      await this.startSpinner(`🔧 Creating ${structure} structure for ${projectName}...`, context);

      // Step 1: Execute NextJS plugin for project creation
      const pluginResult = await this.executeNextJSPlugin(context, framework, structure);

      // Step 2: Validate the created project structure
      await this.validateProjectStructure(context, structure);

      // Step 3: Create project configuration file
      await this.createProjectConfiguration(context, structure);

      await this.succeedSpinner(`✅ Project structure created successfully`);

      return {
        success: true,
        data: {
          projectName,
          framework,
          structure,
          plugin: 'nextjs',
          artifacts: pluginResult.artifacts.length,
          dependencies: pluginResult.dependencies.length
        },
        artifacts: pluginResult.artifacts,
        warnings: pluginResult.warnings,
        duration: Date.now() - this.startTime
      };

    } catch (error) {
      await this.failSpinner(`❌ Failed to create project structure`);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(
        'PROJECT_CREATION_FAILED',
        `Failed to create project structure: ${errorMessage}`,
        [],
        this.startTime,
        error
      );
    }
  }

  // ============================================================================
  // PRIVATE METHODS - Plugin Orchestration
  // ============================================================================

  private async executeNextJSPlugin(
    context: AgentContext, 
    framework: string, 
    structure: 'single-app' | 'monorepo'
  ): Promise<any> {
    // Get the NextJS plugin
    const nextjsPlugin = this.pluginSystem.getRegistry().get('nextjs');
    if (!nextjsPlugin) {
      throw new Error('NextJS plugin not found in registry');
    }

    // Prepare plugin context
    const pluginContext: PluginContext = {
      ...context,
      pluginId: 'nextjs',
      pluginConfig: this.getPluginConfig(context, framework, structure),
      installedPlugins: [],
      projectType: ProjectType.NEXTJS,
      targetPlatform: [TargetPlatform.WEB]
    };

    // Validate plugin compatibility
    const validation = await nextjsPlugin.validate(pluginContext);
    if (!validation.valid) {
      throw new Error(`NextJS plugin validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Execute the plugin
    context.logger.info('Executing NextJS plugin...');
    const result = await nextjsPlugin.install(pluginContext);

    if (!result.success) {
      throw new Error(`NextJS plugin execution failed: ${result.errors.map(e => e.message).join(', ')}`);
    }

    return result;
  }

  private async validateProjectStructure(
    context: AgentContext, 
    structure: 'single-app' | 'monorepo'
  ): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Validating project structure...');

    // Check for essential files
    const essentialFiles = ['package.json', 'README.md'];
    for (const file of essentialFiles) {
      const filePath = path.join(projectPath, file);
      if (!await fsExtra.pathExists(filePath)) {
        throw new Error(`Essential file missing: ${file}`);
      }
    }

    // Check for structure-specific files
    if (structure === 'monorepo') {
      const monorepoFiles = ['turbo.json', 'packages'];
      for (const file of monorepoFiles) {
        const filePath = path.join(projectPath, file);
        if (!await fsExtra.pathExists(filePath)) {
          throw new Error(`Monorepo file/directory missing: ${file}`);
        }
      }
    }

    context.logger.success('Project structure validation passed');
  }

  private async createProjectConfiguration(
    context: AgentContext, 
    structure: 'single-app' | 'monorepo'
  ): Promise<void> {
    const { projectPath, projectName, config } = context;
    
    // Create architech configuration file
    const architechConfig = {
      name: projectName,
      version: '0.1.0',
      structure,
      framework: config.template,
      packageManager: context.packageManager,
      createdAt: new Date().toISOString(),
      plugins: [],
      agents: []
    };

    const configPath = path.join(projectPath, '.architech.json');
    await fsExtra.writeJSON(configPath, architechConfig, { spaces: 2 });
  }

  private getPluginConfig(context: AgentContext, framework: string, structure: 'single-app' | 'monorepo'): Record<string, any> {
    return {
      projectName: context.projectName, // Add projectName to plugin config
      template: framework,
      structure,
      typescript: true,
      tailwind: true,
      eslint: true,
      srcDir: false,
      importAlias: '@/*',
      appRouter: framework === 'nextjs-14', // Fix: use appRouter instead of useAppRouter
      useMonorepo: structure === 'monorepo'
    };
  }
} 