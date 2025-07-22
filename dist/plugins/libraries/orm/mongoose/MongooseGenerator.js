export class MongooseGenerator {
    generateAllFiles(config) {
        const files = [
            this.generateMongooseConnection(config),
            this.generateUserModel(config),
            this.generateDatabaseClient(),
            this.generateSchemaTypes(),
            this.generateUnifiedIndex(),
        ];
        if (config.features.plugins) {
            files.push(this.generatePluginsIndex());
            files.push(this.generateTimestampPlugin());
            files.push(this.generateSoftDeletePlugin());
        }
        return files;
    }
    generateMongooseConnection(config) {
        const content = `import mongoose from 'mongoose';
// ... (from original generator) ...
export { mongoose };
`;
        return { path: 'db/connection.ts', content };
    }
    generateUserModel(config) {
        const content = `import mongoose, { Document, Schema, Model } from 'mongoose';
// ... (from original generator) ...
export default User;
`;
        return { path: 'db/models/user.model.ts', content };
    }
    generateDatabaseClient() {
        const content = `import mongoose from 'mongoose';
// ... (from original generator) ...
};
`;
        return { path: 'db/client.ts', content };
    }
    generateSchemaTypes() {
        const content = `/**
 * Database Schema Types - Mongoose Implementation
 */
// ... (from original generator) ...
export type { Document, Model } from 'mongoose';
`;
        return { path: 'db/schema.ts', content };
    }
    generateUnifiedIndex() {
        const content = `/**
 * Unified Database Interface - Mongoose Implementation
 */
// ... (from original generator) ...
export type { PrismaClient } from '@prisma/client';
`;
        return { path: 'db/index.ts', content };
    }
    generatePluginsIndex() {
        const content = `/**
 * Mongoose Plugins Index
 */
// ... (from original generator) ...
};
`;
        return { path: 'db/plugins/index.ts', content };
    }
    generateTimestampPlugin() {
        const content = `/**
 * Timestamp Plugin for Mongoose
 */
// ... (from original generator) ...
export const timestampPlugin = timestampPlugin;
`;
        return { path: 'db/plugins/timestamp.plugin.ts', content };
    }
    generateSoftDeletePlugin() {
        const content = `/**
 * Soft Delete Plugin for Mongoose
 */
// ... (from original generator) ...
export const softDeletePlugin = softDeletePlugin;
`;
        return { path: 'db/plugins/soft-delete.plugin.ts', content };
    }
    generateEnvConfig(config) {
        const envVars = {};
        if ('connectionString' in config.connection) {
            envVars['MONGODB_URI'] = config.connection.connectionString;
            envVars['DATABASE_URL'] = config.connection.connectionString;
        }
        // Add other env vars from original generator
        return envVars;
    }
}
//# sourceMappingURL=MongooseGenerator.js.map