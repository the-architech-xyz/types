/**
 * DB Agent - Database Package Generator
 *
 * Sets up the packages/db database layer with:
 * - Drizzle ORM configuration
 * - Neon PostgreSQL integration
 * - Database schema definitions
 * - Migration scripts and utilities
 *
 * Enhanced to integrate with the Drizzle plugin and orchestrator agent pattern.
 */
import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { templateService } from '../utils/template-service.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { ProjectType, TargetPlatform } from '../types/plugin.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
export class DBAgent extends AbstractAgent {
    templateService;
    pluginSystem;
    constructor() {
        super();
        this.templateService = templateService;
        this.pluginSystem = PluginSystem.getInstance();
    }
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
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
    getAgentCapabilities() {
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
                    },
                    {
                        name: 'schema',
                        type: 'array',
                        required: false,
                        description: 'Database schema tables to create',
                        defaultValue: ['users', 'posts', 'comments']
                    },
                    {
                        name: 'migrations',
                        type: 'boolean',
                        required: false,
                        description: 'Enable database migrations',
                        defaultValue: true
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
            },
            {
                name: 'design-schema',
                description: 'AI-powered database schema design',
                parameters: [
                    {
                        name: 'requirements',
                        type: 'string',
                        required: true,
                        description: 'Natural language schema requirements'
                    }
                ],
                examples: [
                    {
                        name: 'Design user management schema',
                        description: 'Creates schema for user authentication and profiles',
                        parameters: { requirements: 'User authentication with profiles, roles, and permissions' },
                        expectedResult: 'Complete schema with users, roles, and permissions tables'
                    }
                ],
                category: CapabilityCategory.GENERATION
            }
        ];
    }
    // ============================================================================
    // CORE EXECUTION
    // ============================================================================
    async executeInternal(context) {
        const { projectName, projectPath } = context;
        const dbPackagePath = path.join(projectPath, 'packages', 'db');
        context.logger.info(`Setting up database package: ${projectName}/packages/db`);
        try {
            // Get database configuration from context or user input
            const dbConfig = await this.getDatabaseConfig(context);
            // Step 1: Execute Drizzle plugin for core setup
            const pluginResult = await this.executeDrizzlePlugin(context, dbConfig);
            // Step 2: Enhance with agent-specific features
            const agentResult = await this.enhanceDatabaseSetup(dbPackagePath, dbConfig, context);
            // Step 3: Generate custom schema based on requirements
            const schemaResult = await this.generateCustomSchema(dbPackagePath, dbConfig, context);
            const artifacts = [
                {
                    type: 'directory',
                    path: dbPackagePath,
                    metadata: {
                        package: 'db',
                        orm: 'drizzle',
                        database: dbConfig.provider,
                        features: ['orm', 'migrations', 'schema', 'ai-design']
                    }
                },
                ...pluginResult.artifacts,
                ...agentResult.artifacts,
                ...schemaResult.artifacts
            ];
            return {
                success: true,
                data: {
                    databaseConfig: dbConfig,
                    pluginResult,
                    agentResult,
                    schemaResult
                },
                artifacts,
                warnings: [
                    ...pluginResult.warnings,
                    ...agentResult.warnings,
                    ...schemaResult.warnings
                ],
                duration: Date.now() - (context.state.get('startTime') || Date.now())
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`Failed to setup database package: ${errorMessage}`, error);
            return {
                success: false,
                errors: [
                    {
                        code: 'DATABASE_SETUP_FAILED',
                        message: `Failed to setup database package: ${errorMessage}`,
                        details: error,
                        recoverable: false,
                        timestamp: new Date()
                    }
                ],
                duration: Date.now() - (context.state.get('startTime') || Date.now())
            };
        }
    }
    // ============================================================================
    // PLUGIN INTEGRATION
    // ============================================================================
    async executeDrizzlePlugin(context, dbConfig) {
        context.logger.info('Executing Drizzle plugin for core database setup...');
        const drizzlePlugin = this.pluginSystem.getRegistry().get('drizzle');
        if (!drizzlePlugin) {
            throw new Error('Drizzle plugin not found');
        }
        const pluginContext = {
            ...context,
            pluginId: 'drizzle',
            pluginConfig: {
                provider: dbConfig.provider,
                connectionString: dbConfig.connectionString
            },
            installedPlugins: [],
            projectType: ProjectType.NEXTJS,
            targetPlatform: [TargetPlatform.WEB]
        };
        const result = await drizzlePlugin.install(pluginContext);
        if (!result.success) {
            throw new Error(`Drizzle plugin failed: ${result.errors.map(e => e.message).join(', ')}`);
        }
        return result;
    }
    // ============================================================================
    // AGENT ENHANCEMENTS
    // ============================================================================
    async enhanceDatabaseSetup(dbPackagePath, dbConfig, context) {
        context.logger.info('Enhancing database setup with agent-specific features...');
        const artifacts = [];
        const warnings = [];
        try {
            // Create enhanced database utilities
            await this.createEnhancedUtils(dbPackagePath, context);
            // Create database health checks
            await this.createHealthChecks(dbPackagePath, context);
            // Create database seeding utilities
            if (dbConfig.migrations) {
                await this.createSeedingUtils(dbPackagePath, context);
            }
            artifacts.push({
                type: 'file',
                path: path.join(dbPackagePath, 'utils/enhanced.ts'),
                metadata: { type: 'enhanced-utils' }
            }, {
                type: 'file',
                path: path.join(dbPackagePath, 'utils/health.ts'),
                metadata: { type: 'health-checks' }
            });
            if (dbConfig.migrations) {
                artifacts.push({
                    type: 'file',
                    path: path.join(dbPackagePath, 'utils/seed.ts'),
                    metadata: { type: 'seeding-utils' }
                });
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            warnings.push(`Enhanced setup failed: ${errorMessage}`);
        }
        return { artifacts, warnings };
    }
    async generateCustomSchema(dbPackagePath, dbConfig, context) {
        context.logger.info('Generating custom database schema...');
        const artifacts = [];
        const warnings = [];
        try {
            // Generate schema based on requirements
            const schemaContent = await this.generateSchemaContent(dbConfig.schema, context);
            // Create the schema directory
            const schemaDir = path.join(dbPackagePath, 'schema');
            await fsExtra.ensureDir(schemaDir);
            // Create custom schema file
            await fsExtra.writeFile(path.join(schemaDir, 'custom.ts'), schemaContent);
            // Update the main schema index to include custom schema
            const mainSchemaContent = `// Main schema exports
export * from './custom';

// Export core schema types
export type { DatabaseSchema } from './custom';`;
            await fsExtra.writeFile(path.join(schemaDir, 'main.ts'), mainSchemaContent);
            artifacts.push({
                type: 'file',
                path: path.join(dbPackagePath, 'schema/custom.ts'),
                metadata: { type: 'custom-schema', tables: dbConfig.schema }
            });
            artifacts.push({
                type: 'file',
                path: path.join(dbPackagePath, 'schema/main.ts'),
                metadata: { type: 'schema-index' }
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            warnings.push(`Schema generation failed: ${errorMessage}`);
        }
        return { artifacts, warnings };
    }
    // ============================================================================
    // SCHEMA GENERATION
    // ============================================================================
    async generateSchemaContent(schema, context) {
        // AI-powered schema generation based on table names
        const tableDefinitions = schema.map(tableName => this.generateTableDefinition(tableName));
        return `import { pgTable, serial, text, timestamp, boolean, integer, json } from 'drizzle-orm/pg-core';

// Custom schema generated by DBAgent
${tableDefinitions.join('\n\n')}

// Export all tables
export const tables = {
${schema.map(table => `  ${table},`).join('\n')}
};

// Export types
export type DatabaseSchema = typeof tables;
`;
    }
    generateTableDefinition(tableName) {
        // Generate table definition based on table name
        const baseFields = `  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()`;
        switch (tableName.toLowerCase()) {
            case 'users':
                return `export const users = pgTable('users', {
${baseFields},
  email: text('email').notNull().unique(),
  name: text('name'),
  avatar: text('avatar'),
  isActive: boolean('is_active').default(true),
});`;
            case 'posts':
                return `export const posts = pgTable('posts', {
${baseFields},
  title: text('title').notNull(),
  content: text('content'),
  authorId: integer('author_id').references(() => users.id),
  published: boolean('published').default(false),
});`;
            case 'comments':
                return `export const comments = pgTable('comments', {
${baseFields},
  content: text('content').notNull(),
  authorId: integer('author_id').references(() => users.id),
  postId: integer('post_id').references(() => posts.id),
});`;
            default:
                return `export const ${tableName} = pgTable('${tableName}', {
${baseFields},
  // Add custom fields for ${tableName}
});`;
        }
    }
    // ============================================================================
    // UTILITY CREATION
    // ============================================================================
    async createEnhancedUtils(dbPackagePath, context) {
        const utilsDir = path.join(dbPackagePath, 'utils');
        await fsExtra.ensureDir(utilsDir);
        const enhancedUtils = `import { db } from '../index';
import { eq, and, or } from 'drizzle-orm';
import { users, posts, comments } from '../schema/custom';

// Enhanced database utilities
export class DatabaseUtils {
  // Generic CRUD operations
  static async findById<T>(table: any, id: number): Promise<T | null> {
    const result = await db.select().from(table).where(eq(table.id, id));
    return result[0] || null;
  }

  static async findByField<T>(table: any, field: any, value: any): Promise<T[]> {
    return await db.select().from(table).where(eq(field, value));
  }

  static async create<T>(table: any, data: any): Promise<T> {
    const result = await db.insert(table).values(data).returning();
    return (result as any[])[0];
  }

  static async update<T>(table: any, id: number, data: any): Promise<T | null> {
    const result = await db.update(table).set(data).where(eq(table.id, id)).returning();
    return (result as any[])[0] || null;
  }

  static async delete(table: any, id: number): Promise<boolean> {
    const result = await db.delete(table).where(eq(table.id, id));
    return result.rowCount > 0;
  }

  // Transaction utilities
  static async transaction<T>(callback: () => Promise<T>): Promise<T> {
    return await db.transaction(callback);
  }
}`;
        await fsExtra.writeFile(path.join(utilsDir, 'enhanced.ts'), enhancedUtils);
    }
    async createHealthChecks(dbPackagePath, context) {
        const utilsDir = path.join(dbPackagePath, 'utils');
        await fsExtra.ensureDir(utilsDir);
        const healthChecks = `import { db } from '../index';

// Database health check utilities
export class DatabaseHealth {
  static async checkConnection(): Promise<boolean> {
    try {
      await db.execute('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  }

  static async getStats(): Promise<{
    connection: boolean;
    tables: string[];
    version: string;
  }> {
    const connection = await this.checkConnection();
    let tables: string[] = [];
    let version = 'unknown';

    if (connection) {
      try {
        // Get table list
        const tableResult = await db.execute(\`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        \`);
        tables = tableResult.rows.map((row: any) => row.table_name);

        // Get PostgreSQL version
        const versionResult = await db.execute('SELECT version()');
        version = (versionResult.rows[0] as any)?.version || 'unknown';
      } catch (error) {
        console.error('Failed to get database stats:', error);
      }
    }

    return { connection, tables, version };
  }
}`;
        await fsExtra.writeFile(path.join(utilsDir, 'health.ts'), healthChecks);
    }
    async createSeedingUtils(dbPackagePath, context) {
        const utilsDir = path.join(dbPackagePath, 'utils');
        await fsExtra.ensureDir(utilsDir);
        const seedingUtils = `import { db } from '../index';
import { users, posts, comments } from '../schema/custom';

// Database seeding utilities
export class DatabaseSeeder {
  static async seedUsers(count: number = 10) {
    const userData = Array.from({ length: count }, (_, i) => ({
      email: \`user\${i + 1}@example.com\`,
      name: \`User \${i + 1}\`,
      avatar: \`https://api.dicebear.com/7.x/avataaars/svg?seed=user\${i + 1}\`,
      isActive: true
    }));

    const createdUsers = await db.insert(users).values(userData).returning();
    console.log(\`Created \${createdUsers.length} users\`);
    return createdUsers;
  }

  static async seedPosts(userIds: number[], count: number = 20) {
    const postData = Array.from({ length: count }, (_, i) => ({
      title: \`Post \${i + 1}\`,
      content: \`This is the content for post \${i + 1}. It contains some sample text.\`,
      authorId: userIds[i % userIds.length],
      published: Math.random() > 0.3
    }));

    const createdPosts = await db.insert(posts).values(postData).returning();
    console.log(\`Created \${createdPosts.length} posts\`);
    return createdPosts;
  }

  static async seedComments(userIds: number[], postIds: number[], count: number = 50) {
    const commentData = Array.from({ length: count }, (_, i) => ({
      content: \`Comment \${i + 1} on this post.\`,
      authorId: userIds[i % userIds.length],
      postId: postIds[i % postIds.length]
    }));

    const createdComments = await db.insert(comments).values(commentData).returning();
    console.log(\`Created \${createdComments.length} comments\`);
    return createdComments;
  }

  static async seedAll() {
    console.log('Starting database seeding...');
    
    try {
      // Seed users first
      const createdUsers = await this.seedUsers(10);
      
      // Seed posts
      const createdPosts = await this.seedPosts(
        createdUsers.map((u: any) => u.id), 
        20
      );
      
      // Seed comments
      await this.seedComments(
        createdUsers.map((u: any) => u.id),
        createdPosts.map((p: any) => p.id),
        50
      );
      
      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Database seeding failed:', error);
      throw error;
    }
  }
}`;
        await fsExtra.writeFile(path.join(utilsDir, 'seed.ts'), seedingUtils);
    }
    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    async getDatabaseConfig(context) {
        // Get configuration from context or use defaults
        const config = context.config.database || {};
        return {
            provider: config.provider || 'neon',
            connectionString: config.connectionString || 'NEON_DATABASE_URL_PLACEHOLDER',
            schema: config.schema || ['users', 'posts', 'comments'],
            migrations: config.migrations !== false
        };
    }
    // ============================================================================
    // VALIDATION
    // ============================================================================
    async validate(context) {
        const errors = [];
        const warnings = [];
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
        // Check for conflicting ORMs
        const packageJsonPath = path.join(context.projectPath, 'package.json');
        if (existsSync(packageJsonPath)) {
            const packageJson = await fsExtra.readJSON(packageJsonPath);
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
            if (dependencies.prisma) {
                warnings.push('Prisma detected - consider using only one ORM to avoid conflicts');
            }
            if (dependencies.typeorm) {
                warnings.push('TypeORM detected - consider using only one ORM to avoid conflicts');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    // ============================================================================
    // ROLLBACK
    // ============================================================================
    async rollback(context) {
        const dbPackagePath = path.join(context.projectPath, 'packages', 'db');
        context.logger.warn(`Rolling back database package: ${dbPackagePath}`);
        try {
            if (existsSync(dbPackagePath)) {
                await context.runner.execCommand(['rm', '-rf', dbPackagePath], { silent: true });
                context.logger.success(`Database package removed: ${dbPackagePath}`);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`Failed to remove database package: ${errorMessage}`, error);
        }
    }
}
//# sourceMappingURL=db-agent.js.map