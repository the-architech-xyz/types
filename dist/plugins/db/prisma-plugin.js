/**
 * Prisma ORM Plugin - Pure Technology Implementation
 *
 * Provides Prisma ORM integration with any database provider.
 * Focuses only on ORM technology setup and artifact generation.
 * Database provider setup is handled by separate database plugins.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../types/plugin.js';
import { templateService } from '../../core/templates/template-service.js';
import { CommandRunner } from '../../core/cli/command-runner.js';
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
            category: PluginCategory.ORM,
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
            context.logger.info('Installing Prisma ORM...');
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Initialize Prisma
            await this.initializePrisma(context);
            // Step 3: Create database schema and connection
            await this.createDatabaseFiles(context);
            // Step 4: Generate Prisma client
            await this.generatePrismaClient(context);
            // Step 5: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
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
                    }
                ],
                dependencies: [
                    {
                        name: 'prisma',
                        version: '^5.7.0',
                        type: 'production',
                        category: PluginCategory.ORM
                    },
                    {
                        name: '@prisma/client',
                        version: '^5.7.0',
                        type: 'production',
                        category: PluginCategory.ORM
                    }
                ],
                scripts: [
                    {
                        name: 'db:generate',
                        command: 'npx prisma generate',
                        description: 'Generate Prisma client',
                        category: 'dev'
                    },
                    {
                        name: 'db:migrate',
                        command: 'npx prisma migrate dev',
                        description: 'Run database migrations',
                        category: 'dev'
                    },
                    {
                        name: 'db:studio',
                        command: 'npx prisma studio',
                        description: 'Open Prisma Studio',
                        category: 'dev'
                    },
                    {
                        name: 'db:seed',
                        command: 'npx prisma db seed',
                        description: 'Seed database',
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
                path.join(projectPath, 'src', 'lib', 'db', 'client.ts'),
                path.join(projectPath, 'src', 'lib', 'db', 'schema.ts')
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
            await this.runner.execCommand(['npm', 'update', 'prisma', '@prisma/client']);
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
            // Check if Prisma schema exists
            const schemaPath = path.join(context.projectPath, 'prisma', 'schema.prisma');
            if (!await fsExtra.pathExists(schemaPath)) {
                errors.push({
                    field: 'prisma.schema',
                    message: 'Prisma schema file not found',
                    code: 'MISSING_SCHEMA',
                    severity: 'error'
                });
            }
            // Check if Prisma client exists
            const clientPath = path.join(context.projectPath, 'src', 'lib', 'db', 'client.ts');
            if (!await fsExtra.pathExists(clientPath)) {
                errors.push({
                    field: 'prisma.client',
                    message: 'Prisma client file not found',
                    code: 'MISSING_CLIENT',
                    severity: 'error'
                });
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
            frameworks: ['nextjs', 'react', 'vue', 'angular'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            databases: ['postgresql', 'mysql', 'sqlite', 'mongodb'],
            conflicts: ['drizzle', 'typeorm']
        };
    }
    getDependencies() {
        return ['prisma', '@prisma/client'];
    }
    getConflicts() {
        return ['drizzle', 'typeorm'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'prisma',
                description: 'Prisma CLI and core library',
                version: '^5.7.0'
            },
            {
                type: 'package',
                name: '@prisma/client',
                description: 'Prisma client for database access',
                version: '^5.7.0'
            },
            {
                type: 'config',
                name: 'DATABASE_URL',
                description: 'Database connection URL',
                optional: false
            }
        ];
    }
    getDefaultConfig() {
        return {
            databaseUrl: 'postgresql://user:password@localhost:5432/database',
            schemaPath: './prisma/schema.prisma',
            migrationsDir: './prisma/migrations',
            seedFile: './prisma/seed.ts',
            studio: true
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                databaseUrl: {
                    type: 'string',
                    description: 'Database connection URL',
                    default: 'postgresql://user:password@localhost:5432/database'
                },
                schemaPath: {
                    type: 'string',
                    description: 'Path to Prisma schema file',
                    default: './prisma/schema.prisma'
                },
                migrationsDir: {
                    type: 'string',
                    description: 'Directory for database migrations',
                    default: './prisma/migrations'
                },
                seedFile: {
                    type: 'string',
                    description: 'Path to database seed file',
                    default: './prisma/seed.ts'
                },
                studio: {
                    type: 'boolean',
                    description: 'Enable Prisma Studio',
                    default: true
                }
            },
            required: ['databaseUrl']
        };
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    async installDependencies(context) {
        const { projectPath } = context;
        context.logger.info('Installing Prisma dependencies...');
        const dependencies = [
            'prisma@^5.7.0',
            '@prisma/client@^5.7.0'
        ];
        await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
    }
    async initializePrisma(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Initializing Prisma...');
        // Create prisma directory
        const prismaDir = path.join(projectPath, 'prisma');
        await fsExtra.ensureDir(prismaDir);
        // Generate Prisma schema
        const schemaContent = this.generatePrismaSchema(pluginConfig);
        await fsExtra.writeFile(path.join(prismaDir, 'schema.prisma'), schemaContent);
        // Generate seed file
        const seedContent = this.generateSeedFile();
        await fsExtra.writeFile(path.join(prismaDir, 'seed.ts'), seedContent);
    }
    async createDatabaseFiles(context) {
        const { projectPath } = context;
        context.logger.info('Creating database files...');
        const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
        await fsExtra.ensureDir(dbLibDir);
        // Generate database client
        const clientContent = this.generateDatabaseClient();
        await fsExtra.writeFile(path.join(dbLibDir, 'client.ts'), clientContent);
        // Generate schema types
        const schemaContent = this.generateSchemaTypes();
        await fsExtra.writeFile(path.join(dbLibDir, 'schema.ts'), schemaContent);
    }
    async generatePrismaClient(context) {
        const { projectPath } = context;
        context.logger.info('Generating Prisma client...');
        // Generate Prisma client
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
    }
    generatePrismaSchema(config) {
        return `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
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

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
`;
    }
    generateDatabaseClient() {
        return `import { PrismaClient } from '@prisma/client';

// Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database connection for ORM usage
export const db = prisma;

// Health check utility
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw\`SELECT 1\`;
    return true;
  } catch {
    return false;
  }
}

// Export for use with other plugins
export { prisma as client };
`;
    }
    generateSeedFile() {
        return `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  console.log('✅ Database seeded successfully');
  console.log('Created user:', user);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;
    }
    generateUnifiedIndex() {
        return `/**
 * Unified Database Interface - Prisma Implementation
 * 
 * This file provides a unified interface for database operations
 * that works with Prisma ORM. It abstracts away Prisma-specific
 * details and provides a clean API for database operations.
 */

