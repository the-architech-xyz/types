/**
 * Next.js Framework Plugin - Pure Technology Implementation
 * 
 * Provides Next.js framework integration using the official create-next-app CLI.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../types/plugin.js';
import { TemplateService, templateService } from '../../utils/template-service.js';
import { CommandRunner } from '../../utils/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';

export class NextJSPlugin implements IPlugin {
  private templateService: TemplateService;
  private runner: CommandRunner;

  constructor() {
    this.templateService = templateService;
    this.runner = new CommandRunner();
  }

  // ============================================================================
  // PLUGIN METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'nextjs',
      name: 'Next.js Framework',
      version: '1.0.0',
      description: 'React framework for production with App Router, Server Components, and TypeScript',
      author: 'The Architech Team',
      category: PluginCategory.FRAMEWORK,
      tags: ['react', 'nextjs', 'typescript', 'app-router', 'server-components'],
      license: 'MIT',
      repository: 'https://github.com/vercel/next.js',
      homepage: 'https://nextjs.org'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectName, projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Next.js framework using create-next-app CLI...');

      // Step 0: Handle existing directory based on project structure
      const isMonorepo = context.projectStructure?.type === 'monorepo';
      
      if (await fsExtra.pathExists(projectPath)) {
        if (isMonorepo) {
          // For monorepo, clean up but preserve monorepo files
          context.logger.info(`Directory ${projectPath} exists, cleaning up for fresh installation...`);
          const contents = await fsExtra.readdir(projectPath);
          const allowedFiles = ['.architech.json', 'package.json', 'README.md', 'turbo.json'];
          
          // Remove any files that aren't monorepo configuration files
          for (const item of contents) {
            if (!allowedFiles.includes(item)) {
              const itemPath = path.join(projectPath, item);
              await fsExtra.remove(itemPath);
            }
          }
        } else {
          // For single-app, we need to handle this differently
          context.logger.info(`Directory ${projectPath} exists for single-app, using temporary directory approach...`);
          
          // Create Next.js project in a temporary directory with a different name
          const tempDir = path.join(path.dirname(projectPath), `${projectName}-temp-${Date.now()}`);
          const tempProjectName = 'temp-nextjs-app'; // Use a different name to avoid conflicts
          const cliArgs = this.buildCreateNextAppArgs({ ...pluginConfig, projectName: tempProjectName });
          const parentDir = path.dirname(tempDir);
          
          // Create Next.js project in temp directory
          await this.runner.execCommand(
            [...this.runner.getCreateCommand(), ...cliArgs],
            { cwd: parentDir }
          );
          
          // Move contents from temp to target directory, preserving .architech.json
          const architechConfigPath = path.join(projectPath, '.architech.json');
          const hasArchitechConfig = await fsExtra.pathExists(architechConfigPath);
          let architechConfig = null;
          
          if (hasArchitechConfig) {
            architechConfig = await fsExtra.readJSON(architechConfigPath);
          }
          
          // Remove target directory contents except .architech.json
          const targetContents = await fsExtra.readdir(projectPath);
          for (const item of targetContents) {
            if (item !== '.architech.json') {
              const itemPath = path.join(projectPath, item);
              await fsExtra.remove(itemPath);
            }
          }
          
          // Move Next.js project contents to target directory
          const tempProjectPath = path.join(tempDir, tempProjectName);
          if (await fsExtra.pathExists(tempProjectPath)) {
            const tempContents = await fsExtra.readdir(tempProjectPath);
            for (const item of tempContents) {
              const sourcePath = path.join(tempProjectPath, item);
              const targetPath = path.join(projectPath, item);
              await fsExtra.move(sourcePath, targetPath);
            }
          }
          
          // Restore .architech.json if it existed
          if (hasArchitechConfig && architechConfig) {
            await fsExtra.writeJSON(architechConfigPath, architechConfig, { spaces: 2 });
          }
          
          // Clean up temp directory
          await fsExtra.remove(tempDir);
          
          // Continue with customization
          await this.customizeProject(context);
          await this.addEnhancements(context);
          
          const duration = Date.now() - startTime;
          
          return {
            success: true,
            artifacts: [
              {
                type: 'directory',
                path: projectPath
              }
            ],
            dependencies: [
        {
          name: 'next',
                version: '^15.4.2',
          type: 'production',
          category: PluginCategory.FRAMEWORK
        },
        {
          name: 'react',
                version: '^19.1.0',
          type: 'production',
          category: PluginCategory.FRAMEWORK
        },
        {
          name: 'react-dom',
                version: '^19.1.0',
          type: 'production',
          category: PluginCategory.FRAMEWORK
        },
        {
                name: 'typescript',
                version: '^5.8.3',
          type: 'development',
          category: PluginCategory.FRAMEWORK
        },
        {
          name: '@types/node',
          version: '^20.0.0',
          type: 'development',
          category: PluginCategory.FRAMEWORK
        },
        {
                name: '@types/react',
                version: '^19.0.0',
                type: 'development',
                category: PluginCategory.FRAMEWORK
              },
              {
                name: '@types/react-dom',
                version: '^19.0.0',
          type: 'development',
          category: PluginCategory.FRAMEWORK
        },
        {
          name: 'eslint',
                version: '^9.0.0',
          type: 'development',
          category: PluginCategory.FRAMEWORK
        },
        {
          name: 'eslint-config-next',
                version: '^15.4.2',
          type: 'development',
          category: PluginCategory.FRAMEWORK
        }
            ],
            scripts: [
        {
          name: 'dev',
          command: 'next dev',
          description: 'Start development server',
          category: 'dev'
        },
        {
          name: 'build',
          command: 'next build',
          description: 'Build for production',
          category: 'build'
        },
        {
          name: 'start',
          command: 'next start',
          description: 'Start production server',
          category: 'deploy'
        },
        {
          name: 'lint',
          command: 'next lint',
          description: 'Run ESLint',
          category: 'dev'
        },
        {
          name: 'type-check',
          command: 'tsc --noEmit',
          description: 'Run TypeScript type checking',
          category: 'dev'
        }
            ],
            configs: [],
            errors: [],
            warnings: [],
            duration
          };
        }
      }

      // Step 1: Use official create-next-app CLI (for monorepo or fresh directory)
      const cliArgs = this.buildCreateNextAppArgs(pluginConfig);
      const parentDir = path.dirname(projectPath);
      
      // Use execCommand with the proper create command
      await this.runner.execCommand(
        [...this.runner.getCreateCommand(), ...cliArgs],
        { cwd: parentDir }
      );

      // Step 2: Customize generated project
      await this.customizeProject(context);

      // Step 3: Add project-specific enhancements
      await this.addEnhancements(context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'directory',
            path: projectPath
          }
        ],
        dependencies: [
          {
            name: 'next',
            version: '^15.4.2',
            type: 'production',
            category: PluginCategory.FRAMEWORK
          },
          {
            name: 'react',
            version: '^19.1.0',
            type: 'production',
            category: PluginCategory.FRAMEWORK
          },
          {
            name: 'react-dom',
            version: '^19.1.0',
            type: 'production',
            category: PluginCategory.FRAMEWORK
          },
          {
            name: 'typescript',
            version: '^5.8.3',
            type: 'development',
            category: PluginCategory.FRAMEWORK
          },
          {
            name: '@types/node',
            version: '^20.0.0',
            type: 'development',
            category: PluginCategory.FRAMEWORK
          },
          {
            name: '@types/react',
            version: '^19.0.0',
            type: 'development',
            category: PluginCategory.FRAMEWORK
          },
          {
            name: '@types/react-dom',
            version: '^19.0.0',
            type: 'development',
            category: PluginCategory.FRAMEWORK
          },
          {
            name: 'eslint',
            version: '^9.0.0',
            type: 'development',
            category: PluginCategory.FRAMEWORK
          },
          {
            name: 'eslint-config-next',
            version: '^15.4.2',
            type: 'development',
            category: PluginCategory.FRAMEWORK
          }
        ],
        scripts: [
          {
            name: 'dev',
            command: 'next dev',
            description: 'Start development server',
            category: 'dev'
          },
          {
            name: 'build',
            command: 'next build',
            description: 'Build for production',
            category: 'build'
          },
          {
            name: 'start',
            command: 'next start',
            description: 'Start production server',
            category: 'deploy'
          },
          {
            name: 'lint',
            command: 'next lint',
            description: 'Run ESLint',
            category: 'dev'
          },
          {
            name: 'type-check',
            command: 'tsc --noEmit',
            description: 'Run TypeScript type checking',
            category: 'dev'
          }
        ],
        configs: [],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(
        `Failed to setup Next.js: ${errorMessage}`,
        startTime,
        [],
        error
      );
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      // Remove Next.js specific files
      const filesToRemove = [
        'next.config.js',
        'next.config.ts',
        'tsconfig.json',
        'eslint.config.mjs',
        'eslint.config.js',
        'src/app',
        'src/pages',
        'src/styles',
        'next-env.d.ts'
      ];

      for (const file of filesToRemove) {
        const filePath = path.join(context.projectPath, file);
        if (await fsExtra.pathExists(filePath)) {
          await fsExtra.remove(filePath);
        }
      }

      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: [],
        duration: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(
        `Failed to uninstall Next.js: ${errorMessage}`,
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
      return this.install(context);
  }

  // ============================================================================
  // VALIDATION & COMPATIBILITY
  // ============================================================================

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: string[] = [];

    // For framework plugins that create projects, check if directory exists
    if (await fsExtra.pathExists(context.projectPath)) {
      // In monorepo scenarios, the directory might exist but be empty
      // Check if it's empty or only contains expected monorepo files
      const contents = await fsExtra.readdir(context.projectPath);
      const allowedFiles = ['.architech.json', 'package.json', 'README.md', 'turbo.json'];
      const hasOnlyAllowedFiles = contents.every(item => allowedFiles.includes(item));
      
      if (!hasOnlyAllowedFiles) {
        errors.push({
          field: 'projectPath',
          message: `Project directory already exists and contains files: ${context.projectPath}`,
          code: 'DIRECTORY_EXISTS',
          severity: 'error'
        });
      } else {
        // Directory exists but is empty or only has monorepo config files
        warnings.push(`Directory ${context.projectPath} exists but appears to be empty or contain only monorepo configuration files. Proceeding with installation.`);
      }
    }

    // Check parent directory exists and is writable
    const parentDir = path.dirname(context.projectPath);
    if (!await fsExtra.pathExists(parentDir)) {
      errors.push({
        field: 'projectPath',
        message: `Parent directory does not exist: ${parentDir}`,
        code: 'PARENT_DIRECTORY_NOT_FOUND',
        severity: 'error'
      });
    }

    // Validate project name
    if (!context.pluginConfig?.projectName) {
        errors.push({
        field: 'projectName',
        message: 'Project name is required',
        code: 'PROJECT_NAME_REQUIRED',
          severity: 'error'
        });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['react'],
      platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
      nodeVersions: ['18.0.0', '20.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      conflicts: ['vue', 'angular', 'svelte']
    };
  }

  getDependencies(): string[] {
    return [];
  }

  getConflicts(): string[] {
    return ['vue', 'angular', 'svelte'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'next',
        version: '^15.0.0',
        description: 'Next.js framework'
      },
      {
        type: 'package',
        name: 'react',
        version: '^19.0.0',
        description: 'React library'
      },
      {
        type: 'package',
        name: 'react-dom',
        version: '^19.0.0',
        description: 'React DOM'
      },
      {
        type: 'package',
        name: 'typescript',
        version: '^5.0.0',
        description: 'TypeScript support'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      typescript: true,
      tailwind: true,
      eslint: true,
      appRouter: true,
      srcDir: true,
      importAlias: '@/*',
      skipInstall: true
    };
  }

  getConfigSchema(): ConfigSchema {
    return {
      type: 'object',
      properties: {
        typescript: {
          type: 'boolean',
          description: 'Initialize as TypeScript project',
          default: true
        },
        tailwind: {
          type: 'boolean',
          description: 'Initialize with Tailwind CSS',
          default: true
        },
        eslint: {
          type: 'boolean',
          description: 'Initialize with ESLint',
          default: true
        },
        appRouter: {
          type: 'boolean',
          description: 'Use App Router (recommended)',
          default: true
        },
        srcDir: {
          type: 'boolean',
          description: 'Initialize inside src/ directory',
          default: true
        },
        importAlias: {
          type: 'string',
          description: 'Import alias prefix',
          default: '@/*'
        },
        skipInstall: {
          type: 'boolean',
          description: 'Skip dependency installation',
          default: true
        }
      }
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private buildCreateNextAppArgs(config: Record<string, any>): string[] {
    const args = [config.projectName || 'my-app'];

    // Add flags based on configuration
    if (config.typescript !== false) {
      args.push('--typescript');
    } else {
      args.push('--javascript');
    }

    if (config.tailwind !== false) {
      args.push('--tailwind');
    }

    if (config.eslint !== false) {
      args.push('--eslint');
    }

    if (config.appRouter !== false) {
      args.push('--app');
    }

    if (config.srcDir !== false) {
      args.push('--src-dir');
    }

    if (config.importAlias) {
      args.push('--import-alias', config.importAlias);
    }

    if (config.skipInstall !== false) {
      args.push('--skip-install');
    }

    // Always use yes to skip prompts
    args.push('--yes');

    return args;
  }

  private async customizeProject(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    // Add custom configurations if needed
    if (pluginConfig.customConfig) {
      await this.addCustomConfigurations(projectPath, pluginConfig);
    }
  }

  private async addEnhancements(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    // Add any project-specific enhancements
    // This could include custom scripts, configurations, etc.
  }

  private async addCustomConfigurations(projectPath: string, config: Record<string, any>): Promise<void> {
    // Add any custom configurations that aren't provided by create-next-app
    // This is where we can add project-specific customizations
  }

  private createErrorResult(
    message: string,
    startTime: number,
    errors: any[] = [],
    originalError?: any
  ): PluginResult {
    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors: [
        {
          code: 'NEXTJS_SETUP_FAILED',
          message,
          details: originalError,
          severity: 'error'
        },
        ...errors
      ],
      warnings: [],
      duration: Date.now() - startTime
    };
  }
} 