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
    
    context.logger.info(`Creating monorepo structure: ${projectName}`);

    try {
      // Start spinner for actual work
      await this.startSpinner(`🔧 Creating monorepo structure for ${projectName}...`, context);

      // Step 1: Create the base monorepo structure using base-architech templates
      await this.createBaseProjectStructure(context);

      // Step 2: Verify project structure
      await this.verifyProjectStructure(context);

      // Stop spinner and show success
      this.succeedSpinner(`✅ Monorepo structure created successfully: ${projectName}`);

      const artifacts: Artifact[] = [
        {
          type: 'directory',
          path: projectPath,
          metadata: {
            framework: template,
            features: ['monorepo', 'turborepo', 'typescript', 'packages'],
            structure: 'enterprise'
          }
        }
      ];

      return this.createSuccessResult(
        {
          projectPath,
          framework: template,
          structure: 'monorepo',
          packages: ['ui', 'db', 'auth', 'config']
        },
        artifacts,
        [
          'Monorepo structure created',
          'Turborepo configuration added',
          'Package structure initialized',
          'Ready for package-specific setup'
        ]
      );

    } catch (error) {
      // Stop spinner and show error
      this.failSpinner(`❌ Failed to create monorepo structure`);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Failed to create monorepo: ${errorMessage}`, error as Error);
      
      return this.createErrorResult(
        'PROJECT_CREATION_FAILED',
        `Failed to create monorepo structure: ${errorMessage}`,
        [],
        0,
        error
      );
    }
  }

  // ============================================================================
  // BASE PROJECT STRUCTURE CREATION
  // ============================================================================

  private async createBaseProjectStructure(context: AgentContext): Promise<void> {
    const { projectName, projectPath, packageManager } = context;
    
    context.logger.info('Creating base project structure using base-architech templates...');

    // Create project directory
    await fsExtra.ensureDir(projectPath);

    // Common template variables
    const templateVars = {
      projectName,
      packageManager: packageManager || 'npm',
      template: context.config.template || 'nextjs-14'
    };

    // Update spinner for file creation
    this.updateSpinner(`📁 Creating root configuration files...`);

    // Render root-level project files
    await this.templateService.renderAndWrite('base-architech', 'package.json.ejs', path.join(projectPath, 'package.json'), templateVars);
    await this.templateService.renderAndWrite('base-architech', 'tsconfig.json.ejs', path.join(projectPath, 'tsconfig.json'), templateVars);
    await this.templateService.renderAndWrite('base-architech', '.eslintrc.json.ejs', path.join(projectPath, '.eslintrc.json'), templateVars);
    await this.templateService.renderAndWrite('base-architech', '.prettierrc.json.ejs', path.join(projectPath, '.prettierrc.json'), templateVars);
    await this.templateService.renderAndWrite('base-architech', '.gitignore.ejs', path.join(projectPath, '.gitignore'), templateVars);
    await this.templateService.renderAndWrite('base-architech', 'README.md.ejs', path.join(projectPath, 'README.md'), templateVars);
    await this.templateService.renderAndWrite('base-architech', 'turbo.json.ejs', path.join(projectPath, 'turbo.json'), templateVars);

    // Update spinner for directory creation
    this.updateSpinner(`📂 Creating monorepo directory structure...`);

    // Create monorepo directory structure
    const monorepoDirs = [
      'apps',
      'apps/web',
      'apps/web/src',
      'apps/web/src/app',
      'apps/web/src/components',
      'apps/web/src/lib',
      'apps/web/public',
      'packages',
      'packages/ui',
      'packages/db',
      'packages/auth',
      'docs'
    ];

    for (const dir of monorepoDirs) {
      await fsExtra.ensureDir(path.join(projectPath, dir));
    }

    // Update spinner for web app files
    this.updateSpinner(`🌐 Creating Next.js web application...`);

    // Render apps/web files
    const webAppPath = path.join(projectPath, 'apps/web');
    await this.templateService.renderAndWrite('base-architech/apps/web', 'package.json.ejs', path.join(webAppPath, 'package.json'), templateVars);
    await this.templateService.renderAndWrite('base-architech/apps/web', 'tsconfig.json.ejs', path.join(webAppPath, 'tsconfig.json'), templateVars);
    await this.templateService.renderAndWrite('base-architech/apps/web', 'next.config.js.ejs', path.join(webAppPath, 'next.config.js'), templateVars);
    await this.templateService.renderAndWrite('base-architech/apps/web', 'tailwind.config.js.ejs', path.join(webAppPath, 'tailwind.config.js'), templateVars);
    await this.templateService.renderAndWrite('base-architech/apps/web', 'postcss.config.mjs.ejs', path.join(webAppPath, 'postcss.config.mjs'), templateVars);
    await this.templateService.renderAndWrite('base-architech/apps/web', 'next-env.d.ts.ejs', path.join(webAppPath, 'next-env.d.ts'), templateVars);
    await this.templateService.renderAndWrite('base-architech/apps/web', '.eslintrc.json.ejs', path.join(webAppPath, '.eslintrc.json'), templateVars);
    await this.templateService.renderAndWrite('base-architech/apps/web', '.gitignore.ejs', path.join(webAppPath, '.gitignore'), templateVars);
    await this.templateService.renderAndWrite('base-architech/apps/web', 'README.md.ejs', path.join(webAppPath, 'README.md'), templateVars);

    // Render apps/web/src/app files
    const appPath = path.join(webAppPath, 'src/app');
    await this.templateService.renderAndWrite('base-architech/apps/web/src/app', 'layout.tsx.ejs', path.join(appPath, 'layout.tsx'), templateVars);
    await this.templateService.renderAndWrite('base-architech/apps/web/src/app', 'page.tsx.ejs', path.join(appPath, 'page.tsx'), templateVars);
    await this.templateService.renderAndWrite('base-architech/apps/web/src/app', 'globals.css.ejs', path.join(appPath, 'globals.css'), templateVars);

    // Create components.json at root for Shadcn/ui
    await this.templateService.renderAndWrite('base-architech', 'components.json.ejs', path.join(projectPath, 'components.json'), templateVars);

    // Update spinner for package files
    this.updateSpinner(`📦 Creating package configurations...`);

    // Render packages structure
    const packages = ['ui', 'db', 'auth'];
    for (const pkg of packages) {
      const packagePath = path.join(projectPath, 'packages', pkg);
      
      // Define package-specific dependencies
      const packageDependencies = this.getPackageDependencies(pkg);
      
      await this.templateService.renderAndWrite('base-architech/packages', 'package.json.ejs', path.join(packagePath, 'package.json'), {
        ...templateVars,
        packageName: pkg,
        dependencies: packageDependencies
      });
      await this.templateService.renderAndWrite('base-architech/packages', 'tsconfig.json.ejs', path.join(packagePath, 'tsconfig.json'), templateVars);
      await this.templateService.renderAndWrite('base-architech/packages', 'index.ts.ejs', path.join(packagePath, 'index.ts'), {
        ...templateVars,
        packageName: pkg
      });
    }

    context.logger.info('Base monorepo structure created successfully');
  }

  private getPackageDependencies(packageName: string): Record<string, string> {
    switch (packageName) {
      case 'ui':
        return {
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
          'tailwindcss': '^3.4.0',
          'class-variance-authority': '^0.7.0',
          'clsx': '^2.0.0',
          'tailwind-merge': '^2.0.0'
        };
      case 'db':
        return {
          'drizzle-orm': '^0.29.0',
          'drizzle-kit': '^0.20.0',
          '@neondatabase/serverless': '^0.7.0'
        };
      case 'auth':
        return {
          'better-auth': '^0.5.0',
          '@better-auth/drizzle': '^0.5.0'
        };
      default:
        return {};
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