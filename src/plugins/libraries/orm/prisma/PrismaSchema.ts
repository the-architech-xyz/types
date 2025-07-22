/**
 * Prisma Schema Definitions
 * 
 * Contains all configuration schemas and parameter definitions for the Prisma plugin.
 * Based on: https://www.prisma.io/docs/getting-started
 */

import { ParameterSchema, DatabaseProvider, ORMOption, DatabaseFeature, ParameterGroup } from '../../../../types/plugin-interfaces.js';
import { PluginCategory } from '../../../../types/plugin.js';

export class PrismaSchema {
  static getParameterSchema(): ParameterSchema {
    return {
      category: PluginCategory.ORM,
      groups: [
        { id: 'connection', name: 'Database Connection', description: 'Configure the database connection.', order: 1, parameters: ['provider', 'databaseUrl'] },
        { id: 'features', name: 'Prisma Features', description: 'Enable or disable core Prisma features.', order: 2, parameters: ['enableMigrations', 'enableSeeding', 'enablePrismaStudio'] },
        { id: 'advanced', name: 'Advanced Options', description: 'Configure advanced Prisma settings.', order: 3, parameters: ['enablePreviewFeatures', 'enableLogging'] },
      ],
      parameters: [
        {
          id: 'provider',
          name: 'Database Provider',
          type: 'select',
          description: 'The underlying database provider.',
          required: true,
          default: 'postgresql',
          options: [
            { value: 'postgresql', label: 'PostgreSQL' },
            { value: 'mysql', label: 'MySQL' },
            { value: 'sqlite', label: 'SQLite' },
            { value: 'sqlserver', label: 'SQL Server' },
            { value: 'mongodb', label: 'MongoDB' },
          ],
          group: 'connection'
        },
        {
          id: 'databaseUrl',
          name: 'Database URL',
          type: 'string',
          description: 'The full connection URL for your database.',
          required: true,
          default: 'postgresql://user:password@localhost:5432/myapp',
          group: 'connection'
        },
        {
          id: 'enableMigrations',
          name: 'Enable Migrations',
          type: 'boolean',
          description: 'Use `prisma migrate` for schema migrations.',
          required: true,
          default: true,
          group: 'features'
        },
        {
          id: 'enableSeeding',
          name: 'Enable Seeding',
          type: 'boolean',
          description: 'Enable database seeding with a `seed.ts` file.',
          required: true,
          default: true,
          group: 'features'
        },
        {
          id: 'enablePrismaStudio',
          name: 'Enable Prisma Studio',
          type: 'boolean',
          description: 'Enable the Prisma Studio GUI for database browsing.',
          required: true,
          default: true,
          group: 'features'
        },
        {
          id: 'enablePreviewFeatures',
          name: 'Enable Preview Features',
          type: 'multiselect',
          description: 'Enable specific preview features in Prisma.',
          required: false,
          default: [],
          options: [
            { value: 'fullTextSearch', label: 'Full Text Search' },
            { value: 'fullTextIndex', label: 'Full Text Index' },
            { value: 'extendedWhereUnique', label: 'Extended Where Unique' }
          ],
          group: 'advanced'
        },
        {
          id: 'enableLogging',
          name: 'Enable Logging',
          type: 'boolean',
          description: 'Enable Prisma query logging in development.',
          required: true,
          default: true,
          group: 'advanced'
        }
      ],
      dependencies: [],
      validations: []
    };
  }

  static getDatabaseProviders(): DatabaseProvider[] {
    return [DatabaseProvider.NEON, DatabaseProvider.SUPABASE, DatabaseProvider.MONGODB, DatabaseProvider.PLANETSCALE, DatabaseProvider.LOCAL];
  }
} 