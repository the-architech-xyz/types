/**
 * Drizzle Generator
 *
 * Handles all file generation logic for the Drizzle plugin.
 * Separated from the main plugin for better organization.
 */
import { DATABASE_PROVIDERS, DatabaseFeature } from '../../../../types/core.js';
export class DrizzleGenerator {
    pathResolver;
    constructor(pathResolver) {
        this.pathResolver = pathResolver;
    }
    /**
     * Generate all necessary files for the Drizzle plugin.
     * @returns An array of GeneratedFile objects.
     */
    generateAllFiles(config) {
        return [
            this.generateDrizzleConfig(config),
            this.generateSchemaFile(config),
            this.generateConnectionFile(config),
            this.generateUnifiedInterface(config),
            this.generateInitialMigration(config)
        ];
    }
    /**
     * Generate Drizzle configuration file content.
     */
    generateDrizzleConfig(config) {
        return {
            path: 'drizzle.config.ts', // Relative path
            content: this.generateDrizzleConfigContent(config)
        };
    }
    /**
     * Generate database schema file content.
     */
    generateSchemaFile(config) {
        return {
            path: 'db/schema.ts', // Relative path to be resolved by BasePlugin
            content: this.generateSchemaContent(config)
        };
    }
    /**
     * Generate database connection file content.
     */
    generateConnectionFile(config) {
        return {
            path: 'db/connection.ts',
            content: this.generateConnectionContent(config)
        };
    }
    /**
     * Generate unified interface file content.
     */
    generateUnifiedInterface(config) {
        return {
            path: 'db/index.ts',
            content: this.generateUnifiedInterfaceContent(config)
        };
    }
    /**
     * Generate initial migration file content.
     */
    generateInitialMigration(config) {
        return {
            path: 'db/migrations/0001_initial.ts',
            content: this.generateMigrationContent(config)
        };
    }
    /**
     * Generate environment variables.
     */
    generateEnvVars(config) {
        const envVars = {};
        // Common database environment variables
        if (config.connectionString) {
            envVars.DATABASE_URL = config.connectionString;
        }
        if (config.provider === DATABASE_PROVIDERS.NEON) {
            envVars.NEON_DATABASE_URL = config.connectionString || '';
            if (config.connection?.host) {
                envVars.NEON_REGION = config.connection.host;
            }
        }
        if (config.provider === DATABASE_PROVIDERS.SUPABASE) {
            const supabaseConfig = config; // Assuming SupabaseConfig is not directly imported here
            envVars.SUPABASE_URL = supabaseConfig.connection.projectUrl || '';
            envVars.SUPABASE_ANON_KEY = supabaseConfig.connection.anonKey || '';
            envVars.SUPABASE_SERVICE_ROLE_KEY = supabaseConfig.connection.serviceRoleKey || '';
        }
        if (config.provider === DATABASE_PROVIDERS.MONGODB) {
            const mongoConfig = config; // Assuming MongoDBConfig is not directly imported here
            envVars.MONGODB_URI = mongoConfig.connection.connectionString || '';
            envVars.MONGODB_DATABASE = mongoConfig.connection.databaseName || '';
        }
        return envVars;
    }
    /**
     * Generate package.json scripts
     */
    generateScripts(config) {
        const scripts = {};
        // Add migration scripts
        scripts['db:migrate'] = 'drizzle-kit migrate';
        scripts['db:generate'] = 'drizzle-kit generate';
        scripts['db:studio'] = 'drizzle-kit studio';
        scripts['db:push'] = 'drizzle-kit push';
        // Add database-specific scripts
        if (config.provider === DATABASE_PROVIDERS.NEON) {
            scripts['db:neon:deploy'] = 'drizzle-kit migrate:deploy';
        }
        if (config.provider === DATABASE_PROVIDERS.SUPABASE) {
            scripts['db:supabase:push'] = 'drizzle-kit push:pg';
        }
        return scripts;
    }
    // ============================================================================
    // PRIVATE GENERATION METHODS
    // ============================================================================
    generateDrizzleConfigContent(config) {
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
    generateSchemaContent(config) {
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
    generateConnectionContent(config) {
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
    generateUnifiedInterfaceContent(config) {
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
    generateMigrationContent(config) {
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
    generateSampleTables(config) {
        // Add more sample tables based on features
        if (config.features?.includes(DatabaseFeature.SEEDING)) {
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
    getDriverForProvider(provider) {
        switch (provider) {
            case DATABASE_PROVIDERS.NEON:
            case DATABASE_PROVIDERS.SUPABASE:
                return 'pg';
            case DATABASE_PROVIDERS.MONGODB:
                return 'mongodb';
            case DATABASE_PROVIDERS.PLANETSCALE:
                return 'mysql2';
            case DATABASE_PROVIDERS.LOCAL_SQLITE:
                return 'better-sqlite3';
            default:
                return 'pg';
        }
    }
    getSchemaImports(provider) {
        const baseImports = `import { pgTable, serial, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';`;
        switch (provider) {
            case DATABASE_PROVIDERS.NEON:
            case DATABASE_PROVIDERS.SUPABASE:
                return baseImports;
            case DATABASE_PROVIDERS.MONGODB:
                return `import { collection, objectId, string, date, boolean } from 'drizzle-orm/mongodb';`;
            case DATABASE_PROVIDERS.PLANETSCALE:
                return `import { mysqlTable, serial, varchar, text, timestamp, boolean, int } from 'drizzle-orm/mysql-core';`;
            case DATABASE_PROVIDERS.LOCAL_SQLITE:
                return `import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';`;
            default:
                return baseImports;
        }
    }
    getConnectionImports(provider) {
        switch (provider) {
            case DATABASE_PROVIDERS.NEON:
                return `import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';`;
            case DATABASE_PROVIDERS.SUPABASE:
                return `import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';`;
            case DATABASE_PROVIDERS.MONGODB:
                return `import { drizzle } from 'drizzle-orm/mongodb';
import { MongoClient } from 'mongodb';`;
            case DATABASE_PROVIDERS.PLANETSCALE:
                return `import { drizzle } from 'drizzle-orm/planetscale-serverless';
import { connect } from '@planetscale/database';`;
            case DATABASE_PROVIDERS.LOCAL_SQLITE:
                return `import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';`;
            default:
                return `import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';`;
        }
    }
    getConnectionSetup(config) {
        switch (config.provider) {
            case DATABASE_PROVIDERS.NEON:
                return `drizzle(neon(process.env.NEON_DATABASE_URL!));`;
            case DATABASE_PROVIDERS.SUPABASE:
                return `drizzle(postgres(process.env.SUPABASE_URL!, {
  ssl: 'require',
}));`;
            case DATABASE_PROVIDERS.MONGODB:
                return `drizzle(new MongoClient(process.env.MONGODB_URI!).connect());`;
            case DATABASE_PROVIDERS.PLANETSCALE:
                return `drizzle(connect({
  url: process.env.DATABASE_URL!,
`;
            case DATABASE_PROVIDERS.LOCAL_SQLITE:
                return `drizzle(new Database('local.db'));`;
            default:
                return `drizzle(postgres(process.env.DATABASE_URL!));`;
        }
    }
}
//# sourceMappingURL=DrizzleGenerator.js.map