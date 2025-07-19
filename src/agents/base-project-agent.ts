/**
 * Base Project Agent - Foundation Builder
 * 
 * Responsible for creating the core project structure using the new
 * framework-agnostic and structure-agnostic approach.
 * 
 * Enhanced to integrate with the plugin system for modularity.
 */

import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { TemplateService, templateService } from '../utils/template-service.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { ProjectStructureManager } from '../utils/project-structure-manager.js';
import { ConfigurationManager } from '../utils/configuration-manager.js';
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
  private structureManager: ProjectStructureManager;
  private configManager: ConfigurationManager;

  constructor(pluginSystem: PluginSystem) {
    super();
    this.pluginSystem = pluginSystem;
    this.structureManager = new ProjectStructureManager(templateService);
    this.configManager = new ConfigurationManager();
  }

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'BaseProjectAgent',
      version: '2.0.0',
      description: 'Creates the foundational project structure using framework-agnostic approach',
      author: 'The Architech Team',
      category: AgentCategory.FOUNDATION,
      tags: ['project', 'foundation', 'generator', 'framework-agnostic', 'structure-agnostic'],
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
        description: 'Create project structure (single-app or monorepo)',
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
            description: 'Framework to use (nextjs, react, vue)'
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
            description: 'Create a Next.js monorepo with Turborepo',
            parameters: {
              projectName: 'my-app',
              framework: 'nextjs-14',
              structure: 'monorepo'
            },
            expectedResult: 'Project structure created successfully'
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
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate project name
    if (!context.projectName || context.projectName.trim().length === 0) {
      errors.push('Project name is required');
    } else if (!/^[a-zA-Z0-9-_]+$/.test(context.projectName)) {
      errors.push('Project name can only contain letters, numbers, hyphens, and underscores');
    }

    // Validate framework
    const framework = context.config.template as string;
    if (!framework) {
      errors.push('Framework/template is required');
    } else if (!['nextjs', 'nextjs-14', 'react', 'vue'].includes(framework)) {
      errors.push(`Unsupported framework: ${framework}`);
    }

    // Validate project path
    if (existsSync(context.projectPath)) {
      errors.push(`Project directory already exists: ${context.projectPath}`);
    }

    // Validate package manager
    if (!['npm', 'yarn', 'pnpm', 'bun', 'auto'].includes(context.packageManager)) {
      warnings.push(`Unsupported package manager: ${context.packageManager}`);
    }

    return {
      valid: errors.length === 0,
      errors: errors.map(error => ({
        field: 'general',
        message: error,
        code: 'VALIDATION_ERROR',
        severity: 'error' as const
      })),
      warnings,
      ...(warnings.length > 0 && { suggestions: ['Consider using a supported package manager'] })
    };
  }

  // ============================================================================
  // CORE EXECUTION
  // ============================================================================

  protected async executeInternal(context: AgentContext): Promise<AgentResult> {
    const { projectName, projectPath, config } = context;
    const framework = config.template as string;
    const structure = config.structure as 'single-app' | 'monorepo' || 'monorepo';
    
    context.logger.info(`Creating ${structure} structure for ${framework}: ${projectName}`);

    try {
      // Start spinner for actual work
      await this.startSpinner(`🔧 Creating ${structure} structure for ${projectName}...`, context);

      // Step 1: Create project configuration
      const projectConfig = await this.createProjectConfiguration(context, structure);

      // Step 2: Create project structure
      await this.createProjectStructure(context, projectConfig);

      // Step 3: Validate project structure
      await this.validateProjectStructure(context, projectConfig);

      // Step 4: Save configuration
      await this.saveProjectConfiguration(context, projectConfig);

      // Stop spinner and show success
      this.succeedSpinner(`✅ ${structure} structure created successfully: ${projectName}`);

      const artifacts: Artifact[] = [
        {
          type: 'directory',
          path: projectPath,
          metadata: {
            framework,
            features: projectConfig.features,
            structure,
            modules: projectConfig.modules
          }
        },
        {
          type: 'config',
          path: path.join(projectPath, '.architech.json'),
          metadata: { type: 'project-configuration' }
        }
      ];

      return this.createSuccessResult(
        {
          projectPath,
          framework,
          structure,
          packages: projectConfig.modules,
          features: projectConfig.features
        },
        artifacts,
        [
          `${structure} structure created`,
          'Configuration files generated',
          'Project structure validated',
          'Ready for framework-specific setup'
        ]
      );

    } catch (error) {
      // Stop spinner and show error
      this.failSpinner(`❌ Failed to create ${structure} structure`);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Failed to create project structure: ${errorMessage}`, error as Error);
      
      return this.createErrorResult(
        'PROJECT_CREATION_FAILED',
        `Failed to create ${structure} structure: ${errorMessage}`,
        [],
        0,
        error
      );
    }
  }

  // ============================================================================
  // PROJECT CONFIGURATION
  // ============================================================================

  private async createProjectConfiguration(
    context: AgentContext,
    structure: 'single-app' | 'monorepo'
  ) {
    const framework = context.config.template as string;
    const userInput = context.config.userInput as string;

    // Create configuration options
    const configOptions = {
      skipGit: context.options.skipGit,
      skipInstall: context.options.skipInstall,
      useDefaults: context.options.useDefaults,
      verbose: context.options.verbose
    };

    // Create project configuration
    const projectConfig = this.configManager.createConfiguration(
      context.projectName,
      framework,
      structure,
      configOptions,
      userInput
    );

    // Validate configuration
    const validation = this.configManager.validateConfiguration(projectConfig);
    if (!validation.valid) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }

    context.logger.info('Project configuration created successfully');
    return projectConfig;
  }

  // ============================================================================
  // PROJECT STRUCTURE CREATION
  // ============================================================================

  private async createProjectStructure(
    context: AgentContext,
    projectConfig: any
  ): Promise<void> {
    // Get structure configuration
    const structureConfig = this.configManager.getStructureConfig(projectConfig);

    // Get template data
    const templateData = this.configManager.getTemplateData(projectConfig);

    // Create project structure
    await this.structureManager.createStructure(
      context.projectPath,
      structureConfig,
      templateData
    );

    context.logger.info('Project structure created successfully');
  }

  // ============================================================================
  // PROJECT STRUCTURE VALIDATION
  // ============================================================================

  private async validateProjectStructure(
    context: AgentContext,
    projectConfig: any
  ): Promise<void> {
    // Get structure configuration
    const structureConfig = this.configManager.getStructureConfig(projectConfig);

    // Validate structure
    const isValid = await this.structureManager.validateStructure(
      context.projectPath,
      structureConfig
    );

    if (!isValid) {
      throw new Error('Project structure validation failed');
    }

    context.logger.info('Project structure validation passed');
  }

  // ============================================================================
  // CONFIGURATION PERSISTENCE
  // ============================================================================

  private async saveProjectConfiguration(
    context: AgentContext,
    projectConfig: any
  ): Promise<void> {
    await this.configManager.saveConfiguration(
      context.projectPath,
      projectConfig
    );

    context.logger.info('Project configuration saved');
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getPackageDependencies(packageName: string): Record<string, string> {
    const dependencies: Record<string, Record<string, string>> = {
      ui: {
        'react': '^18.3.0',
        'react-dom': '^18.3.0',
        'tailwindcss': '^3.4.0',
        'tailwindcss-animate': '^1.0.7',
        'class-variance-authority': '^0.7.0',
        'clsx': '^2.1.0',
        'lucide-react': '^0.400.0',
        'tailwind-merge': '^2.2.0'
      },
      db: {
        'drizzle-orm': '^0.30.0',
        'drizzle-kit': '^0.21.0',
        '@neondatabase/serverless': '^0.9.0'
      },
      auth: {
        'better-auth': '^0.20.0',
        '@better-auth/drizzle': '^0.20.0'
      },
      config: {
        '@types/node': '^20.0.0',
        'typescript': '^5.4.0'
      }
    };

    return dependencies[packageName] || {};
  }
} 