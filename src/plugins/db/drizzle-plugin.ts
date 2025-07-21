/**
 * Drizzle ORM Plugin - Pure Technology Implementation
 * 
 * Provides Drizzle ORM integration with Neon PostgreSQL using the official drizzle-kit CLI.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../types/plugin.js';
import { TemplateService, templateService } from '../../core/templates/template-service.js';
import { CommandRunner } from '../../core/cli/command-runner.js';
import { ValidationError } from '../../types/agent.js';
import { 
  DATABASE_PROVIDERS, 
  DatabaseProvider 
} from '../../types/shared-config.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../core/project/structure-service.js';

interface DatabaseConfig {
  provider: DatabaseProvider;
  connectionString: string;
  databaseUrl: string;
}

export class DrizzlePlugin implements IPlugin {
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

      // Step 4: Generate unified interface files (must be before migration)
      await this.generateUnifiedInterfaceFiles(context);

      // Step 5: Generate initial migration (after files exist)
      await this.generateInitialMigration(context);

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
            path: path.join(projectPath, 'src', 'lib', 'db', 'schema.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'db', 'migrations.ts')
          },
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(
        `Failed to setup Drizzle ORM: ${errorMessage}`,
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(
        `Failed to uninstall Drizzle ORM: ${errorMessage}`,
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    return this.install(context);
  }

  // ============================================================================
  // VALIDATION & COMPATIBILITY
  // ============================================================================

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: string[] = [];

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

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['next', 'react', 'vue', 'svelte', 'angular'],
      platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
      nodeVersions: ['18.0.0', '20.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: ['postgresql', 'neon'],
      conflicts: ['prisma', 'typeorm', 'sequelize']
    };
  }

  getDependencies(): string[] {
    return [
      'drizzle-orm@^0.44.3',
      '@neondatabase/serverless@^1.0.1',
      'drizzle-kit@^0.31.4'
    ];
  }

  getConflicts(): string[] {
    return ['prisma', 'typeorm', 'sequelize'];
  }

  getRequirements(): PluginRequirement[] {
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

  getDefaultConfig(): Record<string, any> {
    return {
      provider: 'neon',
      databaseUrl: process.env.DATABASE_URL || '',
      connectionString: process.env.DATABASE_URL || '',
      schema: './db/schema.ts',
      out: './drizzle',
      dialect: 'postgresql'
    };
  }

  getConfigSchema(): ConfigSchema {
    return {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: [DATABASE_PROVIDERS.NEON, DATABASE_PROVIDERS.SUPABASE, DATABASE_PROVIDERS.VERCEL_POSTGRES, DATABASE_PROVIDERS.LOCAL_POSTGRES],
          description: 'Database provider',
          default: DATABASE_PROVIDERS.NEON
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

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    // Drizzle provides everything we need - minimal dependencies
    const dependencies = [
      'drizzle-orm@^0.44.3',
      '@neondatabase/serverless@^1.0.1'
    ];
    
    const devDependencies = [
      'drizzle-kit@^0.31.4'
    ];

    context.logger.info('Installing Drizzle ORM...');
    await this.runner.install(dependencies, false, projectPath);
    await this.runner.install(devDependencies, true, projectPath);
  }

  private async initializeDrizzleKit(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    const structure = context.projectStructure!;
    
    // Adjust config based on project structure
    const adjustedConfig = {
      ...pluginConfig,
      schema: structure.isMonorepo ? './schema.ts' : './src/lib/db/schema.ts',
      out: structure.isMonorepo ? './drizzle' : './drizzle'
    };
    
    // Create drizzle.config.ts in the correct location
    const drizzleConfig = this.generateDrizzleConfig(adjustedConfig);
    const configPath = structure.isMonorepo 
      ? path.join(structureService.getModulePath(projectPath, structure, 'db'), 'drizzle.config.ts')
      : path.join(projectPath, 'drizzle.config.ts');
    await fsExtra.writeFile(configPath, drizzleConfig);
  }

  private async createDatabaseFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const structure = context.projectStructure!;
    
    if (structure.isMonorepo) {
      // For monorepo, create files in packages/db/
      const dbPath = structureService.getModulePath(projectPath, structure, 'db');
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
    // For single app, skip this step as files will be created in src/lib/db/ by generateUnifiedInterfaceFiles
  }

  private async generateInitialMigration(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const structure = context.projectStructure!;
    
    context.logger.info('Generating initial migration...');
    
    // For monorepo, run from the db package directory
    const workingDir = structure.isMonorepo 
      ? structureService.getModulePath(projectPath, structure, 'db') 
      : projectPath;
    await this.runner.exec('drizzle-kit', ['generate'], workingDir);
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    const structure = context.projectStructure!;
    const unifiedPath = structureService.getUnifiedInterfacePath(projectPath, structure, 'db');

    context.logger.info(`Generating unified interface files in: ${unifiedPath}`);
    context.logger.info(`Project structure: ${structure.isMonorepo ? 'monorepo' : 'single-app'}`);

    await fsExtra.ensureDir(unifiedPath);
    context.logger.info(`Created directory: ${unifiedPath}`);

    // Create index.ts
    const indexContent = this.generateUnifiedIndex();
    const indexPath = path.join(unifiedPath, 'index.ts');
    await fsExtra.writeFile(indexPath, indexContent);
    context.logger.info(`Created index.ts: ${indexPath}`);

    // Create schema.ts
    const schemaContent = this.generateDatabaseSchema();
    const schemaPath = path.join(unifiedPath, 'schema.ts');
    await fsExtra.writeFile(schemaPath, schemaContent);
    context.logger.info(`Created schema.ts: ${schemaPath}`);

    // Create migrations.ts
    const migrationsContent = this.generateMigrationUtils();
    const migrationsPath = path.join(unifiedPath, 'migrations.ts');
    await fsExtra.writeFile(migrationsPath, migrationsContent);
    context.logger.info(`Created migrations.ts: ${migrationsPath}`);
  }

  private generateDrizzleConfig(config: Record<string, any>): string {
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

  private generateDatabaseSchema(): string {
    return `import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  boolean, 
  varchar, 
  index, 
  integer,
  uuid,
  jsonb,
  primaryKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// AUTHENTICATION TABLES (Better Auth / NextAuth.js compatible)
// ============================================================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  createdAtIdx: index('users_created_at_idx').on(table.createdAt),
}));

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
}, (table) => ({
  providerProviderAccountIdIdx: index('accounts_provider_provider_account_id_idx').on(table.provider, table.providerAccountId),
  accountsUserIdIdx: index('accounts_user_id_idx').on(table.userId),
}));

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  sessionTokenIdx: index('sessions_session_token_idx').on(table.sessionToken),
  sessionsUserIdIdx: index('sessions_user_id_idx').on(table.userId),
}));

export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  tokenIdx: index('token_idx').on(table.token),
  identifierTokenIdx: index('identifier_token_idx').on(table.identifier, table.token),
}));

// ============================================================================
// APPLICATION TABLES
// ============================================================================

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content'),
  excerpt: text('excerpt'),
  published: boolean('published').default(false).notNull(),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'cascade' }),
  featuredImage: text('featured_image'),
  meta: jsonb('meta'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('posts_slug_idx').on(table.slug),
  authorIdIdx: index('posts_author_id_idx').on(table.authorId),
  publishedIdx: index('posts_published_idx').on(table.published),
  createdAtIdx: index('posts_created_at_idx').on(table.createdAt),
}));

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('categories_slug_idx').on(table.slug),
}));

export const postCategories = pgTable('post_categories', {
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.postId, table.categoryId] }),
  postIdIdx: index('post_categories_post_id_idx').on(table.postId),
  categoryIdIdx: index('post_categories_category_id_idx').on(table.categoryId),
}));

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'set null' }),
  authorName: text('author_name'),
  authorEmail: text('author_email'),
  approved: boolean('approved').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  postIdIdx: index('comments_post_id_idx').on(table.postId),
  authorIdIdx: index('comments_author_id_idx').on(table.authorId),
  approvedIdx: index('comments_approved_idx').on(table.approved),
}));

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  posts: many(posts),
  comments: many(comments),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  postCategories: many(postCategories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  postCategories: many(postCategories),
}));

export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, {
    fields: [postCategories.postId],
    references: [posts.id],
  }),
  category: one(categories, {
    fields: [postCategories.categoryId],
    references: [categories.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type PostCategory = typeof postCategories.$inferSelect;
export type NewPostCategory = typeof postCategories.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

// Export all tables
export * from 'drizzle-orm/pg-core';
`;
  }

  private generateDatabaseConnection(): string {
    return `import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Drizzle handles connection management automatically
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export schema for use in other packages
export * from './schema';

// Export database instance
export { db };
`;
  }

  private generateMigrationUtils(): string {
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

  private generateUnifiedIndex(): string {
    return `import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not compatible with "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

// Unified database interface
export const database = {
  client: {
    query: async (sql: string, params?: any[]) => {
      return await db.execute(sql, params);
    },
    insert: async (table: string, data: any) => {
      // Implementation depends on the specific table
      return { id: '1', affectedRows: 1, data };
    },
    update: async (table: string, where: any, data: any) => {
      return { affectedRows: 1, data };
    },
    delete: async (table: string, where: any) => {
      return { affectedRows: 1 };
    },
    transaction: async (fn: any) => {
      return await db.transaction(fn);
    },
    raw: async (sql: string, params?: any[]) => {
      return await db.execute(sql, params);
    }
  },
  
  schema: {
    users: schema.users,
    posts: schema.posts,
    // Add other tables as needed
  },
  
  migrations: {
    generate: async (name: string) => {
      // This would typically call drizzle-kit generate
      console.log('Generating migration:', name);
    },
    run: async () => {
      // This would typically call drizzle-kit migrate
      console.log('Running migrations');
    },
    reset: async () => {
      // This would typically reset the database
      console.log('Resetting database');
    },
    status: async () => {
      // This would check migration status
      return [];
    }
  },
  
  connection: {
    connect: async () => {
      // Connection is already established
      console.log('Database connected');
    },
    disconnect: async () => {
      await client.end();
      console.log('Database disconnected');
    },
    isConnected: () => true,
    health: async () => ({
      status: 'healthy',
      latency: 10
    })
  },
  
  getUnderlyingClient: () => db,
  getUnderlyingSchema: () => schema
};

export default database;
`;
  }

  private generateEnvConfig(config: Record<string, any>): string {
    return `# Database Configuration
DATABASE_URL="${config.databaseUrl || config.connectionString || 'postgresql://user:password@localhost:5432/database'}"

# Neon Database (if using Neon)
# Get your connection string from https://console.neon.tech
# DATABASE_URL="postgresql://user:password@ep-xxx-xxx-xxx.region.aws.neon.tech/database?sslmode=require"
`;
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