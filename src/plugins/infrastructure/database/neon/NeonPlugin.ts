/**
 * Neon Database Provider Plugin - Pure Infrastructure Implementation
 * 
 * Provides Neon PostgreSQL database infrastructure setup.
 * Focuses only on database connection and configuration.
 * ORM functionality is handled by separate ORM plugins.
 */

import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIDatabasePlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
import { ValidationResult, ValidationError } from '../../../../types/agents.js';
import { NeonConfig, NeonConfigSchema, NeonDefaultConfig } from './NeonSchema.js';
import { NeonGenerator } from './NeonGenerator.js';

export class NeonPlugin extends BasePlugin implements IUIDatabasePlugin {
  private generator!: NeonGenerator;

  constructor() {
    super();
    // Generator will be initialized in install method when pathResolver is available
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
  // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getParameterSchema() {
    return {
      category: PluginCategory.DATABASE,
      groups: [
        { id: 'connection', name: 'Connection Settings', description: 'Configure Neon database connection.', order: 1, parameters: ['connectionString', 'host', 'port', 'username', 'password', 'database'] },
        { id: 'features', name: 'Features', description: 'Enable Neon features.', order: 2, parameters: ['enableBranching', 'enableAutoscaling', 'enableServerless'] },
        { id: 'performance', name: 'Performance', description: 'Configure performance settings.', order: 3, parameters: ['connectionPoolSize', 'connectionTimeout', 'queryTimeout'] }
      ],
      parameters: [
        {
          id: 'connectionString',
          name: 'Connection String',
          type: 'string' as const,
          description: 'Neon database connection string',
          required: true,
          group: 'connection'
        },
        {
          id: 'host',
          name: 'Host',
          type: 'string' as const,
          description: 'Neon database host',
          required: false,
          group: 'connection'
        },
        {
          id: 'port',
          name: 'Port',
          type: 'number' as const,
          description: 'Database port',
          required: false,
          default: 5432,
          group: 'connection'
        },
        {
          id: 'username',
          name: 'Username',
          type: 'string' as const,
          description: 'Database username',
          required: false,
          group: 'connection'
        },
        {
          id: 'password',
          name: 'Password',
          type: 'string' as const,
          description: 'Database password',
          required: false,
          group: 'connection'
        },
        {
          id: 'database',
          name: 'Database Name',
          type: 'string' as const,
          description: 'Database name',
          required: false,
          group: 'connection'
        },
        {
          id: 'enableBranching',
          name: 'Enable Branching',
          type: 'boolean' as const,
          description: 'Enable database branching',
          required: false,
          default: true,
          group: 'features'
        },
        {
          id: 'enableAutoscaling',
          name: 'Enable Autoscaling',
          type: 'boolean' as const,
          description: 'Enable automatic scaling',
          required: false,
          default: true,
          group: 'features'
        },
        {
          id: 'enableServerless',
          name: 'Enable Serverless',
          type: 'boolean' as const,
          description: 'Enable serverless mode',
          required: false,
          default: true,
          group: 'features'
        },
        {
          id: 'connectionPoolSize',
          name: 'Connection Pool Size',
          type: 'number' as const,
          description: 'Connection pool size',
          required: false,
          default: 10,
          group: 'performance'
        },
        {
          id: 'connectionTimeout',
          name: 'Connection Timeout',
          type: 'number' as const,
          description: 'Connection timeout in milliseconds',
          required: false,
          default: 10000,
          group: 'performance'
        },
        {
          id: 'queryTimeout',
          name: 'Query Timeout',
          type: 'number' as const,
          description: 'Query timeout in milliseconds',
          required: false,
          default: 30000,
          group: 'performance'
        }
      ],
      dependencies: [],
      validations: []
    };
  }

  // Plugins NEVER generate questions - agents handle this
  getDynamicQuestions(context: PluginContext): any[] {
    return [];
  }

  validateConfiguration(config: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.connectionString && !config.host) {
      errors.push({
        field: 'connectionString',
        message: 'Either connection string or host is required',
        code: 'MISSING_FIELD',
        severity: 'error'
      });
    }

