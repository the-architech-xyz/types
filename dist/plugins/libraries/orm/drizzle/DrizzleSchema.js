/**
 * Drizzle Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Drizzle plugin.
 * Based on: https://orm.drizzle.team/
 */
import { PluginCategory } from '../../../../types/plugins.js';
import { DATABASE_PROVIDERS, ORM_LIBRARIES, DatabaseFeature } from '../../../../types/core.js';
export class DrizzleSchema {
    static getParameterSchema() {
        return {
            category: PluginCategory.ORM,
            groups: [
                { id: 'provider', name: 'Database Provider', description: 'Choose your database provider.', order: 1, parameters: ['provider'] },
                { id: 'connection', name: 'Connection Settings', description: 'Configure database connection parameters.', order: 2, parameters: ['connectionString', 'host', 'port', 'username', 'password', 'database', 'ssl'] },
                { id: 'features', name: 'Database Features', description: 'Enable additional database features.', order: 3, parameters: ['features'] },
                { id: 'orm', name: 'ORM Configuration', description: 'Configure Drizzle ORM settings.', order: 4, parameters: ['ormType'] },
            ],
            parameters: [
                {
                    id: 'provider',
                    name: 'Database Provider',
                    type: 'select',
                    description: 'Select your database provider.',
                    required: true,
                    default: DATABASE_PROVIDERS.NEON,
                    options: [
                        { value: DATABASE_PROVIDERS.NEON, label: 'Neon (PostgreSQL)', description: 'Serverless PostgreSQL', recommended: true },
                        { value: DATABASE_PROVIDERS.SUPABASE, label: 'Supabase', description: 'Open source Firebase alternative' },
                        { value: DATABASE_PROVIDERS.MONGODB, label: 'MongoDB', description: 'NoSQL database' },
                        { value: DATABASE_PROVIDERS.PLANETSCALE, label: 'PlanetScale', description: 'MySQL-compatible serverless database' },
                        { value: DATABASE_PROVIDERS.LOCAL_SQLITE, label: 'Local SQLite', description: 'Local development database' }
                    ],
                    group: 'provider'
                },
                {
                    id: 'connectionString',
                    name: 'Connection String',
                    type: 'string',
                    description: 'Database connection string (overrides individual connection parameters).',
                    required: false,
                    conditions: [
                        { parameter: 'provider', operator: 'not_equals', value: DATABASE_PROVIDERS.LOCAL_SQLITE, action: 'show' }
                    ],
                    group: 'connection'
                },
                {
                    id: 'host',
                    name: 'Host',
                    type: 'string',
                    description: 'Database host address.',
                    required: false,
                    conditions: [
                        { parameter: 'provider', operator: 'equals', value: DATABASE_PROVIDERS.NEON, action: 'show' }
                    ],
                    group: 'connection'
                },
                {
                    id: 'port',
                    name: 'Port',
                    type: 'number',
                    description: 'Database port number.',
                    required: false,
                    default: 5432,
                    group: 'connection'
                },
                {
                    id: 'username',
                    name: 'Username',
                    type: 'string',
                    description: 'Database username.',
                    required: false,
                    group: 'connection'
                },
                {
                    id: 'password',
                    name: 'Password',
                    type: 'string',
                    description: 'Database password.',
                    required: false,
                    group: 'connection'
                },
                {
                    id: 'database',
                    name: 'Database Name',
                    type: 'string',
                    description: 'Database name.',
                    required: false,
                    group: 'connection'
                },
                {
                    id: 'ssl',
                    name: 'SSL Connection',
                    type: 'boolean',
                    description: 'Enable SSL for secure database connections.',
                    required: false,
                    default: true,
                    group: 'connection'
                },
                {
                    id: 'features',
                    name: 'Database Features',
                    type: 'multiselect',
                    description: 'Select additional database features to enable.',
                    required: false,
                    default: [DatabaseFeature.MIGRATIONS, DatabaseFeature.SEEDING],
                    options: [
                        { value: DatabaseFeature.MIGRATIONS, label: 'Migrations', description: 'Database schema migrations' },
                        { value: DatabaseFeature.SEEDING, label: 'Seeding', description: 'Database seeding' },
                        { value: DatabaseFeature.BACKUP, label: 'Backup', description: 'Database backup' },
                        { value: DatabaseFeature.MONITORING, label: 'Monitoring', description: 'Database monitoring' },
                        { value: DatabaseFeature.REPLICATION, label: 'Replication', description: 'Database replication' },
                        { value: DatabaseFeature.SHARDING, label: 'Sharding', description: 'Database sharding' },
                        { value: DatabaseFeature.CACHING, label: 'Caching', description: 'Database caching' },
                        { value: DatabaseFeature.ENCRYPTION, label: 'Encryption', description: 'Database encryption' }
                    ],
                    group: 'features'
                },
                {
                    id: 'ormType',
                    name: 'ORM Type',
                    type: 'select',
                    description: 'Select the ORM type for Drizzle.',
                    required: true,
                    default: ORM_LIBRARIES.DRIZZLE,
                    options: [
                        { value: ORM_LIBRARIES.DRIZZLE, label: 'Drizzle ORM', description: 'Type-safe SQL ORM', recommended: true }
                    ],
                    group: 'orm'
                }
            ],
            dependencies: [
                {
                    parameter: 'connectionString',
                    dependsOn: 'provider',
                    condition: { parameter: 'provider', operator: 'not_equals', value: DATABASE_PROVIDERS.LOCAL_SQLITE, action: 'require' },
                    message: 'Connection string is required for cloud database providers.'
                }
            ],
            validations: []
        };
    }
    static getDatabaseProviders() {
        return [
            DATABASE_PROVIDERS.NEON,
            DATABASE_PROVIDERS.SUPABASE,
            DATABASE_PROVIDERS.MONGODB,
            DATABASE_PROVIDERS.PLANETSCALE,
            DATABASE_PROVIDERS.LOCAL_SQLITE
        ];
    }
    static getDatabaseFeatures() {
        return [
            DatabaseFeature.MIGRATIONS,
            DatabaseFeature.SEEDING,
            DatabaseFeature.BACKUP,
            DatabaseFeature.MONITORING,
            DatabaseFeature.REPLICATION,
            DatabaseFeature.SHARDING,
            DatabaseFeature.CACHING,
            DatabaseFeature.ENCRYPTION
        ];
    }
    static getProviderLabel(provider) {
        const labels = {
            [DATABASE_PROVIDERS.NEON]: 'Neon (PostgreSQL)',
            [DATABASE_PROVIDERS.SUPABASE]: 'Supabase',
            [DATABASE_PROVIDERS.MONGODB]: 'MongoDB',
            [DATABASE_PROVIDERS.PLANETSCALE]: 'PlanetScale',
            [DATABASE_PROVIDERS.LOCAL_SQLITE]: 'Local SQLite'
        };
        return labels[provider] || provider;
    }
    static getProviderDescription(provider) {
        const descriptions = {
            [DATABASE_PROVIDERS.NEON]: 'Serverless PostgreSQL with branching',
            [DATABASE_PROVIDERS.SUPABASE]: 'Open source Firebase alternative',
            [DATABASE_PROVIDERS.MONGODB]: 'NoSQL document database',
            [DATABASE_PROVIDERS.PLANETSCALE]: 'MySQL-compatible serverless database',
            [DATABASE_PROVIDERS.LOCAL_SQLITE]: 'Local SQLite for development'
        };
        return descriptions[provider] || '';
    }
    static getFeatureLabel(feature) {
        const labels = {
            [DatabaseFeature.MIGRATIONS]: 'Migrations',
            [DatabaseFeature.SEEDING]: 'Seeding',
            [DatabaseFeature.BACKUP]: 'Backup',
            [DatabaseFeature.MONITORING]: 'Monitoring',
            [DatabaseFeature.REPLICATION]: 'Replication',
            [DatabaseFeature.SHARDING]: 'Sharding',
            [DatabaseFeature.CACHING]: 'Caching',
            [DatabaseFeature.ENCRYPTION]: 'Encryption'
        };
        return labels[feature];
    }
    static getFeatureDescription(feature) {
        const descriptions = {
            [DatabaseFeature.MIGRATIONS]: 'Database schema migrations',
            [DatabaseFeature.SEEDING]: 'Database seeding for initial data',
            [DatabaseFeature.BACKUP]: 'Database backup and restore',
            [DatabaseFeature.MONITORING]: 'Database performance monitoring',
            [DatabaseFeature.REPLICATION]: 'Database replication for scaling',
            [DatabaseFeature.SHARDING]: 'Database sharding for large datasets',
            [DatabaseFeature.CACHING]: 'Database query caching',
            [DatabaseFeature.ENCRYPTION]: 'Database encryption at rest'
        };
        return descriptions[feature];
    }
}
//# sourceMappingURL=DrizzleSchema.js.map