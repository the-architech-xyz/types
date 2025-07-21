/**
 * Prisma Plugin - Pure Technology Implementation
 *
 * Provides Prisma ORM integration with PostgreSQL using the official Prisma CLI.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../types/plugin.js';
import { templateService } from '../../core/templates/template-service.js';
import { CommandRunner } from '../../core/cli/command-runner.js';
import { DATABASE_PROVIDERS, DATABASE_FEATURES } from '../../types/shared-config.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
export class PrismaPlugin {
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
            id: 'prisma',
            name: 'Prisma ORM',
            version: '1.0.0',
            description: 'Next-generation TypeScript ORM with auto-generated queries',
            author: 'The Architech Team',
            category: PluginCategory.DATABASE,
            tags: ['database', 'orm', 'typescript', 'postgresql', 'mysql', 'sqlite', 'prisma'],
            license: 'Apache-2.0',
            repository: 'https://github.com/prisma/prisma',
            homepage: 'https://www.prisma.io',
            documentation: 'https://www.prisma.io/docs'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Prisma ORM with PostgreSQL database...');
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Initialize Prisma
            await this.initializePrisma(context);
            // Step 3: Create database schema and connection
            await this.createDatabaseFiles(context);
            // Step 4: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            // Step 5: Generate Prisma client
            await this.generatePrismaClient(context);
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
                        path: path.join(projectPath, 'src', 'lib', 'db', 'client.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'prisma', 'schema.prisma')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'prisma', 'seed.ts')
                    }
                ],
                dependencies: [
                    {
                        name: 'prisma',
                        version: '^5.0.0',
                        type: 'development',
                        category: PluginCategory.DATABASE
                    },
                    {
                        name: '@prisma/client',
                        version: '^5.0.0',
                        type: 'production',
                        category: PluginCategory.DATABASE
                    },
                    {
                        name: 'postgresql',
                        version: '^3.4.0',
                        type: 'production',
                        category: PluginCategory.DATABASE
                    }
                ],
                scripts: [
                    {
                        name: 'db:generate',
                        command: 'prisma generate',
                        description: 'Generate Prisma client',
                        category: 'dev'
                    },
                    {
                        name: 'db:push',
                        command: 'prisma db push',
                        description: 'Push schema changes to database',
                        category: 'dev'
                    },
                    {
                        name: 'db:migrate',
                        command: 'prisma migrate dev',
                        description: 'Create and apply database migrations',
                        category: 'dev'
                    },
                    {
                        name: 'db:studio',
                        command: 'prisma studio',
                        description: 'Open Prisma Studio',
                        category: 'dev'
                    },
                    {
                        name: 'db:seed',
                        command: 'tsx prisma/seed.ts',
                        description: 'Seed database with initial data',
                        category: 'dev'
                    }
                ],
                configs: [
                    {
                        file: '.env',
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
            return this.createErrorResult('Failed to install Prisma ORM', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Uninstalling Prisma ORM...');
            // Remove Prisma files
            const filesToRemove = [
                path.join(projectPath, 'prisma'),
                path.join(projectPath, 'src', 'lib', 'db'),
                path.join(projectPath, '.env')
            ];
            for (const file of filesToRemove) {
                if (await fsExtra.pathExists(file)) {
                    await fsExtra.remove(file);
                }
            }
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: ['Prisma files removed. You may need to manually remove dependencies from package.json'],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall Prisma ORM', startTime, [], error);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            context.logger.info('Updating Prisma ORM...');
            // Update dependencies
            await this.runner.execCommand(['npm', 'update', '@prisma/client', 'prisma']);
            // Regenerate client
            await this.runner.execCommand(['npx', 'prisma', 'generate']);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to update Prisma ORM', startTime, [], error);
        }
    }
    async validate(context) {
        const errors = [];
        const warnings = [];
        try {
            // Check if Prisma is properly installed
            const prismaPath = path.join(context.projectPath, 'prisma', 'schema.prisma');
            if (!await fsExtra.pathExists(prismaPath)) {
                errors.push({
                    field: 'prisma.schema',
                    message: 'Prisma schema file not found',
                    code: 'MISSING_SCHEMA',
                    severity: 'error'
                });
            }
            // Check if client is generated
            const clientPath = path.join(context.projectPath, 'node_modules', '@prisma', 'client');
            if (!await fsExtra.pathExists(clientPath)) {
                warnings.push('Prisma client not generated. Run "npm run db:generate"');
            }
            // Validate environment variables
            const envPath = path.join(context.projectPath, '.env');
            if (await fsExtra.pathExists(envPath)) {
                const envContent = await fsExtra.readFile(envPath, 'utf-8');
                if (!envContent.includes('DATABASE_URL')) {
                    warnings.push('DATABASE_URL not found in .env file');
                }
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [{
                        field: 'validation',
                        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        code: 'VALIDATION_ERROR',
                        severity: 'error'
                    }],
                warnings: []
            };
        }
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'nuxt', 'svelte', 'angular'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            databases: ['postgresql', 'mysql', 'sqlite'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['@prisma/client', 'prisma'];
    }
    getConflicts() {
        return ['drizzle', 'typeorm'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: '@prisma/client',
                description: 'Prisma client for database access',
                version: '^5.0.0'
            },
            {
                type: 'package',
                name: 'prisma',
                description: 'Prisma CLI and development tools',
                version: '^5.0.0'
            },
            {
                type: 'config',
                name: 'DATABASE_URL',
                description: 'Database connection string',
                optional: false
            }
        ];
    }
    getDefaultConfig() {
        return {
            provider: 'postgresql',
            databaseUrl: 'postgresql://user:password@localhost:5432/mydb',
            features: {
                migrations: true,
                seeding: true,
                studio: true
            }
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                provider: {
                    type: 'string',
                    description: 'Database provider',
                    enum: [DATABASE_PROVIDERS.POSTGRESQL, DATABASE_PROVIDERS.MYSQL, DATABASE_PROVIDERS.SQLITE],
                    default: DATABASE_PROVIDERS.POSTGRESQL
                },
                databaseUrl: {
                    type: 'string',
                    description: 'Database connection URL',
                    pattern: '^[a-zA-Z]+://.*$'
                },
                features: {
                    type: 'object',
                    description: 'Prisma features to enable',
                    properties: {
                        [DATABASE_FEATURES.MIGRATIONS]: {
                            type: 'boolean',
                            description: 'Enable database migrations',
                            default: true
                        },
                        [DATABASE_FEATURES.SEEDING]: {
                            type: 'boolean',
                            description: 'Enable database seeding',
                            default: true
                        },
                        [DATABASE_FEATURES.STUDIO]: {
                            type: 'boolean',
                            description: 'Enable Prisma Studio',
                            default: true
                        }
                    }
                }
            },
            required: ['provider', 'databaseUrl']
        };
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    async installDependencies(context) {
        const { projectPath } = context;
        context.logger.info('Installing Prisma dependencies...');
        const dependencies = [
            '@prisma/client@^5.0.0',
            'prisma@^5.0.0'
        ];
        await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
    }
    async initializePrisma(context) {
        const { projectPath } = context;
        context.logger.info('Initializing Prisma...');
        // Create prisma directory
        const prismaDir = path.join(projectPath, 'prisma');
        await fsExtra.ensureDir(prismaDir);
        // Initialize Prisma
        await this.runner.execCommand(['npx', 'prisma', 'init'], { cwd: projectPath });
    }
    async createDatabaseFiles(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Creating database files...');
        // Create database lib directory
        const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
        await fsExtra.ensureDir(dbLibDir);
        // Generate Prisma schema
        const schemaContent = this.generatePrismaSchema(pluginConfig);
        await fsExtra.writeFile(path.join(projectPath, 'prisma', 'schema.prisma'), schemaContent);
        // Generate database client
        const clientContent = this.generateDatabaseClient();
        await fsExtra.writeFile(path.join(dbLibDir, 'client.ts'), clientContent);
        // Generate seed file
        const seedContent = this.generateSeedFile();
        await fsExtra.writeFile(path.join(projectPath, 'prisma', 'seed.ts'), seedContent);
    }
    async generatePrismaClient(context) {
        const { projectPath } = context;
        context.logger.info('Generating Prisma client...');
        await this.runner.execCommand(['npx', 'prisma', 'generate'], { cwd: projectPath });
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        context.logger.info('Generating unified interface files...');
        const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
        await fsExtra.ensureDir(dbLibDir);
        // Generate unified database interface
        const unifiedContent = this.generateUnifiedIndex();
        await fsExtra.writeFile(path.join(dbLibDir, 'index.ts'), unifiedContent);
        // Generate schema types
        const schemaContent = this.generateSchemaTypes();
        await fsExtra.writeFile(path.join(dbLibDir, 'schema.ts'), schemaContent);
    }
    generatePrismaSchema(config) {
        return `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${config.provider || 'postgresql'}"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}
`;
    }
    generateDatabaseClient() {
        return `import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
`;
    }
    generateSeedFile() {
        return `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  // Create a test post
  const post = await prisma.post.upsert({
    where: { id: 'test-post-1' },
    update: {},
    create: {
      id: 'test-post-1',
      title: 'Hello World',
      content: 'This is a test post',
      published: true,
      authorId: user.id,
    },
  });

  console.log({ user, post });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
`;
    }
    generateUnifiedIndex() {
        return `/**
 * Unified Database Interface - Prisma Implementation
 * 
 * This file provides a unified interface for database operations
 * that works with the Prisma ORM. It abstracts away Prisma-specific
 * details and provides a clean API for database operations.
 */

