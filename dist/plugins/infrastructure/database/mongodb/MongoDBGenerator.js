export class MongoDBGenerator {
    static generateMongoDBClient(config) {
        const databaseUrl = config.databaseUrl || 'mongodb://localhost:27017';
        const databaseName = config.databaseName || 'myapp';
        const maxPoolSize = config.maxPoolSize || 10;
        const minPoolSize = config.minPoolSize || 0;
        const maxIdleTimeMS = config.maxIdleTimeMS || 30000;
        const connectTimeoutMS = config.connectTimeoutMS || 10000;
        const socketTimeoutMS = config.socketTimeoutMS || 30000;
        const serverSelectionTimeoutMS = config.serverSelectionTimeoutMS || 30000;
        const heartbeatFrequencyMS = config.heartbeatFrequencyMS || 10000;
        const retryWrites = config.retryWrites !== false;
        const retryReads = config.retryReads !== false;
        const readPreference = config.readPreference || 'primary';
        const writeConcern = config.writeConcern || 'majority';
        const readConcern = config.readConcern || 'local';
        const appName = config.appName || 'the-architech-app';
        const enableCompression = config.enableCompression !== false;
        const compressors = config.compressors || ['zlib'];
        const zlibCompressionLevel = config.zlibCompressionLevel || 6;
        return `import { MongoClient, Db, Collection, Document, ObjectId, Filter, UpdateFilter, InsertOneResult, InsertManyResult, UpdateResult, DeleteResult, FindCursor, AggregationCursor } from 'mongodb';
import { Logger } from '../../../../types/agent.js';

// MongoDB configuration
export const mongoConfig = {
  url: '${databaseUrl}',
  databaseName: '${databaseName}',
  maxPoolSize: ${maxPoolSize},
  minPoolSize: ${minPoolSize},
  maxIdleTimeMS: ${maxIdleTimeMS},
  connectTimeoutMS: ${connectTimeoutMS},
  socketTimeoutMS: ${socketTimeoutMS},
  serverSelectionTimeoutMS: ${serverSelectionTimeoutMS},
  heartbeatFrequencyMS: ${heartbeatFrequencyMS},
  retryWrites: ${retryWrites},
  retryReads: ${retryReads},
  readPreference: '${readPreference}',
  writeConcern: '${writeConcern}',
  readConcern: '${readConcern}',
  appName: '${appName}',
  enableCompression: ${enableCompression},
  compressors: ${JSON.stringify(compressors)},
  zlibCompressionLevel: ${zlibCompressionLevel},
  enableReplicaSet: ${config.enableReplicaSet || false},
  enableSharding: ${config.enableSharding || false},
  enableAtlas: ${config.enableAtlas || false},
  enableMonitoring: ${config.enableMonitoring !== false},
  enableLogging: ${config.enableLogging !== false},
  enableMetrics: ${config.enableMetrics !== false},
  enableTelemetry: ${config.enableTelemetry || false}
};

// MongoDB client instance
let client: MongoClient | null = null;
let db: Db | null = null;

// Connection management
export class MongoDBConnection {
  private static instance: MongoDBConnection;
  private isConnected = false;
  private logger: Logger;

  private constructor() {
    this.logger = new Logger(false, 'MongoDBConnection');
  }

  static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  async connect(): Promise<void> {
    try {
      if (client && this.isConnected) {
        this.logger.info('MongoDB already connected');
        return;
      }

      const options = {
        maxPoolSize: mongoConfig.maxPoolSize,
        minPoolSize: mongoConfig.minPoolSize,
        maxIdleTimeMS: mongoConfig.maxIdleTimeMS,
        connectTimeoutMS: mongoConfig.connectTimeoutMS,
        socketTimeoutMS: mongoConfig.socketTimeoutMS,
        serverSelectionTimeoutMS: mongoConfig.serverSelectionTimeoutMS,
        heartbeatFrequencyMS: mongoConfig.heartbeatFrequencyMS,
        retryWrites: mongoConfig.retryWrites,
        retryReads: mongoConfig.retryReads,
        readPreference: mongoConfig.readPreference,
        writeConcern: mongoConfig.writeConcern,
        readConcern: mongoConfig.readConcern,
        appName: mongoConfig.appName,
        compressors: mongoConfig.compressors,
        zlibCompressionLevel: mongoConfig.zlibCompressionLevel
      };

      client = new MongoClient(mongoConfig.url, options);
      await client.connect();
      
      db = client.db(mongoConfig.databaseName);
      this.isConnected = true;
      
      this.logger.success('✅ Connected to MongoDB database');
      
      // Test connection
      await this.ping();
    } catch (error) {
      this.logger.error('❌ Failed to connect to MongoDB:', error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (client) {
        await client.close();
        client = null;
        db = null;
        this.isConnected = false;
        this.logger.success('✅ Disconnected from MongoDB database');
      }
    } catch (error) {
      this.logger.error('❌ Error disconnecting from MongoDB:', error as Error);
      throw error;
    }
  }

  isConnectedToDatabase(): boolean {
    return this.isConnected && client !== null;
  }

  getDatabase(): Db {
    if (!db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return db;
  }

  getClient(): MongoClient {
    if (!client) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return client;
  }

  async ping(): Promise<boolean> {
    try {
      if (!db) {
        throw new Error('Database not connected');
      }
      await db.admin().ping();
      return true;
    } catch (error) {
      this.logger.error('MongoDB ping failed:', error as Error);
      return false;
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; responseTime: number }> {
    const startTime = Date.now();
    try {
      const isHealthy = await this.ping();
      const responseTime = Date.now() - startTime;
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime
      };
    }
  }
}

// Export singleton instance
export const mongoConnection = MongoDBConnection.getInstance();

// Utility functions
export async function getCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
  const db = mongoConnection.getDatabase();
  return db.collection<T>(collectionName);
}

export async function executeTransaction<T>(callback: (session: any) => Promise<T>): Promise<T> {
  const client = mongoConnection.getClient();
  const session = client.startSession();
  
  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

// Migration utilities
export async function runMigrations(migrations: Array<{ name: string; up: () => Promise<void> }>): Promise<void> {
  const collection = await getCollection('migrations');
  
  for (const migration of migrations) {
    const existing = await collection.findOne({ name: migration.name });
    
    if (!existing) {
      try {
        await migration.up();
        await collection.insertOne({
          name: migration.name,
          appliedAt: new Date(),
          status: 'completed'
        });
        console.log(\`✅ Migration applied: \${migration.name}\`);
      } catch (error) {
        console.error(\`❌ Migration failed: \${migration.name}\`, error);
        throw error;
      }
    }
  }
}

// Backup utilities
export async function createBackup(): Promise<string> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = \`backup-\${timestamp}\`;
    
    // This would typically use mongodump or MongoDB Atlas API
    console.log(\`Creating backup: \${backupName}\`);
    
    return backupName;
  } catch (error) {
    console.error('Backup creation failed:', error);
    throw error;
  }
}

// Performance monitoring
export async function getPerformanceMetrics(): Promise<any> {
  try {
    const db = mongoConnection.getDatabase();
    const stats = await db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize
    };
  } catch (error) {
    console.error('Failed to get performance metrics:', error);
    return {};
  }
}

// Export types for convenience
export type { 
  Document, 
  ObjectId, 
  Filter, 
  UpdateFilter, 
  InsertOneResult, 
  InsertManyResult, 
  UpdateResult, 
  DeleteResult, 
  FindCursor, 
  AggregationCursor 
};
`;
    }
    static generateEnvConfig(config) {
        const databaseUrl = config.databaseUrl || 'mongodb://localhost:27017';
        const databaseName = config.databaseName || 'myapp';
        return `# MongoDB Configuration
MONGODB_URL="${databaseUrl}"
MONGODB_DATABASE="${databaseName}"

# Connection Settings
MONGODB_MAX_POOL_SIZE="${config.maxPoolSize || 10}"
MONGODB_MIN_POOL_SIZE="${config.minPoolSize || 0}"
MONGODB_MAX_IDLE_TIME_MS="${config.maxIdleTimeMS || 30000}"
MONGODB_CONNECT_TIMEOUT_MS="${config.connectTimeoutMS || 10000}"
MONGODB_SOCKET_TIMEOUT_MS="${config.socketTimeoutMS || 30000}"
MONGODB_SERVER_SELECTION_TIMEOUT_MS="${config.serverSelectionTimeoutMS || 30000}"
MONGODB_HEARTBEAT_FREQUENCY_MS="${config.heartbeatFrequencyMS || 10000}"

# Read/Write Settings
MONGODB_RETRY_WRITES="${config.retryWrites !== false ? 'true' : 'false'}"
MONGODB_RETRY_READS="${config.retryReads !== false ? 'true' : 'false'}"
MONGODB_READ_PREFERENCE="${config.readPreference || 'primary'}"
MONGODB_WRITE_CONCERN="${config.writeConcern || 'majority'}"
MONGODB_READ_CONCERN="${config.readConcern || 'local'}"

# Application Settings
MONGODB_APP_NAME="${config.appName || 'the-architech-app'}"

# Feature Flags
MONGODB_ENABLE_REPLICA_SET="${config.enableReplicaSet || false ? 'true' : 'false'}"
MONGODB_ENABLE_SHARDING="${config.enableSharding || false ? 'true' : 'false'}"
MONGODB_ENABLE_ATLAS="${config.enableAtlas || false ? 'true' : 'false'}"
MONGODB_ENABLE_COMPRESSION="${config.enableCompression !== false ? 'true' : 'false'}"
MONGODB_ENABLE_MONITORING="${config.enableMonitoring !== false ? 'true' : 'false'}"
MONGODB_ENABLE_LOGGING="${config.enableLogging !== false ? 'true' : 'false'}"
MONGODB_ENABLE_METRICS="${config.enableMetrics !== false ? 'true' : 'false'}"
MONGODB_ENABLE_TELEMETRY="${config.enableTelemetry || false ? 'true' : 'false'}"

# Compression Settings
MONGODB_COMPRESSORS="${(config.compressors || ['zlib']).join(',')}"
MONGODB_ZLIB_COMPRESSION_LEVEL="${config.zlibCompressionLevel || 6}"

# Security Settings
MONGODB_SSL="${config.ssl || false ? 'true' : 'false'}"
MONGODB_TLS="${config.tls || false ? 'true' : 'false'}"
MONGODB_AUTH_SOURCE="${config.authSource || 'admin'}"
MONGODB_AUTH_MECHANISM="${config.authMechanism || 'SCRAM-SHA-256'}"

# Development Settings
NODE_ENV="development"
MONGODB_DEBUG="${config.enableLogging !== false ? 'true' : 'false'}"
`;
    }
    static generatePackageJson(config) {
        const dependencies = {
            'mongodb': '^6.3.0'
        };
        // Add monitoring dependencies if enabled
        if (config.enableMonitoring !== false) {
            dependencies['@mongodb-js/mongodb-memory-server'] = '^9.1.0';
        }
        return JSON.stringify({
            name: 'mongodb-database',
            version: '0.1.0',
            private: true,
            scripts: {
                'db:connect': 'node -e "require(\'./src/lib/database/mongodb.js\').mongoConnection.connect()"',
                'db:health': 'node -e "require(\'./src/lib/database/mongodb.js\').mongoConnection.healthCheck()"',
                'db:migrate': 'node scripts/migrate.js',
                'db:backup': 'node scripts/backup.js',
                'db:seed': 'node scripts/seed.js'
            },
            dependencies
        }, null, 2);
    }
    static generateReadme() {
        return `# MongoDB Database Setup

This project uses MongoDB for document-oriented NoSQL database storage.

## Features

- **Document Storage**: Flexible schema for JSON-like documents
- **High Performance**: Optimized for read and write operations
- **Scalability**: Horizontal scaling with sharding
- **Replication**: High availability with replica sets
- **Aggregation**: Powerful data processing pipeline
- **Indexing**: Multiple index types for query optimization
- **Transactions**: ACID compliance for multi-document operations

## Configuration

The MongoDB database is configured in \`src/lib/database/mongodb.ts\`. Key settings:

- **Connection URL**: Set via \`MONGODB_URL\` environment variable
- **Database Name**: Set via \`MONGODB_DATABASE\` environment variable
- **Connection Pool**: Configurable pool size and timeouts
- **Read/Write Concerns**: Configurable consistency levels
- **Compression**: Built-in compression for network efficiency

## Environment Variables

Required:
- \`MONGODB_URL\`: MongoDB connection string
- \`MONGODB_DATABASE\`: Database name

Optional:
- \`MONGODB_MAX_POOL_SIZE\`: Maximum connection pool size
- \`MONGODB_READ_PREFERENCE\`: Read preference (primary, secondary, etc.)
- \`MONGODB_WRITE_CONCERN\`: Write concern level
- \`MONGODB_APP_NAME\`: Application name for monitoring

## Usage

\`\`\`typescript
import { mongoConnection, getCollection } from '@/lib/database/mongodb';

// Connect to database
await mongoConnection.connect();

// Get collection
const users = await getCollection('users');

// Insert document
const result = await users.insertOne({
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date()
});

// Find documents
const user = await users.findOne({ email: 'john@example.com' });

// Update document
await users.updateOne(
  { _id: user._id },
  { $set: { lastLogin: new Date() } }
);

// Delete document
await users.deleteOne({ _id: user._id });

// Aggregation pipeline
const pipeline = [
  { $match: { status: 'active' } },
  { $group: { _id: '$role', count: { $sum: 1 } } }
];
const results = await users.aggregate(pipeline).toArray();
\`\`\`

## Available Scripts

- \`npm run db:connect\` - Test database connection
- \`npm run db:health\` - Check database health
- \`npm run db:migrate\` - Run database migrations
- \`npm run db:backup\` - Create database backup
- \`npm run db:seed\` - Seed database with initial data

## Best Practices

1. **Connection Management**: Use connection pooling for production
2. **Indexing**: Create appropriate indexes for query patterns
3. **Schema Design**: Design documents for your query patterns
4. **Aggregation**: Use aggregation pipelines for complex queries
5. **Transactions**: Use transactions for multi-document operations
6. **Monitoring**: Enable monitoring and metrics collection
7. **Backup**: Regular backups with point-in-time recovery

## Troubleshooting

### Connection Issues
- Verify \`MONGODB_URL\` is correct
- Check network connectivity
- Ensure authentication credentials are valid

### Performance Issues
- Monitor connection pool usage
- Check query performance with explain()
- Consider read replicas for read-heavy workloads

### Migration Issues
- Use transactions for schema changes
- Test migrations in development
- Backup before major schema changes
`;
    }
    static generateTypes() {
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
    static generateDatabaseClient() {
        return `/**
 * Database Client - MongoDB Implementation
 * 
 * This file provides a unified database client interface
 * that works with MongoDB.
 * 
 * Based on: https://docs.mongodb.com/drivers/node/current/
 */

import { mongoConnection, getCollection } from './mongodb.js';
import type { Database } from './types.js';

// Database client for ORM usage
export const database = mongoConnection;

// Connection utility
export const getConnection = () => mongoConnection;

// Health check
export const healthCheck = () => mongoConnection.healthCheck();

// Connection status
export const getStatus = () => mongoConnection.getStatus();

// Export types
export type { Database } from './types.js';

// Database utilities
export const dbUtils = {
  // Check if database is connected
  isConnected: () => mongoConnection.isConnected(),
  
  // Get database stats
  getStats: async () => {
    try {
      const db = await mongoConnection.getDatabase();
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
    const db = await mongoConnection.getDatabase();
    const collections = await db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
};
`;
    }
    static generateDatabaseUtils() {
        return `/**
 * MongoDB Database Utilities
 * 
 * Utility functions for common MongoDB operations.
 * Based on: https://docs.mongodb.com/drivers/node/current/
 */

import { mongoConnection, getCollection } from './mongodb.js';
import type { Database } from './types.js';

// Collection utilities
export const collectionUtils = {
  // Get collection with proper typing
  getCollection: <T extends keyof Database>(name: T) => {
    return getCollection(name);
  },

  // Create index
  createIndex: async (collectionName: string, indexSpec: any, options?: any) => {
    const collection = await getCollection(collectionName);
    return await collection.createIndex(indexSpec, options);
  },

  // Drop index
  dropIndex: async (collectionName: string, indexName: string) => {
    const collection = await getCollection(collectionName);
    return await collection.dropIndex(indexName);
  },

  // List indexes
  listIndexes: async (collectionName: string) => {
    const collection = await getCollection(collectionName);
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
export { mongoConnection, getCollection } from './mongodb.js';
export type { Database } from './types.js';
`;
    }
    static generateUnifiedIndex() {
        return `/**
 * Unified Database Interface - MongoDB Implementation
 * 
 * This file provides a unified interface for database operations
 * that works with MongoDB. It abstracts away MongoDB-specific
 * details and provides a clean API for database operations.
 * 
 * Based on: https://docs.mongodb.com/drivers/node/current/
 */

import { mongoConnection, getCollection } from './mongodb.js';
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
      await mongoConnection.connect();
    },

    async disconnect() {
      await mongoConnection.disconnect();
    },

    async healthCheck() {
      return await mongoConnection.healthCheck();
    },

    // Query operations (MongoDB-style)
    async find<T = any>(collection: string, filter: any = {}, options: any = {}): Promise<T[]> {
      const coll = await getCollection(collection);
      return await coll.find(filter, options).toArray();
    },

    async findOne<T = any>(collection: string, filter: any = {}, options: any = {}): Promise<T | null> {
      const coll = await getCollection(collection);
      return await coll.findOne(filter, options);
    },

    async create<T = any>(collection: string, data: any): Promise<T> {
      const coll = await getCollection(collection);
      const result = await coll.insertOne(data);
      return { ...data, _id: result.insertedId } as T;
    },

    async update<T = any>(collection: string, filter: any, data: any, options: any = {}): Promise<T> {
      const coll = await getCollection(collection);
      const result = await coll.findOneAndUpdate(filter, { $set: data }, { returnDocument: 'after', ...options });
      return result.value as T;
    },

    async delete(collection: string, filter: any): Promise<boolean> {
      const coll = await getCollection(collection);
      const result = await coll.deleteOne(filter);
      return result.deletedCount > 0;
    },

    // Transaction support
    async transaction<T>(callback: (db: UnifiedDatabase) => Promise<T>): Promise<T> {
      const database = await mongoConnection.getDatabase();
      const session = database.client.startSession();
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
        const database = await mongoConnection.getDatabase();
        const stats = await database.stats();
        const collections = await database.listCollections().toArray();
        return {
          name: database.databaseName,
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

export { mongoConnection, getCollection } from './mongodb.js';
export type { Database } from './types.js';
export { collectionUtils, queryUtils, validationUtils } from './utils.js';
`;
    }
    static generateMonitoringUtils() {
        return `/**
 * MongoDB Monitoring Utilities
 * 
 * Monitoring and observability utilities for MongoDB.
 * Based on: https://docs.mongodb.com/manual/administration/monitoring/
 */

import { mongoConnection, getCollection } from '../mongodb.js';

// Performance monitoring
export const performanceMonitoring = {
  // Get server status
  getServerStatus: async () => {
    try {
      const database = await mongoConnection.getDatabase();
      return await database.admin().serverStatus();
    } catch (error) {
      console.error('Failed to get server status:', error);
      return null;
    }
  },

  // Get database stats
  getDatabaseStats: async () => {
    try {
      const database = await mongoConnection.getDatabase();
      return await database.stats();
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return null;
    }
  },

  // Get collection stats
  getCollectionStats: async (collectionName: string) => {
    try {
      const collection = await getCollection(collectionName);
      return await collection.stats();
    } catch (error) {
      console.error('Failed to get collection stats:', error);
      return null;
    }
  },

  // Get operation statistics
  getOperationStats: async () => {
    try {
      const database = await mongoConnection.getDatabase();
      const serverStatus = await database.admin().serverStatus();
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
      await mongoConnection.healthCheck();
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date() };
    }
  },

  // Check connection pool health
  checkConnectionPool: async () => {
    try {
      const database = await mongoConnection.getDatabase();
      const serverStatus = await database.admin().serverStatus();
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
      const database = await mongoConnection.getDatabase();
      const profile = await database.admin().command({ profile: 2, slowms: thresholdMs });
      return profile;
    } catch (error) {
      console.error('Failed to enable slow query logging:', error);
      return null;
    }
  },

  // Get recent operations
  getRecentOperations: async (limit: number = 100) => {
    try {
      const systemProfile = await getCollection('system.profile');
      return await systemProfile.find({}).sort({ ts: -1 }).limit(limit).toArray();
    } catch (error) {
      console.error('Failed to get recent operations:', error);
      return [];
    }
  }
};
`;
    }
}
//# sourceMappingURL=MongoDBGenerator.js.map