import { prisma } from './client.js';
import type { Prisma } from '@prisma/client';

// ============================================================================
// UNIFIED DATABASE INTERFACE
// ============================================================================

export interface UnifiedDatabase {
  // Connection management
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  healthCheck: () => Promise<boolean>;
  
  // Query operations
  query: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  execute: (sql: string, params?: any[]) => Promise<void>;
  
  // Transaction support
  transaction: <T>(callback: (db: UnifiedDatabase) => Promise<T>) => Promise<T>;
  
  // Utility
  getConnectionString: () => string;
  getDatabaseInfo: () => Promise<DatabaseInfo>;
}

export interface DatabaseInfo {
  name: string;
  version: string;
  size: string;
  tables: string[];
}

// ============================================================================
// PRISMA IMPLEMENTATION
// ============================================================================

export const createUnifiedDatabase = (): UnifiedDatabase => {
  return {
    // Connection management
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

    // Query operations
    async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
      return await prisma.$queryRawUnsafe(sql, ...(params || []));
    },

    async execute(sql: string, params?: any[]): Promise<void> {
      await prisma.$executeRawUnsafe(sql, ...(params || []));
    },

    // Transaction support
    async transaction<T>(callback: (db: UnifiedDatabase) => Promise<T>): Promise<T> {
      return await prisma.$transaction(async (tx) => {
        // Create a transaction-scoped database interface
        const txDb: UnifiedDatabase = {
          ...this,
          query: async (sql: string, params?: any[]) => {
            return await tx.$queryRawUnsafe(sql, ...(params || []));
          },
          execute: async (sql: string, params?: any[]) => {
            await tx.$executeRawUnsafe(sql, ...(params || []));
          },
        };
        return await callback(txDb);
      });
    },

    // Utility
    getConnectionString(): string {
      return process.env.DATABASE_URL || '';
    },

    async getDatabaseInfo(): Promise<DatabaseInfo> {
      try {
        const result = await prisma.$queryRaw\`
          SELECT 
            current_database() as name,
            version() as version,
            pg_size_pretty(pg_database_size(current_database())) as size
        \`;
        const info = result[0] as any;
        
        return {
          name: info.name || 'Unknown',
          version: info.version || 'Unknown',
          size: info.size || 'Unknown',
          tables: []
        };
      } catch {
        return {
          name: 'Unknown',
          version: 'Unknown',
          size: 'Unknown',
          tables: []
        };
      }
    },
  };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const database = createUnifiedDatabase();
export default database;

// ============================================================================
// RE-EXPORTS
// ============================================================================

export { prisma, db } from './client.js';
export type { Prisma } from '@prisma/client';
`;
    }
    generateSchemaTypes() {
        return `/**
 * Database Schema Types - Prisma Implementation
 * 
 * This file contains TypeScript types for your database schema.
 * These types are auto-generated by Prisma and provide type safety
 * for database operations.
 */

import type { Prisma } from '@prisma/client';

// Re-export Prisma types
export type { Prisma };

// Common model types
export type User = Prisma.UserGetPayload<{}>;
export type Account = Prisma.AccountGetPayload<{}>;
export type Session = Prisma.SessionGetPayload<{}>;
export type VerificationToken = Prisma.VerificationTokenGetPayload<{}>;

// Input types for mutations
export type UserCreateInput = Prisma.UserCreateInput;
export type UserUpdateInput = Prisma.UserUpdateInput;
export type UserWhereInput = Prisma.UserWhereInput;

// Select types for queries
export type UserSelect = Prisma.UserSelect;
export type AccountSelect = Prisma.AccountSelect;
export type SessionSelect = Prisma.SessionSelect;

// Include types for relations
export type UserInclude = Prisma.UserInclude;
export type AccountInclude = Prisma.AccountInclude;
export type SessionInclude = Prisma.SessionInclude;
`;
    }
    generateEnvConfig(config) {
        return `# Prisma ORM Configuration
DATABASE_URL="${config.databaseUrl || 'postgresql://user:password@localhost:5432/database'}"

# Prisma specific
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