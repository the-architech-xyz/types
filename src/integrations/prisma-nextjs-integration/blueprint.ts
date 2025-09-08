import { Blueprint } from '../../types/adapter.js';

const prismaNextjsIntegrationBlueprint: Blueprint = {
  id: 'prisma-nextjs-integration',
  name: 'Prisma Next.js Integration',
  description: 'Complete Prisma ORM integration for Next.js applications',
  version: '1.0.0',
  actions: [
    // Core Database Files
    {
      type: 'CREATE_FILE',
      path: 'src/lib/db/index.ts',
      condition: '{{#if integration.features.apiRoutes}}',
      content: `// Prisma Database Configuration
export { prisma } from './client';
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
      type: 'CREATE_FILE',
      path: 'src/lib/db/client.ts',
      condition: '{{#if integration.features.connectionPooling}}',
      content: `import { PrismaClient } from '@prisma/client';

// Global Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with connection pooling
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Health check function
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency: number;
  error?: string;
}> {
  const start = Date.now();
  
  try {
    await prisma.$queryRaw\`SELECT 1\`;
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
  await prisma.$disconnect();
}

// Connection pooling configuration
export const connectionConfig = {
  maxConnections: 20,
  minConnections: 5,
  connectionTimeout: 10000,
  idleTimeout: 30000,
};
`
    },
    {
      type: 'CREATE_FILE',
      path: 'src/lib/db/schema.prisma',
      condition: '{{#if integration.features.validators}}',
      content: `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  avatar    String?
  role      String   @default("user")
  isActive  Boolean  @default(true)
  metadata  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  posts     Post[]
  comments  Comment[]

  @@map("users")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  slug      String   @unique
  published Boolean  @default(false)
  authorId  Int
  tags      Json?
  viewCount Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  author   User      @relation(fields: [authorId], references: [id])
  comments Comment[]

  @@map("posts")
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  postId    Int
  authorId  Int
  parentId  Int?
  isApproved Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  post   Post    @relation(fields: [postId], references: [id])
  author User    @relation(fields: [authorId], references: [id])
  parent Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies Comment[] @relation("CommentReplies")

  @@map("comments")
}
`
    },
    {
      type: 'CREATE_FILE',
      path: 'src/lib/db/queries.ts',
      condition: '{{#if integration.features.queries}}',
      content: `import { prisma } from './client';
import { Prisma } from '@prisma/client';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  include?: any;
  where?: any;
}

// Generic query builder
export function createQuery<T>(
  model: any,
  conditions: any = {},
  options: QueryOptions = {}
) {
  const { limit, offset, orderBy, orderDirection, include, where } = options;
  
  return model.findMany({
    where: { ...where, ...conditions },
    include,
    orderBy: orderBy ? { [orderBy]: orderDirection || 'asc' } : undefined,
    take: limit,
    skip: offset,
  });
}

// User queries
export async function findUserById(id: number, include?: any) {
  return await prisma.user.findUnique({
    where: { id },
    include,
  });
}

export async function findUserByEmail(email: string, include?: any) {
  return await prisma.user.findUnique({
    where: { email },
    include,
  });
}

export async function findAllUsers(options: QueryOptions = {}) {
  return await prisma.user.findMany({
    where: options.where,
    include: options.include,
    orderBy: options.orderBy ? { [options.orderBy]: options.orderDirection || 'asc' } : undefined,
    take: options.limit,
    skip: options.offset,
  });
}

// Post queries
export async function findPostById(id: number, include?: any) {
  return await prisma.post.findUnique({
    where: { id },
    include,
  });
}

export async function findPostBySlug(slug: string, include?: any) {
  return await prisma.post.findUnique({
    where: { slug },
    include,
  });
}

export async function findPublishedPosts(options: QueryOptions = {}) {
  return await prisma.post.findMany({
    where: { 
      published: true,
      ...options.where 
    },
    include: options.include,
    orderBy: options.orderBy ? { [options.orderBy]: options.orderDirection || 'asc' } : undefined,
    take: options.limit,
    skip: options.offset,
  });
}

export async function searchPosts(searchTerm: string, options: QueryOptions = {}) {
  return await prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { content: { contains: searchTerm, mode: 'insensitive' } },
      ],
      ...options.where,
    },
    include: options.include,
    orderBy: options.orderBy ? { [options.orderBy]: options.orderDirection || 'asc' } : undefined,
    take: options.limit,
    skip: options.offset,
  });
}

// Comment queries
export async function findCommentsByPostId(postId: number, options: QueryOptions = {}) {
  return await prisma.comment.findMany({
    where: { 
      postId,
      ...options.where 
    },
    include: options.include,
    orderBy: options.orderBy ? { [options.orderBy]: options.orderDirection || 'asc' } : undefined,
    take: options.limit,
    skip: options.offset,
  });
}

export async function findApprovedComments(postId: number, options: QueryOptions = {}) {
  return await prisma.comment.findMany({
    where: { 
      postId,
      isApproved: true,
      ...options.where 
    },
    include: options.include,
    orderBy: options.orderBy ? { [options.orderBy]: options.orderDirection || 'asc' } : undefined,
    take: options.limit,
    skip: options.offset,
  });
}

// CRUD operations
export async function createRecord(model: any, data: any) {
  return await model.create({ data });
}

export async function updateRecord(model: any, id: number, data: any) {
  return await model.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
  });
}

export async function deleteRecord(model: any, id: number) {
  return await model.delete({
    where: { id },
  });
}

// Advanced queries
export async function findPostsWithComments(postId?: number) {
  return await prisma.post.findMany({
    where: postId ? { id: postId } : undefined,
    include: {
      author: true,
      comments: {
        include: {
          author: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function findUsersWithPostCount() {
  return await prisma.user.findMany({
    include: {
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
  });
}
`
    },
    {
      type: 'CREATE_FILE',
      path: 'src/lib/db/transactions.ts',
      condition: '{{#if integration.features.transactions}}',
      content: `import { prisma } from './client';

export interface TransactionOptions {
  isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
  maxWait?: number;
  timeout?: number;
}

// Transaction wrapper
export async function withTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  return await prisma.$transaction(callback, {
    isolationLevel: options.isolationLevel,
    maxWait: options.maxWait,
    timeout: options.timeout,
  });
}

// Run multiple operations in a transaction
export async function runInTransaction<T>(
  operations: Array<(tx: Prisma.TransactionClient) => Promise<any>>,
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
    const user = await tx.user.create({ data: userData });
    
    // Create profile (if you have a profile model)
    // const profile = await tx.profile.create({
    //   data: {
    //     ...profileData,
    //     userId: user.id,
    //   },
    // });
    
    return { user };
  });
}

// Example transaction: Update post with view count
export async function incrementPostViewCount(postId: number) {
  return await withTransaction(async (tx) => {
    // Get current post
    const post = await tx.post.findUnique({
      where: { id: postId },
    });
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    // Increment view count
    const updatedPost = await tx.post.update({
      where: { id: postId },
      data: { 
        viewCount: post.viewCount + 1,
        updatedAt: new Date(),
      },
    });
    
    return updatedPost;
  });
}

// Example transaction: Create post with tags
export async function createPostWithTags(postData: any, tagIds: number[]) {
  return await withTransaction(async (tx) => {
    // Create post
    const post = await tx.post.create({
      data: {
        ...postData,
        // If you have a many-to-many relation with tags
        // tags: {
        //   connect: tagIds.map(id => ({ id })),
        // },
      },
    });
    
    return post;
  });
}
`
    },
    {
      type: 'CREATE_FILE',
      path: 'src/app/api/db/health/route.ts',
      condition: '{{#if integration.features.healthChecks}}',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db/client';

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

export const blueprint = prismaNextjsIntegrationBlueprint;
