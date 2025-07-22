/**
 * Mongoose Code Generator
 * 
 * Handles all code generation for Mongoose ODM integration.
 * Based on: https://mongoosejs.com/docs/typescript.html
 */

import { MongooseConfig } from './MongooseSchema.js';

export class MongooseGenerator {
  
  static generateMongooseConnection(config: MongooseConfig): string {
    const enableDebug = config.enableDebug === true;
    const poolSize = config.connectionPoolSize || 10;
    const enableCompression = config.enableCompression !== false;
    
    return `import mongoose from 'mongoose';

// MongoDB connection URI
const mongoUri = process.env.MONGODB_URI!;

if (!mongoUri) {
  throw new Error('Missing MONGODB_URI environment variable');
}

// Mongoose connection options with latest best practices
const connectionOptions: mongoose.ConnectOptions = {
  maxPoolSize: ${poolSize},
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0,
  ${enableCompression ? `
  // Enable compression
  compressors: ['zlib'],` : ''}
  ${enableDebug ? `
  // Debug mode
  debug: true,` : ''}
};

// Connection state tracking
let isConnected = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

// Connect to MongoDB with connection pooling
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose.connect(mongoUri, connectionOptions);
  
  try {
    await connectionPromise;
    isConnected = true;
    console.log('✅ Connected to MongoDB');
    
    // Set up connection event handlers
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      isConnected = true;
    });

    return mongoose;
  } catch (error) {
    connectionPromise = null;
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Disconnect from MongoDB
export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    isConnected = false;
    connectionPromise = null;
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

// Get connection status
export function getConnectionStatus(): {
  isConnected: boolean;
  readyState: number;
  host: string;
  name: string;
} {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
}

// Export mongoose instance
export { mongoose };
`;
  }

  static generateUserModel(config: MongooseConfig): string {
    const enableTimestamps = config.enableTimestamps !== false;
    const enablePlugins = config.enablePlugins !== false;
    
    return `import mongoose, { Document, Schema, Model } from 'mongoose';
${enablePlugins ? `import { timestampPlugin } from '../plugins/timestamp.plugin.js';
import { softDeletePlugin } from '../plugins/soft-delete.plugin.js';` : ''}

// User interface with proper TypeScript types
export interface IUser extends Document {
  email: string;
  name?: string;
  avatar?: string;
  emailVerified?: Date;
  ${enableTimestamps ? `
  createdAt: Date;
  updatedAt: Date;` : ''}
  ${enablePlugins ? `
  deletedAt?: Date;
  isDeleted: boolean;` : ''}
}

// User schema with latest Mongoose patterns
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email: string) {
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        return emailRegex.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot be longer than 100 characters']
  },
  avatar: {
    type: String,
    validate: {
      validator: function(url: string) {
        if (!url) return true;
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Please provide a valid URL for avatar'
    }
  },
  emailVerified: {
    type: Date
  }
}, {
  ${enableTimestamps ? 'timestamps: true,' : ''}
  collection: 'users',
  // Enable optimistic concurrency control
  optimisticConcurrency: true,
  // Add schema-level validation
  validateBeforeSave: true
});

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });
${enablePlugins ? `
// Apply plugins
userSchema.plugin(timestampPlugin);
userSchema.plugin(softDeletePlugin);` : ''}

// Instance methods
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.__v;
  return user;
};

// Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ ${enablePlugins ? 'isDeleted: false' : '1: 1'} });
};

// Virtual properties
userSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0];
});

// Pre-save middleware
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Post-save middleware
userSchema.post('save', function(doc) {
  console.log('User saved:', doc.email);
});

// Export User model with proper typing
export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

// Export for use in other files
export default User;
`;
  }

  static generateDatabaseClient(): string {
    return `import mongoose from 'mongoose';
import { connectToDatabase, disconnectFromDatabase, checkDatabaseConnection, getConnectionStatus } from './connection.js';

// Database client for ORM usage
export const db = mongoose;

// Connection utility
export const getConnection = () => mongoose.connection;

// Health check
export const healthCheck = checkDatabaseConnection;

// Connection status
export const getStatus = getConnectionStatus;

// Export for use with other plugins
export { mongoose as client };

// Database utilities
export const dbUtils = {
  // Check if database is connected
  isConnected: () => mongoose.connection.readyState === 1,
  
  // Get database stats
  getStats: async () => {
    try {
      const stats = await mongoose.connection.db.stats();
      return {
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return null;
    }
  },
  
  // Clear all collections (for testing)
  clearAll: async () => {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
};
`;
  }

  static generateSchemaTypes(): string {
    return `/**
 * Database Schema Types - Mongoose Implementation
 * 
 * This file contains TypeScript types for your Mongoose models.
 * These types provide type safety for database operations.
 * 
 * Based on: https://mongoosejs.com/docs/typescript.html
 */

import type { Document, Model } from 'mongoose';

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
  displayName?: string;
}

// Account document interface (for OAuth)
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

// Model interfaces
export interface UserModel extends Model<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
  findActiveUsers(): Promise<UserDocument[]>;
}

// Re-export common types
export type { Document, Model } from 'mongoose';
`;
  }