import { prisma } from './client.js';
import type { User, Post, Prisma } from '@prisma/client';

// ============================================================================
// UNIFIED DATABASE INTERFACE
// ============================================================================

export interface UnifiedDatabase {
  // User operations
  createUser: (data: Prisma.UserCreateInput) => Promise<User>;
  getUser: (id: string) => Promise<User | null>;
  getUserByEmail: (email: string) => Promise<User | null>;
  updateUser: (id: string, data: Prisma.UserUpdateInput) => Promise<User>;
  deleteUser: (id: string) => Promise<User>;
  listUsers: (options?: ListOptions) => Promise<User[]>;
  
  // Post operations
  createPost: (data: Prisma.PostCreateInput) => Promise<Post>;
  getPost: (id: string) => Promise<Post | null>;
  updatePost: (id: string, data: Prisma.PostUpdateInput) => Promise<Post>;
  deletePost: (id: string) => Promise<Post>;
  listPosts: (options?: ListOptions) => Promise<Post[]>;
  listPostsByAuthor: (authorId: string, options?: ListOptions) => Promise<Post[]>;
  
  // Utility operations
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  healthCheck: () => Promise<boolean>;
}

export interface ListOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: Record<string, any>;
}

// ============================================================================
// PRISMA IMPLEMENTATION
// ============================================================================

