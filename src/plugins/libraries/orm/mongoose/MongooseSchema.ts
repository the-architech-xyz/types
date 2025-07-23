/**
 * Mongoose Schema Definitions
 * 
 * Contains all configuration schemas and parameter definitions for the Mongoose plugin.
 * Based on: https://mongoosejs.com/
 */

import { ParameterSchema, ParameterGroup, ParameterDependency, ParameterCondition } from '../../../../types/plugins.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { DATABASE_PROVIDERS, DatabaseProvider, ORM_LIBRARIES, ORMLibrary, DatabaseFeature } from '../../../../types/core.js';

export class MongooseSchema {
  static getParameterSchema(): ParameterSchema {
    return {
      category: PluginCategory.ORM,
      groups: [
        { id: 'provider', name: 'Database Provider', description: 'Choose your database provider.', order: 1, parameters: ['provider'] },
        { id: 'connection', name: 'Connection Settings', description: 'Configure database connection.', order: 2, parameters: ['connection'] },
        { id: 'features', name: 'Features', description: 'Enable additional features.', order: 3, parameters: ['features'] },
      ],
      parameters: [
        {
          id: 'provider',
          name: 'Database Provider',
          type: 'select',
          description: 'Select the database provider to use.',
          required: true,
          default: DATABASE_PROVIDERS.MONGODB,
          options: [{ value: DATABASE_PROVIDERS.MONGODB, label: 'MongoDB', recommended: true }],
          group: 'provider'
        },
        {
          id: 'connection',
          name: 'Connection String',
          type: 'string',
          description: 'MongoDB connection string (e.g., mongodb://localhost:27017/myapp)',
          required: true,
          default: 'mongodb://localhost:27017/myapp',
          group: 'connection'
        },
        {
          id: 'features',
          name: 'Features',
          type: 'multiselect',
          description: 'Select additional features to enable.',
          required: false,
          default: [DatabaseFeature.MIGRATIONS, DatabaseFeature.SEEDING],
          options: [
            { value: DatabaseFeature.MIGRATIONS, label: 'Migrations', description: 'Database migration support' },
            { value: DatabaseFeature.SEEDING, label: 'Seeding', description: 'Database seeding support' },
            { value: DatabaseFeature.BACKUP, label: 'Backup', description: 'Database backup support' },
            { value: DatabaseFeature.MONITORING, label: 'Monitoring', description: 'Database monitoring support' }
          ],
          group: 'features'
        }
      ],
      dependencies: [],
      validations: []
    };
  }

  static getDatabaseProviders(): DatabaseProvider[] {
    return [DATABASE_PROVIDERS.MONGODB];
  }

  static getORMOptions(): ORMLibrary[] {
    return [ORM_LIBRARIES.MONGOOSE];
  }

  static getDatabaseFeatures(): DatabaseFeature[] {
    return [
      DatabaseFeature.MIGRATIONS,
      DatabaseFeature.SEEDING,
      DatabaseFeature.BACKUP,
      DatabaseFeature.MONITORING
    ];
  }
} 