/**
 * Prisma Schema Definitions
 * 
 * Contains all configuration schemas and parameter definitions for the Prisma plugin.
 * Based on: https://www.prisma.io/
 */

import { ParameterSchema, ParameterGroup, ParameterDependency, ParameterCondition } from '../../../../types/plugins.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { DATABASE_PROVIDERS, DatabaseProvider, ORM_LIBRARIES, ORMLibrary, DatabaseFeature } from '../../../../types/core.js';

export class PrismaSchema {
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
          default: DATABASE_PROVIDERS.NEON,
          options: [
            { value: DATABASE_PROVIDERS.NEON, label: 'Neon (PostgreSQL)', recommended: true },
            { value: DATABASE_PROVIDERS.SUPABASE, label: 'Supabase', description: 'Open source Firebase alternative' },
            { value: DATABASE_PROVIDERS.MONGODB, label: 'MongoDB', description: 'NoSQL document database' },
            { value: DATABASE_PROVIDERS.PLANETSCALE, label: 'PlanetScale', description: 'MySQL-compatible serverless database' },
            { value: DATABASE_PROVIDERS.LOCAL_SQLITE, label: 'Local SQLite', description: 'Local SQLite database' }
          ],
          group: 'provider'
        },
        {
          id: 'connection',
          name: 'Connection String',
          type: 'string',
          description: 'Database connection string or URL',
          required: true,
          default: 'postgresql://user:password@localhost:5432/myapp',
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
    return [DATABASE_PROVIDERS.NEON, DATABASE_PROVIDERS.SUPABASE, DATABASE_PROVIDERS.MONGODB, DATABASE_PROVIDERS.PLANETSCALE, DATABASE_PROVIDERS.LOCAL_SQLITE];
  }

  static getORMOptions(): ORMLibrary[] {
    return [ORM_LIBRARIES.PRISMA];
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