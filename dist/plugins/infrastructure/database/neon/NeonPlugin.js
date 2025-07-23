/**
 * Neon Database Provider Plugin - Pure Infrastructure Implementation
 *
 * Provides Neon PostgreSQL database infrastructure setup.
 * Focuses only on database connection and configuration.
 * ORM functionality is handled by separate ORM plugins.
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { NeonConfigSchema } from './NeonSchema.js';
import { NeonGenerator } from './NeonGenerator.js';
export class NeonPlugin extends BasePlugin {
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
            id: 'neon',
            name: 'Neon Database',
            version: '1.0.0',
            description: 'Serverless PostgreSQL with branching and autoscaling',
            author: 'The Architech Team',
            category: PluginCategory.DATABASE,
            tags: ['database', 'postgresql', 'serverless', 'neon', 'infrastructure'],
            license: 'MIT',
            repository: 'https://github.com/neondatabase/neon',
            homepage: 'https://neon.tech',
            documentation: 'https://neon.tech/docs'
        };
    }
    // ============================================================================
    // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getParameterSchema() {
        return {
            category: PluginCategory.DATABASE,
            groups: [
                { id: 'connection', name: 'Connection Settings', description: 'Configure Neon database connection.', order: 1, parameters: ['connectionString', 'host', 'port', 'username', 'password', 'database'] },
                { id: 'features', name: 'Features', description: 'Enable Neon features.', order: 2, parameters: ['enableBranching', 'enableAutoscaling', 'enableServerless'] },
                { id: 'performance', name: 'Performance', description: 'Configure performance settings.', order: 3, parameters: ['connectionPoolSize', 'connectionTimeout', 'queryTimeout'] }
            ],
            parameters: [
                {
                    id: 'connectionString',
                    name: 'Connection String',
                    type: 'string',
                    description: 'Neon database connection string',
                    required: true,
                    group: 'connection'
                },
                {
                    id: 'host',
                    name: 'Host',
                    type: 'string',
                    description: 'Neon database host',
                    required: false,
                    group: 'connection'
                },
                {
                    id: 'port',
                    name: 'Port',
                    type: 'number',
                    description: 'Database port',
                    required: false,
                    default: 5432,
                    group: 'connection'
                },
                {
                    id: 'username',
                    name: 'Username',
                    type: 'string',
                    description: 'Database username',
                    required: false,
                    group: 'connection'
                },
                {
                    id: 'password',
                    name: 'Password',
                    type: 'string',
                    description: 'Database password',
                    required: false,
                    group: 'connection'
                },
                {
                    id: 'database',
                    name: 'Database Name',
                    type: 'string',
                    description: 'Database name',
                    required: false,
                    group: 'connection'
                },
                {
                    id: 'enableBranching',
                    name: 'Enable Branching',
                    type: 'boolean',
                    description: 'Enable database branching',
                    required: false,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'enableAutoscaling',
                    name: 'Enable Autoscaling',
                    type: 'boolean',
                    description: 'Enable automatic scaling',
                    required: false,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'enableServerless',
                    name: 'Enable Serverless',
                    type: 'boolean',
                    description: 'Enable serverless mode',
                    required: false,
                    default: true,
                    group: 'features'
                },
                {
                    id: 'connectionPoolSize',
                    name: 'Connection Pool Size',
                    type: 'number',
                    description: 'Connection pool size',
                    required: false,
                    default: 10,
                    group: 'performance'
                },
                {
                    id: 'connectionTimeout',
                    name: 'Connection Timeout',
                    type: 'number',
                    description: 'Connection timeout in milliseconds',
                    required: false,
                    default: 10000,
                    group: 'performance'
                },
                {
                    id: 'queryTimeout',
                    name: 'Query Timeout',
                    type: 'number',
                    description: 'Query timeout in milliseconds',
                    required: false,
                    default: 30000,
                    group: 'performance'
                }
            ],
            dependencies: [],
            validations: []
        };
    }
    validateConfiguration(config) {
        const errors = [];
        const warnings = [];
        // Validate required fields
        if (!config.connectionString && !config.host) {
            errors.push({
                field: 'connectionString',
                message: 'Either connection string or host is required',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        // URL validation
        if (config.connectionString && !config.connectionString.includes('neon.tech')) {
            warnings.push('Connection string should be from Neon (neon.tech)');
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
                    name: 'neon',
                    type: 'class',
                    implementation: 'Neon database client',
                    documentation: 'Main Neon database client for PostgreSQL operations'
                },
                {
                    name: 'db',
                    type: 'constant',
                    implementation: 'Database connection utilities',
                    documentation: 'Database connection and utility functions'
                },
                {
                    name: 'config',
                    type: 'constant',
                    implementation: 'Database configuration',
                    documentation: 'Neon database configuration'
                }
            ],
            types: [],
            utilities: [],
            constants: [],
            documentation: 'Neon serverless PostgreSQL database integration'
        };
    }
    // ============================================================================
    // IUIDatabasePlugin INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getDatabaseProviders() {
        return ['neon'];
    }
    getORMOptions() {
        return ['drizzle', 'prisma', 'kysely'];
    }
    getDatabaseFeatures() {
        return ['branching', 'autoscaling', 'serverless', 'connection-pooling'];
    }
    getConnectionOptions() {
        return ['direct', 'pooled', 'serverless'];
    }
    getProviderLabel(provider) {
        return 'Neon';
    }
    getProviderDescription(provider) {
        return 'Serverless PostgreSQL with branching and autoscaling';
    }
    getFeatureLabel(feature) {
        const labels = {
            'branching': 'Database Branching',
            'autoscaling': 'Auto Scaling',
            'serverless': 'Serverless Mode',
            'connection-pooling': 'Connection Pooling'
        };
        return labels[feature] || feature;
    }
    getFeatureDescription(feature) {
        const descriptions = {
            'branching': 'Create and manage database branches for development',
            'autoscaling': 'Automatic scaling based on demand',
            'serverless': 'Serverless PostgreSQL with pay-per-use pricing',
            'connection-pooling': 'Efficient connection management'
        };
        return descriptions[feature] || feature;
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Neon database infrastructure...');
            // Initialize path resolver
            this.initializePathResolver(context);
            // Initialize generator
            this.generator = new NeonGenerator();
            // Validate configuration
            const validation = this.validateConfiguration(pluginConfig);
            if (!validation.valid) {
                return this.createErrorResult('Invalid Neon configuration', validation.errors, startTime);
            }
            // Step 1: Install dependencies
            await this.installDependencies(['@neondatabase/serverless', 'pg']);
            // Step 2: Generate files using the generator
            const neonConfig = NeonGenerator.generateNeonConfig(pluginConfig);
            const envConfig = NeonGenerator.generateEnvConfig(pluginConfig);
            // Step 3: Write files to project
            await this.generateFile('src/lib/database/neon.ts', neonConfig);
            await this.generateFile('.env.local', envConfig);
            await this.generateFile('src/lib/database/index.ts', `export * from './neon.js';`);
            const duration = Date.now() - startTime;
            return this.createSuccessResult([
                { type: 'file', path: 'src/lib/database/neon.ts' },
                { type: 'file', path: 'neon.config.ts' },
                { type: 'file', path: 'src/lib/database/index.ts' }
            ], [
                {
                    name: '@neondatabase/serverless',
                    version: '^1.0.1',
                    type: 'production',
                    category: PluginCategory.DATABASE
                },
                {
                    name: 'pg',
                    version: '^8.11.0',
                    type: 'production',
                    category: PluginCategory.DATABASE
                }
            ], [], [], validation.warnings, startTime);
        }
        catch (error) {
            return this.createErrorResult('Failed to install Neon database infrastructure', [], startTime);
        }
    }
    // ============================================================================
    // PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getDependencies() {
        return ['@neondatabase/serverless', 'pg'];
    }
    getDevDependencies() {
        return ['@neondatabase/cli'];
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'svelte'],
            platforms: ['web', 'mobile'],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            databases: ['postgresql'],
            conflicts: []
        };
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: '@neondatabase/serverless',
                description: 'Neon serverless driver',
                version: '^1.0.1'
            },
            {
                type: 'service',
                name: 'neon-project',
                description: 'Neon PostgreSQL project'
            }
        ];
    }
    getDefaultConfig() {
        return {
            connectionString: '',
            host: '',
            port: 5432,
            username: '',
            password: '',
            database: '',
            enableBranching: true,
            enableAutoscaling: true,
            enableServerless: true,
            connectionPoolSize: 10,
            connectionTimeout: 10000,
            queryTimeout: 30000
        };
    }
    getConfigSchema() {
        return NeonConfigSchema;
    }
}
//# sourceMappingURL=NeonPlugin.js.map