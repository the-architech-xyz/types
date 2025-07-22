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
import { PluginCategory, TargetPlatform } from '../../../../types/plugin.js';
import { templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { MongoDBConfigSchema, MongoDBDefaultConfig } from './MongoDBSchema.js';
import { MongoDBGenerator } from './MongoDBGenerator.js';
export class MongoDBPlugin {
    templateService;
    runner;
    constructor() {
        this.templateService = templateService;
        this.runner = new CommandRunner();
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
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing MongoDB database infrastructure with latest features...');
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Initialize MongoDB configuration
            await this.initializeMongoDBConfig(context);
            // Step 3: Create database connection and utilities
            await this.createDatabaseFiles(context);
            // Step 4: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            // Step 5: Setup monitoring and logging
            if (pluginConfig.enableMonitoring) {
                await this.setupMonitoring(context);
            }
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'db', 'mongodb.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'db', 'types.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'db', 'index.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'db', 'utils.ts')
                    }
                ],
                dependencies: [
                    {
                        name: 'mongodb',
                        version: '^6.3.0',
                        type: 'production',
                        category: PluginCategory.DATABASE
                    },
                    {
                        name: '@types/mongodb',
                        version: '^6.0.0',
                        type: 'development',
                        category: PluginCategory.DATABASE
                    }
                ],
                scripts: [
                    {
                        name: 'db:generate-types',
                        command: 'npx mongodb-schema-generator --uri $DATABASE_URL --output src/lib/db/types.ts',
                        description: 'Generate MongoDB TypeScript types',
                        category: 'dev'
                    },
                    {
                        name: 'db:validate-schema',
                        command: 'npx tsx src/lib/db/validate-schema.ts',
                        description: 'Validate MongoDB schema',
                        category: 'dev'
                    },
                    {
                        name: 'db:backup',
                        command: 'mongodump --uri $MONGODB_URI --db $MONGODB_DATABASE --out ./backups',
                        description: 'Create MongoDB backup',
                        category: 'dev'
                    },
                    {
                        name: 'db:restore',
                        command: 'mongorestore --uri $MONGODB_URI --db $MONGODB_DATABASE ./backups/$MONGODB_DATABASE',
                        description: 'Restore MongoDB backup',
                        category: 'dev'
                    }
                ],
                configs: [
                    {
                        file: '.env',
                        content: MongoDBGenerator.generateEnvConfig(pluginConfig),
                        mergeStrategy: 'append'
                    }
                ],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install MongoDB database', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Uninstalling MongoDB database...');
            // Remove MongoDB database files
            const filesToRemove = [
                path.join(projectPath, 'src', 'lib', 'db', 'mongodb.ts'),
                path.join(projectPath, 'src', 'lib', 'db', 'types.ts'),
                path.join(projectPath, 'src', 'lib', 'db', 'utils.ts')
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
                warnings: ['MongoDB database files removed. You may need to manually remove dependencies from package.json'],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall MongoDB database', startTime, [], error);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            context.logger.info('Updating MongoDB database...');
            // Update dependencies
            await this.runner.execCommand(['npm', 'update', 'mongodb', '@types/mongodb']);
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
            return this.createErrorResult('Failed to update MongoDB database', startTime, [], error);
        }
    }
    async validate(context) {
        const errors = [];
        const warnings = [];
        try {
            // Check if MongoDB client is properly configured
            const mongodbPath = path.join(context.projectPath, 'src', 'lib', 'db', 'mongodb.ts');
            if (!await fsExtra.pathExists(mongodbPath)) {
                errors.push({
                    field: 'mongodb.client',
                    message: 'MongoDB client configuration file not found',
                    code: 'MISSING_CLIENT',
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
                if (!envContent.includes('MONGODB_DATABASE')) {
                    warnings.push('MONGODB_DATABASE not found in .env file');
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
            frameworks: ['nextjs', 'react', 'vue', 'angular', 'express', 'fastify', 'nest'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            databases: ['mongodb'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['mongodb', '@types/mongodb'];
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
                type: 'package',
                name: '@types/mongodb',
                description: 'TypeScript types for MongoDB',
                version: '^6.0.0'
            },
            {
                type: 'config',
                name: 'MONGODB_URI',
                description: 'MongoDB connection URI',
                optional: false
            },
            {
                type: 'config',
                name: 'MONGODB_DATABASE',
                description: 'MongoDB database name',
                optional: false
            }
        ];
    }
    getDefaultConfig() {
        return MongoDBDefaultConfig;
    }
    getConfigSchema() {
        return MongoDBConfigSchema;
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    async installDependencies(context) {
        const { projectPath } = context;
        context.logger.info('Installing MongoDB dependencies...');
        const dependencies = [
            'mongodb@^6.3.0',
            '@types/mongodb@^6.0.0'
        ];
        await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
    }
    async initializeMongoDBConfig(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Initializing MongoDB configuration...');
        // Create database lib directory
        const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
        await fsExtra.ensureDir(dbLibDir);
        // Generate MongoDB client configuration
        const clientContent = MongoDBGenerator.generateMongoDBClient(pluginConfig);
        await fsExtra.writeFile(path.join(dbLibDir, 'mongodb.ts'), clientContent);
        // Generate database types
        const typesContent = MongoDBGenerator.generateTypes();
        await fsExtra.writeFile(path.join(dbLibDir, 'types.ts'), typesContent);
    }
    async createDatabaseFiles(context) {
        const { projectPath } = context;
        context.logger.info('Creating database connection files...');
        const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
        await fsExtra.ensureDir(dbLibDir);
        // Generate database client
        const clientContent = MongoDBGenerator.generateDatabaseClient();
        await fsExtra.writeFile(path.join(dbLibDir, 'client.ts'), clientContent);
        // Generate database utilities
        const utilsContent = MongoDBGenerator.generateDatabaseUtils();
        await fsExtra.writeFile(path.join(dbLibDir, 'utils.ts'), utilsContent);
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        context.logger.info('Generating unified interface files...');
        const dbLibDir = path.join(projectPath, 'src', 'lib', 'db');
        await fsExtra.ensureDir(dbLibDir);
        // Generate unified database interface
        const unifiedContent = MongoDBGenerator.generateUnifiedIndex();
        await fsExtra.writeFile(path.join(dbLibDir, 'index.ts'), unifiedContent);
    }
    async setupMonitoring(context) {
        const { projectPath } = context;
        context.logger.info('Setting up MongoDB monitoring...');
        // Create monitoring directory
        const monitoringDir = path.join(projectPath, 'src', 'lib', 'db', 'monitoring');
        await fsExtra.ensureDir(monitoringDir);
        // Generate monitoring utilities
        const monitoringContent = MongoDBGenerator.generateMonitoringUtils();
        await fsExtra.writeFile(path.join(monitoringDir, 'index.ts'), monitoringContent);
    }
    createErrorResult(message, startTime, errors = [], originalError) {
        const duration = Date.now() - startTime;
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [
                {
                    code: 'MONGODB_INSTALL_ERROR',
                    message,
                    details: originalError,
                    severity: 'error'
                },
                ...errors
            ],
            warnings: [],
            duration
        };
    }
}
//# sourceMappingURL=MongoDBPlugin.js.map