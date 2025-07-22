/**
 * Drizzle Schema
 * 
 * Contains the parameter schema and static helper methods for the Drizzle plugin.
 * Separated from the main plugin for better organization.
 */

import { ParameterSchema, DatabaseProvider, ORMOption, DatabaseFeature } from '../../../../types/plugin-interfaces.js';
import { PluginCategory } from '../../../../types/plugin.js';

export class DrizzleSchema {
  /**
   * Get the parameter schema for Drizzle plugin
   */
  static getParameterSchema(): ParameterSchema {
    return {
      category: PluginCategory.DATABASE,
      parameters: [
        {
          id: 'provider',
          name: 'provider',
          type: 'select',
          description: 'Select database provider',
          required: true,
          default: DatabaseProvider.NEON,
          options: [
            { value: DatabaseProvider.NEON, label: 'Neon (PostgreSQL)', description: 'Serverless PostgreSQL', recommended: true },
            { value: DatabaseProvider.SUPABASE, label: 'Supabase', description: 'Open source Firebase alternative' },
            { value: DatabaseProvider.MONGODB, label: 'MongoDB', description: 'NoSQL database' },
            { value: DatabaseProvider.PLANETSCALE, label: 'PlanetScale', description: 'MySQL-compatible serverless database' },
            { value: DatabaseProvider.LOCAL, label: 'Local SQLite', description: 'Local development database' }
          ],
          group: 'connection',
          order: 1
        },
        {
          id: 'connectionString',
          name: 'connectionString',
          type: 'string',
          description: 'Database connection string',
          required: true,
          conditions: [
            { parameter: 'provider', operator: 'not_equals', value: DatabaseProvider.LOCAL, action: 'show' }
          ],
          validation: [
            { type: 'required', message: 'Connection string is required' },
            { type: 'pattern', value: /^[a-zA-Z0-9+.-]+:\/\/.+/, message: 'Invalid connection string format' }
          ],
          group: 'connection',
          order: 2
        },
        {
          id: 'region',
          name: 'region',
          type: 'select',
          description: 'Database region (for Neon)',
          required: false,
          conditions: [
            { parameter: 'provider', operator: 'equals', value: DatabaseProvider.NEON, action: 'show' }
          ],
          options: [
            { value: 'us-east-1', label: 'US East (N. Virginia)' },
            { value: 'us-west-2', label: 'US West (Oregon)' },
            { value: 'eu-west-1', label: 'Europe (Ireland)' },
            { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' }
          ],
          group: 'connection',
          order: 3
        },
        {
          id: 'features',
          name: 'features',
          type: 'multiselect',
          description: 'Select database features',
          required: false,
          default: [DatabaseFeature.MIGRATIONS],
          options: [
            { value: DatabaseFeature.MIGRATIONS, label: 'Migrations', description: 'Database schema migrations' },
            { value: DatabaseFeature.SEEDING, label: 'Seeding', description: 'Database seeding' },
            { value: DatabaseFeature.BACKUP, label: 'Backup', description: 'Automatic backups' },
            { value: DatabaseFeature.CONNECTION_POOLING, label: 'Connection Pooling', description: 'Connection pooling' },
            { value: DatabaseFeature.SSL, label: 'SSL', description: 'SSL encryption' }
          ],
          group: 'features',
          order: 4
        },
        {
          id: 'ormType',
          name: 'ormType',
          type: 'select',
          description: 'Select ORM type',
          required: true,
          default: ORMOption.DRIZZLE,
          options: [
            { value: ORMOption.DRIZZLE, label: 'Drizzle ORM', description: 'TypeScript ORM', recommended: true },
            { value: ORMOption.PRISMA, label: 'Prisma', description: 'Next-generation ORM' },
            { value: ORMOption.TYPEORM, label: 'TypeORM', description: 'Traditional ORM' }
          ],
          group: 'orm',
          order: 5
        }
      ],
      dependencies: [
        {
          parameter: 'connectionString',
          dependsOn: 'provider',
          condition: { parameter: 'provider', operator: 'not_equals', value: DatabaseProvider.LOCAL, action: 'require' },
          message: 'Connection string is required for remote databases'
        }
      ],
      validations: [
        {
          parameter: 'provider',
          rules: [
            { type: 'required', message: 'Database provider is required' }
          ]
        },
        {
          parameter: 'connectionString',
          rules: [
            { type: 'required', message: 'Connection string is required for remote databases' },
            { type: 'pattern', value: /^[a-zA-Z0-9+.-]+:\/\/.+/, message: 'Invalid connection string format' }
          ]
        }
      ],
      groups: [
        {
          id: 'connection',
          name: 'Database Connection',
          description: 'Configure your database connection',
          order: 1,
          parameters: ['provider', 'connectionString', 'region']
        },
        {
          id: 'features',
          name: 'Database Features',
          description: 'Select additional database features',
          order: 2,
          parameters: ['features']
        },
        {
          id: 'orm',
          name: 'ORM Configuration',
          description: 'Configure your ORM settings',
          order: 3,
          parameters: ['ormType']
        }
      ]
    };
  }

  /**
   * Get database providers supported by Drizzle
   */
  static getDatabaseProviders(): DatabaseProvider[] {
    return [
      DatabaseProvider.NEON,
      DatabaseProvider.SUPABASE,
      DatabaseProvider.MONGODB,
      DatabaseProvider.PLANETSCALE,
      DatabaseProvider.LOCAL
    ];
  }

  /**
   * Get ORM options supported by Drizzle
   */
  static getORMOptions(): ORMOption[] {
    return [
      ORMOption.DRIZZLE,
      ORMOption.PRISMA,
      ORMOption.TYPEORM
    ];
  }

  /**
   * Get database features supported by Drizzle
   */
  static getDatabaseFeatures(): DatabaseFeature[] {
    return [
      DatabaseFeature.MIGRATIONS,
      DatabaseFeature.SEEDING,
      DatabaseFeature.BACKUP,
      DatabaseFeature.CONNECTION_POOLING,
      DatabaseFeature.SSL
    ];
  }

  /**
   * Get provider label for display
   */
  static getProviderLabel(provider: DatabaseProvider): string {
    const labels: Record<DatabaseProvider, string> = {
      [DatabaseProvider.NEON]: 'Neon (PostgreSQL)',
      [DatabaseProvider.SUPABASE]: 'Supabase',
      [DatabaseProvider.MONGODB]: 'MongoDB',
      [DatabaseProvider.PLANETSCALE]: 'PlanetScale',
      [DatabaseProvider.LOCAL]: 'Local SQLite'
    };
    return labels[provider];
  }

  /**
   * Get provider description
   */
  static getProviderDescription(provider: DatabaseProvider): string {
    const descriptions: Record<DatabaseProvider, string> = {
      [DatabaseProvider.NEON]: 'Serverless PostgreSQL with branching',
      [DatabaseProvider.SUPABASE]: 'Open source Firebase alternative',
      [DatabaseProvider.MONGODB]: 'NoSQL document database',
      [DatabaseProvider.PLANETSCALE]: 'MySQL-compatible serverless database',
      [DatabaseProvider.LOCAL]: 'Local SQLite for development'
    };
    return descriptions[provider];
  }

  /**
   * Get feature label for display
   */
  static getFeatureLabel(feature: DatabaseFeature): string {
    const labels: Record<DatabaseFeature, string> = {
      [DatabaseFeature.MIGRATIONS]: 'Migrations',
      [DatabaseFeature.SEEDING]: 'Seeding',
      [DatabaseFeature.BACKUP]: 'Backup',
      [DatabaseFeature.CONNECTION_POOLING]: 'Connection Pooling',
      [DatabaseFeature.SSL]: 'SSL',
      [DatabaseFeature.READ_REPLICAS]: 'Read Replicas'
    };
    return labels[feature];
  }

  /**
   * Get feature description
   */
  static getFeatureDescription(feature: DatabaseFeature): string {
    const descriptions: Record<DatabaseFeature, string> = {
      [DatabaseFeature.MIGRATIONS]: 'Database schema migrations',
      [DatabaseFeature.SEEDING]: 'Database seeding with sample data',
      [DatabaseFeature.BACKUP]: 'Automatic database backups',
      [DatabaseFeature.CONNECTION_POOLING]: 'Connection pooling for better performance',
      [DatabaseFeature.SSL]: 'SSL encryption for secure connections',
      [DatabaseFeature.READ_REPLICAS]: 'Read replicas for scaling'
    };
    return descriptions[feature];
  }
} 