/**
 * DB Agent - Database Package Generator
 * 
 * Sets up the packages/db database layer with:
 * - Drizzle ORM configuration
 * - Neon PostgreSQL integration
 * - Database schema definitions
 * - Migration scripts and utilities
 * 
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */

import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { TemplateService, templateService } from '../utils/template-service.js';
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

// Dynamic import for inquirer
let inquirerModule: any = null;
async function getInquirer() {
  if (!inquirerModule) {
    inquirerModule = await import('inquirer');
  }
  return inquirerModule.default;
}

interface DatabaseConfig {
  provider: 'neon' | 'local' | 'vercel';
  connectionString: string;
}

export class DBAgent extends AbstractAgent {
  private templateService: TemplateService;

  constructor() {
    super();
    this.templateService = templateService;
  }

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'DBAgent',
      version: '1.0.0',
      description: 'Sets up the database package with Drizzle ORM and PostgreSQL',
      author: 'The Architech Team',
      category: AgentCategory.DATABASE,
      tags: ['database', 'drizzle', 'postgresql', 'neon', 'orm'],
      dependencies: ['BaseProjectAgent'],
      conflicts: [],
      requirements: [
        {
          type: 'package',
          name: 'drizzle-orm',
          description: 'Drizzle ORM for database operations'
        },
        {
          type: 'package',
          name: '@neondatabase/serverless',
          description: 'Neon PostgreSQL serverless driver'
        },
        {
          type: 'file',
          name: 'packages/db',
          description: 'Database package directory'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/the-architech/cli'
    };
  }

  protected getAgentCapabilities(): AgentCapability[] {
    return [
      {
        name: 'setup-database',
        description: 'Creates a complete database setup with Drizzle ORM',
        parameters: [
          {
            name: 'provider',
            type: 'string',
            required: false,
            description: 'Database provider (neon, local, vercel)',
            defaultValue: 'neon',
            validation: [
              {
                type: 'enum',
                value: ['neon', 'local', 'vercel'],
                message: 'Provider must be neon, local, or vercel'
              }
            ]
          },
          {
            name: 'connectionString',
            type: 'string',
            required: false,
            description: 'Database connection string',
            defaultValue: ''
          }
        ],
        examples: [
          {
            name: 'Setup Neon PostgreSQL',
            description: 'Creates database setup with Neon PostgreSQL',
            parameters: { provider: 'neon' },
            expectedResult: 'Complete database package with Drizzle ORM'
          },
          {
            name: 'Setup local PostgreSQL',
            description: 'Creates database setup with local PostgreSQL',
            parameters: { provider: 'local', connectionString: 'postgresql://localhost:5432/myapp' },
            expectedResult: 'Database package configured for local development'
          }
        ],
        category: CapabilityCategory.SETUP
      },
      {
        name: 'generate-migrations',
        description: 'Generates database migrations using Drizzle Kit',
        parameters: [],
        examples: [
          {
            name: 'Generate migrations',
            description: 'Creates migration files for schema changes',
            parameters: {},
            expectedResult: 'Migration files generated in migrations directory'
          }
        ],
        category: CapabilityCategory.GENERATION
      }
    ];
  }

  // ============================================================================
  // CORE EXECUTION
  // ============================================================================

