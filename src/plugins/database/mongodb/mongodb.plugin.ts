/**
 * MongoDB Database Provider Plugin - Pure Technology Implementation
 * 
 * Provides MongoDB database infrastructure setup.
 * Focuses only on database technology setup and artifact generation.
 * ORM functionality is handled by separate plugins (Mongoose, Prisma MongoDB).
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../types/plugin.js';
import { TemplateService, templateService } from '../../../core/templates/template-service.js';
import { CommandRunner } from '../../../core/cli/command-runner.js';
import { ValidationError } from '../../../types/agent.js';
import { 
  DATABASE_PROVIDERS, 
  DatabaseProvider
} from '../../../types/shared-config.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../../core/project/structure-service.js';

interface MongoDBConfig {
  // Database configuration
  databaseUrl: string;
  databaseName: string;
  
  // MongoDB specific
  enableReplicaSet: boolean;
  enableSharding: boolean;
  enableAtlas: boolean;
}

export class MongoDBPlugin implements IPlugin {
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
      id: 'mongodb',
      name: 'MongoDB Database',
      version: '1.0.0',
      description: 'Document-oriented NoSQL database with flexible schema',
      author: 'The Architech Team',
      category: PluginCategory.DATABASE,
      tags: ['database', 'nosql', 'document', 'mongodb', 'atlas', 'replica-set'],
      license: 'SSPL',
      repository: 'https://github.com/mongodb/mongo',
      homepage: 'https://www.mongodb.com',
      documentation: 'https://docs.mongodb.com'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectName, projectPath, pluginConfig } = context;
      
      context.logger.info('Installing MongoDB database infrastructure...');

      // Step 1: Install dependencies
      await this.installDependencies(context);

      // Step 2: Initialize MongoDB configuration
      await this.initializeMongoDBConfig(context);

      // Step 3: Create database connection and utilities
      await this.createDatabaseFiles(context);

      // Step 4: Generate unified interface files
      await this.generateUnifiedInterfaceFiles(context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'db', 'mongodb.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'db', 'types.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'db', 'index.ts')
          }
        ],
        dependencies: [
          {
            name: 'mongodb',
            version: '^6.3.0',
            type: 'production',
            category: PluginCategory.DATABASE
          }
        ],
        scripts: [
          {
            name: 'db:generate-types',
            command: 'npx mongodb-schema-generator --uri $DATABASE_URL --output src/lib/db/types.ts',
            description: 'Generate MongoDB TypeScript types',
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

    } catch (error) {
      return this.createErrorResult(
        'Failed to install MongoDB database',
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
      
      context.logger.info('Uninstalling MongoDB database...');

      // Remove MongoDB database files
      const filesToRemove = [
        path.join(projectPath, 'src', 'lib', 'db', 'mongodb.ts'),
        path.join(projectPath, 'src', 'lib', 'db', 'types.ts')
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
        warnings: ['MongoDB database files removed. You may need to manually remove dependencies from package.json'],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall MongoDB database',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Updating MongoDB database...');

      // Update dependencies
      await this.runner.execCommand(['npm', 'update', 'mongodb']);

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

    } catch (error) {
      return this.createErrorResult(
        'Failed to update MongoDB database',
        startTime,
        [],
        error
      );
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      // Check if MongoDB client is properly configured
      const mongodbPath = path.join(context.projectPath, 'src', 'lib', 'db', 'mongodb.ts');
      if (!await fsExtra.pathExists(mongodbPath)) {
        errors.push({
          field: 'mongodb.client',
          message: 'MongoDB client configuration file not found',
          code: 'MISSING_CLIENT',
          severity: 'error'
        });
      }

      // Validate environment variables
      const envPath = path.join(context.projectPath, '.env');
      if (await fsExtra.pathExists(envPath)) {
        const envContent = await fsExtra.readFile(envPath, 'utf-8');
        if (!envContent.includes('MONGODB_URI')) {
          warnings.push('MONGODB_URI not found in .env file');
        }
        if (!envContent.includes('MONGODB_DATABASE')) {
          warnings.push('MONGODB_DATABASE not found in .env file');
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
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

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['nextjs', 'react', 'vue', 'angular'],
      platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: ['mongodb'],
      conflicts: []
    };
  }

  getDependencies(): string[] {
    return ['mongodb'];
  }

  getConflicts(): string[] {
    return [];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'mongodb',
        description: 'MongoDB Node.js driver',
        version: '^6.3.0'
      },
      {
        type: 'config',
        name: 'MONGODB_URI',
        description: 'MongoDB connection URI',
        optional: false
      },
      {
        type: 'config',
        name: 'MONGODB_DATABASE',
        description: 'MongoDB database name',
        optional: false
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      databaseUrl: 'mongodb://localhost:27017',
      databaseName: 'myapp',
      enableReplicaSet: false,
      enableSharding: false,
      enableAtlas: false
    };
  }

  getConfigSchema(): ConfigSchema {
    return {
      type: 'object',
      properties: {
        databaseUrl: {
          type: 'string',
          description: 'MongoDB connection URI',
          default: 'mongodb://localhost:27017'
        },
        databaseName: {
          type: 'string',
          description: 'MongoDB database name',
          default: 'myapp'
        },
        enableReplicaSet: {
          type: 'boolean',
          description: 'Enable replica set configuration',
          default: false
        },
        enableSharding: {
          type: 'boolean',
          description: 'Enable sharding configuration',
          default: false
        },
        enableAtlas: {
          type: 'boolean',
          description: 'Use MongoDB Atlas cloud service',
          default: false
        }
      },
      required: ['databaseUrl', 'databaseName']
    };
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing MongoDB dependencies...');

    const dependencies = [
      'mongodb@^6.3.0'
    ];

    await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
  }

  private async initializeMongoDBConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Initializing MongoDB configuration...');

    // Create database lib directory
    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Generate MongoDB client configuration
    const clientContent = this.generateMongoDBClient(pluginConfig);
    await fsExtra.writeFile(
      path.join(dbLibDir, 'mongodb.ts'),
      clientContent
    );

    // Generate database types
    const typesContent = this.generateTypes();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'types.ts'),
      typesContent
    );
  }

  private async createDatabaseFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating database connection files...');

    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Generate database client
    const clientContent = this.generateDatabaseClient();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'client.ts'),
      clientContent
    );
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Generating unified interface files...');

    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Generate unified database interface
    const unifiedContent = this.generateUnifiedIndex();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'index.ts'),
      unifiedContent
    );
  }

  private generateMongoDBClient(config: Record<string, any>): string {
    const enableReplicaSet = config.enableReplicaSet === true;
    const enableSharding = config.enableSharding === true;
    const enableAtlas = config.enableAtlas === true;
    
    return `import { MongoClient, Db } from 'mongodb';

// MongoDB client configuration
const mongoUri = process.env.MONGODB_URI!;
const databaseName = process.env.MONGODB_DATABASE!;

if (!mongoUri || !databaseName) {
  throw new Error('Missing MongoDB environment variables');
}

// MongoDB client options
const clientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,${enableReplicaSet ? `
  // Replica set configuration
  replicaSet: 'rs0',
  readPreference: 'primary',` : ''}${enableAtlas ? `
  // Atlas-specific options
  retryWrites: true,
  w: 'majority',` : ''}
};

// Create MongoDB client
export const mongoClient = new MongoClient(mongoUri, clientOptions);

// Database instance
export const db: Db = mongoClient.db(databaseName);

// Database connection for ORM usage
export const sql = db;

// Health check utility
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await mongoClient.db('admin').command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

// Export for use with ORM plugins
export { db as database };
`;
  }

  private generateTypes(): string {
    return `/**
 * MongoDB Database Types
 * 
 * This file contains TypeScript types for your MongoDB database.
 * You can generate these types using MongoDB Schema Generator:
 * 
 * npx mongodb-schema-generator --uri $MONGODB_URI --output src/lib/db/types.ts
 */

