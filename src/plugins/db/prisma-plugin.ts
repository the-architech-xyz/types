/**
 * Prisma Plugin - Database Toolkit and ORM
 * 
 * Provides Prisma integration using the official Prisma CLI.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../types/plugin.js';
import { TemplateService, templateService } from '../../utils/template-service.js';
import { CommandRunner } from '../../utils/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';

interface PrismaConfig {
  provider: 'postgresql' | 'mysql' | 'sqlite' | 'sqlserver' | 'mongodb';
  databaseUrl: string;
  shadowDatabaseUrl?: string;
  generateClient: boolean;
  generateMigrations: boolean;
  seedScript: boolean;
  studio: boolean;
  introspection: boolean;
}

export class PrismaPlugin implements IPlugin {
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
      id: 'prisma',
      name: 'Prisma',
      version: '1.0.0',
      description: 'Next-generation ORM for Node.js and TypeScript',
      author: 'The Architech Team',
      category: PluginCategory.ORM,
      tags: ['database', 'orm', 'typescript', 'nodejs', 'postgresql', 'mysql', 'sqlite'],
      license: 'MIT',
      repository: 'https://github.com/prisma/prisma',
      homepage: 'https://www.prisma.io'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    const { projectPath, pluginConfig } = context;
    const prismaConfig = pluginConfig as PrismaConfig;

    try {
      context.logger.info('Installing Prisma ORM...');

      // Install Prisma CLI and client
      await this.installDependencies(context, prismaConfig);

      // Initialize Prisma
      await this.initializePrisma(projectPath, prismaConfig, context);

      // Create Prisma schema
      await this.createPrismaSchema(projectPath, prismaConfig);

      // Generate Prisma client
      await this.generatePrismaClientCLI(projectPath);

      // Create database utilities
      await this.createDatabaseUtilities(projectPath);

      // Create seed script if requested
      if (prismaConfig.seedScript) {
        await this.createSeedScript(projectPath);
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'file',
            path: path.join(projectPath, 'prisma', 'schema.prisma')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'prisma.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'types', 'database.ts')
          }
        ],
        dependencies: [
          {
            name: 'prisma',
            version: '^5.7.0',
            type: 'development',
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
            command: 'prisma generate',
            description: 'Generate Prisma client',
            category: 'dev'
          },
          {
            name: 'db:push',
            command: 'prisma db push',
            description: 'Push schema to database',
            category: 'dev'
          },
          {
            name: 'db:migrate',
            command: 'prisma migrate dev',
            description: 'Create and apply migrations',
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
            description: 'Seed database',
            category: 'dev'
          }
        ],
        configs: [],
        errors: [],
        warnings: [],
        duration
      };

    } catch (error) {
      context.logger.error(`Prisma installation failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      return this.createErrorResult(
        `Failed to install Prisma: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
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
      
      // Remove Prisma specific files
      const filesToRemove = [
        'prisma',
        'src/lib/prisma.ts',
        'src/types/database.ts',
        'prisma/seed.ts'
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
      return this.createErrorResult(
        `Failed to uninstall Prisma: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      // Update Prisma packages
      await this.runner.execCommand(['npm', 'update', 'prisma', '@prisma/client'], {
        cwd: projectPath
      });

      // Regenerate client
      await this.runner.execCommand(['npx', 'prisma', 'generate'], {
        cwd: projectPath
      });

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
      return this.createErrorResult(
        `Failed to update Prisma: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        startTime,
        [],
        error
      );
    }
  }

  // ============================================================================
  // VALIDATION & COMPATIBILITY
  // ============================================================================

  async validate(context: PluginContext): Promise<ValidationResult> {
    const { projectPath } = context;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if project directory exists
    if (!await fsExtra.pathExists(projectPath)) {
      errors.push('Project directory does not exist');
    }

    // Check if package.json exists (required for dependency installation)
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!await fsExtra.pathExists(packageJsonPath)) {
      errors.push('package.json not found - required for dependency installation');
    }

    // Check for potential conflicts (as warnings)
    if (await fsExtra.pathExists(packageJsonPath)) {
      const packageJson = await fsExtra.readJson(packageJsonPath);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Check for conflicting ORMs
      const conflicts = ['drizzle-orm', 'typeorm', 'sequelize', 'mongoose'];
      for (const conflict of conflicts) {
        if (dependencies[conflict]) {
          warnings.push(`Potential conflict detected: ${conflict} is already installed`);
        }
      }
    }

    // Check if Prisma is already installed (as warning)
    const prismaSchemaPath = path.join(projectPath, 'prisma', 'schema.prisma');
    if (await fsExtra.pathExists(prismaSchemaPath)) {
      warnings.push('Prisma schema already exists - may overwrite existing setup');
    }

    return {
      valid: errors.length === 0,
      errors: errors.map(error => ({ 
        field: 'prisma', 
        message: error, 
        code: 'PRISMA_ERROR',
        severity: 'error' as const
      })),
      warnings,
      suggestions: errors.length > 0 ? ['Ensure project directory and package.json exist before installation'] : []
    };
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['nextjs', 'react', 'node', 'express', 'fastify', 'nestjs'],
      platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: ['postgresql', 'mysql', 'sqlite', 'sqlserver', 'mongodb'],
      conflicts: ['drizzle', 'typeorm', 'sequelize']
    };
  }

  getDependencies(): string[] {
    return ['node', 'typescript'];
  }

  getConflicts(): string[] {
    return ['drizzle', 'typeorm', 'sequelize'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'node',
        version: '>=16.0.0',
        description: 'Node.js runtime required for Prisma'
      },
      {
        type: 'package',
        name: 'typescript',
        version: '>=4.0.0',
        description: 'TypeScript required for Prisma client generation'
      }
    ];
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  getDefaultConfig(): Record<string, any> {
    return {
      provider: 'postgresql',
      databaseUrl: 'DATABASE_URL',
      shadowDatabaseUrl: 'SHADOW_DATABASE_URL',
      generateClient: true,
      generateMigrations: true,
      seedScript: true,
      studio: true,
      introspection: false
    };
  }

  getConfigSchema(): ConfigSchema {
    return {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          description: 'Database provider to use',
          default: 'postgresql',
          enum: ['postgresql', 'mysql', 'sqlite', 'sqlserver', 'mongodb']
        },
        databaseUrl: {
          type: 'string',
          description: 'Database connection URL',
          default: 'DATABASE_URL'
        },
        shadowDatabaseUrl: {
          type: 'string',
          description: 'Shadow database URL for migrations',
          default: 'SHADOW_DATABASE_URL'
        },
        generateClient: {
          type: 'boolean',
          description: 'Generate Prisma client',
          default: true
        },
        generateMigrations: {
          type: 'boolean',
          description: 'Generate database migrations',
          default: true
        },
        seedScript: {
          type: 'boolean',
          description: 'Create database seed script',
          default: true
        },
        studio: {
          type: 'boolean',
          description: 'Enable Prisma Studio',
          default: true
        },
        introspection: {
          type: 'boolean',
          description: 'Introspect existing database',
          default: false
        }
      }
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext, config: PrismaConfig): Promise<void> {
    const { projectPath } = context;
    
    try {
      await this.runner.execCommand(['npm', 'install', 'prisma', '@prisma/client'], {
        cwd: projectPath
      });
      context.logger.info('Dependencies installed successfully.');
    } catch (error) {
      context.logger.error(`Failed to install dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`Failed to install dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async initializePrisma(projectPath: string, config: PrismaConfig, context: PluginContext): Promise<void> {
    try {
      context.logger.info('Initializing Prisma...');
      await this.runner.execCommand(['npx', 'prisma', 'init'], {
        cwd: projectPath
      });
      context.logger.info('Prisma initialized successfully.');
    } catch (error) {
      context.logger.warn('Prisma CLI initialization failed, creating configuration manually...');
      
      // Create the prisma directory manually
      const prismaDir = path.join(projectPath, 'prisma');
      await fsExtra.ensureDir(prismaDir);
      
      // Create .env file with database URL
      const envContent = `# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="${config.databaseUrl}"
${config.shadowDatabaseUrl ? `SHADOW_DATABASE_URL="${config.shadowDatabaseUrl}"` : ''}
`;
      
      await fsExtra.writeFile(path.join(projectPath, '.env'), envContent);
      context.logger.info('Prisma configuration created manually.');
    }
  }

  private async createPrismaSchema(projectPath: string, config: PrismaConfig): Promise<void> {
    const schemaContent = this.generatePrismaSchema(config);
    const schemaPath = path.join(projectPath, 'prisma', 'schema.prisma');
    
    await fsExtra.ensureDir(path.dirname(schemaPath));
    await fsExtra.writeFile(schemaPath, schemaContent);
  }

  private async generatePrismaClientCLI(projectPath: string): Promise<void> {
    try {
      await this.runner.execCommand(['npx', 'prisma', 'generate'], {
        cwd: projectPath
      });
    } catch (error) {
      // If CLI generation fails, we'll create the client manually
      // The client will be generated when the user runs the command manually
      console.warn('Prisma client generation failed, will be generated on first use');
    }
  }

  private async createDatabaseUtilities(projectPath: string): Promise<void> {
    // Create Prisma client utility
    const prismaClientPath = path.join(projectPath, 'src', 'lib', 'prisma.ts');
    await fsExtra.ensureDir(path.dirname(prismaClientPath));
    
    const prismaClientContent = this.generatePrismaClientContent();
    await fsExtra.writeFile(prismaClientPath, prismaClientContent);

    // Create database types
    const typesPath = path.join(projectPath, 'src', 'types', 'database.ts');
    await fsExtra.ensureDir(path.dirname(typesPath));
    
    const typesContent = this.generateDatabaseTypes();
    await fsExtra.writeFile(typesPath, typesContent);
  }

  private async createSeedScript(projectPath: string): Promise<void> {
    const seedPath = path.join(projectPath, 'prisma', 'seed.ts');
    await fsExtra.ensureDir(path.dirname(seedPath));
    
    const seedContent = this.generateSeedScript();
    await fsExtra.writeFile(seedPath, seedContent);
  }

  private generatePrismaSchema(config: PrismaConfig): string {
    return `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${config.provider}"
  url      = env("${config.databaseUrl}")
  ${config.shadowDatabaseUrl ? `shadowDatabaseUrl = env("${config.shadowDatabaseUrl}")` : ''}
}

// User model for authentication
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  posts         Post[]

  @@map("users")
}

// Account model for OAuth providers
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

// Session model for authentication
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// Verification token for email verification
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// Example Post model
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author User? @relation(fields: [authorId], references: [id])

  @@map("posts")
}
`;
  }

  private generatePrismaClientContent(): string {
    return `import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
`;
  }

  private generateDatabaseTypes(): string {
    return `import { Prisma } from '@prisma/client'

// Database types
export type User = Prisma.UserGetPayload<{}>
export type Account = Prisma.AccountGetPayload<{}>
export type Session = Prisma.SessionGetPayload<{}>
export type VerificationToken = Prisma.VerificationTokenGetPayload<{}>
export type Post = Prisma.PostGetPayload<{}

// Create types
export type CreateUserInput = Prisma.UserCreateInput
export type CreateAccountInput = Prisma.AccountCreateInput
export type CreateSessionInput = Prisma.SessionCreateInput
export type CreateVerificationTokenInput = Prisma.VerificationTokenCreateInput
export type CreatePostInput = Prisma.PostCreateInput

// Update types
export type UpdateUserInput = Prisma.UserUpdateInput
export type UpdateAccountInput = Prisma.AccountUpdateInput
export type UpdateSessionInput = Prisma.SessionUpdateInput
export type UpdatePostInput = Prisma.PostUpdateInput

// Where types
export type UserWhereInput = Prisma.UserWhereInput
export type AccountWhereInput = Prisma.AccountWhereInput
export type SessionWhereInput = Prisma.SessionWhereInput
export type PostWhereInput = Prisma.PostWhereInput

// Select types
export type UserSelect = Prisma.UserSelect
export type AccountSelect = Prisma.AccountSelect
export type SessionSelect = Prisma.SessionSelect
export type PostSelect = Prisma.PostSelect

// Include types
export type UserInclude = Prisma.UserInclude
export type AccountInclude = Prisma.AccountInclude
export type SessionInclude = Prisma.SessionInclude
export type PostInclude = Prisma.PostInclude
`;
  }

  private generateSeedScript(): string {
    return `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created user:', user.email)

  // Create a test post
  const post = await prisma.post.upsert({
    where: { id: 'test-post-1' },
    update: {},
    create: {
      id: 'test-post-1',
      title: 'Hello World',
      content: 'This is a test post created by the seed script.',
      published: true,
      authorId: user.id,
    },
  })

  console.log('✅ Created post:', post.title)

  console.log('🎉 Database seed completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
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
          code: 'PRISMA_ERROR',
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