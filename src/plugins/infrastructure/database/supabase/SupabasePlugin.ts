/**
 * Supabase Database Provider Plugin - Pure Technology Implementation
 * 
 * Provides Supabase PostgreSQL database infrastructure setup.
 * Focuses only on database technology setup and artifact generation.
 * Authentication functionality is handled by separate auth plugins.
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugins.js';
import { TemplateService, templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import { ValidationError } from '../../../../types/agents.js';

import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../../../core/project/structure-service.js';
import { SupabaseConfig, SupabaseConfigSchema, SupabaseDefaultConfig } from './SupabaseSchema.js';
import { SupabaseGenerator } from './SupabaseGenerator.js';

export class SupabasePlugin implements IPlugin {
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
      id: 'supabase',
      name: 'Supabase Database',
      version: '1.0.0',
      description: 'Open-source Firebase alternative with PostgreSQL database infrastructure',
      author: 'The Architech Team',
      category: PluginCategory.DATABASE,
      tags: ['database', 'postgresql', 'realtime', 'edge-functions', 'storage', 'supabase', 'firebase-alternative'],
      license: 'Apache-2.0',
      repository: 'https://github.com/supabase/supabase',
      homepage: 'https://supabase.com',
      documentation: 'https://supabase.com/docs'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectName, projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Supabase database infrastructure...');

      // Step 1: Install dependencies
      await this.installDependencies(context);

      // Step 2: Initialize Supabase configuration
      await this.initializeSupabaseConfig(context);

      // Step 3: Create database connection and utilities
      await this.createDatabaseFiles(context);

      // Step 4: Generate unified interface files
      await this.generateUnifiedInterfaceFiles(context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'db', 'supabase.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'db', 'types.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'db', 'index.ts')
          }
        ],
        dependencies: [
          {
            name: '@supabase/supabase-js',
            version: '^2.39.0',
            type: 'production',
            category: PluginCategory.DATABASE
          },
          {
            name: '@supabase/auth-helpers-nextjs',
            version: '^0.8.7',
            type: 'production',
            category: PluginCategory.DATABASE
          },
          {
            name: '@supabase/auth-helpers-react',
            version: '^0.4.2',
            type: 'production',
            category: PluginCategory.DATABASE
          }
        ],
        scripts: [
          {
            name: 'db:connect',
            command: 'node -e "require(\'./src/lib/db/supabase.js\').checkDatabaseConnection()"',
            description: 'Test database connection',
            category: 'dev'
          },
          {
            name: 'db:health',
            command: 'node -e "require(\'./src/lib/db/supabase.js\').healthCheck()"',
            description: 'Check database health',
            category: 'dev'
          },
          {
            name: 'db:generate-types',
            command: 'npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/db/types.ts',
            description: 'Generate TypeScript types',
            category: 'dev'
          },
          {
            name: 'db:migrate',
            command: 'npx supabase db push',
            description: 'Run database migrations',
            category: 'dev'
          },
          {
            name: 'db:studio',
            command: 'npx supabase studio',
            description: 'Open Supabase Studio',
            category: 'dev'
          },
          {
            name: 'db:backup',
            command: 'npx supabase db dump',
            description: 'Create database backup',
            category: 'dev'
          }
        ],
        configs: [
          {
            file: '.env',
            content: SupabaseGenerator.generateEnvConfig(pluginConfig as SupabaseConfig),
            mergeStrategy: 'append'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to install Supabase database',
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
      
      context.logger.info('Uninstalling Supabase database...');

      // Remove Supabase dependencies
      await this.runner.execCommand(['npm', 'uninstall', '@supabase/supabase-js', '@supabase/auth-helpers-nextjs', '@supabase/auth-helpers-react'], { cwd: projectPath });

      // Remove database files
      const filesToRemove = [
        path.join(projectPath, 'src', 'lib', 'db', 'supabase.ts'),
        path.join(projectPath, 'src', 'lib', 'db', 'types.ts'),
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
        warnings: ['Supabase database files removed. You may need to manually remove dependencies from package.json'],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall Supabase database',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Updating Supabase database...');

      // Update Supabase dependencies
      await this.runner.execCommand(['npm', 'update', '@supabase/supabase-js', '@supabase/auth-helpers-nextjs', '@supabase/auth-helpers-react']);

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
        'Failed to update Supabase database',
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
      // Check if Supabase client is properly configured
      const supabasePath = path.join(context.projectPath, 'src', 'lib', 'db', 'supabase.ts');
      if (!await fsExtra.pathExists(supabasePath)) {
        errors.push({
          field: 'supabase.client',
          message: 'Supabase client configuration file not found',
          code: 'MISSING_CLIENT',
          severity: 'error'
        });
      }

      // Validate environment variables
      const envPath = path.join(context.projectPath, '.env');
      if (await fsExtra.pathExists(envPath)) {
        const envContent = await fsExtra.readFile(envPath, 'utf-8');
        if (!envContent.includes('SUPABASE_URL')) {
          warnings.push('SUPABASE_URL not found in .env file');
        }
        if (!envContent.includes('SUPABASE_ANON_KEY')) {
          warnings.push('SUPABASE_ANON_KEY not found in .env file');
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
      databases: ['postgresql'],
      conflicts: []
    };
  }

  getDependencies(): string[] {
    return ['@supabase/supabase-js', '@supabase/auth-helpers-nextjs', '@supabase/auth-helpers-react'];
  }

  getConflicts(): string[] {
    return [];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: '@supabase/supabase-js',
        description: 'Supabase JavaScript client',
        version: '^2.39.0'
      },
      {
        type: 'package',
        name: '@supabase/auth-helpers-nextjs',
        description: 'Supabase auth helpers for Next.js',
        version: '^0.8.7'
      },
      {
        type: 'package',
        name: '@supabase/auth-helpers-react',
        description: 'Supabase auth helpers for React',
        version: '^0.4.2'
      },
      {
        type: 'config',
        name: 'SUPABASE_URL',
        description: 'Supabase project URL',
        optional: false
      },
      {
        type: 'config',
        name: 'SUPABASE_ANON_KEY',
        description: 'Supabase anonymous key',
        optional: false
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return SupabaseDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return SupabaseConfigSchema;
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing Supabase dependencies...');

    const dependencies = [
      '@supabase/supabase-js@^2.39.0',
      '@supabase/auth-helpers-nextjs@^0.8.7',
      '@supabase/auth-helpers-react@^0.4.2'
    ];

    await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
  }

  private async initializeSupabaseConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Initializing Supabase configuration...');

    // Create database lib directory
    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Generate Supabase client configuration
    const clientContent = SupabaseGenerator.generateSupabaseClient(pluginConfig as SupabaseConfig);
    await fsExtra.writeFile(
      path.join(dbLibDir, 'supabase.ts'),
      clientContent
    );

    // Generate database types
    const typesContent = SupabaseGenerator.generateTypes();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'types.ts'),
      typesContent
    );
  }

  private async createDatabaseFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating database connection files...');

    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Generate database client
    const clientContent = SupabaseGenerator.generateDatabaseClient();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'client.ts'),
      clientContent
    );
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Generating unified interface files...');

    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Generate unified database interface
    const unifiedContent = SupabaseGenerator.generateUnifiedIndex();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'index.ts'),
      unifiedContent
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
          code: 'SUPABASE_INSTALL_ERROR',
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