export const createUnifiedDatabase = (): UnifiedDatabase => {
  return {
    // User operations
    async createUser(data) {
      return await prisma.user.create({ data });
    },

    async getUser(id) {
      return await prisma.user.findUnique({ where: { id } });
    },

    async getUserByEmail(email) {
      return await prisma.user.findUnique({ where: { email } });
    },

    async updateUser(id, data) {
      return await prisma.user.update({ where: { id }, data });
    },

    async deleteUser(id) {
      return await prisma.user.delete({ where: { id } });
    },

    async listUsers(options = {}) {
      return await prisma.user.findMany({
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        where: options.where,
      });
    },

    // Post operations
    async createPost(data) {
      return await prisma.post.create({ data });
    },

    async getPost(id) {
      return await prisma.post.findUnique({ where: { id } });
    },

    async updatePost(id, data) {
      return await prisma.post.update({ where: { id }, data });
    },

    async deletePost(id) {
      return await prisma.post.delete({ where: { id } });
    },

    async listPosts(options = {}) {
      return await prisma.post.findMany({
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        where: options.where,
        include: { author: true },
      });
    },

    async listPostsByAuthor(authorId, options = {}) {
      return await prisma.post.findMany({
        where: { authorId },
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        include: { author: true },
      });
    },

    // Utility operations
    async connect() {
      await prisma.$connect();
    },

    async disconnect() {
      await prisma.$disconnect();
    },

    async healthCheck() {
      try {
        await prisma.$queryRaw\`SELECT 1\`;
        return true;
      } catch {
        return false;
      }
    },
  };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const db = createUnifiedDatabase();
export default db;
`;
    }
    generateSchemaTypes() {
        return `/**
 * Database Schema Types - Prisma Implementation
 * 
 * This file exports TypeScript types for database entities
 * that can be used throughout the application.
 */

import type { User, Post, Prisma } from '@prisma/client';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type { User, Post };

// ============================================================================
// INPUT TYPES
// ============================================================================

export type CreateUserInput = Prisma.UserCreateInput;
export type UpdateUserInput = Prisma.UserUpdateInput;
export type CreatePostInput = Prisma.PostCreateInput;
export type UpdatePostInput = Prisma.PostUpdateInput;

// ============================================================================
// RELATION TYPES
// ============================================================================

export type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true };
}>;

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: { author: true };
}>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DatabaseEntity = User | Post;
export type DatabaseInput = CreateUserInput | CreatePostInput;
export type DatabaseUpdate = UpdateUserInput | UpdatePostInput;
`;
    }
    generateEnvConfig(config) {
        return `# Database Configuration
DATABASE_URL="${config.databaseUrl || 'postgresql://user:password@localhost:5432/mydb'}"

# Prisma Configuration
PRISMA_GENERATE_DATAPROXY=true
`;
    }
    createErrorResult(message, startTime, errors = [], originalError) {
        const duration = Date.now() - startTime;
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [
                {
                    code: 'PRISMA_INSTALL_ERROR',
                    message,
                    details: originalError,
                    severity: 'error'
                },
                ...errors
            ],
            warnings: [],
            duration
        };
    }
}
//# sourceMappingURL=prisma-plugin.js.map