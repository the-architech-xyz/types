/**
 * Prisma Code Generator
 * 
 * Handles all code generation for Prisma ORM integration.
 * Based on: https://www.prisma.io/docs/getting-started
 */

import { DatabasePluginConfig } from '../../../../types/plugins.js';

export interface GeneratedFile {
    path: string;
    content: string;
}

export class PrismaGenerator {
  
  generateAllFiles(config: DatabasePluginConfig): GeneratedFile[] {
    const files: GeneratedFile[] = [
      this.generatePrismaSchema(config),
      this.generatePrismaClient(),
      this.generateDatabaseUtils(),
      this.generateUnifiedIndex(),
    ];

    if ((config.features as any).seeding) {
        files.push(this.generateSeedFile());
    }
    
    return files;
  }

  generatePrismaSchema(config: DatabasePluginConfig): GeneratedFile {
    const provider = config.provider;
    const enablePreviewFeatures = (config.features as any).previewFeatures || [];
    
    const content = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
  ${enablePreviewFeatures.length > 0 ? `
  previewFeatures = [${enablePreviewFeatures.map((f: string) => `"${f}"`).join(', ')}]` : ''}
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]

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

// Example models for common use cases
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}

model Profile {
  id     String @id @default(cuid())
  bio    String?
  userId String @unique

  @@map("profiles")
}
`;
    return { path: 'prisma/schema.prisma', content };
  }

  generateSeedFile(): GeneratedFile {
    const content = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      emailVerified: new Date(),
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      emailVerified: new Date(),
    },
  });

  // Create sample posts
  const post1 = await prisma.post.upsert({
    where: { id: 'post-1' },
    update: {},
    create: {
      id: 'post-1',
      title: 'Hello World',
      content: 'This is my first post!',
      published: true,
      authorId: user1.id,
    },
  });

  const post2 = await prisma.post.upsert({
    where: { id: 'post-2' },
    update: {},
    create: {
      id: 'post-2',
      title: 'Getting Started with Prisma',
      content: 'Learn how to use Prisma with your database...',
      published: true,
      authorId: user2.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('Created users:', { user1: user1.email, user2: user2.email });
  console.log('Created posts:', { post1: post1.title, post2: post2.title });
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
    return { path: 'prisma/seed.ts', content };
  }

  generatePrismaClient(): GeneratedFile {
    const content = `import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the \`global\` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export for use in other files
export default prisma;
`;
    return { path: 'db/client.ts', content };
  }

  generateDatabaseUtils(): GeneratedFile {
    const content = `import { PrismaClient } from '@prisma/client';

// Database utilities for common operations
export const dbUtils = {
  // Check if database is connected
  async isConnected(): Promise<boolean> {
    try {
      await prisma.$queryRaw\`SELECT 1\`;
      return true;
    } catch {
      return false;
    }
  },

  // Get database stats
  async getStats() {
    try {
      const userCount = await prisma.user.count();
      const postCount = await prisma.post.count();
      const accountCount = await prisma.account.count();
      const sessionCount = await prisma.session.count();

      return {
        users: userCount,
        posts: postCount,
        accounts: accountCount,
        sessions: sessionCount,
        total: userCount + postCount + accountCount + sessionCount
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return null;
    }
  },

  // Clear all data (for testing)
  async clearAll() {
    try {
      await prisma.session.deleteMany();
      await prisma.account.deleteMany();
      await prisma.post.deleteMany();
      await prisma.user.deleteMany();
      await prisma.verificationToken.deleteMany();
      console.log('✅ All data cleared');
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  },

  // Health check
  async healthCheck() {
    try {
      await prisma.$queryRaw\`SELECT 1\`;
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date() };
    }
  }
};

// Re-export prisma client
export { prisma } from './client.js';
`;
    return { path: 'db/utils.ts', content };
  }

  generateUnifiedIndex(): GeneratedFile {
    const content = `/**
 * Unified Database Interface - Prisma Implementation
 * 
 * This file provides a unified interface for database operations
 * that works with Prisma ORM. It abstracts away Prisma-specific
 * details and provides a clean API for database operations.
 * 
 * Based on: https://www.prisma.io/docs/concepts/components/prisma-client
 */

import { PrismaClient } from '@prisma/client';
import { prisma } from './client.js';
import { dbUtils } from './utils.js';

// ============================================================================
// UNIFIED DATABASE INTERFACE
// ============================================================================

export interface UnifiedDatabase {
  // Connection management
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  healthCheck: () => Promise<boolean>;
  
  // Query operations (Prisma-style)
  find: <T = any>(model: string, filter?: any, options?: any) => Promise<T[]>;
  findOne: <T = any>(model: string, filter?: any, options?: any) => Promise<T | null>;
  create: <T = any>(model: string, data: any) => Promise<T>;
  update: <T = any>(model: string, filter: any, data: any, options?: any) => Promise<T>;
  delete: (model: string, filter: any) => Promise<boolean>;
  
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
      // Prisma connects automatically
      await prisma.$connect();
    },

    async disconnect() {
      await prisma.$disconnect();
    },

    async healthCheck() {
      const health = await dbUtils.healthCheck();
      return health.status === 'healthy';
    },

    // Query operations (Prisma-style)
    async find<T = any>(model: string, filter: any = {}, options: any = {}): Promise<T[]> {
      const modelClient = (prisma as any)[model];
      if (!modelClient) {
        throw new Error(\`Model \${model} not found\`);
      }
      return await modelClient.findMany(filter);
    },

    async findOne<T = any>(model: string, filter: any = {}, options: any = {}): Promise<T | null> {
      const modelClient = (prisma as any)[model];
      if (!modelClient) {
        throw new Error(\`Model \${model} not found\`);
      }
      return await modelClient.findFirst(filter);
    },

    async create<T = any>(model: string, data: any): Promise<T> {
      const modelClient = (prisma as any)[model];
      if (!modelClient) {
        throw new Error(\`Model \${model} not found\`);
      }
      return await modelClient.create({ data });
    },

    async update<T = any>(model: string, filter: any, data: any, options: any = {}): Promise<T> {
      const modelClient = (prisma as any)[model];
      if (!modelClient) {
        throw new Error(\`Model \${model} not found\`);
      }
      return await modelClient.update({ where: filter, data });
    },

    async delete(model: string, filter: any): Promise<boolean> {
      const modelClient = (prisma as any)[model];
      if (!modelClient) {
        throw new Error(\`Model \${model} not found\`);
      }
      await modelClient.delete({ where: filter });
      return true;
    },

    // Transaction support
    async transaction<T>(callback: (db: UnifiedDatabase) => Promise<T>): Promise<T> {
      return await prisma.$transaction(async (tx) => {
        // Create a transaction-aware database interface
        const txDb = {
          ...this,
          async find<T = any>(model: string, filter: any = {}, options: any = {}): Promise<T[]> {
            const modelClient = (tx as any)[model];
            return await modelClient.findMany(filter);
          },
          async findOne<T = any>(model: string, filter: any = {}, options: any = {}): Promise<T | null> {
            const modelClient = (tx as any)[model];
            return await modelClient.findFirst(filter);
          },
          async create<T = any>(model: string, data: any): Promise<T> {
            const modelClient = (tx as any)[model];
            return await modelClient.create({ data });
          },
          async update<T = any>(model: string, filter: any, data: any, options: any = {}): Promise<T> {
            const modelClient = (tx as any)[model];
            return await modelClient.update({ where: filter, data });
          },
          async delete(model: string, filter: any): Promise<boolean> {
            const modelClient = (tx as any)[model];
            await modelClient.delete({ where: filter });
            return true;
          }
        } as UnifiedDatabase;

        return await callback(txDb);
      });
    },

    // Utility
    getConnectionString(): string {
      return process.env.DATABASE_URL || '';
    },

    async getDatabaseInfo(): Promise<DatabaseInfo> {
      try {
        const stats = await dbUtils.getStats();
        return {
          name: 'Prisma Database',
          version: 'Prisma',
          size: stats ? \`\${stats.total} records\` : 'Unknown',
          tables: ['users', 'accounts', 'sessions', 'posts', 'profiles']
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

export { prisma } from './client.js';
export { dbUtils } from './utils.js';
export type { PrismaClient } from '@prisma/client';
`;
    return { path: 'db/index.ts', content };
  }

  generateEnvConfig(config: DatabasePluginConfig): Record<string, string> {
    const envVars: Record<string, string> = {};
    
    // Check if connection exists and has connectionString
    if (config.connection && 'connectionString' in config.connection) {
        const connectionString = config.connection.connectionString as string;
        envVars['DATABASE_URL'] = connectionString;
    } else if (config.connection && 'projectUrl' in config.connection) {
        // For providers like Supabase, we might construct a postgresql URL
        // This is a simplification; a real implementation might need more logic
        const projectUrl = config.connection.projectUrl as string;
        envVars['DATABASE_URL'] = projectUrl;
    }
    
    // Fallback to direct connectionString if available
    if (config.connectionString) {
        envVars['DATABASE_URL'] = config.connectionString;
    }
    
    return envVars;
  }

  generateScripts(config: DatabasePluginConfig): Record<string, string> {
    const scripts: Record<string, string> = {
      'db:generate': 'npx prisma generate',
      'db:format': 'npx prisma format',
      'db:validate': 'npx prisma validate',
    };
    if ((config.features as any).migrations) {
      scripts['db:migrate'] = 'npx prisma migrate dev';
      scripts['db:push'] = 'npx prisma db push';
    }
    if ((config.features as any).seeding) {
      scripts['db:seed'] = 'npx tsx prisma/seed.ts';
    }
    if ((config.features as any).prismaStudio) {
      scripts['db:studio'] = 'npx prisma studio';
    }
    return scripts;
  }
} 