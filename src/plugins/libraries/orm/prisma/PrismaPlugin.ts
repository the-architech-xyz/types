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

import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIDatabasePlugin, UnifiedInterfaceTemplate, ValidationResult, ValidationError } from '../../../../types/plugins.js';
import { TemplateService, templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../../../core/project/structure-service.js';
import { PrismaSchema } from './PrismaSchema.js';
import { PrismaGenerator } from './PrismaGenerator.js';

export class PrismaPlugin extends BasePlugin implements IUIDatabasePlugin {
  private generator: PrismaGenerator;

  constructor() {
    super();
    this.generator = new PrismaGenerator();
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
      await this.installPrismaDependencies(context);

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
            content: Object.entries(this.generator.generateEnvConfig(pluginConfig as any))
              .map(([key, value]) => `${key}=${value}`)
              .join('\n'),
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
        [error],
        startTime
      );
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      context.logger.info('Uninstalling Prisma ORM...');

      // Remove Prisma files
      const prismaDir = path.join(projectPath, 'prisma');
      const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
      
      if (await fsExtra.pathExists(prismaDir)) {
        await fsExtra.remove(prismaDir);
      }
      
      if (await fsExtra.pathExists(dbLibDir)) {
        await fsExtra.remove(dbLibDir);
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
        'Failed to uninstall Prisma ORM',
        [error],
        startTime
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      context.logger.info('Updating Prisma ORM...');

      // Regenerate Prisma Client
      await this.runner.execCommand(['npx', 'prisma', 'generate'], { cwd: projectPath });

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
        [error],
        startTime
      );
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    
    try {
      const { projectPath } = context;
      
      // Validate Prisma schema
      await this.runner.execCommand(['npx', 'prisma', 'validate'], { cwd: projectPath });
      
    } catch (error) {
      errors.push({
        field: 'prisma.schema',
        message: `Prisma schema validation failed: ${error}`,
        code: 'VALIDATION_FAILED',
        severity: 'error'
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  getCompatibility(): any {
    return {
      frameworks: ['nextjs', 'react', 'vue', 'angular', 'express', 'fastify'],
      platforms: ['web', 'node'],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      databases: ['postgresql', 'mysql', 'sqlite', 'sqlserver', 'mongodb'],
      conflicts: []
    };
  }

  getDependencies(): string[] {
    return ['@prisma/client'];
  }

  getConflicts(): string[] {
    return ['drizzle-orm', 'typeorm', 'sequelize'];
  }

  getRequirements(): any[] {
    return [
      {
        type: 'package',
        name: 'prisma',
        description: 'Prisma CLI for development',
        version: '^5.0.0',
        optional: false
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      provider: 'postgresql',
      databaseUrl: 'postgresql://user:password@localhost:5432/myapp',
      enableMigrations: true,
      enableSeeding: true,
      enablePrismaStudio: true,
      enableLogging: true
    };
  }

  getConfigSchema(): any {
    return PrismaSchema.getParameterSchema();
  }

  // ============================================================================
  // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getParameterSchema(): any {
    return PrismaSchema.getParameterSchema();
  }

  getDynamicQuestions(context: PluginContext): any[] {
    return []; // Plugins NEVER generate questions
  }

  validateConfiguration(config: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Validate required fields
    if (!config.provider) {
      errors.push({
        field: 'provider',
        message: 'Database provider is required',
        code: 'MISSING_PROVIDER',
        severity: 'error'
      });
    }
    
    if (!config.databaseUrl) {
      errors.push({
        field: 'databaseUrl',
        message: 'Database URL is required',
        code: 'MISSING_DATABASE_URL',
        severity: 'error'
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return {
      category: PluginCategory.ORM,
      exports: [
        {
          name: 'createClient',
          type: 'function',
          implementation: 'PrismaClient',
          documentation: 'Create a new Prisma client instance',
          parameters: [],
          returnType: 'PrismaClient',
          examples: []
        },
        {
          name: 'getClient',
          type: 'function',
          implementation: 'PrismaClient',
          documentation: 'Get the global Prisma client instance',
          parameters: [],
          returnType: 'PrismaClient',
          examples: []
        }
      ],
      types: [
        {
          name: 'PrismaConfig',
          type: 'interface',
          definition: 'interface PrismaConfig { provider: string; databaseUrl: string; }',
          documentation: 'Configuration for Prisma ORM',
          properties: []
        },
        {
          name: 'DatabaseProvider',
          type: 'enum',
          definition: 'enum DatabaseProvider { POSTGRESQL, MYSQL, SQLITE, SQLSERVER, MONGODB }',
          documentation: 'Supported database providers',
          properties: []
        }
      ],
      utilities: [],
      constants: [
        {
          name: 'PRISMA_CLIENT_VERSION',
          value: '5.0.0',
          documentation: 'Current Prisma client version',
          type: 'string'
        },
        {
          name: 'SUPPORTED_PROVIDERS',
          value: ['postgresql', 'mysql', 'sqlite', 'sqlserver', 'mongodb'],
          documentation: 'List of supported database providers',
          type: 'array'
        }
      ],
      documentation: 'Prisma ORM unified interface for database operations'
    };
  }

  // ============================================================================
  // IUIDatabasePlugin INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getDatabaseProviders(): string[] {
    return [
      'postgresql',
      'mysql',
      'sqlite',
      'sqlserver',
      'mongodb',
      'cockroachdb'
    ];
  }

  getORMOptions(): string[] {
    return [
      'prisma-client',
      'prisma-migrate',
      'prisma-studio',
      'prisma-seed',
      'prisma-introspect'
    ];
  }

  getDatabaseFeatures(): string[] {
    return [
      'type-safe-queries',
      'migrations',
      'schema-introspection',
      'studio-gui',
      'seeding',
      'connection-pooling',
      'transactions',
      'relations'
    ];
  }

  getConnectionOptions(): string[] {
    return [
      'connection-string',
      'connection-pool',
      'ssl',
      'timeout',
      'max-connections'
    ];
  }

  getProviderLabel(provider: string): string {
    const labels: Record<string, string> = {
      'postgresql': 'PostgreSQL',
      'mysql': 'MySQL',
      'sqlite': 'SQLite',
      'sqlserver': 'SQL Server',
      'mongodb': 'MongoDB',
      'cockroachdb': 'CockroachDB'
    };
    return labels[provider] || provider;
  }

  getProviderDescription(provider: string): string {
    const descriptions: Record<string, string> = {
      'postgresql': 'Advanced open-source relational database',
      'mysql': 'Popular open-source relational database',
      'sqlite': 'Lightweight, serverless database',
      'sqlserver': 'Microsoft SQL Server database',
      'mongodb': 'NoSQL document database',
      'cockroachdb': 'Distributed SQL database'
    };
    return descriptions[provider] || 'Database provider';
  }

  getFeatureLabel(feature: string): string {
    const labels: Record<string, string> = {
      'type-safe-queries': 'Type-Safe Queries',
      'migrations': 'Database Migrations',
      'schema-introspection': 'Schema Introspection',
      'studio-gui': 'Prisma Studio GUI',
      'seeding': 'Database Seeding',
      'connection-pooling': 'Connection Pooling',
      'transactions': 'Database Transactions',
      'relations': 'Data Relations'
    };
    return labels[feature] || feature;
  }

  getFeatureDescription(feature: string): string {
    const descriptions: Record<string, string> = {
      'type-safe-queries': 'Compile-time type checking for database queries',
      'migrations': 'Version-controlled database schema changes',
      'schema-introspection': 'Generate schema from existing database',
      'studio-gui': 'Visual database browser and editor',
      'seeding': 'Populate database with initial data',
      'connection-pooling': 'Efficient database connection management',
      'transactions': 'ACID-compliant database operations',
      'relations': 'Define relationships between data models'
    };
    return descriptions[feature] || 'Database feature';
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async installPrismaDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing Prisma dependencies...');

    // Install Prisma CLI and Client
    await this.runner.execCommand(['npm', 'install', 'prisma', '@prisma/client'], { cwd: projectPath });
  }

  private async initializePrismaConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Initializing Prisma configuration...');

    // Create prisma directory
    const prismaDir = path.join(projectPath, 'prisma');
    await fsExtra.ensureDir(prismaDir);

    // Generate Prisma schema
    const schemaContent = this.generator.generatePrismaSchema(pluginConfig as any);
    await fsExtra.writeFile(
      path.join(prismaDir, 'schema.prisma'),
      schemaContent.content
    );

    // Generate seed file if enabled
    if (pluginConfig.enableSeeding) {
      const seedContent = this.generator.generateSeedFile();
      await fsExtra.writeFile(
        path.join(prismaDir, 'seed.ts'),
        seedContent.content
      );
    }
  }

  private async createDatabaseFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating database files...');

    // Create database library directory
    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Generate Prisma Client wrapper
    const clientContent = this.generator.generatePrismaClient();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'client.ts'),
      clientContent.content
    );

    // Generate database utilities
    const utilsContent = this.generator.generateDatabaseUtils();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'utils.ts'),
      utilsContent.content
    );
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Generating unified interface files...');

    // Create database library directory
    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Generate unified database interface
    const unifiedContent = this.generator.generateUnifiedIndex();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'index.ts'),
      unifiedContent.content
    );
  }

  private async setupPrismaStudio(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Setting up Prisma Studio...');

    // Generate Prisma Client
    await this.runner.execCommand(['npx', 'prisma', 'generate'], { cwd: projectPath });
  }
} 