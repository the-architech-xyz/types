/**
 * Drizzle ORM Plugin - Pure Technology Implementation
 *
 * Provides Drizzle ORM integration with Neon PostgreSQL using the official drizzle-kit CLI.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../types/plugin.js';
import { templateService } from '../../utils/template-service.js';
import { CommandRunner } from '../../utils/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
export class DrizzlePlugin {
    templateService;
    runner;
    constructor() {
        this.templateService = templateService;
        this.runner = new CommandRunner();
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
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
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Drizzle ORM with Neon database...');
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Initialize drizzle-kit configuration
            await this.initializeDrizzleKit(context);
            // Step 3: Create database schema and connection
            await this.createDatabaseFiles(context);
            // Step 4: Generate initial migration
            await this.generateInitialMigration(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'drizzle.config.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'db/schema.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'db/index.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'db/migrate.ts')
                    }
                ],
                dependencies: [
                    {
                        name: 'drizzle-orm',
                        version: '^0.44.3',
                        type: 'production',
                        category: PluginCategory.DATABASE
                    },
                    {
                        name: '@neondatabase/serverless',
                        version: '^1.0.1',
                        type: 'production',
                        category: PluginCategory.DATABASE
                    },
                    {
                        name: 'drizzle-kit',
                        version: '^0.31.4',
                        type: 'development',
                        category: PluginCategory.DATABASE
                    },
                    {
                        name: 'postgres',
                        version: '^3.4.0',
                        type: 'production',
                        category: PluginCategory.DATABASE
                    }
                ],
                scripts: [
                    {
                        name: 'db:generate',
                        command: 'drizzle-kit generate',
                        description: 'Generate database migrations',
                        category: 'dev'
                    },
                    {
                        name: 'db:migrate',
                        command: 'tsx db/migrate.ts',
                        description: 'Run database migrations',
                        category: 'dev'
                    },
                    {
                        name: 'db:push',
                        command: 'drizzle-kit push',
                        description: 'Push schema to database',
                        category: 'dev'
                    },
                    {
                        name: 'db:studio',
                        command: 'drizzle-kit studio',
                        description: 'Open Drizzle Studio',
                        category: 'dev'
                    },
                    {
                        name: 'db:drop',
                        command: 'drizzle-kit drop',
                        description: 'Drop database schema',
                        category: 'dev'
                    }
                ],
                configs: [
                    {
                        file: '.env.local',
                        content: this.generateEnvConfig(pluginConfig),
                        mergeStrategy: 'append'
                    }
                ],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return this.createErrorResult(`Failed to setup Drizzle ORM: ${errorMessage}`, startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            // Remove Drizzle specific files
            const filesToRemove = [
                'drizzle.config.ts',
                'drizzle.config.js',
                'db',
                'migrations'
            ];
            for (const file of filesToRemove) {
                const filePath = path.join(projectPath, file);
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return this.createErrorResult(`Failed to uninstall Drizzle ORM: ${errorMessage}`, startTime, [], error);
        }
    }
    async update(context) {
        return this.install(context);
    }
    // ============================================================================
    // VALIDATION & COMPATIBILITY
    // ============================================================================
    async validate(context) {
        const errors = [];
        const warnings = [];
        // Check if project directory exists
        if (!await fsExtra.pathExists(context.projectPath)) {
            errors.push({
                field: 'projectPath',
                message: `Project directory does not exist: ${context.projectPath}`,
                code: 'DIRECTORY_NOT_FOUND',
                severity: 'error'
            });
        }
        // Check for database configuration
        const dbConfig = context.pluginConfig;
        if (!dbConfig.databaseUrl && !dbConfig.connectionString) {
            warnings.push('Database URL not configured - you will need to set DATABASE_URL environment variable');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    getCompatibility() {
        return {
            frameworks: ['next', 'react', 'vue', 'svelte', 'angular'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['18.0.0', '20.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            databases: ['postgresql', 'neon'],
            conflicts: ['prisma', 'typeorm', 'sequelize']
        };
    }
    getDependencies() {
        return [];
    }
    getConflicts() {
        return ['prisma', 'typeorm', 'sequelize'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'drizzle-orm',
                version: '^0.44.3',
                description: 'Drizzle ORM core package'
            },
            {
                type: 'package',
                name: '@neondatabase/serverless',
                version: '^1.0.1',
                description: 'Neon database driver'
            },
            {
                type: 'package',
                name: 'drizzle-kit',
                version: '^0.31.4',
                description: 'Drizzle CLI and migration tools'
            },
            {
                type: 'package',
                name: 'postgres',
                version: '^3.4.0',
                description: 'PostgreSQL client'
            }
        ];
    }
    getDefaultConfig() {
        return {
            provider: 'neon',
            databaseUrl: process.env.DATABASE_URL || '',
            connectionString: process.env.DATABASE_URL || '',
            schema: './db/schema.ts',
            out: './drizzle',
            dialect: 'postgresql'
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                provider: {
                    type: 'string',
                    enum: ['neon'],
                    description: 'Database provider',
                    default: 'neon'
                },
                databaseUrl: {
                    type: 'string',
                    description: 'Database connection URL',
                    default: ''
                },
                connectionString: {
                    type: 'string',
                    description: 'Database connection string (alias for databaseUrl)',
                    default: ''
                },
                schema: {
                    type: 'string',
                    description: 'Path to schema file',
                    default: './db/schema.ts'
                },
                out: {
                    type: 'string',
                    description: 'Output directory for migrations',
                    default: './drizzle'
                },
                dialect: {
                    type: 'string',
                    enum: ['postgresql'],
                    description: 'Database dialect',
                    default: 'postgresql'
                }
            }
        };
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    async installDependencies(context) {
        const { projectPath } = context;
        const dependencies = [
            'drizzle-orm@^0.44.3',
            '@neondatabase/serverless@^1.0.1',
            'postgres@^3.4.0'
        ];
        const devDependencies = [
            'drizzle-kit@^0.31.4'
        ];
        context.logger.info('Installing Drizzle ORM dependencies...');
        await this.runner.install(dependencies, false, projectPath);
        await this.runner.install(devDependencies, true, projectPath);
    }
    async initializeDrizzleKit(context) {
        const { projectPath, pluginConfig } = context;
        // Create drizzle.config.ts
        const drizzleConfig = this.generateDrizzleConfig(pluginConfig);
        const configPath = path.join(projectPath, 'drizzle.config.ts');
        await fsExtra.writeFile(configPath, drizzleConfig);
    }
    async createDatabaseFiles(context) {
        const { projectPath } = context;
        const dbPath = path.join(projectPath, 'db');
        await fsExtra.ensureDir(dbPath);
        // Create schema file
        const schemaContent = this.generateDatabaseSchema();
        await fsExtra.writeFile(path.join(dbPath, 'schema.ts'), schemaContent);
        // Create database connection
        const connectionContent = this.generateDatabaseConnection();
        await fsExtra.writeFile(path.join(dbPath, 'index.ts'), connectionContent);
        // Create migration utility
        const migrateContent = this.generateMigrationUtils();
        await fsExtra.writeFile(path.join(dbPath, 'migrate.ts'), migrateContent);
    }
    async generateInitialMigration(context) {
        const { projectPath } = context;
        context.logger.info('Generating initial migration...');
        await this.runner.exec('drizzle-kit', ['generate'], projectPath);
    }
    generateDrizzleConfig(config) {
        return `import type { Config } from 'drizzle-kit';

export default {
  schema: '${config.schema || './db/schema.ts'}',
  out: '${config.out || './drizzle'}',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
`;
    }
    generateDatabaseSchema() {
        return `import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Example user table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Example posts table
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').default(false),
  authorId: serial('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Export all tables
export * from 'drizzle-orm/pg-core';
`;
    }
    generateDatabaseConnection() {
        return `import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export * from './schema';
`;
    }
    generateMigrationUtils() {
        return `import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  try {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
`;
    }
    generateEnvConfig(config) {
        return `# Database Configuration
DATABASE_URL="${config.databaseUrl || config.connectionString || 'postgresql://user:password@localhost:5432/database'}"

# Neon Database (if using Neon)
# Get your connection string from https://console.neon.tech
# DATABASE_URL="postgresql://user:password@ep-xxx-xxx-xxx.region.aws.neon.tech/database?sslmode=require"
`;
    }
    createErrorResult(message, startTime, errors = [], originalError) {
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [
                {
                    code: 'DRIZZLE_SETUP_FAILED',
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
//# sourceMappingURL=drizzle-plugin.js.map