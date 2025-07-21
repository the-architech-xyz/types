/**
 * Drizzle ORM Plugin - Pure ORM Implementation
 *
 * Provides Drizzle ORM integration that can work with any database provider.
 * Focuses only on ORM functionality and schema management.
 * Database connection is handled by separate database provider plugins.
 */
import { PluginCategory, TargetPlatform } from '../../../types/plugin.js';
import { templateService } from '../../../core/templates/template-service.js';
import { CommandRunner } from '../../../core/cli/command-runner.js';
import { ORM_LIBRARIES, DATABASE_ORM_COMPATIBILITY } from '../../../types/shared-config.js';
import { PluginValidationUtils } from '../../../core/plugin/plugin-validation.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService } from '../../../core/project/structure-service.js';
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
            category: PluginCategory.ORM,
            tags: ['orm', 'typescript', 'sql', 'migrations', 'schema'],
            license: 'Apache-2.0',
            repository: 'https://github.com/drizzle-team/drizzle-orm',
            homepage: 'https://orm.drizzle.team',
            documentation: 'https://orm.drizzle.team/docs'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure ORM Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectPath, pluginConfig } = context;
            context.logger.info('Installing Drizzle ORM...');
            // Step 1: Install Drizzle dependencies
            await this.installDependencies(context);
            // Step 2: Initialize drizzle-kit configuration
            await this.initializeDrizzleKit(context);
            // Step 3: Create ORM schema and utilities
            await this.createORMFiles(context);
            // Step 4: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'orm', 'drizzle.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'orm', 'schema.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'orm', 'migrations.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'drizzle.config.ts')
                    }
                ],
                dependencies: [
                    {
                        name: 'drizzle-orm',
                        version: '^0.44.3',
                        type: 'production',
                        category: PluginCategory.ORM
                    },
                    {
                        name: 'drizzle-kit',
                        version: '^0.31.4',
                        type: 'development',
                        category: PluginCategory.ORM
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
                        command: 'tsx src/lib/orm/migrations.ts',
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
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to setup Drizzle ORM', startTime, [], error);
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
                'src/lib/orm',
                'drizzle'
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
        try {
            // Use standardized validation utilities
            const contextValidation = await PluginValidationUtils.validateInstallationContext(context);
            if (!contextValidation.valid) {
                return contextValidation;
            }
            const errors = [];
            const warnings = [];
            // Validate Node.js version
            const nodeValidation = PluginValidationUtils.validateNodeVersion('16.0.0');
            if (!nodeValidation.valid) {
                errors.push(...nodeValidation.errors);
            }
            warnings.push(...nodeValidation.warnings);
            // Check for database provider compatibility
            const config = context.pluginConfig;
            if (config?.databaseProvider) {
                const compatibleORMs = DATABASE_ORM_COMPATIBILITY[config.databaseProvider];
                if (!compatibleORMs?.includes(ORM_LIBRARIES.DRIZZLE)) {
                    warnings.push(`Drizzle ORM may not be compatible with ${config.databaseProvider} database provider`);
                }
            }
            // Validate dependencies (will be installed during execution)
            const depValidation = await PluginValidationUtils.validateDependencies(context.projectPath, ['drizzle-orm', 'drizzle-kit']);
            warnings.push(...depValidation.warnings);
            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        }
        catch (error) {
            return PluginValidationUtils.createErrorResult(`Drizzle plugin validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'drizzle.validation');
        }
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'node'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['16.0.0', '18.0.0', '20.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            databases: ['postgresql', 'mysql', 'sqlite'],
            conflicts: ['prisma', 'typeorm']
        };
    }
    getDependencies() {
        return ['drizzle-orm', 'drizzle-kit'];
    }
    getConflicts() {
        return ['prisma', 'typeorm'];
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
                name: 'drizzle-kit',
                version: '^0.31.4',
                description: 'Drizzle CLI and migration tools'
            },
            {
                type: 'config',
                name: 'DATABASE_URL',
                description: 'Database connection string (provided by database provider plugin)'
            }
        ];
    }
    getDefaultConfig() {
        return {
            databaseUrl: process.env.DATABASE_URL || '',
            enableMigrations: true,
            enableStudio: true,
            enableSeeding: false
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                databaseUrl: {
                    type: 'string',
                    description: 'Database connection URL'
                },
                enableMigrations: {
                    type: 'boolean',
                    description: 'Enable database migrations',
                    default: true
                },
                enableStudio: {
                    type: 'boolean',
                    description: 'Enable Drizzle Studio',
                    default: true
                },
                enableSeeding: {
                    type: 'boolean',
                    description: 'Enable database seeding',
                    default: false
                }
            },
            required: ['databaseUrl']
        };
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    async installDependencies(context) {
        // Drizzle ORM dependencies only
        const dependencies = [
            'drizzle-orm@^0.44.3'
        ];
        const devDependencies = [
            'drizzle-kit@^0.31.4'
        ];
        context.logger.info('Installing Drizzle ORM...');
        await this.runner.install(dependencies, false, context.projectPath);
        await this.runner.install(devDependencies, true, context.projectPath);
    }
    async initializeDrizzleKit(context) {
        const { projectPath, pluginConfig } = context;
        // Create drizzle.config.ts
        const drizzleConfig = this.generateDrizzleConfig(pluginConfig);
        const configPath = path.join(projectPath, 'drizzle.config.ts');
        await fsExtra.writeFile(configPath, drizzleConfig);
    }
    async createORMFiles(context) {
        const { projectPath } = context;
        const structure = context.projectStructure;
        if (structure.isMonorepo) {
            // For monorepo, create files in packages/orm/
            const ormPath = structureService.getModulePath(projectPath, structure, 'orm');
            await fsExtra.ensureDir(ormPath);
            // Create schema file
            const schemaContent = this.generateDatabaseSchema();
            await fsExtra.writeFile(path.join(ormPath, 'schema.ts'), schemaContent);
            // Create ORM connection
            const connectionContent = this.generateORMConnection();
            await fsExtra.writeFile(path.join(ormPath, 'index.ts'), connectionContent);
            // Create migration utility
            const migrateContent = this.generateMigrationUtils();
            await fsExtra.writeFile(path.join(ormPath, 'migrations.ts'), migrateContent);
        }
        // For single app, skip this step as files will be created in src/lib/orm/ by generateUnifiedInterfaceFiles
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        const structure = context.projectStructure;
        const unifiedPath = structureService.getUnifiedInterfacePath(projectPath, structure, 'orm');
        await fsExtra.ensureDir(unifiedPath);
        // Create index.ts
        const indexContent = this.generateUnifiedIndex();
        const indexPath = path.join(unifiedPath, 'index.ts');
        await fsExtra.writeFile(indexPath, indexContent);
        // Create schema.ts
        const schemaContent = this.generateDatabaseSchema();
        const schemaPath = path.join(unifiedPath, 'schema.ts');
        await fsExtra.writeFile(schemaPath, schemaContent);
        // Create migrations.ts
        const migrationsContent = this.generateMigrationUtils();
        const migrationsPath = path.join(unifiedPath, 'migrations.ts');
        await fsExtra.writeFile(migrationsPath, migrationsContent);
    }
    generateDrizzleConfig(config) {
        return `import type { Config } from 'drizzle-kit';

export default {
  schema: '${config.schemaPath || './src/lib/orm/schema.ts'}',
  out: '${config.migrationsPath || './drizzle'}',
  dialect: 'postgresql', // Will be auto-detected based on DATABASE_URL
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
`;
    }
    generateDatabaseSchema() {
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
    generateORMConnection() {
        return `import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Drizzle ORM connection
// This works with any database provider that provides a connection string
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export schema for use in other packages
export * from './schema';

// Export database instance
export { db };
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
    console.log('Running Drizzle migrations...');
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
    generateUnifiedIndex() {
        return `import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Drizzle ORM unified interface
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Unified ORM interface
export const orm = {
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
      await sql.end();
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

export default orm;
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
//# sourceMappingURL=drizzle.plugin.js.map