/**
 * Prisma Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Prisma plugin.
 * Based on: https://www.prisma.io/docs/getting-started
 */
export const PrismaConfigSchema = {
    type: 'object',
    properties: {
        databaseUrl: {
            type: 'string',
            description: 'Database connection URL',
            default: 'postgresql://user:password@localhost:5432/myapp'
        },
        provider: {
            type: 'string',
            enum: ['postgresql', 'mysql', 'sqlite', 'sqlserver', 'mongodb'],
            description: 'Database provider',
            default: 'postgresql'
        },
        enablePrismaStudio: {
            type: 'boolean',
            description: 'Enable Prisma Studio',
            default: true
        },
        enableSeeding: {
            type: 'boolean',
            description: 'Enable database seeding',
            default: true
        },
        enableMigrations: {
            type: 'boolean',
            description: 'Enable database migrations',
            default: true
        },
        enableIntrospection: {
            type: 'boolean',
            description: 'Enable database introspection',
            default: false
        },
        enableGenerate: {
            type: 'boolean',
            description: 'Enable Prisma Client generation',
            default: true
        },
        enableFormat: {
            type: 'boolean',
            description: 'Enable schema formatting',
            default: true
        },
        enableValidate: {
            type: 'boolean',
            description: 'Enable schema validation',
            default: true
        },
        enablePush: {
            type: 'boolean',
            description: 'Enable schema push',
            default: true
        },
        enableDeploy: {
            type: 'boolean',
            description: 'Enable schema deployment',
            default: true
        },
        enableReset: {
            type: 'boolean',
            description: 'Enable database reset',
            default: false
        },
        enableSeed: {
            type: 'boolean',
            description: 'Enable database seeding',
            default: true
        },
        enableStudio: {
            type: 'boolean',
            description: 'Enable Prisma Studio',
            default: true
        },
        enableDebug: {
            type: 'boolean',
            description: 'Enable debug mode',
            default: false
        },
        enableLogging: {
            type: 'boolean',
            description: 'Enable logging',
            default: true
        },
        enableMetrics: {
            type: 'boolean',
            description: 'Enable metrics',
            default: true
        },
        enableTelemetry: {
            type: 'boolean',
            description: 'Enable telemetry',
            default: true
        },
        enablePreviewFeatures: {
            type: 'array',
            items: { type: 'string', description: 'Preview feature name' },
            description: 'Enable preview features',
            default: ['fullTextSearch', 'fullTextIndex']
        }
    },
    required: ['databaseUrl', 'provider']
};
export const PrismaDefaultConfig = {
    databaseUrl: 'postgresql://user:password@localhost:5432/myapp',
    provider: 'postgresql',
    enablePrismaStudio: true,
    enableSeeding: true,
    enableMigrations: true,
    enableIntrospection: false,
    enableGenerate: true,
    enableFormat: true,
    enableValidate: true,
    enablePush: true,
    enableDeploy: true,
    enableReset: false,
    enableSeed: true,
    enableStudio: true,
    enableDebug: false,
    enableLogging: true,
    enableMetrics: true,
    enableTelemetry: true,
    enablePreviewFeatures: ['fullTextSearch', 'fullTextIndex']
};
//# sourceMappingURL=PrismaSchema.js.map