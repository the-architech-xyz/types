/**
 * Drizzle Generator
 * 
 * Handles all file generation logic for the Drizzle plugin.
 * Separated from the main plugin for better organization.
 */

import { DatabasePluginConfig, DatabaseProvider, ORMOption, NeonConfig, SupabaseConfig, MongoDBConfig } from '../../../../types/plugin-interfaces.js';
import { PathResolver } from '../../../base/PathResolver.js';

export class DrizzleGenerator {
  private pathResolver: PathResolver;

  constructor(pathResolver: PathResolver) {
    this.pathResolver = pathResolver;
  }

  /**
   * Generate Drizzle configuration file
   */
  async generateDrizzleConfig(config: DatabasePluginConfig): Promise<void> {
    const configPath = this.pathResolver.getConfigPath('drizzle.config.ts');
    const configContent = this.generateDrizzleConfigContent(config);
    
    // Use the base plugin's generateFile method through pathResolver
    await this.pathResolver.ensureDirectory(configPath);
    const fs = await import('fs-extra');
    await fs.writeFile(configPath, configContent, 'utf8');
  }

  /**
   * Generate database schema file
   */
  async generateSchemaFile(config: DatabasePluginConfig): Promise<void> {
    const schemaPath = this.pathResolver.getSchemaPath();
    const schemaContent = this.generateSchemaContent(config);
    
    await this.pathResolver.ensureDirectory(schemaPath);
    const fs = await import('fs-extra');
    await fs.writeFile(schemaPath, schemaContent, 'utf8');
  }

  /**
   * Generate database connection file
   */
  async generateConnectionFile(config: DatabasePluginConfig): Promise<void> {
    const connectionPath = this.pathResolver.getLibPath('db', 'connection.ts');
    const connectionContent = this.generateConnectionContent(config);
    
    await this.pathResolver.ensureDirectory(connectionPath);
    const fs = await import('fs-extra');
    await fs.writeFile(connectionPath, connectionContent, 'utf8');
  }

  /**
   * Generate unified interface file
   */
  async generateUnifiedInterface(config: DatabasePluginConfig): Promise<void> {
    const interfacePath = this.pathResolver.getUnifiedInterfacePath('db');
    const interfaceContent = this.generateUnifiedInterfaceContent(config);
    
    await this.pathResolver.ensureDirectory(interfacePath);
    const fs = await import('fs-extra');
    await fs.writeFile(interfacePath, interfaceContent, 'utf8');
  }

  /**
   * Generate initial migration
   */
  async generateInitialMigration(config: DatabasePluginConfig): Promise<void> {
    const migrationDir = this.pathResolver.getMigrationPath('');
    await this.pathResolver.ensureDirectory(migrationDir);
    
    const migrationPath = this.pathResolver.getMigrationPath('0001_initial.ts');
    const migrationContent = this.generateMigrationContent(config);
    
    const fs = await import('fs-extra');
    await fs.writeFile(migrationPath, migrationContent, 'utf8');
  }

  /**
   * Generate environment variables
   */
  generateEnvVars(config: DatabasePluginConfig): Record<string, string> {
    const envVars: Record<string, string> = {};

    // Common database environment variables
    if ('connectionString' in config.connection) {
      envVars.DATABASE_URL = config.connection.connectionString || '';
    }
    
    if (config.provider === DatabaseProvider.NEON) {
      const neonConfig = config as NeonConfig;
      envVars.NEON_DATABASE_URL = neonConfig.connection.connectionString || '';
      if (neonConfig.connection.region) {
        envVars.NEON_REGION = neonConfig.connection.region;
      }
    }

    if (config.provider === DatabaseProvider.SUPABASE) {
      const supabaseConfig = config as SupabaseConfig;
      envVars.SUPABASE_URL = supabaseConfig.connection.projectUrl || '';
      envVars.SUPABASE_ANON_KEY = supabaseConfig.connection.anonKey || '';
      envVars.SUPABASE_SERVICE_ROLE_KEY = supabaseConfig.connection.serviceRoleKey || '';
    }

    if (config.provider === DatabaseProvider.MONGODB) {
      const mongoConfig = config as MongoDBConfig;
      envVars.MONGODB_URI = mongoConfig.connection.connectionString || '';
      envVars.MONGODB_DATABASE = mongoConfig.connection.databaseName || '';
    }

    return envVars;
  }

