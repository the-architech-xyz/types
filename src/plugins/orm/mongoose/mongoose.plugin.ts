/**
 * Mongoose ORM Plugin - Pure Technology Implementation
 * 
 * Provides Mongoose ODM integration with MongoDB database providers.
 * Focuses only on ORM technology setup and artifact generation.
 * Database provider setup is handled by separate database plugins.
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../types/plugin.js';
import { TemplateService, templateService } from '../../../core/templates/template-service.js';
import { CommandRunner } from '../../../core/cli/command-runner.js';
import { ValidationError } from '../../../types/agent.js';
import { 
  ORM_LIBRARIES,
  ORMLibrary
} from '../../../types/shared-config.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../../core/project/structure-service.js';

interface MongooseConfig {
  databaseUrl: string;
  modelsDir: string;
  enableDebug: boolean;
  enableTimestamps: boolean;
}

export class MongoosePlugin implements IPlugin {
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
      id: 'mongoose',
      name: 'Mongoose ODM',
      version: '1.0.0',
      description: 'Elegant MongoDB object modeling for Node.js',
      author: 'The Architech Team',
      category: PluginCategory.ORM,
      tags: ['database', 'orm', 'odm', 'typescript', 'mongodb', 'mongoose'],
      license: 'MIT',
      repository: 'https://github.com/Automattic/mongoose',
      homepage: 'https://mongoosejs.com',
      documentation: 'https://mongoosejs.com/docs'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectName, projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Mongoose ODM...');

      // Step 1: Install dependencies
      await this.installDependencies(context);

      // Step 2: Initialize Mongoose configuration
      await this.initializeMongooseConfig(context);

      // Step 3: Create database models and connection
      await this.createDatabaseFiles(context);

      // Step 4: Generate unified interface files
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
            path: path.join(projectPath, 'src', 'lib', 'db', 'models', 'user.model.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'db', 'connection.ts')
          }
        ],
        dependencies: [
          {
            name: 'mongoose',
            version: '^8.0.0',
            type: 'production',
            category: PluginCategory.ORM
          }
        ],
        scripts: [
          {
            name: 'db:generate-types',
            command: 'npx mongoose-schema-generator --uri $DATABASE_URL --output src/lib/db/types.ts',
            description: 'Generate Mongoose TypeScript types',
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
        'Failed to install Mongoose ODM',
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
      
      context.logger.info('Uninstalling Mongoose ODM...');

      // Remove Mongoose files
      const filesToRemove = [
        path.join(projectPath, 'src', 'lib', 'db', 'models'),
        path.join(projectPath, 'src', 'lib', 'db', 'connection.ts')
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
        warnings: ['Mongoose files removed. You may need to manually remove dependencies from package.json'],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall Mongoose ODM',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Updating Mongoose ODM...');

      // Update dependencies
      await this.runner.execCommand(['npm', 'update', 'mongoose']);

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
        'Failed to update Mongoose ODM',
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
      // Check if Mongoose connection exists
      const connectionPath = path.join(context.projectPath, 'src', 'lib', 'db', 'connection.ts');
      if (!await fsExtra.pathExists(connectionPath)) {
        errors.push({
          field: 'mongoose.connection',
          message: 'Mongoose connection file not found',
          code: 'MISSING_CONNECTION',
          severity: 'error'
        });
      }

      // Check if models directory exists
      const modelsPath = path.join(context.projectPath, 'src', 'lib', 'db', 'models');
      if (!await fsExtra.pathExists(modelsPath)) {
        errors.push({
          field: 'mongoose.models',
          message: 'Mongoose models directory not found',
          code: 'MISSING_MODELS',
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
      conflicts: ['drizzle', 'prisma', 'typeorm']
    };
  }

  getDependencies(): string[] {
    return ['mongoose'];
  }

  getConflicts(): string[] {
    return ['drizzle', 'prisma', 'typeorm'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'mongoose',
        description: 'Mongoose ODM for MongoDB',
        version: '^8.0.0'
      },
      {
        type: 'config',
        name: 'MONGODB_URI',
        description: 'MongoDB connection URI',
        optional: false
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      databaseUrl: 'mongodb://localhost:27017/myapp',
      modelsDir: './src/lib/db/models',
      enableDebug: false,
      enableTimestamps: true
    };
  }

  getConfigSchema(): ConfigSchema {
    return {
      type: 'object',
      properties: {
        databaseUrl: {
          type: 'string',
          description: 'MongoDB connection URI',
          default: 'mongodb://localhost:27017/myapp'
        },
        modelsDir: {
          type: 'string',
          description: 'Directory for Mongoose models',
          default: './src/lib/db/models'
        },
        enableDebug: {
          type: 'boolean',
          description: 'Enable Mongoose debug mode',
          default: false
        },
        enableTimestamps: {
          type: 'boolean',
          description: 'Enable automatic timestamps',
          default: true
        }
      },
      required: ['databaseUrl']
    };
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing Mongoose dependencies...');

    const dependencies = [
      'mongoose@^8.0.0'
    ];

    await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
  }

  private async initializeMongooseConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Initializing Mongoose configuration...');

    // Create database lib directory
    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Create models directory
    const modelsDir = path.join(dbLibDir, 'models');
    await fsExtra.ensureDir(modelsDir);

    // Generate Mongoose connection
    const connectionContent = this.generateMongooseConnection(pluginConfig);
    await fsExtra.writeFile(
      path.join(dbLibDir, 'connection.ts'),
      connectionContent
    );

    // Generate User model
    const userModelContent = this.generateUserModel();
    await fsExtra.writeFile(
      path.join(modelsDir, 'user.model.ts'),
      userModelContent
    );
  }

  private async createDatabaseFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating database files...');

    const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
    await fsExtra.ensureDir(dbLibDir);

    // Generate database client
    const clientContent = this.generateDatabaseClient();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'client.ts'),
      clientContent
    );

    // Generate schema types
    const schemaContent = this.generateSchemaTypes();
    await fsExtra.writeFile(
      path.join(dbLibDir, 'schema.ts'),
      schemaContent
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

  private generateMongooseConnection(config: Record<string, any>): string {
    const enableDebug = config.enableDebug === true;
    
    return `import mongoose from 'mongoose';

// MongoDB connection URI
const mongoUri = process.env.MONGODB_URI!;

if (!mongoUri) {
  throw new Error('Missing MONGODB_URI environment variable');
}

// Mongoose connection options
const connectionOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0,
  ${enableDebug ? `
  // Debug mode
  debug: true,` : ''}
};

// Connect to MongoDB
export async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(mongoUri, connectionOptions);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Disconnect from MongoDB
export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Failed to disconnect from MongoDB:', error);
    throw error;
  }
}

// Health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const state = mongoose.connection.readyState;
    return state === 1; // 1 = connected
  } catch {
    return false;
  }
}

// Export mongoose instance
export { mongoose };
`;
  }

  private generateUserModel(): string {
    return `import mongoose, { Document, Schema } from 'mongoose';

// User interface
export interface IUser extends Document {
  email: string;
  name?: string;
  avatar?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  emailVerified: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes
userSchema.index({ email: 1 });

// Export User model
export const User = mongoose.model<IUser>('User', userSchema);
`;
  }

  private generateDatabaseClient(): string {
    return `import mongoose from 'mongoose';
import { connectToDatabase, disconnectFromDatabase, checkDatabaseConnection } from './connection.js';

// Database client for ORM usage
export const db = mongoose;

// Connection utility
export const getConnection = () => mongoose.connection;

// Health check
export const healthCheck = checkDatabaseConnection;

// Export for use with other plugins
export { mongoose as client };
`;
  }

  private generateSchemaTypes(): string {
    return `/**
 * Database Schema Types - Mongoose Implementation
 * 
 * This file contains TypeScript types for your Mongoose models.
 * These types provide type safety for database operations.
 */

