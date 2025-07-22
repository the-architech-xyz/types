/**
 * Mongoose ORM Plugin - Updated with Latest Best Practices
 * 
 * Provides Mongoose ODM integration with MongoDB database providers.
 * Follows latest Mongoose documentation and TypeScript best practices.
 * 
 * References:
 * - https://mongoosejs.com/docs/typescript.html
 * - https://mongoosejs.com/docs/plugins.html
 * - https://mongoosejs.com/docs/schematypes.html
 * - https://mongoosejs.com/docs/middleware.html
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
import { MongooseConfig, MongooseConfigSchema, MongooseDefaultConfig } from './MongooseSchema.js';
import { MongooseGenerator } from './MongooseGenerator.js';

export class MongoosePlugin implements IPlugin {
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
      id: 'mongoose',
      name: 'Mongoose ODM',
      version: '8.0.0',
      description: 'Elegant MongoDB object modeling for Node.js with TypeScript support',
      author: 'The Architech Team',
      category: PluginCategory.ORM,
      tags: ['database', 'orm', 'odm', 'typescript', 'mongodb', 'mongoose', 'schema', 'validation'],
      license: 'MIT',
      repository: 'https://github.com/Automattic/mongoose',
      homepage: 'https://mongoosejs.com',
      documentation: 'https://mongoosejs.com/docs'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectName, projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Mongoose ODM with latest features...');

      // Step 1: Install dependencies
      await this.installDependencies(context);

      // Step 2: Initialize Mongoose configuration
      await this.initializeMongooseConfig(context);

      // Step 3: Create database models and connection
      await this.createDatabaseFiles(context);

      // Step 4: Generate unified interface files
      await this.generateUnifiedInterfaceFiles(context);

      // Step 5: Create plugins and middleware
      if (pluginConfig.enablePlugins) {
        await this.createPluginsAndMiddleware(context);
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'db', 'index.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'db', 'models', 'user.model.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'db', 'connection.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'db', 'plugins', 'index.ts')
          }
        ],
        dependencies: [
          {
            name: 'mongoose',
            version: '^8.0.0',
            type: 'production',
            category: PluginCategory.ORM
          },
          {
            name: '@types/mongoose',
            version: '^5.11.97',
            type: 'development',
            category: PluginCategory.ORM
          }
        ],
        scripts: [
          {
            name: 'db:generate-types',
            command: 'npx mongoose-schema-generator --uri $DATABASE_URL --output src/lib/db/types.ts',
            description: 'Generate Mongoose TypeScript types',
            category: 'dev'
          },
          {
            name: 'db:validate-schemas',
            command: 'npx tsx src/lib/db/validate-schemas.ts',
            description: 'Validate Mongoose schemas',
            category: 'dev'
          }
        ],
        configs: [
          {
            file: '.env',
            content: MongooseGenerator.generateEnvConfig(pluginConfig as MongooseConfig),
            mergeStrategy: 'append'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to install Mongoose ODM',
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
      
      context.logger.info('Uninstalling Mongoose ODM...');

      // Remove Mongoose files
      const filesToRemove = [
        path.join(projectPath, 'src', 'lib', 'db', 'models'),
        path.join(projectPath, 'src', 'lib', 'db', 'plugins'),
        path.join(projectPath, 'src', 'lib', 'db', 'connection.ts'),
        path.join(projectPath, 'src', 'lib', 'db', 'client.ts'),
        path.join(projectPath, 'src', 'lib', 'db', 'schema.ts')
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
        warnings: ['Mongoose files removed. You may need to manually remove dependencies from package.json'],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall Mongoose ODM',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Updating Mongoose ODM...');

      // Update dependencies
      await this.runner.execCommand(['npm', 'update', 'mongoose', '@types/mongoose']);

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
        'Failed to update Mongoose ODM',
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
      // Check if Mongoose connection exists
      const connectionPath = path.join(context.projectPath, 'src', 'lib', 'db', 'connection.ts');
      if (!await fsExtra.pathExists(connectionPath)) {
        errors.push({
          field: 'mongoose.connection',
          message: 'Mongoose connection file not found',
          code: 'MISSING_CONNECTION',
          severity: 'error'
        });
      }

      // Check if models directory exists
      const modelsPath = path.join(context.projectPath, 'src', 'lib', 'db', 'models');
      if (!await fsExtra.pathExists(modelsPath)) {
        errors.push({
          field: 'mongoose.models',
          message: 'Mongoose models directory not found',
          code: 'MISSING_MODELS',
          severity: 'error'
        });
      }

      // Validate environment variables
      const envPath = path.join(context.projectPath, '.env');
      if (await fsExtra.pathExists(envPath)) {
        const envContent = await fsExtra.readFile(envPath, 'utf-8');
        if (!envContent.includes('MONGODB_URI')) {
          warnings.push('MONGODB_URI not found in .env file');
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
      frameworks: ['nextjs', 'react', 'vue', 'angular', 'express', 'fastify'],
      platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: ['mongodb'],
      conflicts: ['drizzle', 'prisma', 'typeorm']
    };
  }

  getDependencies(): string[] {
    return ['mongoose', '@types/mongoose'];
  }

  getConflicts(): string[] {
    return ['drizzle', 'prisma', 'typeorm'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'mongoose',
        description: 'Mongoose ODM for MongoDB',
        version: '^8.0.0'
      },
      {
        type: 'package',
        name: '@types/mongoose',
        description: 'TypeScript types for Mongoose',
        version: '^5.11.97'
      },
      {
        type: 'config',
        name: 'MONGODB_URI',
        description: 'MongoDB connection URI',
        optional: false
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return MongooseDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return MongooseConfigSchema;
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing Mongoose dependencies...');

    const dependencies = [
      'mongoose@^8.0.0',
      '@types/mongoose@^5.11.97'
    ];

    await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
  }

  private async initializeMongooseConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Initializing Mongoose configuration...');

    // Create database lib directory
    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Create models directory
    const modelsDir = path.join(dbLibDir, 'models');
    await fsExtra.ensureDir(modelsDir);

    // Generate Mongoose connection
    const connectionContent = MongooseGenerator.generateMongooseConnection(pluginConfig as MongooseConfig);
    await fsExtra.writeFile(
      path.join(dbLibDir, 'connection.ts'),
      connectionContent
    );

    // Generate User model with latest patterns
    const userModelContent = MongooseGenerator.generateUserModel(pluginConfig as MongooseConfig);
    await fsExtra.writeFile(
      path.join(modelsDir, 'user.model.ts'),
      userModelContent
    );
  }

  private async createDatabaseFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating database files...');

    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Generate database client
    const clientContent = MongooseGenerator.generateDatabaseClient();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'client.ts'),
      clientContent
    );

    // Generate schema types
    const schemaContent = MongooseGenerator.generateSchemaTypes();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'schema.ts'),
      schemaContent
    );
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Generating unified interface files...');

    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Generate unified database interface
    const unifiedContent = MongooseGenerator.generateUnifiedIndex();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'index.ts'),
      unifiedContent
    );
  }

  private async createPluginsAndMiddleware(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating Mongoose plugins and middleware...');

    const pluginsDir = path.join(projectPath, 'src', 'lib', 'db', 'plugins');
    await fsExtra.ensureDir(pluginsDir);

    // Generate plugins index
    const pluginsIndexContent = MongooseGenerator.generatePluginsIndex();
    await fsExtra.writeFile(
      path.join(pluginsDir, 'index.ts'),
      pluginsIndexContent
    );

    // Generate timestamp plugin
    const timestampPluginContent = MongooseGenerator.generateTimestampPlugin();
    await fsExtra.writeFile(
      path.join(pluginsDir, 'timestamp.plugin.ts'),
      timestampPluginContent
    );

    // Generate soft delete plugin
    const softDeletePluginContent = MongooseGenerator.generateSoftDeletePlugin();
    await fsExtra.writeFile(
      path.join(pluginsDir, 'soft-delete.plugin.ts'),
      softDeletePluginContent
    );
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
          code: 'MONGOOSE_INSTALL_ERROR',
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