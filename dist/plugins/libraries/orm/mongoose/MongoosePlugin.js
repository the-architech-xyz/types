/**
 * Mongoose ORM Plugin - Updated with Latest Best Practices
 *
 * Provides Mongoose ODM integration with MongoDB database providers.
 * Follows latest Mongoose documentation and TypeScript best practices.
 *
 * References:
 * - https://mongoosejs.com/docs/typescript.html
 * - https://mongoosejs.com/docs/plugins.html
 * - https://mongoosejs.com/docs/schematypes.html
 * - https://mongoosejs.com/docs/middleware.html
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginCategory } from '../../../../types/plugins.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { MongooseSchema } from './MongooseSchema.js';
import { MongooseGenerator } from './MongooseGenerator.js';
export class MongoosePlugin extends BasePlugin {
    generator;
    constructor() {
        super();
        this.generator = new MongooseGenerator();
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'mongoose',
            name: 'Mongoose ODM',
            version: '8.0.0',
            description: 'Elegant MongoDB object modeling for Node.js with TypeScript support',
            author: 'The Architech Team',
            category: PluginCategory.ORM,
            tags: ['database', 'orm', 'odm', 'typescript', 'mongodb', 'mongoose', 'schema', 'validation'],
            license: 'MIT',
            repository: 'https://github.com/Automattic/mongoose',
            homepage: 'https://mongoosejs.com',
            documentation: 'https://mongoosejs.com/docs'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Mongoose ODM with latest features...');
            // Step 1: Install dependencies
            await this.installMongooseDependencies(context);
            // Step 2: Initialize Mongoose configuration
            await this.initializeMongooseConfig(context);
            // Step 3: Create database models and connection
            await this.createDatabaseFiles(context);
            // Step 4: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            // Step 5: Create plugins and middleware
            if (pluginConfig.enablePlugins) {
                await this.createPluginsAndMiddleware(context);
            }
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'db', 'index.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'db', 'models', 'user.model.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'db', 'connection.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'db', 'plugins', 'index.ts')
                    }
                ],
                dependencies: [
                    {
                        name: 'mongoose',
                        version: '^8.0.0',
                        type: 'production',
                        category: PluginCategory.ORM
                    },
                    {
                        name: '@types/mongoose',
                        version: '^5.11.97',
                        type: 'development',
                        category: PluginCategory.ORM
                    }
                ],
                scripts: [
                    {
                        name: 'db:generate-types',
                        command: 'npx mongoose-schema-generator --uri $DATABASE_URL --output src/lib/db/types.ts',
                        description: 'Generate Mongoose TypeScript types',
                        category: 'dev'
                    },
                    {
                        name: 'db:validate-schemas',
                        command: 'npx tsx src/lib/db/validate-schemas.ts',
                        description: 'Validate Mongoose schemas',
                        category: 'dev'
                    }
                ],
                configs: [
                    {
                        file: '.env',
                        content: Object.entries(this.generator.generateEnvConfig(pluginConfig))
                            .map(([key, value]) => `${key}=${value}`)
                            .join('\n'),
                        mergeStrategy: 'append'
                    }
                ],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install Mongoose ODM', [error], startTime);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Uninstalling Mongoose ODM...');
            // Remove Mongoose files
            const filesToRemove = [
                path.join(projectPath, 'src', 'lib', 'db', 'models'),
                path.join(projectPath, 'src', 'lib', 'db', 'plugins'),
                path.join(projectPath, 'src', 'lib', 'db', 'connection.ts'),
                path.join(projectPath, 'src', 'lib', 'db', 'client.ts'),
                path.join(projectPath, 'src', 'lib', 'db', 'schema.ts')
            ];
            for (const file of filesToRemove) {
                if (await fsExtra.pathExists(file)) {
                    await fsExtra.remove(file);
                }
            }
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: ['Mongoose files removed. You may need to manually remove dependencies from package.json'],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall Mongoose ODM', [error], startTime);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            context.logger.info('Updating Mongoose ODM...');
            // Update dependencies
            await this.runner.execCommand(['npm', 'update', 'mongoose', '@types/mongoose']);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to update Mongoose ODM', [error], startTime);
        }
    }
    async validate(context) {
        const errors = [];
        const warnings = [];
        try {
            // Check if Mongoose connection exists
            const connectionPath = path.join(context.projectPath, 'src', 'lib', 'db', 'connection.ts');
            if (!await fsExtra.pathExists(connectionPath)) {
                errors.push({
                    field: 'mongoose.connection',
                    message: 'Mongoose connection file not found',
                    code: 'MISSING_CONNECTION',
                    severity: 'error'
                });
            }
            // Check if models directory exists
            const modelsPath = path.join(context.projectPath, 'src', 'lib', 'db', 'models');
            if (!await fsExtra.pathExists(modelsPath)) {
                errors.push({
                    field: 'mongoose.models',
                    message: 'Mongoose models directory not found',
                    code: 'MISSING_MODELS',
                    severity: 'error'
                });
            }
            // Validate environment variables
            const envPath = path.join(context.projectPath, '.env');
            if (await fsExtra.pathExists(envPath)) {
                const envContent = await fsExtra.readFile(envPath, 'utf-8');
                if (!envContent.includes('MONGODB_URI')) {
                    warnings.push('MONGODB_URI not found in .env file');
                }
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [{
                        field: 'validation',
                        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        code: 'VALIDATION_ERROR',
                        severity: 'error'
                    }],
                warnings: []
            };
        }
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'angular', 'express', 'fastify'],
            platforms: ['web', 'node'],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            databases: ['mongodb'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['mongoose'];
    }
    getConflicts() {
        return ['prisma', 'drizzle-orm', 'typeorm'];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'mongoose',
                description: 'Mongoose ODM for MongoDB',
                version: '^8.0.0',
                optional: false
            }
        ];
    }
    getDefaultConfig() {
        return {
            connectionString: 'mongodb://localhost:27017/myapp',
            enablePlugins: true,
            enableValidation: true,
            enableIndexes: true
        };
    }
    getConfigSchema() {
        return MongooseSchema.getParameterSchema();
    }
    // ============================================================================
    // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getParameterSchema() {
        return MongooseSchema.getParameterSchema();
    }
    validateConfiguration(config) {
        const errors = [];
        // Validate required fields
        if (!config.connectionString && !config.connection) {
            errors.push({
                field: 'connection',
                message: 'Database connection string or configuration is required',
                code: 'MISSING_CONNECTION',
                severity: 'error'
            });
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings: []
        };
    }
    generateUnifiedInterface(config) {
        return {
            category: PluginCategory.ORM,
            exports: [
                {
                    name: 'connect',
                    type: 'function',
                    implementation: 'MongooseConnection',
                    documentation: 'Connect to MongoDB database',
                    parameters: [],
                    returnType: 'Promise<void>',
                    examples: []
                },
                {
                    name: 'disconnect',
                    type: 'function',
                    implementation: 'MongooseConnection',
                    documentation: 'Disconnect from MongoDB database',
                    parameters: [],
                    returnType: 'Promise<void>',
                    examples: []
                }
            ],
            types: [
                {
                    name: 'MongooseConfig',
                    type: 'interface',
                    definition: 'interface MongooseConfig { connectionString: string; options?: ConnectionOptions; }',
                    documentation: 'Configuration for Mongoose ODM',
                    properties: []
                },
                {
                    name: 'ConnectionOptions',
                    type: 'interface',
                    definition: 'interface ConnectionOptions { useNewUrlParser?: boolean; useUnifiedTopology?: boolean; }',
                    documentation: 'MongoDB connection options',
                    properties: []
                }
            ],
            utilities: [],
            constants: [
                {
                    name: 'MONGOOSE_VERSION',
                    value: '8.0.0',
                    documentation: 'Current Mongoose version',
                    type: 'string'
                },
                {
                    name: 'DEFAULT_OPTIONS',
                    value: { useNewUrlParser: true, useUnifiedTopology: true },
                    documentation: 'Default MongoDB connection options',
                    type: 'object'
                }
            ],
            documentation: 'Mongoose ODM unified interface for MongoDB operations'
        };
    }
    // ============================================================================
    // IUIDatabasePlugin INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getDatabaseProviders() {
        return [
            'mongodb',
            'mongodb-atlas',
            'mongodb-local'
        ];
    }
    getORMOptions() {
        return [
            'mongoose-odm',
            'mongoose-schemas',
            'mongoose-plugins',
            'mongoose-middleware',
            'mongoose-validation'
        ];
    }
    getDatabaseFeatures() {
        return [
            'schema-validation',
            'middleware-hooks',
            'plugins',
            'virtuals',
            'indexes',
            'aggregation',
            'transactions',
            'change-streams'
        ];
    }
    getConnectionOptions() {
        return [
            'connection-string',
            'connection-pool',
            'ssl',
            'timeout',
            'max-connections',
            'replica-set'
        ];
    }
    getProviderLabel(provider) {
        const labels = {
            'mongodb': 'MongoDB',
            'mongodb-atlas': 'MongoDB Atlas',
            'mongodb-local': 'MongoDB Local'
        };
        return labels[provider] || provider;
    }
    getProviderDescription(provider) {
        const descriptions = {
            'mongodb': 'NoSQL document database',
            'mongodb-atlas': 'Cloud-hosted MongoDB service',
            'mongodb-local': 'Local MongoDB instance'
        };
        return descriptions[provider] || 'Database provider';
    }
    getFeatureLabel(feature) {
        const labels = {
            'schema-validation': 'Schema Validation',
            'middleware-hooks': 'Middleware Hooks',
            'plugins': 'Mongoose Plugins',
            'virtuals': 'Virtual Properties',
            'indexes': 'Database Indexes',
            'aggregation': 'Aggregation Pipeline',
            'transactions': 'Database Transactions',
            'change-streams': 'Change Streams'
        };
        return labels[feature] || feature;
    }
    getFeatureDescription(feature) {
        const descriptions = {
            'schema-validation': 'Validate data against defined schemas',
            'middleware-hooks': 'Execute code before/after operations',
            'plugins': 'Reusable functionality for schemas',
            'virtuals': 'Computed properties not stored in database',
            'indexes': 'Optimize query performance',
            'aggregation': 'Complex data processing pipeline',
            'transactions': 'ACID-compliant database operations',
            'change-streams': 'Real-time database change notifications'
        };
        return descriptions[feature] || 'Database feature';
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    async installMongooseDependencies(context) {
        const { projectPath } = context;
        context.logger.info('Installing Mongoose dependencies...');
        // Install Mongoose and MongoDB driver
        await this.runner.execCommand(['npm', 'install', 'mongoose'], { cwd: projectPath });
    }
    async initializeMongooseConfig(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Initializing Mongoose configuration...');
        // Create database library directory
        const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
        await fsExtra.ensureDir(dbLibDir);
        // Generate Mongoose connection
        const connectionContent = this.generator.generateMongooseConnection(pluginConfig);
        await fsExtra.writeFile(path.join(dbLibDir, 'connection.ts'), connectionContent.content);
        // Create models directory
        const modelsDir = path.join(dbLibDir, 'models');
        await fsExtra.ensureDir(modelsDir);
        // Generate User model with latest patterns
        const userModelContent = this.generator.generateUserModel(pluginConfig);
        await fsExtra.writeFile(path.join(modelsDir, 'user.model.ts'), userModelContent.content);
    }
    async createDatabaseFiles(context) {
        const { projectPath } = context;
        context.logger.info('Creating database files...');
        // Create database library directory
        const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
        await fsExtra.ensureDir(dbLibDir);
        // Generate database client
        const clientContent = this.generator.generateDatabaseClient();
        await fsExtra.writeFile(path.join(dbLibDir, 'client.ts'), clientContent.content);
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        context.logger.info('Generating unified interface files...');
        // Create database library directory
        const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
        await fsExtra.ensureDir(dbLibDir);
        // Generate unified database interface
        const unifiedContent = this.generator.generateUnifiedIndex();
        await fsExtra.writeFile(path.join(dbLibDir, 'index.ts'), unifiedContent.content);
    }
    async createPluginsAndMiddleware(context) {
        const { projectPath } = context;
        context.logger.info('Creating plugins and middleware...');
        // Create plugins directory
        const pluginsDir = path.join(projectPath, 'src', 'lib', 'db', 'plugins');
        await fsExtra.ensureDir(pluginsDir);
        // Generate timestamp plugin
        const timestampPluginContent = this.generator.generateTimestampPlugin();
        await fsExtra.writeFile(path.join(pluginsDir, 'timestamp.plugin.ts'), timestampPluginContent.content);
    }
}
//# sourceMappingURL=MongoosePlugin.js.map