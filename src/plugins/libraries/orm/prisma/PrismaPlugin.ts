/**
 * Prisma ORM Plugin - Updated with Latest Best Practices
 * 
 * Provides Prisma ORM integration with multiple database providers.
 * Follows latest Prisma documentation and TypeScript best practices.
 * 
 * References:
 * - https://www.prisma.io/docs/getting-started
 * - https://www.prisma.io/docs/concepts/components/prisma-schema
 * - https://www.prisma.io/docs/concepts/components/prisma-client
 * - https://www.prisma.io/docs/guides/performance-and-optimization
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugin.js';
import { TemplateService, templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import { ValidationError } from '../../../../types/agent.js';
import { 
  ORM_LIBRARIES,
  ORMLibrary
} from '../../../../types/shared-config.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../../../core/project/structure-service.js';
import { PrismaConfig, PrismaConfigSchema, PrismaDefaultConfig } from './PrismaSchema.js';
import { PrismaGenerator } from './PrismaGenerator.js';

export class PrismaPlugin implements IPlugin {
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
      id: 'prisma',
      name: 'Prisma ORM',
      version: '5.0.0',
      description: 'Next-generation ORM for Node.js and TypeScript',
      author: 'The Architech Team',
      category: PluginCategory.ORM,
      tags: ['database', 'orm', 'typescript', 'prisma', 'schema', 'migrations', 'studio'],
      license: 'MIT',
      repository: 'https://github.com/prisma/prisma',
      homepage: 'https://www.prisma.io',
      documentation: 'https://www.prisma.io/docs'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectName, projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Prisma ORM with latest features...');

      // Step 1: Install dependencies
      await this.installDependencies(context);

      // Step 2: Initialize Prisma configuration
      await this.initializePrismaConfig(context);

      // Step 3: Create database schema and client
      await this.createDatabaseFiles(context);

      // Step 4: Generate unified interface files
      await this.generateUnifiedInterfaceFiles(context);

      // Step 5: Setup Prisma Studio and tools
      if (pluginConfig.enablePrismaStudio) {
        await this.setupPrismaStudio(context);
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'file',
            path: path.join(projectPath, 'prisma', 'schema.prisma')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'db', 'index.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'db', 'client.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'prisma', 'seed.ts')
          }
        ],
        dependencies: [
          {
            name: 'prisma',
            version: '^5.0.0',
            type: 'development',
            category: PluginCategory.ORM
          },
          {
            name: '@prisma/client',
            version: '^5.0.0',
            type: 'production',
            category: PluginCategory.ORM
          }
        ],
        scripts: [
          {
            name: 'db:generate',
            command: 'npx prisma generate',
            description: 'Generate Prisma Client',
            category: 'dev'
          },
          {
            name: 'db:push',
            command: 'npx prisma db push',
            description: 'Push schema to database',
            category: 'dev'
          },
          {
            name: 'db:migrate',
            command: 'npx prisma migrate dev',
            description: 'Create and apply migrations',
            category: 'dev'
          },
          {
            name: 'db:studio',
            command: 'npx prisma studio',
            description: 'Open Prisma Studio',
            category: 'dev'
          },
          {
            name: 'db:seed',
            command: 'npx tsx prisma/seed.ts',
            description: 'Seed database',
            category: 'dev'
          },
          {
            name: 'db:format',
            command: 'npx prisma format',
            description: 'Format Prisma schema',
            category: 'dev'
          },
          {
            name: 'db:validate',
            command: 'npx prisma validate',
            description: 'Validate Prisma schema',
            category: 'dev'
          },
          {
            name: 'db:introspect',
            command: 'npx prisma db pull',
            description: 'Introspect database',
            category: 'dev'
          }
        ],
        configs: [
          {
            file: '.env',
            content: PrismaGenerator.generateEnvConfig(pluginConfig as PrismaConfig),
            mergeStrategy: 'append'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to install Prisma ORM',
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
      
      context.logger.info('Uninstalling Prisma ORM...');

      // Remove Prisma files
      const filesToRemove = [
        path.join(projectPath, 'prisma'),
        path.join(projectPath, 'src', 'lib', 'db', 'client.ts'),
        path.join(projectPath, 'src', 'lib', 'db', 'index.ts')
      ];

      for (const file of filesToRemove) {
        if (await fsExtra.pathExists(file)) {
          await fsExtra.remove(file);
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: ['Prisma files removed. You may need to manually remove dependencies from package.json'],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall Prisma ORM',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Updating Prisma ORM...');

      // Update dependencies
      await this.runner.execCommand(['npm', 'update', 'prisma', '@prisma/client']);

      // Regenerate Prisma Client
      await this.runner.execCommand(['npx', 'prisma', 'generate']);

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
        'Failed to update Prisma ORM',
        startTime,
        [],
        error
      );
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      // Check if Prisma schema exists
      const schemaPath = path.join(context.projectPath, 'prisma', 'schema.prisma');
      if (!await fsExtra.pathExists(schemaPath)) {
        errors.push({
          field: 'prisma.schema',
          message: 'Prisma schema file not found',
          code: 'MISSING_SCHEMA',
          severity: 'error'
        });
      }

      // Check if Prisma Client exists
      const clientPath = path.join(context.projectPath, 'src', 'lib', 'db', 'client.ts');
      if (!await fsExtra.pathExists(clientPath)) {
        errors.push({
          field: 'prisma.client',
          message: 'Prisma Client file not found',
          code: 'MISSING_CLIENT',
          severity: 'error'
        });
      }

      // Validate environment variables
      const envPath = path.join(context.projectPath, '.env');
      if (await fsExtra.pathExists(envPath)) {
        const envContent = await fsExtra.readFile(envPath, 'utf-8');
        if (!envContent.includes('DATABASE_URL')) {
          warnings.push('DATABASE_URL not found in .env file');
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: 'validation',
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        }],
        warnings: []
      };
    }
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['nextjs', 'react', 'vue', 'angular', 'express', 'fastify', 'nest'],
      platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: ['postgresql', 'mysql', 'sqlite', 'sqlserver', 'mongodb'],
      conflicts: ['drizzle', 'typeorm', 'mongoose']
    };
  }

  getDependencies(): string[] {
    return ['prisma', '@prisma/client'];
  }

  getConflicts(): string[] {
    return ['drizzle', 'typeorm', 'mongoose'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'prisma',
        description: 'Prisma CLI and tools',
        version: '^5.0.0'
      },
      {
        type: 'package',
        name: '@prisma/client',
        description: 'Prisma Client for database access',
        version: '^5.0.0'
      },
      {
        type: 'config',
        name: 'DATABASE_URL',
        description: 'Database connection URL',
        optional: false
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return PrismaDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return PrismaConfigSchema;
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing Prisma dependencies...');

    const dependencies = [
      'prisma@^5.0.0',
      '@prisma/client@^5.0.0'
    ];

    await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
  }

  private async initializePrismaConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Initializing Prisma configuration...');

    // Create prisma directory
    const prismaDir = path.join(projectPath, 'prisma');
    await fsExtra.ensureDir(prismaDir);

    // Generate Prisma schema
    const schemaContent = PrismaGenerator.generatePrismaSchema(pluginConfig as PrismaConfig);
    await fsExtra.writeFile(
      path.join(prismaDir, 'schema.prisma'),
      schemaContent
    );

    // Generate seed file
    const seedContent = PrismaGenerator.generateSeedFile();
    await fsExtra.writeFile(
      path.join(prismaDir, 'seed.ts'),
      seedContent
    );
  }

  private async createDatabaseFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating database files...');

    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Generate Prisma Client
    const clientContent = PrismaGenerator.generatePrismaClient();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'client.ts'),
      clientContent
    );

    // Generate database utilities
    const utilsContent = PrismaGenerator.generateDatabaseUtils();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'utils.ts'),
      utilsContent
    );
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Generating unified interface files...');

    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Generate unified database interface
    const unifiedContent = PrismaGenerator.generateUnifiedIndex();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'index.ts'),
      unifiedContent
    );
  }

  private async setupPrismaStudio(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Setting up Prisma Studio...');

    // Generate Prisma Client
    await this.runner.execCommand(['npx', 'prisma', 'generate'], { cwd: projectPath });
  }

  private createErrorResult(
    message: string,
    startTime: number,
    errors: any[] = [],
    originalError?: any
  ): PluginResult {
    const duration = Date.now() - startTime;
    
    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors: [
        {
          code: 'PRISMA_INSTALL_ERROR',
          message,
          details: originalError,
          severity: 'error'
        },
        ...errors
      ],
      warnings: [],
      duration
    };
  }
} 