import { DatabasePluginConfig } from '../../../../types/plugin-interfaces.js';

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
// ... (from original generator) ...
export { mongoose };
`;
    return { path: 'db/connection.ts', content };
  }

  generateUserModel(config: DatabasePluginConfig): GeneratedFile {
    const content = `import mongoose, { Document, Schema, Model } from 'mongoose';
// ... (from original generator) ...
export default User;
`;
    return { path: 'db/models/user.model.ts', content };
  }

  generateDatabaseClient(): GeneratedFile {
    const content = `import mongoose from 'mongoose';
// ... (from original generator) ...
};
`;
    return { path: 'db/client.ts', content };
  }

  generateSchemaTypes(): GeneratedFile {
    const content = `/**
 * Database Schema Types - Mongoose Implementation
 */
// ... (from original generator) ...
export type { Document, Model } from 'mongoose';
`;
    return { path: 'db/schema.ts', content };
  }

  generateUnifiedIndex(): GeneratedFile {
    const content = `/**
 * Unified Database Interface - Mongoose Implementation
 */
// ... (from original generator) ...
export type { PrismaClient } from '@prisma/client';
`;
    return { path: 'db/index.ts', content };
  }

  generatePluginsIndex(): GeneratedFile {
    const content = `/**
 * Mongoose Plugins Index
 */
// ... (from original generator) ...
};
`;
    return { path: 'db/plugins/index.ts', content };
  }

  generateTimestampPlugin(): GeneratedFile {
    const content = `/**
 * Timestamp Plugin for Mongoose
 */
// ... (from original generator) ...
export const timestampPlugin = timestampPlugin;
`;
    return { path: 'db/plugins/timestamp.plugin.ts', content };
  }

  generateSoftDeletePlugin(): GeneratedFile {
    const content = `/**
 * Soft Delete Plugin for Mongoose
 */
// ... (from original generator) ...
export const softDeletePlugin = softDeletePlugin;
`;
    return { path: 'db/plugins/soft-delete.plugin.ts', content };
  }

  generateEnvConfig(config: DatabasePluginConfig): Record<string, string> {
    const envVars: Record<string, string> = {};
    if ('connectionString' in config.connection) {
        envVars['MONGODB_URI'] = config.connection.connectionString;
        envVars['DATABASE_URL'] = config.connection.connectionString;
    }
    // Add other env vars from original generator
    return envVars;
  }
} 