    // URL validation
    if (config.connectionString && !config.connectionString.includes('neon.tech')) {
      warnings.push('Connection string should be from Neon (neon.tech)');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return {
      category: PluginCategory.DATABASE,
      exports: [
        {
          name: 'neon',
          type: 'class',
          implementation: 'Neon database client',
          documentation: 'Main Neon database client for PostgreSQL operations'
        },
        {
          name: 'db',
          type: 'constant',
          implementation: 'Database connection utilities',
          documentation: 'Database connection and utility functions'
        },
        {
          name: 'config',
          type: 'constant',
          implementation: 'Database configuration',
          documentation: 'Neon database configuration'
        }
      ],
      types: [],
      utilities: [],
      constants: [],
      documentation: 'Neon serverless PostgreSQL database integration'
    };
  }

  // ============================================================================
  // IUIDatabasePlugin INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getDatabaseProviders(): string[] {
    return ['neon'];
  }

  getORMOptions(): string[] {
    return ['drizzle', 'prisma', 'kysely'];
  }

  getDatabaseFeatures(): string[] {
    return ['branching', 'autoscaling', 'serverless', 'connection-pooling'];
  }

  getConnectionOptions(): string[] {
    return ['direct', 'pooled', 'serverless'];
  }

  getProviderLabel(provider: string): string {
    return 'Neon';
  }

  getProviderDescription(provider: string): string {
    return 'Serverless PostgreSQL with branching and autoscaling';
  }

  getFeatureLabel(feature: string): string {
    const labels: Record<string, string> = {
      'branching': 'Database Branching',
      'autoscaling': 'Auto Scaling',
      'serverless': 'Serverless Mode',
      'connection-pooling': 'Connection Pooling'
    };
    return labels[feature] || feature;
  }

  getFeatureDescription(feature: string): string {
    const descriptions: Record<string, string> = {
      'branching': 'Create and manage database branches for development',
      'autoscaling': 'Automatic scaling based on demand',
      'serverless': 'Serverless PostgreSQL with pay-per-use pricing',
      'connection-pooling': 'Efficient connection management'
    };
    return descriptions[feature] || feature;
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectName, projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Neon database infrastructure...');

      // Initialize path resolver
      this.initializePathResolver(context);
      
      // Initialize generator
      this.generator = new NeonGenerator();

      // Validate configuration
      const validation = this.validateConfiguration(pluginConfig);
      if (!validation.valid) {
        return this.createErrorResult('Invalid Neon configuration', validation.errors, startTime);
      }

      // Step 1: Install dependencies
      await this.installDependencies(['@neondatabase/serverless', 'pg']);

      // Step 2: Generate files using the generator
      const neonConfig = NeonGenerator.generateNeonConfig(pluginConfig as any);
      const envConfig = NeonGenerator.generateEnvConfig(pluginConfig as any);
      
      // Step 3: Write files to project
      await this.generateFile('src/lib/database/neon.ts', neonConfig);
      await this.generateFile('.env.local', envConfig);
      await this.generateFile('src/lib/database/index.ts', `export * from './neon.js';`);

      const duration = Date.now() - startTime;

      return this.createSuccessResult(
        [
          { type: 'file' as const, path: 'src/lib/database/neon.ts' },
          { type: 'file' as const, path: 'neon.config.ts' },
          { type: 'file' as const, path: 'src/lib/database/index.ts' }
        ],
        [
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
          }
        ],
        [],
        [],
        validation.warnings,
        startTime
      );

    } catch (error) {
      return this.createErrorResult(
        'Failed to install Neon database infrastructure',
        [],
        startTime
      );
    }
  }

  // ============================================================================
  // PLUGIN INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getDependencies(): string[] {
    return ['@neondatabase/serverless', 'pg'];
  }

  getDevDependencies(): string[] {
    return ['@neondatabase/cli'];
  }

  getCompatibility(): any {
    return {
      frameworks: ['nextjs', 'react', 'vue', 'svelte'],
      platforms: ['web', 'mobile'],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      databases: ['postgresql'],
      conflicts: []
    };
  }

  getConflicts(): string[] {
    return [];
  }

  getRequirements(): any[] {
    return [
      {
        type: 'package',
        name: '@neondatabase/serverless',
        description: 'Neon serverless driver',
        version: '^1.0.1'
      },
      {
        type: 'service',
        name: 'neon-project',
        description: 'Neon PostgreSQL project'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      connectionString: '',
      host: '',
      port: 5432,
      username: '',
      password: '',
      database: '',
      enableBranching: true,
      enableAutoscaling: true,
      enableServerless: true,
      connectionPoolSize: 10,
      connectionTimeout: 10000,
      queryTimeout: 30000
    };
  }

  getConfigSchema(): any {
    return NeonConfigSchema;
  }
} 