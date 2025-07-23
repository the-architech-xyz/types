/**
 * Mongoose Generator
 * 
 * Handles all file generation logic for the Mongoose plugin.
 * Separated from the main plugin for better organization.
 */

import { DatabasePluginConfig } from '../../../../types/plugins.js';

export interface GeneratedFile {
    path: string;
    content: string;
}

export class MongooseGenerator {

  generateAllFiles(config: DatabasePluginConfig): GeneratedFile[] {
    const files: GeneratedFile[] = [
      this.generateMongooseConnection(config),
      this.generateUserModel(config),
      this.generateDatabaseClient(),
      this.generateSchemaTypes(),
      this.generateUnifiedIndex(),
    ];

    if ((config.features as any).plugins) {
        files.push(this.generatePluginsIndex());
        files.push(this.generateTimestampPlugin());
        files.push(this.generateSoftDeletePlugin());
    }
    
    return files;
  }

  generateMongooseConnection(config: DatabasePluginConfig): GeneratedFile {
    const content = `import mongoose from 'mongoose';

// Database connection configuration
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/myapp';

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Connect to MongoDB
export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Disconnect from MongoDB
export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
}

// Export mongoose instance
export { mongoose };
`;
    return { path: 'db/connection.ts', content };
  }

  generateUserModel(config: DatabasePluginConfig): GeneratedFile {
    const content = `import mongoose, { Document, Schema, Model } from 'mongoose';

// User interface
export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
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
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for user's full name
userSchema.virtual('fullName').get(function() {
  return \`\${this.name}\`;
});

// Method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Create and export model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
`;
    return { path: 'db/models/user.model.ts', content };
  }

  generateDatabaseClient(): GeneratedFile {
    const content = `import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './connection.js';

/**
 * Database Client for Mongoose
 * Provides a unified interface for database operations
 */
export class DatabaseClient {
  private isConnected = false;

  async connect() {
    if (!this.isConnected) {
      await connectDB();
      this.isConnected = true;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await disconnectDB();
      this.isConnected = false;
    }
  }

  async healthCheck() {
    try {
      const status = mongoose.connection.readyState;
      return {
        status: status === 1 ? 'connected' : 'disconnected',
        readyState: status,
        database: mongoose.connection.name,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getConnection() {
    return mongoose.connection;
  }

  getMongoose() {
    return mongoose;
  }
}

// Create and export singleton instance
export const dbClient = new DatabaseClient();
`;
    return { path: 'db/client.ts', content };
  }

  generateSchemaTypes(): GeneratedFile {
    const content = `/**
 * Database Schema Types - Mongoose Implementation
 */

import { Document, Model, Schema } from 'mongoose';

// Base document interface
export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

// Base schema options
export const baseSchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
  },
};

// Utility types
export type DocumentType<T> = T & BaseDocument;
export type ModelType<T> = Model<DocumentType<T>>;

// Re-export mongoose types
export type { Document, Model, Schema } from 'mongoose';
`;
    return { path: 'db/schema.ts', content };
  }

  generateUnifiedIndex(): GeneratedFile {
    const content = `/**
 * Unified Database Interface - Mongoose Implementation
 * 
 * This module provides a unified interface for database operations
 * regardless of the underlying database provider or ORM.
 */

// Re-export the database connection
export { connectDB, disconnectDB, mongoose } from './connection.js';

// Re-export database client
export { DatabaseClient, dbClient } from './client.js';

// Re-export schema types
export type { BaseDocument, DocumentType, ModelType } from './schema.js';

// Re-export models
export { default as User } from './models/user.model.js';
export type { IUser } from './models/user.model.js';

// Database client class for type-safe operations
export class DatabaseClient {
  constructor(private db: any) {}

  // User operations
  async createUser(data: any) {
    const User = this.db.model('User');
    return new User(data).save();
  }

  async getUserById(id: string) {
    const User = this.db.model('User');
    return User.findById(id);
  }

  async getUserByEmail(email: string) {
    const User = this.db.model('User');
    return User.findOne({ email });
  }

  async updateUser(id: string, data: any) {
    const User = this.db.model('User');
    return User.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteUser(id: string) {
    const User = this.db.model('User');
    return User.findByIdAndDelete(id);
  }

  // Query operations
  async query(modelName: string, query: any) {
    const Model = this.db.model(modelName);
    return Model.find(query);
  }

  async transaction<T>(fn: (session: any) => Promise<T>): Promise<T> {
    const session = await this.db.startSession();
    try {
      await session.withTransaction(fn);
      return await fn(session);
    } finally {
      await session.endSession();
    }
  }
}

// Create and export database client instance
export const dbClient = new DatabaseClient(mongoose);

// Utility functions
export const createConnection = () => mongoose.connection;
export const closeConnection = async () => {
  await mongoose.disconnect();
  console.log('Connection closed');
};

// Constants
export const DEFAULT_TIMEOUT = 30000; // 30 seconds
export const MAX_CONNECTIONS = 10;

// Types
export interface DatabaseConfig {
  provider: string;
  connection: any;
  features: any;
  orm?: any;
}

// Re-export everything for convenience
export * from './connection.js';
export * from './client.js';
export * from './schema.js';
export * from './models/user.model.js';
`;
    return { path: 'db/index.ts', content };
  }