  /**
   * Generate package.json scripts
   */
  generateScripts(config: DatabasePluginConfig): Record<string, string> {
    const scripts: Record<string, string> = {};

    // Add migration scripts
    scripts['db:migrate'] = 'drizzle-kit migrate';
    scripts['db:generate'] = 'drizzle-kit generate';
    scripts['db:studio'] = 'drizzle-kit studio';
    scripts['db:push'] = 'drizzle-kit push';

    // Add database-specific scripts
    if (config.provider === DatabaseProvider.NEON) {
      scripts['db:neon:deploy'] = 'drizzle-kit migrate:deploy';
    }

    if (config.provider === DatabaseProvider.SUPABASE) {
      scripts['db:supabase:push'] = 'drizzle-kit push:pg';
    }

    return scripts;
  }

  // ============================================================================
  // PRIVATE GENERATION METHODS
  // ============================================================================

  private generateDrizzleConfigContent(config: DatabasePluginConfig): string {
    const driver = this.getDriverForProvider(config.provider);
    const schemaPath = this.pathResolver.getRelativePath(this.pathResolver.getSchemaPath());
    const migrationsPath = this.pathResolver.getRelativePath(this.pathResolver.getMigrationPath(''));

    return `import type { Config } from 'drizzle-kit';

export default {
  schema: '${schemaPath}',
  out: '${migrationsPath}',
  driver: '${driver}',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
`;
  }

  private generateSchemaContent(config: DatabasePluginConfig): string {
    const imports = this.getSchemaImports(config.provider);
    const tables = this.generateSampleTables(config);

    return `${imports}

// Sample schema - customize based on your needs
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  authorId: integer('author_id').references(() => users.id),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

${tables}

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
`;
  }

  private generateConnectionContent(config: DatabasePluginConfig): string {
    const imports = this.getConnectionImports(config.provider);
    const connectionSetup = this.getConnectionSetup(config);

    return `${imports}

// Database connection configuration
export const dbConfig = ${JSON.stringify(config, null, 2)};

// Create database connection
export const db = ${connectionSetup};

// Export for use in other modules
export default db;
`;
  }

  private generateUnifiedInterfaceContent(config: DatabasePluginConfig): string {
    return `/**
 * Database Module - Unified Interface
 * 
 * This module provides a unified interface for database operations
 * regardless of the underlying database provider or ORM.
 */

// Re-export the database connection
export { db, dbConfig } from './connection.js';

// Re-export schema types
export type { User, NewUser, Post, NewPost } from '../schema.js';

// Re-export schema tables
export { users, posts } from '../schema.js';

// Database client class for type-safe operations
export class DatabaseClient {
  constructor(private db: any) {}

  // User operations
  async createUser(data: NewUser) {
    return this.db.insert(users).values(data).returning();
  }

  async getUserById(id: number) {
    return this.db.select().from(users).where(eq(users.id, id)).limit(1);
  }

  async getUserByEmail(email: string) {
    return this.db.select().from(users).where(eq(users.email, email)).limit(1);
  }

  async updateUser(id: number, data: Partial<NewUser>) {
    return this.db.update(users).set(data).where(eq(users.id, id)).returning();
  }

  async deleteUser(id: number) {
    return this.db.delete(users).where(eq(users.id, id));
  }

  // Post operations
  async createPost(data: NewPost) {
    return this.db.insert(posts).values(data).returning();
  }

  async getPostById(id: number) {
    return this.db.select().from(posts).where(eq(posts.id, id)).limit(1);
  }

  async getPostsByAuthor(authorId: number) {
    return this.db.select().from(posts).where(eq(posts.authorId, authorId));
  }

  async updatePost(id: number, data: Partial<NewPost>) {
    return this.db.update(posts).set(data).where(eq(posts.id, id)).returning();
  }

  async deletePost(id: number) {
    return this.db.delete(posts).where(eq(posts.id, id));
  }

  // Query operations
  async query(sql: string, params?: any[]) {
    return this.db.execute(sql, params);
  }

  async transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return this.db.transaction(fn);
  }
}

// Create and export database client instance
export const dbClient = new DatabaseClient(db);

// Utility functions
export const createConnection = () => db;
export const closeConnection = async () => {
  // Implementation depends on the database driver
  console.log('Connection closed');
};

// Constants
export const DEFAULT_TIMEOUT = 30000; // 30 seconds
export const MAX_CONNECTIONS = 10;

// Types
export interface DatabaseConfig {
  provider: string;
  connection: any;
  features: any;
  orm?: any;
}

// Re-export everything for convenience
export * from './connection.js';
export * from '../schema.js';
`;
  }