  static generateUnifiedIndex(): string {
    return `/**
 * Unified Database Interface - Mongoose Implementation
 * 
 * This file provides a unified interface for database operations
 * that works with Mongoose ODM. It abstracts away Mongoose-specific
 * details and provides a clean API for database operations.
 * 
 * Based on: https://mongoosejs.com/docs/queries.html
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
  
  // Query operations (Mongoose-style)
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

    // Query operations (Mongoose-style)
    async find<T = any>(collection: string, filter: any = {}, options: any = {}): Promise<T[]> {
      const model = mongoose.model(collection);
      return await model.find(filter, null, options).lean();
    },

    async findOne<T = any>(collection: string, filter: any = {}, options: any = {}): Promise<T | null> {
      const model = mongoose.model(collection);
      return await model.findOne(filter, null, options).lean();
    },

    async create<T = any>(collection: string, data: any): Promise<T> {
      const model = mongoose.model(collection);
      const doc = new model(data);
      return await doc.save();
    },

    async update<T = any>(collection: string, filter: any, data: any, options: any = {}): Promise<T> {
      const model = mongoose.model(collection);
      return await model.findOneAndUpdate(filter, data, { new: true, ...options });
    },

    async delete(collection: string, filter: any): Promise<boolean> {
      const model = mongoose.model(collection);
      const result = await model.deleteOne(filter);
      return result.deletedCount > 0;
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
          collections: Object.keys(stats.collections || {})
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

export { mongoose, db } from './client.js';
export type { UserDocument } from './schema.js';
`;
  }

  static generatePluginsIndex(): string {
    return `/**
 * Mongoose Plugins Index
 * 
 * Central export for all Mongoose plugins and middleware.
 * Based on: https://mongoosejs.com/docs/plugins.html
 */

export { timestampPlugin } from './timestamp.plugin.js';
export { softDeletePlugin } from './soft-delete.plugin.js';

// Plugin utilities
export const pluginUtils = {
  // Apply multiple plugins to a schema
  applyPlugins: (schema: any, plugins: any[]) => {
    plugins.forEach(plugin => {
      if (typeof plugin === 'function') {
        schema.plugin(plugin);
      } else if (plugin.plugin) {
        schema.plugin(plugin.plugin, plugin.options);
      }
    });
  },

  // Create a custom plugin
  createPlugin: (fn: (schema: any, options?: any) => void) => fn
};
`;
  }

  static generateTimestampPlugin(): string {
    return `/**
 * Timestamp Plugin for Mongoose
 * 
 * Automatically adds createdAt and updatedAt fields to documents.
 * Based on: https://mongoosejs.com/docs/middleware.html
 */

import { Schema } from 'mongoose';

export function timestampPlugin(schema: Schema, options: any = {}) {
  const createdAtField = options.createdAtField || 'createdAt';
  const updatedAtField = options.updatedAtField || 'updatedAt';

  // Add timestamp fields to schema
  schema.add({
    [createdAtField]: {
      type: Date,
      default: Date.now,
      immutable: true
    },
    [updatedAtField]: {
      type: Date,
      default: Date.now
    }
  });

  // Pre-save middleware to update updatedAt
  schema.pre('save', function(next) {
    if (this.isModified()) {
      this[updatedAtField] = new Date();
    }
    next();
  });

  // Pre-update middleware
  schema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function(next) {
    this.set({ [updatedAtField]: new Date() });
    next();
  });
}

// Export as plugin
export const timestampPlugin = timestampPlugin;
`;
  }

  static generateSoftDeletePlugin(): string {
    return `/**
 * Soft Delete Plugin for Mongoose
 * 
 * Implements soft delete functionality by adding deletedAt and isDeleted fields.
 * Based on: https://mongoosejs.com/docs/middleware.html
 */

import { Schema } from 'mongoose';

export function softDeletePlugin(schema: Schema, options: any = {}) {
  const deletedAtField = options.deletedAtField || 'deletedAt';
  const isDeletedField = options.isDeletedField || 'isDeleted';

  // Add soft delete fields to schema
  schema.add({
    [deletedAtField]: {
      type: Date,
      default: null
    },
    [isDeletedField]: {
      type: Boolean,
      default: false
    }
  });

  // Add soft delete method
  schema.methods.softDelete = function() {
    this[isDeletedField] = true;
    this[deletedAtField] = new Date();
    return this.save();
  };

  // Add restore method
  schema.methods.restore = function() {
    this[isDeletedField] = false;
    this[deletedAtField] = null;
    return this.save();
  };

  // Add permanent delete method
  schema.methods.hardDelete = function() {
    return this.deleteOne();
  };

  // Modify find queries to exclude soft deleted documents
  schema.pre(['find', 'findOne', 'findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
    if (!this.getQuery()[isDeletedField]) {
      this.where(isDeletedField, false);
    }
    next();
  });

  // Add static methods
  schema.statics.findWithDeleted = function(filter = {}) {
    return this.find(filter);
  };

  schema.statics.findOneWithDeleted = function(filter = {}) {
    return this.findOne(filter);
  };

  schema.statics.findDeleted = function(filter = {}) {
    return this.find({ ...filter, [isDeletedField]: true });
  };
}

// Export as plugin
export const softDeletePlugin = softDeletePlugin;
`;
  }

  static generateEnvConfig(config: MongooseConfig): string {
    return `# Mongoose ODM Configuration
MONGODB_URI="${config.databaseUrl || 'mongodb://localhost:27017/myapp'}"

# Database URL for ORM usage
DATABASE_URL="${config.databaseUrl || 'mongodb://localhost:27017/myapp'}"

# Mongoose specific settings
MONGOOSE_DEBUG="${config.enableDebug ? 'true' : 'false'}"
MONGOOSE_POOL_SIZE="${config.connectionPoolSize || 10}"
MONGOOSE_COMPRESSION="${config.enableCompression ? 'true' : 'false'}"
`;
  }
} 