  protected async executeInternal(context: AgentContext): Promise<AgentResult> {
    const { projectName, projectPath } = context;
    const dbPackagePath = path.join(projectPath, 'packages', 'db');
    
    context.logger.info(`Setting up database package: ${projectName}/packages/db`);

    try {
      // Get database configuration
      const dbConfig = await this.getDatabaseConfig(context);
      
      // Update package.json with dependencies
      await this.updatePackageJson(dbPackagePath, context);
      
      // Create ESLint config
      await this.createESLintConfig(dbPackagePath);
      
      // Create Drizzle configuration
      await this.createDrizzleConfig(dbPackagePath, dbConfig);
      
      // Create database schema
      await this.createDatabaseSchema(dbPackagePath);
      
      // Create database connection
      await this.createDatabaseConnection(dbPackagePath);
      
      // Create migration utilities
      await this.createMigrationUtils(dbPackagePath);
      
      // Create environment configuration
      await this.createEnvConfig(projectPath, dbConfig);

      const artifacts: Artifact[] = [
        {
          type: 'directory',
          path: dbPackagePath,
          metadata: {
            package: 'db',
            orm: 'drizzle',
            database: dbConfig.provider,
            features: ['orm', 'migrations', 'schema']
          }
        },
        {
          type: 'file',
          path: path.join(dbPackagePath, 'package.json'),
          metadata: { type: 'package-config' }
        },
        {
          type: 'file',
          path: path.join(dbPackagePath, 'drizzle.config.ts'),
          metadata: { type: 'drizzle-config' }
        },
        {
          type: 'file',
          path: path.join(dbPackagePath, 'schema/index.ts'),
          metadata: { type: 'database-schema' }
        }
      ];

      context.logger.success(`Database package configured successfully`);
      
      // Display setup instructions
      this.displayDatabaseSetupInstructions(dbConfig);
      
      return this.createSuccessResult(
        { 
          dbPackagePath,
          provider: dbConfig.provider,
          connectionString: dbConfig.connectionString
        },
        artifacts,
        [
          'Database package structure created',
          'Drizzle ORM configured',
          'Schema definitions created',
          'Migration utilities ready',
          'Environment variables configured'
        ]
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Failed to configure database package: ${errorMessage}`, error as Error);
      
      return this.createErrorResult(
        'DB_PACKAGE_SETUP_FAILED',
        `Failed to configure database package: ${errorMessage}`,
        [],
        0,
        error
      );
    }
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

    // Check if DB package directory exists
    const dbPackagePath = path.join(context.projectPath, 'packages', 'db');
    if (!existsSync(dbPackagePath)) {
      errors.push({
        field: 'dbPackagePath',
        message: `Database package directory does not exist: ${dbPackagePath}`,
        code: 'DIRECTORY_NOT_FOUND',
        severity: 'error'
      });
    }

    // Check if project has packages structure (monorepo)
    const packagesPath = path.join(context.projectPath, 'packages');
    if (!existsSync(packagesPath)) {
      warnings.push('Packages directory not found - this agent is designed for monorepo structures');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // DATABASE CONFIGURATION
  // ============================================================================

  private async getDatabaseConfig(context: AgentContext): Promise<DatabaseConfig> {
    if (context.options.useDefaults) {
      return {
        provider: 'neon',
        connectionString: 'NEON_DATABASE_URL_PLACEHOLDER'
      };
    }

    context.logger.info('🗄️  Database Configuration');

    const inquirer = await getInquirer();
    const { provider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Choose your database provider:',
        choices: [
          { name: 'Neon PostgreSQL (Recommended - Serverless)', value: 'neon' },
          { name: 'Local PostgreSQL', value: 'local' },
          { name: 'Vercel Postgres', value: 'vercel' }
        ],
        default: 'neon'
      }
    ]);

    let connectionString = '';
    
    if (provider === 'neon') {
      context.logger.info('📋 To set up Neon PostgreSQL:');
      context.logger.info('1. Go to https://neon.tech');
      context.logger.info('2. Create a new project');
      context.logger.info('3. Copy your connection string');
      context.logger.info('4. Paste it below (or leave empty to configure later)');
      
      const { neonUrl } = await inquirer.prompt([
        {
          type: 'input',
          name: 'neonUrl',
          message: 'Neon connection string (optional):',
          validate: (input: string) => {
            if (!input) return true;
            if (!input.startsWith('postgresql://')) {
              return 'Connection string should start with postgresql://';
            }
            return true;
          }
        }
      ]);
      
      connectionString = neonUrl || 'NEON_DATABASE_URL_PLACEHOLDER';
    } else if (provider === 'local') {
      connectionString = 'postgresql://localhost:5432/myapp';
    } else if (provider === 'vercel') {
      connectionString = 'POSTGRES_URL_PLACEHOLDER';
    }

    return { provider, connectionString };
  }

  // ============================================================================
  // PACKAGE SETUP METHODS
  // ============================================================================

  private async updatePackageJson(dbPackagePath: string, context: AgentContext): Promise<void> {
    const packageJson = {
      name: `@${context.projectName}/db`,
      version: "0.1.0",
      private: true,
      description: "Database layer with Drizzle ORM",
      main: "index.ts",
      types: "index.ts",
      scripts: {
        "build": "tsc",
        "dev": "tsc --watch",
        "lint": "eslint . --ext .ts",
        "type-check": "tsc --noEmit",
        "db:generate": "drizzle-kit generate:pg",
        "db:migrate": "tsx migrate.ts",
        "db:push": "drizzle-kit push:pg",
        "db:studio": "drizzle-kit studio"
      },
      dependencies: {
        "drizzle-orm": "^0.44.3",
        "@neondatabase/serverless": "^1.0.1",
        "postgres": "^3.4.3"
      },
      devDependencies: {
        "drizzle-kit": "^0.31.4",
        "tsx": "^4.1.0",
        "typescript": "^5.2.2",
        "dotenv": "^16.3.1"
      }
    };

    await fsExtra.writeJSON(path.join(dbPackagePath, 'package.json'), packageJson, { spaces: 2 });
    context.logger.success(`Package.json updated for database package`);
  }

  private async createESLintConfig(dbPackagePath: string): Promise<void> {
    const eslintConfig = {
      extends: ["../../.eslintrc.json"]
    };

    await fsExtra.writeJSON(path.join(dbPackagePath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
  }

  private async createDrizzleConfig(dbPackagePath: string, dbConfig: DatabaseConfig): Promise<void> {
    const templateData = { connectionString: dbConfig.connectionString };
    const content = await this.templateService.renderTemplate('db', 'drizzle.config.ts.ejs', templateData);
    await fsExtra.writeFile(path.join(dbPackagePath, 'drizzle.config.ts'), content);
  }

  private async createDatabaseSchema(dbPackagePath: string): Promise<void> {
    await fsExtra.ensureDir(path.join(dbPackagePath, 'schema'));
    
    // Create example users table schema
    const usersContent = await this.templateService.renderTemplate('db', 'schema/users.ts.ejs', {});
    await fsExtra.writeFile(path.join(dbPackagePath, 'schema', 'users.ts'), usersContent);

    // Create index file
    const indexContent = await this.templateService.renderTemplate('db', 'schema/index.ts.ejs', {});
    await fsExtra.writeFile(path.join(dbPackagePath, 'schema', 'index.ts'), indexContent);
  }

  private async createDatabaseConnection(dbPackagePath: string): Promise<void> {
    const content = await this.templateService.renderTemplate('db', 'index.ts.ejs', {});
    await fsExtra.writeFile(path.join(dbPackagePath, 'index.ts'), content);
  }

  private async createMigrationUtils(dbPackagePath: string): Promise<void> {
    const content = await this.templateService.renderTemplate('db', 'migrate.ts.ejs', {});
    await fsExtra.writeFile(path.join(dbPackagePath, 'migrate.ts'), content);
  }

  private async createEnvConfig(projectPath: string, dbConfig: DatabaseConfig): Promise<void> {
    const envPath = path.join(projectPath, '.env.local');
    const envContent = `# Database Configuration
DATABASE_URL="${dbConfig.connectionString}"

# Neon PostgreSQL (if using Neon)
# NEON_DATABASE_URL="your-neon-connection-string"

# Vercel Postgres (if using Vercel)
# POSTGRES_URL="your-vercel-postgres-url"
# POSTGRES_PRISMA_URL="your-vercel-postgres-prisma-url"
# POSTGRES_URL_NON_POOLING="your-vercel-postgres-non-pooling-url"
# POSTGRES_USER="your-vercel-postgres-user"
# POSTGRES_HOST="your-vercel-postgres-host"
# POSTGRES_PASSWORD="your-vercel-postgres-password"
# POSTGRES_DATABASE="your-vercel-postgres-database"`;

    await fsExtra.writeFile(envPath, envContent);
  }

  private displayDatabaseSetupInstructions(dbConfig: DatabaseConfig): void {
    console.log('\n🗄️  Database Setup Instructions:');
    console.log('=====================================');
    
    if (dbConfig.provider === 'neon') {
      console.log('1. Go to https://neon.tech and create a new project');
      console.log('2. Copy your connection string');
      console.log('3. Update your .env.local file with the DATABASE_URL');
      console.log('4. Run: npm run db:generate (to generate migrations)');
      console.log('5. Run: npm run db:push (to push schema to database)');
    } else if (dbConfig.provider === 'local') {
      console.log('1. Make sure PostgreSQL is running locally');
      console.log('2. Create a database: createdb myapp');
      console.log('3. Update your .env.local file with the DATABASE_URL');
      console.log('4. Run: npm run db:generate (to generate migrations)');
      console.log('5. Run: npm run db:push (to push schema to database)');
    } else if (dbConfig.provider === 'vercel') {
      console.log('1. Set up Vercel Postgres in your Vercel dashboard');
      console.log('2. Copy the connection details to your .env.local file');
      console.log('3. Run: npm run db:generate (to generate migrations)');
      console.log('4. Run: npm run db:push (to push schema to database)');
    }
    
    console.log('\n📚 Useful commands:');
    console.log('- npm run db:studio (open Drizzle Studio)');
    console.log('- npm run db:migrate (run migrations)');
    console.log('- npm run db:generate (generate new migrations)');
  }

  // ============================================================================
  // ROLLBACK
  // ============================================================================

  async rollback(context: AgentContext): Promise<void> {
    const dbPackagePath = path.join(context.projectPath, 'packages', 'db');
    
    context.logger.warn(`Rolling back DBAgent - removing database package: ${dbPackagePath}`);
    
    try {
      // Remove the created database package directory
      if (existsSync(dbPackagePath)) {
        await context.runner.execCommand(['rm', '-rf', dbPackagePath], { silent: true });
        context.logger.success(`Database package removed: ${dbPackagePath}`);
      }
    } catch (error) {
      context.logger.error(`Failed to remove database package: ${dbPackagePath}`, error as Error);
    }
  }
} 