/**
 * Drizzle ORM Plugin - Pure Technology Implementation
 * 
 * Provides Drizzle ORM integration with PostgreSQL/MySQL/SQLite.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform } from '../../types/plugin.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { TemplateService, templateService } from '../../utils/template-service.js';

interface DatabaseConfig {
  provider: 'neon' | 'local' | 'vercel';
  connectionString: string;
}

export class DrizzlePlugin implements IPlugin {
  private templateService: TemplateService;

  constructor() {
    this.templateService = templateService;
  }

  // ============================================================================
  // PLUGIN METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'drizzle',
      name: 'Drizzle ORM',
      version: '1.0.0',
      description: 'Modern TypeScript ORM with excellent developer experience',
      author: 'The Architech Team',
      category: PluginCategory.DATABASE,
      tags: ['database', 'orm', 'typescript', 'postgresql', 'neon'],
      license: 'Apache-2.0',
      repository: 'https://github.com/drizzle-team/drizzle-orm',
      homepage: 'https://orm.drizzle.team'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const { projectName, projectPath } = context;
    const dbPackagePath = path.join(projectPath, 'packages', 'db');
    
    const startTime = Date.now();

    try {
      // Validate plugin can be installed
      const validation = await this.validate(context);
      if (!validation.valid) {
        return this.createErrorResult(
          'Plugin validation failed',
          startTime,
          validation.errors
        );
      }

      // Use configuration from context (provided by agent)
      const dbConfig = await this.getDatabaseConfig(context);
      
      const artifacts: PluginArtifact[] = [];
      const dependencies: any[] = [];
      const scripts: any[] = [];
      const configs: any[] = [];
      const warnings: string[] = [];

      // Add core dependencies
      dependencies.push(
        {
          name: 'drizzle-orm',
          version: '^0.44.3',
          type: 'production' as const,
          category: PluginCategory.DATABASE
        },
        {
          name: '@neondatabase/serverless',
          version: '^1.0.1',
          type: 'production' as const,
          category: PluginCategory.DATABASE
        },
        {
          name: 'drizzle-kit',
          version: '^0.31.4',
          type: 'development' as const,
          category: PluginCategory.DATABASE
        }
      );

      // Generate technology artifacts
      const packageJson = this.generatePackageJson(projectName);
      artifacts.push({
        type: 'file',
        path: path.join(dbPackagePath, 'package.json'),
        content: packageJson
      });

      const eslintConfig = this.generateESLintConfig();
      artifacts.push({
        type: 'file',
        path: path.join(dbPackagePath, '.eslintrc.json'),
        content: eslintConfig
      });

      const drizzleConfig = this.generateDrizzleConfig(dbConfig);
      artifacts.push({
        type: 'file',
        path: path.join(dbPackagePath, 'drizzle.config.ts'),
        content: drizzleConfig
      });

      const databaseSchema = this.generateDatabaseSchema();
      artifacts.push({
        type: 'file',
        path: path.join(dbPackagePath, 'schema/index.ts'),
        content: databaseSchema
      });

      const databaseConnection = this.generateDatabaseConnection();
      artifacts.push({
        type: 'file',
        path: path.join(dbPackagePath, 'index.ts'),
        content: databaseConnection
      });

      const migrationUtils = this.generateMigrationUtils();
      artifacts.push({
        type: 'file',
        path: path.join(dbPackagePath, 'migrate.ts'),
        content: migrationUtils
      });

      // Add technology scripts
      scripts.push(
        {
          name: 'db:generate',
          command: 'drizzle-kit generate:pg',
          description: 'Generate database migrations',
          category: 'dev' as const
        },
        {
          name: 'db:migrate',
          command: 'tsx migrate.ts',
          description: 'Run database migrations',
          category: 'dev' as const
        },
        {
          name: 'db:push',
          command: 'drizzle-kit push:pg',
          description: 'Push schema to database',
          category: 'dev' as const
        },
        {
          name: 'db:studio',
          command: 'drizzle-kit studio',
          description: 'Open Drizzle Studio',
          category: 'dev' as const
        }
      );

      // Add environment configuration
      const envConfig = this.generateEnvConfig(dbConfig);
      configs.push({
        file: '.env.local',
        content: envConfig,
        mergeStrategy: 'append'
      });

      return {
        success: true,
        artifacts,
        dependencies,
        scripts,
        configs,
        errors: [],
        warnings,
        duration: Date.now() - startTime
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(
        `Failed to configure Drizzle ORM: ${errorMessage}`,
        startTime,
        [],
        error
      );
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const dbPackagePath = path.join(context.projectPath, 'packages', 'db');
    const startTime = Date.now();
    
    try {
      const artifacts: PluginArtifact[] = [
        { type: 'directory', path: dbPackagePath }
      ];

      return {
        success: true,
        artifacts,
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: ['Database package removed'],
        duration: Date.now() - startTime
      };

    } catch (error) {
      return this.createErrorResult(
        error instanceof Error ? error.message : 'Unknown error',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    // For now, just reinstall
    return this.install(context);
  }

  // ============================================================================
  // VALIDATION - Technology Compatibility Only
  // ============================================================================

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: string[] = [];

    // Check if DB package directory exists
    const dbPackagePath = path.join(context.projectPath, 'packages', 'db');
    if (!fsExtra.existsSync(dbPackagePath)) {
      errors.push({
        field: 'dbPackagePath',
        message: `Database package directory does not exist: ${dbPackagePath}`,
        code: 'DIRECTORY_NOT_FOUND',
        severity: 'error'
      });
    }

    // Check if project has packages structure (monorepo)
    const packagesPath = path.join(context.projectPath, 'packages');
    if (!fsExtra.existsSync(packagesPath)) {
      warnings.push('Packages directory not found - this plugin is designed for monorepo structures');
    }

    // Check for conflicting ORMs
    const packageJsonPath = path.join(context.projectPath, 'package.json');
    if (fsExtra.existsSync(packageJsonPath)) {
      const packageJson = await fsExtra.readJSON(packageJsonPath);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (dependencies.prisma) {
        warnings.push('Prisma detected - potential conflict');
      }
      if (dependencies.typeorm) {
        warnings.push('TypeORM detected - potential conflict');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // COMPATIBILITY MATRIX
  // ============================================================================

  getCompatibility() {
    return {
      frameworks: ['next', 'react', 'vue', 'svelte', 'angular'],
      platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
      nodeVersions: ['18.0.0', '20.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      databases: ['postgresql', 'mysql', 'sqlite'],
      conflicts: ['prisma', 'typeorm', 'sequelize']
    };
  }

  getDependencies(): string[] {
    return [];
  }

  getConflicts(): string[] {
    return ['prisma', 'typeorm', 'sequelize'];
  }

  getRequirements() {
    return [
      {
        type: 'package' as const,
        name: 'drizzle-orm',
        version: '^0.44.3',
        description: 'Drizzle ORM core package'
      },
      {
        type: 'package' as const,
        name: '@neondatabase/serverless',
        version: '^1.0.1',
        description: 'Neon PostgreSQL serverless driver'
      },
      {
        type: 'package' as const,
        name: 'drizzle-kit',
        version: '^0.31.4',
        description: 'Drizzle CLI and migration tools'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      provider: 'neon',
      connectionString: 'NEON_DATABASE_URL_PLACEHOLDER'
    };
  }

  getConfigSchema() {
    return {
      type: 'object' as const,
      properties: {
        provider: {
          type: 'string' as const,
          description: 'Database provider',
          enum: ['neon', 'local', 'vercel'],
          default: 'neon'
        },
        connectionString: {
          type: 'string' as const,
          description: 'Database connection string',
          default: 'NEON_DATABASE_URL_PLACEHOLDER'
        }
      },
      required: ['provider']
    };
  }

  // ============================================================================
  // TECHNOLOGY IMPLEMENTATION METHODS
  // ============================================================================

  private async getDatabaseConfig(context: PluginContext): Promise<DatabaseConfig> {
    // Use configuration from context (provided by agent)
    const provider = context.pluginConfig.provider || 'neon';
    const connectionString = context.pluginConfig.connectionString || 'NEON_DATABASE_URL_PLACEHOLDER';

    return { provider, connectionString };
  }

  private generatePackageJson(projectName: string): string {
    const packageJson = {
      name: `@${projectName}/db`,
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

    return JSON.stringify(packageJson, null, 2);
  }

  private generateESLintConfig(): string {
    const eslintConfig = {
      extends: ["../../.eslintrc.json"]
    };

    return JSON.stringify(eslintConfig, null, 2);
  }

  private generateDrizzleConfig(dbConfig: DatabaseConfig): string {
    return `import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './schema/*',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '${dbConfig.connectionString}',
  },
});`;
  }

  private generateDatabaseSchema(): string {
    return `import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Example query
export const getUserByEmail = async (email: string) => {
  // Implementation would go here
  return null;
};`;
  }

  private generateDatabaseConnection(): string {
    return `import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// Export types
export * from './schema';`;
  }

  private generateMigrationUtils(): string {
    return `import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  try {
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();`;
  }

  private generateEnvConfig(dbConfig: DatabaseConfig): string {
    return `# Database Configuration
DATABASE_URL="${dbConfig.connectionString}"

# Add your database credentials here
# For Neon: postgresql://user:password@host/database
# For local: postgresql://localhost:5432/myapp
# For Vercel: $POSTGRES_URL`;
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
      errors: [{
        code: 'PLUGIN_ERROR',
        message,
        details: originalError,
        severity: 'error'
      }, ...errors],
      warnings: [],
      duration: Date.now() - startTime
    };
  }
} 