/**
 * MongoDB Database Provider Plugin - Updated with Latest Best Practices
 *
 * Provides MongoDB database infrastructure setup.
 * Follows latest MongoDB documentation and TypeScript best practices.
 *
 * References:
 * - https://docs.mongodb.com/drivers/node/current/
 * - https://docs.mongodb.com/manual/
 * - https://docs.mongodb.com/atlas/
 * - https://docs.mongodb.com/manual/replication/
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { MongoDBConfigSchema } from './MongoDBSchema.js';
import { MongoDBGenerator } from './MongoDBGenerator.js';
export class MongoDBPlugin extends BasePlugin {
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
            id: 'mongodb',
            name: 'MongoDB Database',
            version: '6.3.0',
            description: 'Document-oriented NoSQL database with flexible schema and high performance',
            author: 'The Architech Team',
            category: PluginCategory.DATABASE,
            tags: ['database', 'nosql', 'document', 'mongodb', 'atlas', 'replica-set', 'sharding', 'aggregation'],
            license: 'SSPL',
            repository: 'https://github.com/mongodb/mongo',
            homepage: 'https://www.mongodb.com',
            documentation: 'https://docs.mongodb.com'
        };
    }
    // ============================================================================
    // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getParameterSchema() {
        return {
            category: PluginCategory.DATABASE,
            groups: [
                { id: 'connection', name: 'Connection Settings', description: 'Configure MongoDB connection.', order: 1, parameters: ['connectionString', 'host', 'port', 'username', 'password', 'database'] },
                { id: 'features', name: 'Features', description: 'Enable MongoDB features.', order: 2, parameters: ['enableReplicaSet', 'enableSharding', 'enableAggregation'] },
                { id: 'performance', name: 'Performance', description: 'Configure performance settings.', order: 3, parameters: ['connectionPoolSize', 'connectionTimeout', 'queryTimeout'] }
            ],
            parameters: [
                {
                    id: 'connectionString',
                    name: 'Connection String',
                    type: 'string',
                    description: 'MongoDB connection string',
                    required: true,
                    group: 'connection'
                },
                {
                    id: 'host',
                    name: 'Host',
                    type: 'string',
                    description: 'MongoDB host',
                    required: false,
                    group: 'connection'
                },
                {
                    id: 'port',
                    name: 'Port',
                    type: 'number',
                    description: 'Database port',
                    required: false,
                    default: 27017,
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
                    id: 'enableReplicaSet',
                    name: 'Enable Replica Set',
                    type: 'boolean',
                    description: 'Enable replica set support',
                    required: false,
                    default: false,
                    group: 'features'
                },
                {
                    id: 'enableSharding',
                    name: 'Enable Sharding',
                    type: 'boolean',
                    description: 'Enable sharding support',
                    required: false,
                    default: false,
                    group: 'features'
                },
                {
                    id: 'enableAggregation',
                    name: 'Enable Aggregation',
                    type: 'boolean',
                    description: 'Enable aggregation pipeline support',
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
        if (config.connectionString && !config.connectionString.includes('mongodb')) {
            warnings.push('Connection string should be a MongoDB connection string');
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
                    name: 'mongodb',
                    type: 'class',
                    implementation: 'MongoDB client instance',
                    documentation: 'Main MongoDB client for database operations'
                },
                {
                    name: 'db',
                    type: 'constant',
                    implementation: 'Database connection utilities',
                    documentation: 'Database connection and utility functions'
                },
                {
                    name: 'types',
                    type: 'constant',
                    implementation: 'Database type definitions',
                    documentation: 'TypeScript type definitions for database schema'
                }
            ],
            types: [],
            utilities: [],
            constants: [],
            documentation: 'MongoDB NoSQL database integration with document support'
        };
    }
    // ============================================================================
    // IUIDatabasePlugin INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getDatabaseProviders() {
        return ['mongodb'];
    }
    getORMOptions() {
        return ['mongoose', 'prisma', 'typegoose'];
    }
    getDatabaseFeatures() {
        return ['document-storage', 'aggregation', 'replica-set', 'sharding'];
    }
    getConnectionOptions() {
        return ['direct', 'pooled', 'replica-set'];
    }
    getProviderLabel(provider) {
        return 'MongoDB';
    }
    getProviderDescription(provider) {
        return 'Document-oriented NoSQL database with flexible schema and high performance';
    }
    getFeatureLabel(feature) {
        const labels = {
            'document-storage': 'Document Storage',
            'aggregation': 'Aggregation Pipeline',
            'replica-set': 'Replica Set',
            'sharding': 'Sharding'
        };
        return labels[feature] || feature;
    }
    getFeatureDescription(feature) {
        const descriptions = {
            'document-storage': 'Store and query JSON-like documents',
            'aggregation': 'Powerful data processing pipeline',
            'replica-set': 'High availability with automatic failover',
            'sharding': 'Horizontal scaling across multiple servers'
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
            context.logger.info('Installing MongoDB database infrastructure...');
            // Initialize path resolver
            this.initializePathResolver(context);
            // Initialize generator
            this.generator = new MongoDBGenerator();
            // Validate configuration
            const validation = this.validateConfiguration(pluginConfig);
            if (!validation.valid) {
                return this.createErrorResult('Invalid MongoDB configuration', validation.errors, startTime);
            }
            // Step 1: Install dependencies
            await this.installDependencies(['mongodb']);
            // Step 2: Generate files using the generator
            const mongodbClient = MongoDBGenerator.generateMongoDBClient(pluginConfig);
            const types = MongoDBGenerator.generateTypes();
            const unifiedIndex = MongoDBGenerator.generateUnifiedIndex();
            // Step 3: Write files to project
            await this.generateFile('src/lib/db/mongodb.ts', mongodbClient);
            await this.generateFile('src/lib/db/types.ts', types);
            await this.generateFile('src/lib/db/index.ts', unifiedIndex);
            const duration = Date.now() - startTime;
            return this.createSuccessResult([
                { type: 'file', path: 'src/lib/db/mongodb.ts' },
                { type: 'file', path: 'src/lib/db/types.ts' },
                { type: 'file', path: 'src/lib/db/index.ts' }
            ], [
                {
                    name: 'mongodb',
                    version: '^6.3.0',
                    type: 'production',
                    category: PluginCategory.DATABASE
                }
            ], [], [], validation.warnings, startTime);
        }
        catch (error) {
            return this.createErrorResult('Failed to install MongoDB database infrastructure', [], startTime);
        }
    }
    // ============================================================================
    // PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getDependencies() {
        return ['mongodb'];
    }
    getDevDependencies() {
        return ['@types/mongodb'];
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'svelte'],
            platforms: ['web', 'mobile'],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            databases: ['mongodb'],
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
                name: 'mongodb',
                description: 'MongoDB Node.js driver',
                version: '^6.3.0'
            },
            {
                type: 'service',
                name: 'mongodb-instance',
                description: 'MongoDB database instance'
            }
        ];
    }
    getDefaultConfig() {
        return {
            connectionString: '',
            host: '',
            port: 27017,
            username: '',
            password: '',
            database: '',
            enableReplicaSet: false,
            enableSharding: false,
            enableAggregation: true,
            connectionPoolSize: 10,
            connectionTimeout: 10000,
            queryTimeout: 30000
        };
    }
    getConfigSchema() {
        return MongoDBConfigSchema;
    }
}
//# sourceMappingURL=MongoDBPlugin.js.map