import { Blueprint } from '../../types/adapter.js';

const drizzleNextjsIntegrationBlueprint: Blueprint = {
  id: 'drizzle-nextjs-integration',
  name: 'Drizzle Next.js Integration',
  description: 'Complete Drizzle ORM integration for Next.js applications',
  version: '1.0.0',
  actions: [
    // Core Database Files
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/db/index.ts',
      condition: '{{#if integration.features.apiRoutes}}',
      content: `// Drizzle Database Configuration
export { db } from './connection';
export { schema } from './schema';
export { runMigrations } from './migrations';
export { seedDatabase } from './seed';

// Query utilities
export { 
  createQuery, 
  findById, 
  findAll, 
  createRecord, 
  updateRecord, 
  deleteRecord 
} from './queries';

// Transaction utilities
export { 
  withTransaction, 
  runInTransaction 
} from './transactions';

// Validation utilities
export { 
  validateSchema, 
  validateRecord 
} from './validators';

// Types
export type { DatabaseConfig, QueryOptions, TransactionOptions } from './types';
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/db/connection.ts',
      condition: '{{#if integration.features.connectionPooling}}',
      content: `import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { schema } from './schema';

// Database configuration
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/myapp';

// Create connection with pooling
const client = postgres(connectionString, {
  max: 20, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Health check function
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency: number;
  error?: string;
}> {
  const start = Date.now();
  
  try {
    await client\`SELECT 1\`;
    const latency = Date.now() - start;
    
    return {
      status: 'healthy',
      latency,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  await client.end();
}
`
    },
    {
      type: 'CREATE_FILE',
      path: 'src/lib/db/schema.ts',
      condition: '{{#if integration.features.validators}}',
      content: `import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  role: text('role').notNull().default('user'),
  isActive: boolean('is_active').notNull().default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Posts table
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  slug: text('slug').notNull().unique(),
  published: boolean('published').notNull().default(false),
  authorId: integer('author_id').notNull().references(() => users.id),
  tags: jsonb('tags'),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Comments table
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  postId: integer('post_id').notNull().references(() => posts.id),
  authorId: integer('author_id').notNull().references(() => users.id),
  parentId: integer('parent_id').references(() => comments.id),
  isApproved: boolean('is_approved').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}));

// Export schema
export const schema = {
  users,
  posts,
  comments,
};
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/db/queries.ts',
      condition: '{{#if integration.features.queries}}',
      content: `import { eq, and, desc, asc, like, sql } from 'drizzle-orm';
import { db } from './connection';
import { users, posts, comments } from './schema';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// Generic query builder
export function createQuery<T>(
  table: any,
  conditions: any = {},
  options: QueryOptions = {}
) {
  let query = db.select().from(table);
  
  // Apply conditions
  Object.entries(conditions).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.where(eq(table[key], value));
    }
  });
  
  // Apply ordering
  if (options.orderBy) {
    const direction = options.orderDirection === 'desc' ? desc : asc;
    query = query.orderBy(direction(table[options.orderBy]));
  }
  
  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  if (options.offset) {
    query = query.offset(options.offset);
  }
  
  return query;
}

// User queries
export async function findUserById(id: number) {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0] || null;
}

export async function findUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0] || null;
}

export async function findAllUsers(options: QueryOptions = {}) {
  return createQuery(users, {}, options);
}

// Post queries
export async function findPostById(id: number) {
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id));
  return result[0] || null;
}

export async function findPostBySlug(slug: string) {
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug));
  return result[0] || null;
}

export async function findPublishedPosts(options: QueryOptions = {}) {
  return createQuery(posts, { published: true }, options);
}

export async function searchPosts(searchTerm: string, options: QueryOptions = {}) {
  let query = db
    .select()
    .from(posts)
    .where(
      sql\`\${posts.title} ILIKE \${'%' + searchTerm + '%'} OR \${posts.content} ILIKE \${'%' + searchTerm + '%'}\`
    );
  
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  return query;
}

// Comment queries
export async function findCommentsByPostId(postId: number, options: QueryOptions = {}) {
  return createQuery(comments, { postId }, options);
}

export async function findApprovedComments(postId: number, options: QueryOptions = {}) {
  return createQuery(comments, { postId, isApproved: true }, options);
}

// CRUD operations
export async function createRecord(table: any, data: any) {
  const result = await db.insert(table).values(data).returning();
  return result[0];
}

export async function updateRecord(table: any, id: number, data: any) {
  const result = await db
    .update(table)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(table.id, id))
    .returning();
  return result[0];
}

export async function deleteRecord(table: any, id: number) {
  const result = await db
    .delete(table)
    .where(eq(table.id, id))
    .returning();
  return result[0];
}
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/db/transactions.ts',
      condition: '{{#if integration.features.transactions}}',
      content: `import { db } from './connection';

export interface TransactionOptions {
  isolationLevel?: 'read uncommitted' | 'read committed' | 'repeatable read' | 'serializable';
  readOnly?: boolean;
  deferrable?: boolean;
}

// Transaction wrapper
export async function withTransaction<T>(
  callback: (tx: any) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  return await db.transaction(async (tx) => {
    return await callback(tx);
  });
}

// Run multiple operations in a transaction
export async function runInTransaction<T>(
  operations: Array<(tx: any) => Promise<any>>,
  options: TransactionOptions = {}
): Promise<T[]> {
  return await withTransaction(async (tx) => {
    const results: T[] = [];
    
    for (const operation of operations) {
      const result = await operation(tx);
      results.push(result);
    }
    
    return results;
  }, options);
}

// Example transaction: Create user with profile
export async function createUserWithProfile(userData: any, profileData: any) {
  return await withTransaction(async (tx) => {
    // Create user
    const user = await tx.insert(users).values(userData).returning();
    
    // Create profile
    const profile = await tx.insert(profiles).values({
      ...profileData,
      userId: user[0].id,
    }).returning();
    
    return { user: user[0], profile: profile[0] };
  });
}

// Example transaction: Update post with view count
export async function incrementPostViewCount(postId: number) {
  return await withTransaction(async (tx) => {
    // Get current view count
    const post = await tx.select().from(posts).where(eq(posts.id, postId));
    
    if (!post[0]) {
      throw new Error('Post not found');
    }
    
    // Increment view count
    const updatedPost = await tx
      .update(posts)
      .set({ 
        viewCount: post[0].viewCount + 1,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId))
      .returning();
    
    return updatedPost[0];
  });
}
`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/app/api/db/health/route.ts',
      condition: '{{#if integration.features.healthChecks}}',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    const health = await checkDatabaseHealth();
    
    if (health.status === 'healthy') {
      return NextResponse.json({
        status: 'healthy',
        database: {
          status: health.status,
          latency: \`\${health.latency}ms\`,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        database: {
          status: health.status,
          error: health.error,
          latency: \`\${health.latency}ms\`,
        },
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
`
    }
  ]
};

export const blueprint = drizzleNextjsIntegrationBlueprint;
