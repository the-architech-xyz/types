/**
 * MongoDB Database Provider Plugin - Updated with Latest Best Practices
 *
 * Provides MongoDB database infrastructure setup.
 * Follows latest MongoDB documentation and TypeScript best practices.
 *
 * References:
 * - https://docs.mongodb.com/drivers/node/current/
 * - https://docs.mongodb.com/manual/
 * - https://docs.mongodb.com/atlas/
 * - https://docs.mongodb.com/manual/replication/
 */
import { PluginCategory, TargetPlatform } from '../../../../types/plugin.js';
import { templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
export class MongoDBPlugin {
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
            id: 'mongodb',
            name: 'MongoDB Database',
            version: '6.3.0',
            description: 'Document-oriented NoSQL database with flexible schema and high performance',
            author: 'The Architech Team',
            category: PluginCategory.DATABASE,
            tags: ['database', 'nosql', 'document', 'mongodb', 'atlas', 'replica-set', 'sharding', 'aggregation'],
            license: 'SSPL',
            repository: 'https://github.com/mongodb/mongo',
            homepage: 'https://www.mongodb.com',
            documentation: 'https://docs.mongodb.com'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing MongoDB database infrastructure with latest features...');
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Initialize MongoDB configuration
            await this.initializeMongoDBConfig(context);
            // Step 3: Create database connection and utilities
            await this.createDatabaseFiles(context);
            // Step 4: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            // Step 5: Setup monitoring and logging
            if (pluginConfig.enableMonitoring) {
                await this.setupMonitoring(context);
            }
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
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'db', 'utils.ts')
                    }
                ],
                dependencies: [
                    {
                        name: 'mongodb',
                        version: '^6.3.0',
                        type: 'production',
                        category: PluginCategory.DATABASE
                    },
                    {
                        name: '@types/mongodb',
                        version: '^6.0.0',
                        type: 'development',
                        category: PluginCategory.DATABASE
                    }
                ],
                scripts: [
                    {
                        name: 'db:generate-types',
                        command: 'npx mongodb-schema-generator --uri $DATABASE_URL --output src/lib/db/types.ts',
                        description: 'Generate MongoDB TypeScript types',
                        category: 'dev'
                    },
                    {
                        name: 'db:validate-schema',
                        command: 'npx tsx src/lib/db/validate-schema.ts',
                        description: 'Validate MongoDB schema',
                        category: 'dev'
                    },
                    {
                        name: 'db:backup',
                        command: 'mongodump --uri $MONGODB_URI --db $MONGODB_DATABASE --out ./backups',
                        description: 'Create MongoDB backup',
                        category: 'dev'
                    },
                    {
                        name: 'db:restore',
                        command: 'mongorestore --uri $MONGODB_URI --db $MONGODB_DATABASE ./backups/$MONGODB_DATABASE',
                        description: 'Restore MongoDB backup',
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
            return this.createErrorResult('Failed to install MongoDB database', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Uninstalling MongoDB database...');
            // Remove MongoDB database files
            const filesToRemove = [
                path.join(projectPath, 'src', 'lib', 'db', 'mongodb.ts'),
                path.join(projectPath, 'src', 'lib', 'db', 'types.ts'),
                path.join(projectPath, 'src', 'lib', 'db', 'utils.ts')
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
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall MongoDB database', startTime, [], error);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            context.logger.info('Updating MongoDB database...');
            // Update dependencies
            await this.runner.execCommand(['npm', 'update', 'mongodb', '@types/mongodb']);
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
            return this.createErrorResult('Failed to update MongoDB database', startTime, [], error);
        }
    }
    async validate(context) {
        const errors = [];
        const warnings = [];
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
            frameworks: ['nextjs', 'react', 'vue', 'angular', 'express', 'fastify', 'nest'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            databases: ['mongodb'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['mongodb', '@types/mongodb'];
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'mongodb',
                description: 'MongoDB Node.js driver',
                version: '^6.3.0'
            },
            {
                type: 'package',
                name: '@types/mongodb',
                description: 'TypeScript types for MongoDB',
                version: '^6.0.0'
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
    getDefaultConfig() {
        return {
            databaseUrl: 'mongodb://localhost:27017',
            databaseName: 'myapp',
            enableReplicaSet: false,
            enableSharding: false,
            enableAtlas: false,
            enableCompression: true,
            enableRetryWrites: true,
            enableReadConcern: true,
            enableWriteConcern: true,
            connectionPoolSize: 10,
            serverSelectionTimeout: 5000,
            socketTimeout: 45000,
            maxIdleTime: 30000,
            enableMonitoring: true,
            enableLogging: true,
            enableMetrics: true,
            enableTelemetry: true
        };
    }
    getConfigSchema() {
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
                },
                enableCompression: {
                    type: 'boolean',
                    description: 'Enable compression',
                    default: true
                },
                enableRetryWrites: {
                    type: 'boolean',
                    description: 'Enable retry writes',
                    default: true
                },
                enableReadConcern: {
                    type: 'boolean',
                    description: 'Enable read concern',
                    default: true
                },
                enableWriteConcern: {
                    type: 'boolean',
                    description: 'Enable write concern',
                    default: true
                },
                connectionPoolSize: {
                    type: 'number',
                    description: 'Connection pool size',
                    default: 10,
                    minimum: 1,
                    maximum: 100
                },
                serverSelectionTimeout: {
                    type: 'number',
                    description: 'Server selection timeout (ms)',
                    default: 5000,
                    minimum: 1000,
                    maximum: 30000
                },
                socketTimeout: {
                    type: 'number',
                    description: 'Socket timeout (ms)',
                    default: 45000,
                    minimum: 1000,
                    maximum: 300000
                },
                maxIdleTime: {
                    type: 'number',
                    description: 'Max idle time (ms)',
                    default: 30000,
                    minimum: 1000,
                    maximum: 300000
                },
                enableMonitoring: {
                    type: 'boolean',
                    description: 'Enable monitoring',
                    default: true
                },
                enableLogging: {
                    type: 'boolean',
                    description: 'Enable logging',
                    default: true
                },
                enableMetrics: {
                    type: 'boolean',
                    description: 'Enable metrics',
                    default: true
                },
                enableTelemetry: {
                    type: 'boolean',
                    description: 'Enable telemetry',
                    default: true
                }
            },
            required: ['databaseUrl', 'databaseName']
        };
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    async installDependencies(context) {
        const { projectPath } = context;
        context.logger.info('Installing MongoDB dependencies...');
        const dependencies = [
            'mongodb@^6.3.0',
            '@types/mongodb@^6.0.0'
        ];
        await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
    }
    async initializeMongoDBConfig(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Initializing MongoDB configuration...');
        // Create database lib directory
        const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
        await fsExtra.ensureDir(dbLibDir);
        // Generate MongoDB client configuration
        const clientContent = this.generateMongoDBClient(pluginConfig);
        await fsExtra.writeFile(path.join(dbLibDir, 'mongodb.ts'), clientContent);
        // Generate database types
        const typesContent = this.generateTypes();
        await fsExtra.writeFile(path.join(dbLibDir, 'types.ts'), typesContent);
    }
    async createDatabaseFiles(context) {
        const { projectPath } = context;
        context.logger.info('Creating database connection files...');
        const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
        await fsExtra.ensureDir(dbLibDir);
        // Generate database client
        const clientContent = this.generateDatabaseClient();
        await fsExtra.writeFile(path.join(dbLibDir, 'client.ts'), clientContent);
        // Generate database utilities
        const utilsContent = this.generateDatabaseUtils();
        await fsExtra.writeFile(path.join(dbLibDir, 'utils.ts'), utilsContent);
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
    async setupMonitoring(context) {
        const { projectPath } = context;
        context.logger.info('Setting up MongoDB monitoring...');
        // Create monitoring directory
        const monitoringDir = path.join(projectPath, 'src', 'lib', 'db', 'monitoring');
        await fsExtra.ensureDir(monitoringDir);
        // Generate monitoring utilities
        const monitoringContent = this.generateMonitoringUtils();
        await fsExtra.writeFile(path.join(monitoringDir, 'index.ts'), monitoringContent);
    }
    generateMongoDBClient(config) {
        const enableReplicaSet = config.enableReplicaSet === true;
        const enableSharding = config.enableSharding === true;
        const enableAtlas = config.enableAtlas === true;
        const enableCompression = config.enableCompression !== false;
        const enableRetryWrites = config.enableRetryWrites !== false;
        const enableReadConcern = config.enableReadConcern !== false;
        const enableWriteConcern = config.enableWriteConcern !== false;
        const poolSize = config.connectionPoolSize || 10;
        const serverSelectionTimeout = config.serverSelectionTimeout || 5000;
        const socketTimeout = config.socketTimeout || 45000;
        const maxIdleTime = config.maxIdleTime || 30000;
        return `import { MongoClient, Db, MongoClientOptions } from 'mongodb';

// MongoDB client configuration
const mongoUri = process.env.MONGODB_URI!;
const databaseName = process.env.MONGODB_DATABASE!;

if (!mongoUri || !databaseName) {
  throw new Error('Missing MongoDB environment variables');
}

// MongoDB client options with latest best practices
const clientOptions: MongoClientOptions = {
  maxPoolSize: ${poolSize},
  serverSelectionTimeoutMS: ${serverSelectionTimeout},
  socketTimeoutMS: ${socketTimeout},
  maxIdleTimeMS: ${maxIdleTime},${enableCompression ? `
  compressors: ['zlib'],` : ''}${enableRetryWrites ? `
  retryWrites: true,` : ''}${enableReadConcern ? `
  readConcern: { level: 'majority' },` : ''}${enableWriteConcern ? `
  writeConcern: { w: 'majority' },` : ''}${enableReplicaSet ? `
  // Replica set configuration
  replicaSet: 'rs0',
  readPreference: 'primary',` : ''}${enableAtlas ? `
  // Atlas-specific options
  retryWrites: true,
  w: 'majority',` : ''}
};

// Connection state tracking
let isConnected = false;
let connectionPromise: Promise<MongoClient> | null = null;

// Create MongoDB client
export const mongoClient = new MongoClient(mongoUri, clientOptions);

// Database instance
export const db: Db = mongoClient.db(databaseName);

// Connect to MongoDB with connection pooling
export async function connectToDatabase(): Promise<MongoClient> {
  if (isConnected) {
    return mongoClient;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoClient.connect();
  
  try {
    await connectionPromise;
    isConnected = true;
    console.log('✅ Connected to MongoDB');
    
    // Set up connection event handlers
    mongoClient.on('connectionPoolCreated', (event) => {
      console.log('MongoDB connection pool created:', event);
    });

    mongoClient.on('connectionPoolClosed', (event) => {
      console.log('MongoDB connection pool closed:', event);
    });

    mongoClient.on('connectionCreated', (event) => {
      console.log('MongoDB connection created:', event);
    });

    mongoClient.on('connectionClosed', (event) => {
      console.log('MongoDB connection closed:', event);
    });

    return mongoClient;
  } catch (error) {
    connectionPromise = null;
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Disconnect from MongoDB
export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoClient.close();
    isConnected = false;
    connectionPromise = null;
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Failed to disconnect from MongoDB:', error);
    throw error;
  }
}

// Health check utility
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await mongoClient.db('admin').command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

// Get connection status
export function getConnectionStatus(): {
  isConnected: boolean;
  readyState: number;
  host: string;
  name: string;
} {
  return {
    isConnected,
    readyState: mongoClient.topology?.isConnected() ? 1 : 0,
    host: mongoClient.options.hosts?.[0]?.host || 'unknown',
    name: databaseName
  };
}

// Database connection for ORM usage
export const sql = db;

// Export for use with ORM plugins
export { db as database };
`;
    }
    generateTypes() {
        return `/**
 * MongoDB Database Types
 * 
 * This file contains TypeScript types for your MongoDB database.
 * You can generate these types using MongoDB Schema Generator:
 * 
 * npx mongodb-schema-generator --uri $MONGODB_URI --output src/lib/db/types.ts
 * 
 * Based on: https://docs.mongodb.com/drivers/node/current/fundamentals/typescript/
 */

import { ObjectId, Document } from 'mongodb';

// Base document interface
export interface BaseDocument extends Document {
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

// Post document interface
export interface Post extends BaseDocument {
  title: string;
  content?: string;
  published: boolean;
  authorId: string;
}

// Profile document interface
export interface Profile extends BaseDocument {
  bio?: string;
  userId: string;
}

// Database collections
export interface Database {
  users: User[];
  accounts: Account[];
  sessions: Session[];
  verificationTokens: VerificationToken[];
  posts: Post[];
  profiles: Profile[];
}

// Re-export common types
export type { ObjectId, Document } from 'mongodb';
`;
    }
    generateDatabaseClient() {
        return `/**
 * Database Client - MongoDB Implementation
 * 
 * This file provides a unified database client interface
 * that works with MongoDB.
 * 
 * Based on: https://docs.mongodb.com/drivers/node/current/
 */

import { db, connectToDatabase, disconnectFromDatabase, checkDatabaseConnection, getConnectionStatus } from './mongodb.js';
import type { Database } from './types.js';

// Database client for ORM usage
export const database = db;

// Connection utility
export const getConnection = () => db;

// Health check
export const healthCheck = checkDatabaseConnection;

// Connection status
export const getStatus = getConnectionStatus;

// Export types
export type { Database } from './types.js';

// Database utilities
export const dbUtils = {
  // Check if database is connected
  isConnected: () => db.client.topology?.isConnected() || false,
  
  // Get database stats
  getStats: async () => {
    try {
      const stats = await db.stats();
      return {
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return null;
    }
  },
  
  // Clear all collections (for testing)
  clearAll: async () => {
    const collections = await db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
};
`;
    }
    generateDatabaseUtils() {
        return `/**
 * MongoDB Database Utilities
 * 
 * Utility functions for common MongoDB operations.
 * Based on: https://docs.mongodb.com/drivers/node/current/
 */

import { db } from './mongodb.js';
import type { Database } from './types.js';

// Collection utilities
export const collectionUtils = {
  // Get collection with proper typing
  getCollection: <T extends keyof Database>(name: T) => {
    return db.collection(name);
  },

  // Create index
  createIndex: async (collectionName: string, indexSpec: any, options?: any) => {
    const collection = db.collection(collectionName);
    return await collection.createIndex(indexSpec, options);
  },

  // Drop index
  dropIndex: async (collectionName: string, indexName: string) => {
    const collection = db.collection(collectionName);
    return await collection.dropIndex(indexName);
  },

  // List indexes
  listIndexes: async (collectionName: string) => {
    const collection = db.collection(collectionName);
    return await collection.listIndexes().toArray();
  }
};

// Query utilities
export const queryUtils = {
  // Build aggregation pipeline
  buildAggregation: (pipeline: any[]) => pipeline,

  // Build find query
  buildFindQuery: (filter: any, options?: any) => ({ filter, options }),

  // Build update query
  buildUpdateQuery: (filter: any, update: any, options?: any) => ({ filter, update, options }),

  // Build delete query
  buildDeleteQuery: (filter: any, options?: any) => ({ filter, options })
};

// Validation utilities
export const validationUtils = {
  // Validate ObjectId
  isValidObjectId: (id: string) => {
    try {
      return /^[0-9a-fA-F]{24}$/.test(id);
    } catch {
      return false;
    }
  },

  // Validate database name
  isValidDatabaseName: (name: string) => {
    return /^[a-zA-Z0-9_-]+$/.test(name) && name.length > 0 && name.length <= 64;
  },

  // Validate collection name
  isValidCollectionName: (name: string) => {
    return /^[a-zA-Z0-9_-]+$/.test(name) && name.length > 0 && name.length <= 255;
  }
};

// Export for use in other files
export { db } from './mongodb.js';
export type { Database } from './types.js';
`;
    }
    generateMonitoringUtils() {
        return `/**
 * MongoDB Monitoring Utilities
 * 
 * Monitoring and observability utilities for MongoDB.
 * Based on: https://docs.mongodb.com/manual/administration/monitoring/
 */

import { db } from '../mongodb.js';

// Performance monitoring
export const performanceMonitoring = {
  // Get server status
  getServerStatus: async () => {
    try {
      return await db.admin().serverStatus();
    } catch (error) {
      console.error('Failed to get server status:', error);
      return null;
    }
  },

  // Get database stats
  getDatabaseStats: async () => {
    try {
      return await db.stats();
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return null;
    }
  },

  // Get collection stats
  getCollectionStats: async (collectionName: string) => {
    try {
      return await db.collection(collectionName).stats();
    } catch (error) {
      console.error('Failed to get collection stats:', error);
      return null;
    }
  },

  // Get operation statistics
  getOperationStats: async () => {
    try {
      const serverStatus = await db.admin().serverStatus();
      return {
        operations: serverStatus.opcounters,
        connections: serverStatus.connections,
        network: serverStatus.network,
        memory: serverStatus.mem
      };
    } catch (error) {
      console.error('Failed to get operation stats:', error);
      return null;
    }
  }
};

// Health monitoring
export const healthMonitoring = {
  // Check database health
  checkHealth: async () => {
    try {
      await db.command({ ping: 1 });
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date() };
    }
  },

  // Check connection pool health
  checkConnectionPool: async () => {
    try {
      const serverStatus = await db.admin().serverStatus();
      return {
        activeConnections: serverStatus.connections.active,
        availableConnections: serverStatus.connections.available,
        currentConnections: serverStatus.connections.current
      };
    } catch (error) {
      console.error('Failed to check connection pool:', error);
      return null;
    }
  }
};

// Logging utilities
export const loggingUtils = {
  // Log slow queries
  logSlowQueries: async (thresholdMs: number = 100) => {
    try {
      const profile = await db.admin().command({ profile: 2, slowms: thresholdMs });
      return profile;
    } catch (error) {
      console.error('Failed to enable slow query logging:', error);
      return null;
    }
  },

  // Get recent operations
  getRecentOperations: async (limit: number = 100) => {
    try {
      const systemProfile = db.collection('system.profile');
      return await systemProfile.find({}).sort({ ts: -1 }).limit(limit).toArray();
    } catch (error) {
      console.error('Failed to get recent operations:', error);
      return [];
    }
  }
};
`;
    }
    generateUnifiedIndex() {
        return `/**
 * Unified Database Interface - MongoDB Implementation
 * 
 * This file provides a unified interface for database operations
 * that works with MongoDB. It abstracts away MongoDB-specific
 * details and provides a clean API for database operations.
 * 
 * Based on: https://docs.mongodb.com/drivers/node/current/
 */

import { db } from './mongodb.js';
import type { Database } from './types.js';
import { collectionUtils, queryUtils } from './utils.js';

// ============================================================================
// UNIFIED DATABASE INTERFACE
// ============================================================================

export interface UnifiedDatabase {
  // Connection management
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  healthCheck: () => Promise<boolean>;
  
  // Query operations (MongoDB-style)
  find: <T = any>(collection: string, filter?: any, options?: any) => Promise<T[]>;
  findOne: <T = any>(collection: string, filter?: any, options?: any) => Promise<T | null>;
  create: <T = any>(collection: string, data: any) => Promise<T>;
  update: <T = any>(collection: string, filter: any, data: any, options?: any) => Promise<T>;
  delete: (collection: string, filter: any) => Promise<boolean>;
  
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
  collections: string[];
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

    // Query operations (MongoDB-style)
    async find<T = any>(collection: string, filter: any = {}, options: any = {}): Promise<T[]> {
      const coll = db.collection(collection);
      return await coll.find(filter, options).toArray();
    },

    async findOne<T = any>(collection: string, filter: any = {}, options: any = {}): Promise<T | null> {
      const coll = db.collection(collection);
      return await coll.findOne(filter, options);
    },

    async create<T = any>(collection: string, data: any): Promise<T> {
      const coll = db.collection(collection);
      const result = await coll.insertOne(data);
      return { ...data, _id: result.insertedId } as T;
    },

    async update<T = any>(collection: string, filter: any, data: any, options: any = {}): Promise<T> {
      const coll = db.collection(collection);
      const result = await coll.findOneAndUpdate(filter, { $set: data }, { returnDocument: 'after', ...options });
      return result.value as T;
    },

    async delete(collection: string, filter: any): Promise<boolean> {
      const coll = db.collection(collection);
      const result = await coll.deleteOne(filter);
      return result.deletedCount > 0;
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
        const collections = await db.listCollections().toArray();
        return {
          name: db.databaseName,
          version: 'MongoDB',
          size: \`\${Math.round(stats.dataSize / 1024 / 1024)}MB\`,
          collections: collections.map(c => c.name)
        };
      } catch {
        return {
          name: 'Unknown',
          version: 'Unknown',
          size: 'Unknown',
          collections: []
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
export { collectionUtils, queryUtils, validationUtils } from './utils.js';
`;
    }
    generateEnvConfig(config) {
        return `# MongoDB Database Configuration
MONGODB_URI="${config.databaseUrl || 'mongodb://localhost:27017'}"
MONGODB_DATABASE="${config.databaseName || 'myapp'}"

# Database URL for ORM usage
DATABASE_URL="${config.databaseUrl || 'mongodb://localhost:27017'}/${config.databaseName || 'myapp'}"

# MongoDB specific settings
MONGODB_COMPRESSION="${config.enableCompression ? 'true' : 'false'}"
MONGODB_RETRY_WRITES="${config.enableRetryWrites ? 'true' : 'false'}"
MONGODB_READ_CONCERN="${config.enableReadConcern ? 'true' : 'false'}"
MONGODB_WRITE_CONCERN="${config.enableWriteConcern ? 'true' : 'false'}"
MONGODB_POOL_SIZE="${config.connectionPoolSize || 10}"
MONGODB_SERVER_SELECTION_TIMEOUT="${config.serverSelectionTimeout || 5000}"
MONGODB_SOCKET_TIMEOUT="${config.socketTimeout || 45000}"
MONGODB_MAX_IDLE_TIME="${config.maxIdleTime || 30000}"
MONGODB_MONITORING="${config.enableMonitoring ? 'true' : 'false'}"
MONGODB_LOGGING="${config.enableLogging ? 'true' : 'false'}"
MONGODB_METRICS="${config.enableMetrics ? 'true' : 'false'}"
MONGODB_TELEMETRY="${config.enableTelemetry ? 'true' : 'false'}"
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
//# sourceMappingURL=mongodb.plugin.js.map