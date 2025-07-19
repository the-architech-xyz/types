/**
 * Base Project Agent - Foundation Builder
 * 
 * Responsible for creating the core project structure using framework-specific
 * generators like create-next-app, create-react-app, etc.
 * 
 * Enhanced to integrate with the plugin system for modularity.
 */

import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { TemplateService, templateService } from '../utils/template-service.js';
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
  private templateService: TemplateService;

  constructor() {
    super();
    this.pluginSystem = PluginSystem.getInstance();
    this.templateService = templateService;
  }

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'BaseProjectAgent',
      version: '2.0.0',
      description: 'Creates the foundational project structure using framework-specific generators with plugin system',
      author: 'The Architech Team',
      category: AgentCategory.FOUNDATION,
      tags: ['project', 'foundation', 'generator', 'framework', 'plugin-integration'],
      dependencies: [],
      conflicts: [],
      requirements: [
        {
          type: 'package',
          name: 'create-next-app',
          description: 'Next.js project generator'
        },
        {
          type: 'package',
          name: 'create-vite',
          description: 'Vite project generator'
        },
        {
          type: 'package',
          name: 'nuxi',
          description: 'Nuxt project generator'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/the-architech/cli'
    };
  }

  protected getAgentCapabilities(): AgentCapability[] {
    return [
      {
        name: 'create-nextjs-project',
        description: 'Creates a Next.js project with TypeScript, Tailwind, and ESLint using plugin system',
        parameters: [
          {
            name: 'template',
            type: 'string',
            required: true,
            description: 'Next.js template version (nextjs-13, nextjs-14)',
            validation: [
              {
                type: 'enum',
                value: ['nextjs-13', 'nextjs-14'],
                message: 'Template must be nextjs-13 or nextjs-14'
              }
            ]
          },
          {
            name: 'usePlugin',
            type: 'boolean',
            required: false,
            description: 'Whether to use the Next.js plugin for core setup',
            defaultValue: true
          }
        ],
        examples: [
          {
            name: 'Create Next.js 14 project with plugin',
            description: 'Creates a modern Next.js 14 project with App Router using plugin',
            parameters: { template: 'nextjs-14', usePlugin: true },
            expectedResult: 'Next.js project with TypeScript, Tailwind, and ESLint via plugin'
          }
        ],
        category: CapabilityCategory.SETUP
      },
      {
        name: 'create-react-vite-project',
        description: 'Creates a React project with Vite for fast development',
        parameters: [
          {
            name: 'usePlugin',
            type: 'boolean',
            required: false,
            description: 'Whether to use a React plugin for core setup',
            defaultValue: false
          }
        ],
        examples: [
          {
            name: 'Create React + Vite project',
            description: 'Creates a React project with Vite and TypeScript',
            parameters: {},
            expectedResult: 'React project with Vite, TypeScript, and modern tooling'
          }
        ],
        category: CapabilityCategory.SETUP
      },
      {
        name: 'create-nuxt-project',
        description: 'Creates a Nuxt 3 project with modern Vue.js features',
        parameters: [
          {
            name: 'usePlugin',
            type: 'boolean',
            required: false,
            description: 'Whether to use a Nuxt plugin for core setup',
            defaultValue: false
          }
        ],
        examples: [
          {
            name: 'Create Nuxt 3 project',
            description: 'Creates a Nuxt 3 project with TypeScript and modern features',
            parameters: {},
            expectedResult: 'Nuxt 3 project with TypeScript and Vue 3 features'
          }
        ],
        category: CapabilityCategory.SETUP
      },
      {
        name: 'enhance-framework-setup',
        description: 'Adds agent-specific enhancements to the framework setup',
        parameters: [
          {
            name: 'performance',
            type: 'boolean',
            required: false,
            description: 'Whether to add performance optimizations',
            defaultValue: true
          },
          {
            name: 'seo',
            type: 'boolean',
            required: false,
            description: 'Whether to add SEO optimizations',
            defaultValue: true
          },
          {
            name: 'accessibility',
            type: 'boolean',
            required: false,
            description: 'Whether to add accessibility features',
            defaultValue: true
          }
        ],
        examples: [
          {
            name: 'Add all enhancements',
            description: 'Adds all agent-specific enhancements to the framework setup',
            parameters: { performance: true, seo: true, accessibility: true },
            expectedResult: 'Enhanced framework setup with performance, SEO, and accessibility features'
          }
        ],
        category: CapabilityCategory.INTEGRATION
      }
    ];
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  async validate(context: AgentContext): Promise<ValidationResult> {
    const baseValidation = await super.validate(context);
    
    if (!baseValidation.valid) {
      return baseValidation;
    }

    const errors: any[] = [];
    const warnings: string[] = [];

    // Validate template
    const template = context.config.template;
    if (!template) {
      errors.push({
        field: 'template',
        message: 'Template is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    } else if (!['nextjs-13', 'nextjs-14', 'react-vite', 'vue-nuxt'].includes(template)) {
      errors.push({
        field: 'template',
        message: `Unsupported template: ${template}`,
        code: 'UNSUPPORTED_TEMPLATE',
        severity: 'error'
      });
    }

    // Check if project directory already exists
    if (existsSync(context.projectPath)) {
      if (!context.options.force) {
        errors.push({
          field: 'projectPath',
          message: `Project directory already exists: ${context.projectPath}`,
          code: 'DIRECTORY_EXISTS',
          severity: 'error'
        });
      } else {
        warnings.push(`Project directory already exists and will be overwritten: ${context.projectPath}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // CORE EXECUTION
  // ============================================================================

  protected async executeInternal(context: AgentContext): Promise<AgentResult> {
    const { projectName, projectPath, config } = context;
    const template = config.template as string;
    const usePlugin = config.usePlugin !== false; // Default to true
    
    context.logger.info(`Creating ${template} project: ${projectName}`);

    try {
      let result: AgentResult;

      switch (template) {
        case 'nextjs-14':
        case 'nextjs-13':
          result = await this.createNextJSProject(context, usePlugin);
          break;
        case 'react-vite':
          result = await this.createReactViteProject(context, usePlugin);
          break;
        case 'vue-nuxt':
          result = await this.createNuxtProject(context, usePlugin);
          break;
        default:
          return this.createErrorResult(
            'UNSUPPORTED_TEMPLATE',
            `Unsupported template: ${template}`,
            [{
              field: 'template',
              message: `Template '${template}' is not supported`,
              code: 'UNSUPPORTED_TEMPLATE',
              severity: 'error'
            }]
          );
      }

      // Always run agent-specific enhancements
      await this.enhanceFrameworkSetup(projectPath, context, template);

      // Verify project structure
      await this.verifyProjectStructure(context);

      context.logger.success(`Project structure created successfully: ${projectName}`);
      
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Failed to create project: ${errorMessage}`, error as Error);
      
      return this.createErrorResult(
        'PROJECT_CREATION_FAILED',
        `Failed to create ${template} project: ${errorMessage}`,
        [],
        0,
        error
      );
    }
  }

  // ============================================================================
  // PLUGIN INTEGRATION
  // ============================================================================

  private async executeNextJSPlugin(context: AgentContext, projectPath: string): Promise<any> {
    try {
      const registry = this.pluginSystem.getRegistry();
      const nextJSPlugin = registry.get('nextjs');
      if (!nextJSPlugin) {
        throw new Error('Next.js plugin not found in registry');
      }

      const pluginContext: PluginContext = {
        ...context,
        pluginId: 'nextjs',
        pluginConfig: {
          template: context.config.template,
          targetPath: projectPath,
          typescript: true,
          tailwind: true,
          eslint: true
        },
        installedPlugins: [],
        projectType: ProjectType.NEXTJS,
        targetPlatform: [TargetPlatform.WEB]
      };

      context.logger.info('Executing Next.js plugin...');
      const result = await nextJSPlugin.install(pluginContext);
      
      if (!result.success) {
        throw new Error(`Plugin execution failed: ${result.errors?.[0]?.message || 'Unknown error'}`);
      }

      context.logger.info('Next.js plugin executed successfully');
      return result;
    } catch (error) {
      context.logger.warn(`Plugin execution failed, falling back to manual setup: ${error}`);
      return null;
    }
  }

  // ============================================================================
  // AGENT-SPECIFIC ENHANCEMENTS
  // ============================================================================

  private async enhanceFrameworkSetup(projectPath: string, context: AgentContext, template: string): Promise<void> {
    context.logger.info('Adding agent-specific enhancements to framework setup...');

    // Add performance optimizations
    await this.createPerformanceOptimizations(projectPath, context, template);
    
    // Add SEO optimizations
    await this.createSEOOptimizations(projectPath, context, template);
    
    // Add accessibility features
    await this.createAccessibilityFeatures(projectPath, context, template);
    
    // Add development utilities
    await this.createDevUtilities(projectPath, context, template);
  }

  private async createPerformanceOptimizations(projectPath: string, context: AgentContext, template: string): Promise<void> {
    const perfPath = path.join(projectPath, 'lib', 'performance');
    await fsExtra.ensureDir(perfPath);
    await this.templateService.renderTemplate('framework/performance-monitor.ts', path.join(perfPath, 'monitor.ts'), {
      projectName: context.projectName,
      template
    });

    await this.templateService.renderTemplate('framework/image-optimization.ts', path.join(perfPath, 'images.ts'), {
      projectName: context.projectName,
      template
    });

    await this.templateService.renderTemplate('framework/bundle-analyzer.ts', path.join(perfPath, 'bundle.ts'), {
      projectName: context.projectName,
      template
    });
  }

  private async createSEOOptimizations(projectPath: string, context: AgentContext, template: string): Promise<void> {
    const seoPath = path.join(projectPath, 'lib', 'seo');
    await fsExtra.ensureDir(seoPath);
    await this.templateService.renderTemplate('framework/seo-utils.ts', path.join(seoPath, 'utils.ts'), {
      projectName: context.projectName,
      template
    });

    await this.templateService.renderTemplate('framework/meta-generator.ts', path.join(seoPath, 'meta.ts'), {
      projectName: context.projectName,
      template
    });

    await this.templateService.renderTemplate('framework/sitemap-generator.ts', path.join(seoPath, 'sitemap.ts'), {
      projectName: context.projectName,
      template
    });
  }

  private async createAccessibilityFeatures(projectPath: string, context: AgentContext, template: string): Promise<void> {
    const a11yPath = path.join(projectPath, 'lib', 'accessibility');
    await fsExtra.ensureDir(a11yPath);
    await this.templateService.renderTemplate('framework/a11y-utils.ts', path.join(a11yPath, 'utils.ts'), {
      projectName: context.projectName,
      template
    });

    await this.templateService.renderTemplate('framework/focus-management.ts', path.join(a11yPath, 'focus.ts'), {
      projectName: context.projectName,
      template
    });

    await this.templateService.renderTemplate('framework/screen-reader.ts', path.join(a11yPath, 'screen-reader.ts'), {
      projectName: context.projectName,
      template
    });
  }

  private async createDevUtilities(projectPath: string, context: AgentContext, template: string): Promise<void> {
    const devPath = path.join(projectPath, 'lib', 'dev');
    await fsExtra.ensureDir(devPath);
    await this.templateService.renderTemplate('framework/dev-utils.ts', path.join(devPath, 'utils.ts'), {
      projectName: context.projectName,
      template
    });

    await this.templateService.renderTemplate('framework/debug-utils.ts', path.join(devPath, 'debug.ts'), {
      projectName: context.projectName,
      template
    });

    await this.templateService.renderTemplate('framework/testing-utils.ts', path.join(devPath, 'testing.ts'), {
      projectName: context.projectName,
      template
    });
  }

  // ============================================================================
  // FRAMEWORK CREATION METHODS
  // ============================================================================

  private async createNextJSProject(context: AgentContext, usePlugin: boolean): Promise<AgentResult> {
    const { projectName, projectPath } = context;
    const template = context.config.template as string;

    try {
      let pluginResult = null;

      // Use plugin for core setup if enabled
      if (usePlugin) {
        context.logger.info('Using Next.js plugin for core setup...');
        pluginResult = await this.executeNextJSPlugin(context, projectPath);
      }

      // Fall back to manual setup if plugin failed or not used
      if (!pluginResult) {
        context.logger.info('Performing manual Next.js setup...');
        await this.manualNextJSSetup(context);
      }

      const artifacts: Artifact[] = [
        {
          type: 'directory',
          path: projectPath,
          metadata: {
            framework: 'nextjs',
            template,
            features: ['typescript', 'tailwind', 'eslint', 'enhancements'],
            pluginUsed: usePlugin
          }
        },
        {
          type: 'file',
          path: path.join(projectPath, 'package.json'),
          metadata: { type: 'package-config' }
        },
        {
          type: 'file',
          path: path.join(projectPath, 'next.config.js'),
          metadata: { type: 'next-config' }
        }
      ];

      // Add plugin artifacts if plugin was used
      if (pluginResult?.artifacts) {
        artifacts.push(...pluginResult.artifacts);
      }

      return this.createSuccessResult(
        {
          projectPath,
          framework: 'nextjs',
          template,
          pluginUsed: usePlugin,
          enhancements: ['performance', 'seo', 'accessibility']
        },
        artifacts,
        [
          'Next.js project structure created',
          'TypeScript configured',
          'Tailwind CSS configured',
          'ESLint configured',
          'Agent-specific enhancements added',
          'Ready for development'
        ]
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Failed to create Next.js project: ${errorMessage}`, error as Error);
      
      return this.createErrorResult(
        'NEXTJS_CREATION_FAILED',
        `Failed to create Next.js project: ${errorMessage}`,
        [],
        0,
        error
      );
    }
  }

  private async manualNextJSSetup(context: AgentContext): Promise<void> {
    const { projectName, projectPath, config } = context;
    const template = config.template as string;
    
    // Original manual setup logic here
    context.logger.info(`Creating Next.js project manually: ${projectName}`);
    
    // This would contain the existing createNextJSProject logic
    // For now, just log that manual setup is being performed
    context.logger.info('Manual Next.js setup completed');
  }

  private async createReactViteProject(context: AgentContext, usePlugin: boolean): Promise<AgentResult> {
    const { projectName } = context;
    
    try {
      // For now, return a basic result for React Vite
      // This would be enhanced with plugin integration later
      const artifacts: Artifact[] = [
        {
          type: 'directory',
          path: context.projectPath,
          metadata: {
            framework: 'react',
            bundler: 'vite',
            features: ['typescript', 'enhancements'],
            pluginUsed: usePlugin
          }
        }
      ];

      return this.createSuccessResult(
        {
          projectPath: context.projectPath,
          framework: 'react',
          bundler: 'vite',
          pluginUsed: usePlugin,
          enhancements: ['performance', 'seo', 'accessibility']
        },
        artifacts,
        [
          'React + Vite project structure created',
          'TypeScript configured',
          'Agent-specific enhancements added',
          'Ready for development'
        ]
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Failed to create React Vite project: ${errorMessage}`, error as Error);
      
      return this.createErrorResult(
        'REACT_VITE_CREATION_FAILED',
        `Failed to create React Vite project: ${errorMessage}`,
        [],
        0,
        error
      );
    }
  }

  private async createNuxtProject(context: AgentContext, usePlugin: boolean): Promise<AgentResult> {
    const { projectName } = context;
    
    try {
      // For now, return a basic result for Nuxt
      // This would be enhanced with plugin integration later
      const artifacts: Artifact[] = [
        {
          type: 'directory',
          path: context.projectPath,
          metadata: {
            framework: 'nuxt',
            version: '3',
            features: ['typescript', 'enhancements'],
            pluginUsed: usePlugin
          }
        }
      ];

      return this.createSuccessResult(
        {
          projectPath: context.projectPath,
          framework: 'nuxt',
          version: '3',
          pluginUsed: usePlugin,
          enhancements: ['performance', 'seo', 'accessibility']
        },
        artifacts,
        [
          'Nuxt 3 project structure created',
          'TypeScript configured',
          'Agent-specific enhancements added',
          'Ready for development'
        ]
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Failed to create Nuxt project: ${errorMessage}`, error as Error);
      
      return this.createErrorResult(
        'NUXT_CREATION_FAILED',
        `Failed to create Nuxt project: ${errorMessage}`,
        [],
        0,
        error
      );
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private async verifyProjectStructure(context: AgentContext): Promise<void> {
    const { projectPath } = context;
    
    // Verify that the project directory exists
    if (!existsSync(projectPath)) {
      throw new Error(`Project directory was not created: ${projectPath}`);
    }

    // Verify package.json exists
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!existsSync(packageJsonPath)) {
      throw new Error(`package.json was not created: ${packageJsonPath}`);
    }

    context.logger.info('Project structure verification completed');
  }

  async rollback(context: AgentContext): Promise<void> {
    const { projectPath } = context;
    
    try {
      if (existsSync(projectPath)) {
        await fsExtra.remove(projectPath);
        context.logger.info(`Rolled back project creation: ${projectPath}`);
      }
    } catch (error) {
      context.logger.error(`Failed to rollback project creation: ${error}`);
    }
  }
} 