/**
 * Neon Database Provider Plugin - Pure Infrastructure Implementation
 * 
 * Provides Neon PostgreSQL database infrastructure setup.
 * Focuses only on database connection and configuration.
 * ORM functionality is handled by separate ORM plugins.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugins.js';
import { TemplateService, templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import { ValidationError } from '../../../../types/agents.js';
import { DATABASE_PROVIDERS, ORM_LIBRARIES } from '../../../../types/core.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../../../core/project/structure-service.js';
import { NeonConfig, NeonConfigSchema, NeonDefaultConfig } from './NeonSchema.js';
import { NeonGenerator } from './NeonGenerator.js';

export class NeonPlugin implements IPlugin {
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
      id: 'neon',
      name: 'Neon Database',
      version: '1.0.0',
      description: 'Serverless PostgreSQL with branching and autoscaling',
      author: 'The Architech Team',
      category: PluginCategory.DATABASE,
      tags: ['database', 'postgresql', 'serverless', 'neon', 'infrastructure'],
      license: 'MIT',
      repository: 'https://github.com/neondatabase/neon',
      homepage: 'https://neon.tech',
      documentation: 'https://neon.tech/docs'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Infrastructure Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath, pluginConfig } = context;
      
      context.logger.info('Setting up Neon PostgreSQL database...');

      // Step 1: Install Neon CLI (optional, for management)
      await this.installNeonCLI(context);

      // Step 2: Create database configuration
      await this.createDatabaseConfig(context);

      // Step 3: Add environment configuration
      await this.addEnvironmentConfig(context);

      // Step 4: Generate unified interface files
      await this.generateUnifiedInterfaceFiles(context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'database', 'neon.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'neon.config.ts')
          }
        ],
        dependencies: [
          {
            name: '@neondatabase/serverless',
            version: '^1.0.1',
            type: 'production',
            category: PluginCategory.DATABASE
          },
          {
            name: 'pg',
            version: '^8.11.0',
            type: 'production',
            category: PluginCategory.DATABASE
          },
          {
            name: '@types/pg',
            version: '^8.10.0',
            type: 'development',
            category: PluginCategory.DATABASE
          }
        ],
        scripts: [
          {
            name: 'db:connect',
            command: 'node -e "require(\'./src/lib/database/neon.js\').databaseConnection.connect()"',
            description: 'Test database connection',
            category: 'custom'
          },
          {
            name: 'db:health',
            command: 'node -e "require(\'./src/lib/database/neon.js\').databaseConnection.healthCheck()"',
            description: 'Check database health',
            category: 'custom'
          },
          {
            name: 'db:migrate',
            command: 'drizzle-kit push',
            description: 'Run database migrations',
            category: 'custom'
          },
          {
            name: 'db:studio',
            command: 'drizzle-kit studio',
            description: 'Open Drizzle Studio',
            category: 'custom'
          },
          {
            name: 'db:generate',
            command: 'drizzle-kit generate',
            description: 'Generate migration files',
            category: 'custom'
          },
          {
            name: 'db:backup',
            command: 'node scripts/backup.js',
            description: 'Create database backup',
            category: 'custom'
          }
        ],
        configs: [
          {
            file: 'neon.config.ts',
            content: NeonGenerator.generateNeonConfig(pluginConfig as NeonConfig),
            mergeStrategy: 'replace'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult(
        'Failed to install Neon database',
        startTime,
        [],
        error
      );
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      context.logger.info('Uninstalling Neon database...');

      // Remove Neon dependencies
      await this.runner.execCommand(['npm', 'uninstall', '@neondatabase/serverless', 'pg', '@types/pg'], { cwd: projectPath });

      // Remove configuration files
      const configPath = path.join(projectPath, 'neon.config.ts');
      if (await fsExtra.pathExists(configPath)) {
        await fsExtra.remove(configPath);
      }

      // Remove database files
      const dbPath = path.join(projectPath, 'src', 'lib', 'database', 'neon.ts');
      if (await fsExtra.pathExists(dbPath)) {
        await fsExtra.remove(dbPath);
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall Neon database',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      context.logger.info('Updating Neon database...');

      // Update Neon dependencies
      await this.runner.execCommand(['npm', 'update', '@neondatabase/serverless', 'pg', '@types/pg'], { cwd: projectPath });

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult(
        'Failed to update Neon database',
        startTime,
        [],
        error
      );
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: string[] = [];

    try {
      const { projectPath } = context;

      // Check if package.json exists
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!await fsExtra.pathExists(packageJsonPath)) {
        errors.push({
          code: 'MISSING_PACKAGE_JSON',
          message: 'package.json not found in project directory',
          severity: 'error'
        });
      }

      // Check if it's a Node.js project
      const packageJson = await fsExtra.readJson(packageJsonPath);
      if (!packageJson.dependencies && !packageJson.devDependencies) {
        errors.push({
          code: 'NOT_NODE_PROJECT',
          message: 'Neon requires a Node.js project',
          severity: 'error'
        });
      }

      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion?.slice(1).split('.')[0] || '16');
      if (majorVersion < 16) {
        errors.push({
          code: 'NODE_VERSION_TOO_OLD',
          message: 'Node.js 16 or higher is required for Neon',
          severity: 'error'
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });

      return {
        valid: false,
        errors,
        warnings
      };
    }
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['nextjs', 'react', 'node', 'express', 'fastify'],
      platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: [],
      uiLibraries: [],
      conflicts: ['supabase', 'mongodb', 'mysql', 'sqlite'] // Conflicts with other database providers
    };
  }

  getDependencies(): string[] {
    return ['node'];
  }

  getConflicts(): string[] {
    return ['supabase', 'mongodb', 'mysql', 'sqlite'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'binary',
        name: 'node',
        description: 'Node.js 16 or higher',
        version: '>=16.0.0'
      },
      {
        type: 'package',
        name: 'package.json',
        description: 'Valid package.json file',
        version: 'any'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return NeonDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return NeonConfigSchema;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async installNeonCLI(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing Neon CLI...');

    // Install Neon CLI globally (optional)
    try {
      await this.runner.execCommand(['npm', 'install', '-g', '@neondatabase/cli'], { cwd: projectPath });
    } catch (error) {
      context.logger.warn('Failed to install Neon CLI globally. You can install it manually with: npm install -g @neondatabase/cli');
    }
  }

  private async createDatabaseConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating Neon database configuration...');

    const configContent = NeonGenerator.generateNeonConfig(pluginConfig as NeonConfig);
    await fsExtra.writeFile(path.join(projectPath, 'neon.config.ts'), configContent);
  }

  private async addEnvironmentConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Adding environment configuration...');

    const envContent = NeonGenerator.generateEnvConfig(pluginConfig as NeonConfig);
    const envPath = path.join(projectPath, '.env.local');
    
    // Append to existing .env.local or create new
    let existingContent = '';
    if (await fsExtra.pathExists(envPath)) {
      existingContent = await fsExtra.readFile(envPath, 'utf-8');
    }
    
    const fullContent = existingContent + '\n' + envContent;
    await fsExtra.writeFile(envPath, fullContent);
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Generating unified interface files...');

    // Create database lib directory
    const dbLibDir = path.join(projectPath, 'src', 'lib', 'database');
    await fsExtra.ensureDir(dbLibDir);

    // Generate Neon connection file
    const connectionContent = NeonGenerator.generateNeonConnection(pluginConfig as NeonConfig);
    await fsExtra.writeFile(path.join(dbLibDir, 'neon.ts'), connectionContent);
  }

  private createErrorResult(
    message: string,
    startTime: number,
    errors: any[] = [],
    originalError?: any
  ): PluginResult {
    const duration = Date.now() - startTime;
    
    if (originalError) {
      errors.push({
        code: 'NEON_INSTALL_ERROR',
        message: originalError instanceof Error ? originalError.message : String(originalError),
        severity: 'error',
        details: originalError
      });
    }

    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors,
      warnings: [],
      duration
    };
  }
} 