import type { Document } from 'mongoose';

// Base document interface
export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

// User document interface
export interface UserDocument extends BaseDocument {
  email: string;
  name?: string;
  avatar?: string;
  emailVerified?: Date;
}

// Account document interface
export interface AccountDocument extends BaseDocument {
  userId: mongoose.Types.ObjectId;
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
export interface SessionDocument extends BaseDocument {
  sessionToken: string;
  userId: mongoose.Types.ObjectId;
  expires: Date;
}

// Verification token document interface
export interface VerificationTokenDocument {
  identifier: string;
  token: string;
  expires: Date;
}

// Database collections
export interface Database {
  users: UserDocument[];
  accounts: AccountDocument[];
  sessions: SessionDocument[];
  verificationTokens: VerificationTokenDocument[];
}

// Re-export common types
export type { Document } from 'mongoose';
`;
  }

  private generateUnifiedIndex(): string {
    return `/**
 * Unified Database Interface - Mongoose Implementation
 * 
 * This file provides a unified interface for database operations
 * that works with Mongoose ODM. It abstracts away Mongoose-specific
 * details and provides a clean API for database operations.
 */

import mongoose from 'mongoose';
import { connectToDatabase, disconnectFromDatabase, checkDatabaseConnection } from './connection.js';
import { User } from './models/user.model.js';

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
// MONGOOSE IMPLEMENTATION
// ============================================================================

export const createUnifiedDatabase = (): UnifiedDatabase => {
  return {
    // Connection management
    async connect() {
      await connectToDatabase();
    },

    async disconnect() {
      await disconnectFromDatabase();
    },

    async healthCheck() {
      return await checkDatabaseConnection();
    },

    // Query operations
    async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
      // Note: Mongoose doesn't use SQL queries
      // This is a simplified implementation for compatibility
      throw new Error('SQL queries are not supported in Mongoose. Use Mongoose query methods instead.');
    },

    async execute(sql: string, params?: any[]): Promise<void> {
      // Note: Mongoose doesn't use SQL execution
      throw new Error('SQL execution is not supported in Mongoose. Use Mongoose operations instead.');
    },

    // Transaction support
    async transaction<T>(callback: (db: UnifiedDatabase) => Promise<T>): Promise<T> {
      const session = await mongoose.startSession();
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
        const db = mongoose.connection.db;
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

export { mongoose, db } from './client.js';
export type { UserDocument } from './schema.js';
`;
  }

  private generateEnvConfig(config: Record<string, any>): string {
    return `# Mongoose ODM Configuration
MONGODB_URI="${config.databaseUrl || 'mongodb://localhost:27017/myapp'}"

# Database URL for ORM usage
DATABASE_URL="${config.databaseUrl || 'mongodb://localhost:27017/myapp'}"
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
          code: 'MONGOOSE_INSTALL_ERROR',
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