  generatePluginsIndex(): GeneratedFile {
    const content = `/**
 * Mongoose Plugins Index
 */

export { timestampPlugin } from './timestamp.plugin.js';
export { softDeletePlugin } from './soft-delete.plugin.js';

// Plugin registry
export const plugins = {
  timestamp: 'timestamp',
  softDelete: 'softDelete',
};

// Plugin configuration
export const pluginConfig = {
  timestamp: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  softDelete: {
    deletedAt: 'deletedAt',
    deletedBy: 'deletedBy',
  },
};
`;
    return { path: 'db/plugins/index.ts', content };
  }

  generateTimestampPlugin(): GeneratedFile {
    const content = `/**
 * Timestamp Plugin for Mongoose
 */

import { Schema } from 'mongoose';

export function timestampPlugin(schema: Schema) {
  // Add timestamp fields
  schema.add({
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  });

  // Update the updatedAt field on save
  schema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });

  // Update the updatedAt field on update operations
  schema.pre(['updateOne', 'updateMany', 'findOneAndUpdate', 'findByIdAndUpdate'], function(next) {
    this.set({ updatedAt: new Date() });
    next();
  });
}

export const timestampPlugin = timestampPlugin;
`;
    return { path: 'db/plugins/timestamp.plugin.ts', content };
  }

  generateSoftDeletePlugin(): GeneratedFile {
    const content = `/**
 * Soft Delete Plugin for Mongoose
 */

import { Schema } from 'mongoose';

export function softDeletePlugin(schema: Schema) {
  // Add soft delete fields
  schema.add({
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  });

  // Add isDeleted virtual
  schema.virtual('isDeleted').get(function() {
    return !!this.deletedAt;
  });

  // Override find methods to exclude soft deleted documents
  schema.pre(['find', 'findOne', 'findById'], function(next) {
    if (!this.getQuery().includeDeleted) {
      this.where({ deletedAt: null });
    }
    next();
  });

  // Soft delete method
  schema.methods.softDelete = function(deletedBy?: any) {
    this.deletedAt = new Date();
    if (deletedBy) {
      this.deletedBy = deletedBy;
    }
    return this.save();
  };

  // Restore method
  schema.methods.restore = function() {
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
  };

  // Static method to find including deleted
  schema.statics.findIncludingDeleted = function(query: any = {}) {
    return this.find({ ...query, includeDeleted: true });
  };

  // Static method to find only deleted
  schema.statics.findDeleted = function(query: any = {}) {
    return this.find({ ...query, deletedAt: { $ne: null } });
  };
}

export const softDeletePlugin = softDeletePlugin;
`;
    return { path: 'db/plugins/soft-delete.plugin.ts', content };
  }

  generateEnvConfig(config: DatabasePluginConfig): Record<string, string> {
    const envVars: Record<string, string> = {};
    
    // Check if connection exists and has connectionString
    if (config.connection && 'connectionString' in config.connection) {
        const connectionString = config.connection.connectionString as string;
        envVars['MONGODB_URI'] = connectionString;
        envVars['DATABASE_URL'] = connectionString;
    }
    
    // Fallback to direct connectionString if available
    if (config.connectionString) {
        envVars['MONGODB_URI'] = config.connectionString;
        envVars['DATABASE_URL'] = config.connectionString;
    }
    
    // Add other env vars from original generator
    return envVars;
  }
} 