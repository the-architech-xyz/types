import { eq, and, desc, asc, like, sql } from 'drizzle-orm';
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
      sql`${posts.title} ILIKE ${'%' + searchTerm + '%'} OR ${posts.content} ILIKE ${'%' + searchTerm + '%'}`
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