import { ObjectId } from 'mongodb';

// Base document interface
export interface BaseDocument {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// User document interface
export interface User extends BaseDocument {
  email: string;
  name?: string;
  avatar?: string;
  emailVerified?: Date;
  accounts?: Account[];
  sessions?: Session[];
}

// Account document interface
export interface Account extends BaseDocument {
  userId: ObjectId;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

// Session document interface
export interface Session extends BaseDocument {
  sessionToken: string;
  userId: ObjectId;
  expires: Date;
}

// Verification token document interface
export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

// Database collections
export interface Database {
  users: User[];
  accounts: Account[];
  sessions: Session[];
  verificationTokens: VerificationToken[];
}

// Re-export common types
export type { ObjectId };
`;
  }

  private generateDatabaseClient(): string {
    return `/**
 * Database Client - MongoDB Implementation
 * 
 * This file provides a unified database client interface
 * that works with MongoDB.
 */

import { db } from './mongodb.js';
import type { Database } from './types.js';

// Database client for ORM usage
export const database = db;

// Connection utility
export const getConnection = () => db;

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    await db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
};

// Export types
export type { Database } from './types.js';
`;
  }

  private generateUnifiedIndex(): string {
    return `/**
 * Unified Database Interface - MongoDB Implementation
 * 
 * This file provides a unified interface for database operations
 * that works with MongoDB. It abstracts away MongoDB-specific
 * details and provides a clean API for database operations.
 */

import { db } from './mongodb.js';
import type { Database } from './types.js';

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
// MONGODB IMPLEMENTATION
// ============================================================================

export const createUnifiedDatabase = (): UnifiedDatabase => {
  return {
    // Connection management
    async connect() {
      // MongoDB client is auto-connected
      await db.command({ ping: 1 });
    },

    async disconnect() {
      // MongoDB client doesn't need explicit disconnection
    },

    async healthCheck() {
      try {
        await db.command({ ping: 1 });
        return true;
      } catch {
        return false;
      }
    },

    // Query operations
    async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
      // Note: MongoDB doesn't use SQL queries
      // This is a simplified implementation for compatibility
      throw new Error('SQL queries are not supported in MongoDB. Use MongoDB aggregation or find methods instead.');
    },

    async execute(sql: string, params?: any[]): Promise<void> {
      // Note: MongoDB doesn't use SQL execution
      throw new Error('SQL execution is not supported in MongoDB. Use MongoDB operations instead.');
    },

    // Transaction support
    async transaction<T>(callback: (db: UnifiedDatabase) => Promise<T>): Promise<T> {
      const session = db.client.startSession();
      try {
        return await session.withTransaction(async () => {
          return await callback(this);
        });
      } finally {
        await session.endSession();
      }
    },

    // Utility
    getConnectionString(): string {
      return process.env.MONGODB_URI || '';
    },

    async getDatabaseInfo(): Promise<DatabaseInfo> {
      try {
        const stats = await db.stats();
        return {
          name: db.databaseName,
          version: 'MongoDB',
          size: \`\${Math.round(stats.dataSize / 1024 / 1024)}MB\`,
          tables: Object.keys(stats.collections || {})
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

export { db, database as client } from './mongodb.js';
export type { Database } from './types.js';
`;
  }

  private generateEnvConfig(config: Record<string, any>): string {
    return `# MongoDB Database Configuration
MONGODB_URI="${config.databaseUrl || 'mongodb://localhost:27017'}"
MONGODB_DATABASE="${config.databaseName || 'myapp'}"

# Database URL for ORM usage
DATABASE_URL="${config.databaseUrl || 'mongodb://localhost:27017'}/${config.databaseName || 'myapp'}"
`;
  }

  private createErrorResult(
    message: string,
    startTime: number,
    errors: any[] = [],
    originalError?: any
  ): PluginResult {
    const duration = Date.now() - startTime;
    
    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors: [
        {
          code: 'MONGODB_INSTALL_ERROR',
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