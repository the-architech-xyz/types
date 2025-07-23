/**
 * Drizzle Plugin - Refactored with New Architecture
 *
 * Uses the new base classes and separated concerns:
 * - DrizzleSchema: Parameter schema and configuration
 * - DrizzleGenerator: File generation logic
 * - DrizzlePlugin: Main plugin class (this file)
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { DATABASE_PROVIDERS, ORM_LIBRARIES } from '../../../../types/core.js';
import { DrizzleSchema } from './DrizzleSchema.js';
import { DrizzleGenerator } from './DrizzleGenerator.js';
export class DrizzlePlugin extends BasePlugin {
    generator;
    constructor() {
        super();
        // Generator will be initialized in install method when pathResolver is available
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'drizzle',
            name: 'Drizzle ORM',
            version: '0.44.3',
            description: 'TypeScript ORM for SQL databases with excellent type safety',
            author: 'The Architech Team',
            category: PluginCategory.DATABASE,
            tags: ['orm', 'typescript', 'sql', 'database'],
            repository: 'https://github.com/drizzle-team/drizzle-orm',
            documentation: 'https://orm.drizzle.team/',
            license: 'MIT'
        };
    }
    // ============================================================================
    // ENHANCED PLUGIN INTERFACE IMPLEMENTATION
    // ============================================================================
    getParameterSchema() {
        return DrizzleSchema.getParameterSchema();
    }
    validateConfiguration(config) {
        const errors = [];
        const warnings = [];
        // Validate required fields
        if (!config.provider) {
            errors.push({
                field: 'provider',
                message: 'Database provider is required',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        if (config.provider !== DATABASE_PROVIDERS.LOCAL_SQLITE && !config.connectionString) {
            errors.push({
                field: 'connectionString',
                message: 'Connection string is required for remote databases',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        // Provider-specific validation
        if (config.provider === DATABASE_PROVIDERS.NEON && !config.connectionString?.includes('neon.tech')) {
            warnings.push('Connection string should be from Neon (neon.tech)');
        }
        if (config.provider === DATABASE_PROVIDERS.SUPABASE && !config.connectionString?.includes('supabase.co')) {
            warnings.push('Connection string should be from Supabase (supabase.co)');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    generateUnifiedInterface(config) {
        return {
            category: PluginCategory.DATABASE,
            exports: [
                {
                    name: 'db',
                    type: 'constant',
                    implementation: 'Database connection instance',
                    documentation: 'Main database connection object',
                    examples: ['import { db } from "@/lib/db"']
                },
                {
                    name: 'query',
                    type: 'function',
                    implementation: 'Database query function',
                    documentation: 'Execute database queries',
                    examples: ['const users = await query("SELECT * FROM users")']
                }
            ],
            types: [
                {
                    name: 'DatabaseConfig',
                    type: 'interface',
                    definition: 'interface DatabaseConfig { provider: string; connectionString?: string; }',
                    documentation: 'Database configuration interface'
                }
            ],
            utilities: [
                {
                    name: 'connect',
                    type: 'function',
                    implementation: 'Database connection function',
                    documentation: 'Connect to the database',
                    parameters: [],
                    returnType: 'Promise<void>',
                    examples: ['await connect()']
                }
            ],
            constants: [
                {
                    name: 'DATABASE_URL',
                    value: 'process.env.DATABASE_URL',
                    documentation: 'Database connection URL',
                    type: 'string'
                }
            ],
            documentation: 'Drizzle ORM unified interface for database operations'
        };
    }
    // ============================================================================
    // DATABASE PLUGIN INTERFACE IMPLEMENTATION
    // ============================================================================
    getDatabaseProviders() {
        return [
            DATABASE_PROVIDERS.NEON,
            DATABASE_PROVIDERS.SUPABASE,
            DATABASE_PROVIDERS.MONGODB,
            DATABASE_PROVIDERS.PLANETSCALE,
            DATABASE_PROVIDERS.LOCAL_SQLITE
        ];
    }
    getORMOptions() {
        return [ORM_LIBRARIES.DRIZZLE];
    }
    getDatabaseFeatures() {
        return ['migrations', 'seeding', 'backup', 'connection_pooling', 'ssl'];
    }
    getConnectionOptions() {
        return ['connectionString', 'host', 'port', 'username', 'password', 'database', 'ssl'];
    }
    getProviderLabel(provider) {
        const labels = {
            [DATABASE_PROVIDERS.NEON]: 'Neon (PostgreSQL)',
            [DATABASE_PROVIDERS.SUPABASE]: 'Supabase',
            [DATABASE_PROVIDERS.MONGODB]: 'MongoDB',
            [DATABASE_PROVIDERS.PLANETSCALE]: 'PlanetScale',
            [DATABASE_PROVIDERS.LOCAL_SQLITE]: 'Local SQLite'
        };
        return labels[provider] || provider;
    }
    getProviderDescription(provider) {
        const descriptions = {
            [DATABASE_PROVIDERS.NEON]: 'Serverless PostgreSQL with branching',
            [DATABASE_PROVIDERS.SUPABASE]: 'Open source Firebase alternative',
            [DATABASE_PROVIDERS.MONGODB]: 'NoSQL document database',
            [DATABASE_PROVIDERS.PLANETSCALE]: 'MySQL-compatible serverless database',
            [DATABASE_PROVIDERS.LOCAL_SQLITE]: 'Local SQLite for development'
        };
        return descriptions[provider] || '';
    }
    getFeatureLabel(feature) {
        return feature.charAt(0).toUpperCase() + feature.slice(1).replace('_', ' ');
    }
    getFeatureDescription(feature) {
        const descriptions = {
            migrations: 'Database schema versioning and migrations',
            seeding: 'Initial data seeding for development',
            backup: 'Automated database backups',
            connection_pooling: 'Connection pooling and caching',
            ssl: 'SSL/TLS encryption for connections'
        };
        return descriptions[feature] || '';
    }
    // ============================================================================
    // PLUGIN INSTALLATION
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            // Initialize path resolver
            this.initializePathResolver(context);
            // Initialize generator with path resolver
            this.generator = new DrizzleGenerator(this.pathResolver);
            // Get configuration from context
            const config = context.pluginConfig;
            // Validate configuration
            const validation = this.validateConfiguration(config);
            if (!validation.valid) {
                return this.createErrorResult('Configuration validation failed', validation.errors, startTime);
            }
            // Install dependencies
            const dependencies = this.getDependencies();
            const devDependencies = this.getDevDependencies();
            await this.installDependencies(dependencies, devDependencies);
            // Generate files
            await this.generator.generateDrizzleConfig(config);
            await this.generator.generateSchemaFile(config);
            await this.generator.generateConnectionFile(config);
            await this.generator.generateUnifiedInterface(config);
            // Add scripts to package.json
            const scripts = this.generator.generateScripts(config);
            await this.addScripts(scripts);
            // Generate environment variables
            const envVars = this.generator.generateEnvVars(config);
            return this.createSuccessResult([
                { type: 'config', path: 'drizzle.config.ts', description: 'Drizzle configuration' },
                { type: 'schema', path: this.pathResolver.getSchemaPath(), description: 'Database schema' },
                { type: 'connection', path: this.pathResolver.getLibPath('db', 'connection.ts'), description: 'Database connection' },
                { type: 'interface', path: this.pathResolver.getUnifiedInterfacePath('db'), description: 'Unified database interface' }
            ], dependencies, Object.keys(scripts), [
                { type: 'env', content: envVars, description: 'Database environment variables' }
            ], validation.warnings, startTime);
        }
        catch (error) {
            return this.createErrorResult('Drizzle plugin installation failed', [error], startTime);
        }
    }
    // ============================================================================
    // DEPENDENCIES AND CONFIGURATION
    // ============================================================================
    getDependencies() {
        return [
            'drizzle-orm',
            '@neondatabase/serverless',
            'postgres'
        ];
    }
    getDevDependencies() {
        return [
            'drizzle-kit',
            '@types/pg'
        ];
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'svelte'],
            platforms: ['node', 'browser'],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: ['prisma', 'typeorm']
        };
    }
    getConflicts() {
        return ['prisma', 'typeorm'];
    }
    getRequirements() {
        return [
            { type: 'database', name: 'PostgreSQL, MySQL, SQLite, or MongoDB' },
            { type: 'node', version: '>=16.0.0' }
        ];
    }
    getDefaultConfig() {
        return {
            provider: DATABASE_PROVIDERS.NEON,
            ormType: ORM_LIBRARIES.DRIZZLE,
            features: ['migrations'],
            connectionString: '',
            ssl: true
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                provider: { type: 'string', enum: Object.values(DATABASE_PROVIDERS) },
                ormType: { type: 'string', enum: Object.values(ORM_LIBRARIES) },
                features: { type: 'array', items: { type: 'string' } },
                connectionString: { type: 'string' },
                ssl: { type: 'boolean' }
            },
            required: ['provider', 'ormType']
        };
    }
}
//# sourceMappingURL=DrizzlePlugin.js.map