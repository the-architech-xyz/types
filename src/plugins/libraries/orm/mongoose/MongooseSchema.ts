import { ParameterSchema, DatabaseProvider, ORMOption, DatabaseFeature, ParameterGroup } from '../../../../types/plugin-interfaces.js';
import { PluginCategory } from '../../../../types/plugin.js';

export class MongooseSchema {
  static getParameterSchema(): ParameterSchema {
    return {
      category: PluginCategory.ORM,
      groups: [
        { id: 'connection', name: 'Database Connection', description: 'Configure the MongoDB connection.', order: 1, parameters: ['databaseUrl', 'connectionPoolSize', 'enableCompression'] },
        { id: 'features', name: 'Mongoose Features', description: 'Enable or disable Mongoose features.', order: 2, parameters: ['enableTimestamps', 'enablePlugins', 'enableDebug'] },
      ],
      parameters: [
        {
          id: 'provider',
          name: 'Database Provider',
          type: 'select',
          description: 'The underlying database provider.',
          required: true,
          default: DatabaseProvider.MONGODB,
          options: [{ value: DatabaseProvider.MONGODB, label: 'MongoDB', recommended: true }],
          group: 'connection'
        },
        {
          id: 'databaseUrl',
          name: 'MongoDB Connection URI',
          type: 'string',
          description: 'The full connection URI for your MongoDB database.',
          required: true,
          default: 'mongodb://localhost:27017/myapp',
          group: 'connection'
        },
        {
          id: 'connectionPoolSize',
          name: 'Connection Pool Size',
          type: 'number',
          description: 'The maximum number of concurrent connections.',
          required: true,
          default: 10,
          validation: [{ type: 'min', value: 1, message: 'Pool size must be at least 1.' }],
          group: 'connection'
        },
        {
          id: 'enableCompression',
          name: 'Enable Compression',
          type: 'boolean',
          description: 'Enable network compression for MongoDB connections.',
          required: true,
          default: true,
          group: 'connection'
        },
        {
          id: 'enableTimestamps',
          name: 'Enable Timestamps',
          type: 'boolean',
          description: 'Automatically add `createdAt` and `updatedAt` fields to schemas.',
          required: true,
          default: true,
          group: 'features'
        },
        {
          id: 'enablePlugins',
          name: 'Enable Plugins',
          type: 'boolean',
          description: 'Enable support for Mongoose plugins (e.g., soft delete).',
          required: true,
          default: true,
          group: 'features'
        },
        {
          id: 'enableDebug',
          name: 'Enable Debug Mode',
          type: 'boolean',
          description: 'Log Mongoose operations to the console.',
          required: true,
          default: false,
          group: 'features'
        },
      ],
      dependencies: [],
      validations: []
    };
  }
} 