  private generateMigrationContent(config: DatabasePluginConfig): string {
    return `import { sql } from 'drizzle-orm';

export async function up(db: any) {
  // Create users table
  await db.execute(sql\`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  \`);

  // Create posts table
  await db.execute(sql\`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      author_id INTEGER REFERENCES users(id),
      published BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  \`);

  // Create indexes
  await db.execute(sql\`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
    CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
  \`);
}

export async function down(db: any) {
  // Drop tables in reverse order
  await db.execute(sql\`DROP TABLE IF EXISTS posts;\`);
  await db.execute(sql\`DROP TABLE IF EXISTS users;\`);
}
`;
  }

  private generateSampleTables(config: DatabasePluginConfig): string {
    // Add more sample tables based on features
    if (config.features?.seeding) {
      return `
// Additional tables for seeding
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  color: varchar('color', { length: 7 }), // hex color
  createdAt: timestamp('created_at').defaultNow(),
});

export const postTags = pgTable('post_tags', {
  postId: integer('post_id').references(() => posts.id),
  tagId: integer('tag_id').references(() => tags.id),
}, (table) => ({
  pk: primaryKey(table.postId, table.tagId),
}));
`;
    }
    return '';
  }

  private getDriverForProvider(provider: DatabaseProvider): string {
    switch (provider) {
      case DatabaseProvider.NEON:
      case DatabaseProvider.SUPABASE:
        return 'pg';
      case DatabaseProvider.MONGODB:
        return 'mongodb';
      case DatabaseProvider.PLANETSCALE:
        return 'mysql2';
      case DatabaseProvider.LOCAL:
        return 'better-sqlite3';
      default:
        return 'pg';
    }
  }

  private getSchemaImports(provider: DatabaseProvider): string {
    const baseImports = `import { pgTable, serial, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';`;

    switch (provider) {
      case DatabaseProvider.NEON:
      case DatabaseProvider.SUPABASE:
        return baseImports;
      case DatabaseProvider.MONGODB:
        return `import { collection, objectId, string, date, boolean } from 'drizzle-orm/mongodb';`;
      case DatabaseProvider.PLANETSCALE:
        return `import { mysqlTable, serial, varchar, text, timestamp, boolean, int } from 'drizzle-orm/mysql-core';`;
      case DatabaseProvider.LOCAL:
        return `import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';`;
      default:
        return baseImports;
    }
  }

  private getConnectionImports(provider: DatabaseProvider): string {
    switch (provider) {
      case DatabaseProvider.NEON:
        return `import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';`;
      case DatabaseProvider.SUPABASE:
        return `import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';`;
      case DatabaseProvider.MONGODB:
        return `import { drizzle } from 'drizzle-orm/mongodb';
import { MongoClient } from 'mongodb';`;
      case DatabaseProvider.PLANETSCALE:
        return `import { drizzle } from 'drizzle-orm/planetscale-serverless';
import { connect } from '@planetscale/database';`;
      case DatabaseProvider.LOCAL:
        return `import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';`;
      default:
        return `import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';`;
    }
  }

  private getConnectionSetup(config: DatabasePluginConfig): string {
    switch (config.provider) {
      case DatabaseProvider.NEON:
        return `drizzle(neon(process.env.NEON_DATABASE_URL!));`;
      case DatabaseProvider.SUPABASE:
        return `drizzle(postgres(process.env.SUPABASE_URL!, {
  ssl: 'require',
}));`;
      case DatabaseProvider.MONGODB:
        return `drizzle(new MongoClient(process.env.MONGODB_URI!).connect());`;
      case DatabaseProvider.PLANETSCALE:
        return `drizzle(connect({
  url: process.env.DATABASE_URL!,
}));`;
      case DatabaseProvider.LOCAL:
        return `drizzle(new Database('local.db'));`;
      default:
        return `drizzle(postgres(process.env.DATABASE_URL!));`;
    }
  }
} 