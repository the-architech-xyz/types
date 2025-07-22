/**
 * Mongoose Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Mongoose plugin.
 * Based on: https://mongoosejs.com/docs/typescript.html
 */
export const MongooseConfigSchema = {
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
        },
        enablePlugins: {
            type: 'boolean',
            description: 'Enable Mongoose plugins',
            default: true
        },
        enableMiddleware: {
            type: 'boolean',
            description: 'Enable Mongoose middleware',
            default: true
        },
        connectionPoolSize: {
            type: 'number',
            description: 'Connection pool size',
            default: 10,
            minimum: 1,
            maximum: 100
        },
        enableCompression: {
            type: 'boolean',
            description: 'Enable MongoDB compression',
            default: true
        }
    },
    required: ['databaseUrl']
};
export const MongooseDefaultConfig = {
    databaseUrl: 'mongodb://localhost:27017/myapp',
    modelsDir: './src/lib/db/models',
    enableDebug: false,
    enableTimestamps: true,
    enablePlugins: true,
    enableMiddleware: true,
    connectionPoolSize: 10,
    enableCompression: true
};
//# sourceMappingURL=MongooseSchema.js.map