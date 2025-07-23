/**
 * DB Agent - Database Orchestrator
 *
 * Pure orchestrator for database setup using unified interfaces.
 * Handles user interaction, decision making, and coordinates database plugins through unified interfaces.
 * No direct installation logic - delegates everything to plugins through adapters.
 */
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { ProjectType, TargetPlatform } from '../types/plugins.js';
import { AgentCategory, CapabilityCategory } from '../types/agents.js';
import { structureService } from '../core/project/structure-service.js';
export class DBAgent extends AbstractAgent {
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
        return {
            name: 'DBAgent',
            version: '2.0.0',
            description: 'Orchestrates database setup using unified interfaces',
            author: 'The Architech Team',
            category: AgentCategory.DATABASE,
            tags: ['database', 'orm', 'migrations', 'unified-interface'],
            dependencies: ['base-project'],
            conflicts: [],
            requirements: [
                {
                    type: 'package',
                    name: 'fs-extra',
                    description: 'File system utilities'
                }
            ],
            license: 'MIT',
            repository: 'https://github.com/the-architech/cli'
        };
    }
    getAgentCapabilities() {
        return [
            {
                name: 'db-setup',
                description: 'Setup database with unified interfaces',
                category: CapabilityCategory.SETUP,
                parameters: [
                    {
                        name: 'provider',
                        type: 'string',
                        description: 'Database provider',
                        required: false,
                        defaultValue: 'neon'
                    },
                    {
                        name: 'connectionString',
                        type: 'string',
                        description: 'Database connection string',
                        required: false,
                        defaultValue: ''
                    },
                    {
                        name: 'schema',
                        type: 'array',
                        description: 'Database schema tables',
                        required: false,
                        defaultValue: ['users', 'posts', 'comments']
                    },
                    {
                        name: 'migrations',
                        type: 'boolean',
                        description: 'Enable migrations',
                        required: false,
                        defaultValue: true
                    },
                    {
                        name: 'features',
                        type: 'object',
                        description: 'Advanced database features',
                        required: false,
                        defaultValue: {
                            seeding: false,
                            backup: false,
                            connectionPooling: false,
                            ssl: true,
                            readReplicas: false
                        }
                    },
                    {
                        name: 'seeding',
                        type: 'object',
                        description: 'Database seeding configuration',
                        required: false,
                        defaultValue: {
                            fixtures: ['users', 'posts'],
                            autoSeed: false
                        }
                    },
                    {
                        name: 'backup',
                        type: 'object',
                        description: 'Database backup configuration',
                        required: false,
                        defaultValue: {
                            frequency: 'daily',
                            retention: 30,
                            autoBackup: false
                        }
                    },
                    {
                        name: 'connectionPooling',
                        type: 'object',
                        description: 'Connection pooling configuration',
                        required: false,
                        defaultValue: {
                            min: 2,
                            max: 10,
                            idleTimeout: 30000
                        }
                    }
                ],
                examples: [
                    {
                        name: 'Setup Drizzle ORM',
                        description: 'Creates database setup with Drizzle ORM using unified interfaces',
                        parameters: { provider: 'neon', migrations: true },
                        expectedResult: 'Complete database setup with Drizzle ORM via unified interface'
                    },
                    {
                        name: 'Setup Prisma ORM',
                        description: 'Creates database setup with Prisma ORM using unified interfaces',
                        parameters: { provider: 'supabase', migrations: true },
                        expectedResult: 'Database setup with Prisma ORM via unified interface'
                    },
                    {
                        name: 'Setup advanced database',
                        description: 'Creates database setup with seeding and backup using unified interfaces',
                        parameters: {
                            provider: 'planetscale',
                            migrations: true,
                            features: { seeding: true, backup: true, connectionPooling: true },
                            seeding: { fixtures: ['users', 'posts', 'categories'], autoSeed: true },
                            backup: { frequency: 'daily', retention: 7, autoBackup: true }
                        },
                        expectedResult: 'Advanced database setup with seeding and backup via unified interface'
                    }
                ]
            },
            {
                name: 'db-validation',
                description: 'Validate database setup',
                category: CapabilityCategory.VALIDATION,
                parameters: [],
                examples: [
                    {
                        name: 'Validate database setup',
                        description: 'Validates the database setup using unified interfaces',
                        parameters: {},
                        expectedResult: 'Database setup validation report'
                    }
                ]
            },
            {
                name: 'db-seeding',
                description: 'Setup database seeding',
                category: CapabilityCategory.SETUP,
                parameters: [
                    {
                        name: 'fixtures',
                        type: 'array',
                        description: 'Fixtures to seed',
                        required: true
                    },
                    {
                        name: 'autoSeed',
                        type: 'boolean',
                        description: 'Automatically seed on setup',
                        required: false,
                        defaultValue: false
                    }
                ],
                examples: [
                    {
                        name: 'Setup seeding',
                        description: 'Creates database seeding system',
                        parameters: {
                            fixtures: ['users', 'posts', 'categories'],
                            autoSeed: true
                        },
                        expectedResult: 'Database seeding system with auto-seeding enabled'
                    }
                ]
            },
            {
                name: 'db-backup',
                description: 'Setup database backup',
                category: CapabilityCategory.SETUP,
                parameters: [
                    {
                        name: 'frequency',
                        type: 'string',
                        description: 'Backup frequency',
                        required: true
                    },
                    {
                        name: 'retention',
                        type: 'number',
                        description: 'Backup retention in days',
                        required: true
                    },
                    {
                        name: 'autoBackup',
                        type: 'boolean',
                        description: 'Enable automatic backups',
                        required: false,
                        defaultValue: false
                    }
                ],
                examples: [
                    {
                        name: 'Setup backup',
                        description: 'Creates database backup system',
                        parameters: {
                            frequency: 'daily',
                            retention: 30,
                            autoBackup: true
                        },
                        expectedResult: 'Database backup system with daily backups'
                    }
                ]
            }
        ];
    }
    // ============================================================================
    // CORE EXECUTION - Pure Plugin Orchestration with Unified Interfaces
    // ============================================================================
    async executeInternal(context) {
        const startTime = Date.now();
        try {
            context.logger.info('Starting database orchestration...');
            // For monorepo, install database in the db package directory
            const isMonorepo = context.projectStructure?.type === 'monorepo';
            let packagePath;
            if (isMonorepo) {
                // Install in the db package directory (packages/db)
                packagePath = path.join(context.projectPath, 'packages', 'db');
                context.logger.info(`Database package path: ${packagePath}`);
                // Ensure the db package directory exists and is properly set up
                await this.ensurePackageDirectory(context, 'db', packagePath);
                context.logger.info(`Using db package directory for database setup: ${packagePath}`);
            }
            else {
                // For single-app, use the project root
                packagePath = context.projectPath;
                context.logger.info(`Using project root for database setup: ${packagePath}`);
            }
            // Select database plugin based on user preferences or project requirements
            const selectedPlugin = await this.selectDatabasePlugin(context);
            // Get database configuration
            const dbConfig = await this.getDatabaseConfig(context);
            // Execute selected database plugin through unified interface
            context.logger.info(`Executing ${selectedPlugin} plugin through unified interface...`);
            const result = await this.executeDatabasePluginUnified(selectedPlugin, context);
            // Validate the setup using unified interface
            await this.validateDatabaseSetupUnified(context, selectedPlugin, packagePath);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: result.artifacts || [],
                data: {
                    plugin: selectedPlugin,
                    packagePath,
                    provider: dbConfig.provider,
                    migrations: dbConfig.migrations,
                    unifiedInterface: true
                },
                errors: [],
                warnings: result.warnings || [],
                duration
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`Database setup failed: ${errorMessage}`);
            return this.createErrorResult('DB_SETUP_FAILED', `Failed to setup database: ${errorMessage}`, [], startTime, error);
        }
    }
    // ============================================================================
    // VALIDATION
    // ============================================================================
    async validate(context) {
        const baseValidation = await super.validate(context);
        if (!baseValidation.valid) {
            return baseValidation;
        }
        const errors = [];
        const warnings = [];
        // Check if database package exists (but don't fail if it doesn't - we'll create it)
        const packagePath = this.getPackagePath(context, 'db');
        if (!await fsExtra.pathExists(packagePath)) {
            warnings.push(`Database package directory will be created at: ${packagePath}`);
        }
        // Check if Drizzle plugin is available
        const drizzlePlugin = this.pluginSystem.getRegistry().get('drizzle');
        if (!drizzlePlugin) {
            errors.push({
                field: 'plugin',
                message: 'Drizzle plugin not found in registry',
                code: 'PLUGIN_NOT_FOUND',
                severity: 'error'
            });
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    // ============================================================================
    // PRIVATE METHODS - Database Setup
    // ============================================================================
    getPackagePath(context, packageName) {
        const structure = context.projectStructure;
        return structureService.getModulePath(context.projectPath, structure, packageName);
    }
    async ensurePackageDirectory(context, packageName, packagePath) {
        const structure = context.projectStructure;
        if (structure.isMonorepo) {
            // For monorepo, ensure the package directory exists
            await fsExtra.ensureDir(packagePath);
            // Create package.json if it doesn't exist
            const packageJsonPath = path.join(packagePath, 'package.json');
            if (!await fsExtra.pathExists(packageJsonPath)) {
                const packageJson = {
                    name: `@${context.projectName}/${packageName}`,
                    version: "0.1.0",
                    private: true,
                    main: "./index.ts",
                    types: "./index.ts",
                    scripts: {
                        "build": "tsc",
                        "dev": "tsc --watch",
                        "lint": "eslint . --ext .ts,.tsx"
                    },
                    dependencies: {},
                    devDependencies: {
                        "typescript": "^5.0.0"
                    }
                };
                await fsExtra.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
            }
        }
        // For single app, the directory is already created by the base project agent
    }
    async getDatabaseConfig(context) {
        // Get configuration from context or use defaults
        const userConfig = context.config.database || {};
        return {
            provider: userConfig.provider || 'neon',
            connectionString: userConfig.connectionString || userConfig.databaseUrl || '',
            schema: userConfig.schema || ['users', 'posts', 'comments'],
            migrations: userConfig.migrations !== false,
            features: {
                seeding: userConfig.features?.seeding || false,
                backup: userConfig.features?.backup || false,
                connectionPooling: userConfig.features?.connectionPooling || false,
                ssl: userConfig.features?.ssl || false,
                readReplicas: userConfig.features?.readReplicas || false,
            },
            seeding: userConfig.seeding,
            backup: userConfig.backup,
            connectionPooling: userConfig.connectionPooling,
        };
    }
    getPluginConfig(dbConfig, pluginName) {
        const config = {
            provider: dbConfig.provider,
            connectionString: dbConfig.connectionString,
            schema: dbConfig.schema,
            migrations: dbConfig.migrations,
            useTypeScript: true,
            includeExamples: true
        };
        // Add specific plugin-specific configurations if needed
        if (pluginName === 'drizzle') {
            config.skipDb = true; // Drizzle handles its own DB setup
            config.skipPlugins = true; // Drizzle handles its own plugins
        }
        else if (pluginName === 'prisma') {
            config.skipDb = true; // Prisma handles its own DB setup
            config.skipPlugins = true; // Prisma handles its own plugins
        }
        return config;
    }
    // ============================================================================
    // ROLLBACK
    // ============================================================================
    async rollback(context) {
        context.logger.warn('Rolling back database setup...');
        try {
            // Get the Drizzle plugin for uninstallation
            const drizzlePlugin = this.pluginSystem.getRegistry().get('drizzle');
            if (drizzlePlugin) {
                const packagePath = this.getPackagePath(context, 'db');
                const pluginContext = {
                    ...context,
                    projectPath: packagePath, // Use package path for uninstallation
                    pluginId: 'drizzle',
                    pluginConfig: {},
                    installedPlugins: [],
                    projectType: ProjectType.NEXTJS,
                    targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
                };
                await drizzlePlugin.uninstall(pluginContext);
            }
            context.logger.success('Database setup rollback completed');
        }
        catch (error) {
            context.logger.error('Database rollback failed', error);
        }
    }
    // ============================================================================
    // UNIFIED INTERFACE EXECUTION
    // ============================================================================
    async executeDatabasePluginUnified(pluginId, context) {
        context.logger.info(`Starting unified execution of ${pluginId} plugin...`);
        // Get plugin selection from context to determine which database to use
        const pluginSelection = context.state.get('pluginSelection');
        const selectedDatabase = pluginSelection?.database?.type || pluginId;
        context.logger.info(`Using database technology: ${selectedDatabase} (user selection: ${pluginSelection?.database?.type})`);
        // Use the selected database instead of the default
        const actualPluginId = selectedDatabase === 'none' ? pluginId : selectedDatabase;
        context.logger.info(`Found ${actualPluginId} plugin in registry`);
        // Get plugin from registry
        const plugin = this.pluginSystem.getRegistry().get(actualPluginId);
        if (!plugin) {
            throw new Error(`Database plugin not found: ${actualPluginId}`);
        }
        // Always use the root project path for the plugin context
        // The plugin will handle monorepo vs single app structure internally
        const pluginProjectPath = context.projectPath;
        context.logger.info(`Plugin will generate files in: ${pluginProjectPath}`);
        // Prepare plugin context with root project path
        const pluginContext = {
            ...context,
            projectPath: pluginProjectPath, // Use root project path
            pluginId: actualPluginId,
            pluginConfig: {
                provider: pluginSelection?.database?.provider || 'neon',
                features: pluginSelection?.database?.features || {}
            },
            installedPlugins: [],
            projectType: ProjectType.NEXTJS,
            targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
        };
        context.logger.info('Plugin context prepared for ' + actualPluginId);
        // Validate plugin
        const validation = await plugin.validate(pluginContext);
        if (!validation.valid) {
            throw new Error(`${actualPluginId} plugin validation failed: ${validation.errors.map((e) => e.message).join(', ')}`);
        }
        context.logger.info(`${actualPluginId} plugin validation passed`);
        // Execute plugin
        context.logger.info(`Executing ${actualPluginId} plugin...`);
        const result = await plugin.install(pluginContext);
        if (!result.success) {
            throw new Error(`${actualPluginId} plugin execution failed: ${result.errors?.map((e) => e.message).join(', ') || 'Unknown error'}`);
        }
        context.logger.info(`${actualPluginId} plugin execution completed successfully`);
        return {
            artifacts: result.artifacts || [],
            warnings: result.warnings || []
        };
    }
    async validateDatabaseSetupUnified(context, pluginName, installPath) {
        const structure = context.projectStructure;
        const unifiedPath = structureService.getUnifiedInterfacePath(context.projectPath, structure, 'db');
        // Check for unified interface files
        const requiredFiles = [
            'index.ts',
            'schema.ts',
            'migrations.ts'
        ];
        for (const file of requiredFiles) {
            const filePath = path.join(unifiedPath, file);
            if (!await fsExtra.pathExists(filePath)) {
                throw new Error(`Missing unified interface file: ${filePath}`);
            }
        }
        context.logger.success(`✅ ${pluginName} unified interface validation passed`);
    }
    // ============================================================================
    // PLUGIN SELECTION
    // ============================================================================
    async selectDatabasePlugin(context) {
        // Check if user has specified a preference
        const userPreference = context.state.get('dbTechnology');
        if (userPreference) {
            context.logger.info(`Using user preference for database: ${userPreference}`);
            return userPreference;
        }
        // Check if project has specified database technology
        const projectDB = context.config.database?.technology;
        if (projectDB) {
            context.logger.info(`Using project database technology: ${projectDB}`);
            return projectDB;
        }
        // Default to Drizzle for Next.js projects
        context.logger.info('Using default database technology: drizzle');
        return 'drizzle';
    }
    getAvailableDatabasePlugins() {
        const registry = this.pluginSystem.getRegistry();
        const allPlugins = registry.getAll();
        return allPlugins.filter((plugin) => {
            const metadata = plugin.getMetadata();
            return metadata.category === 'orm' || metadata.category === 'database';
        });
    }
    // ============================================================================
    // PLUGIN EXECUTION
    // ============================================================================
    async executeDatabasePlugin(context, pluginName, dbConfig, packagePath) {
        try {
            context.logger.info(`Starting execution of ${pluginName} plugin...`);
            // Get the selected plugin
            const plugin = this.pluginSystem.getRegistry().get(pluginName);
            if (!plugin) {
                throw new Error(`${pluginName} plugin not found in registry`);
            }
            context.logger.info(`Found ${pluginName} plugin in registry`);
            // Prepare plugin context with correct path
            const pluginContext = {
                ...context,
                projectPath: packagePath, // Use package path instead of root path
                pluginId: pluginName,
                pluginConfig: this.getPluginConfig(dbConfig, pluginName),
                installedPlugins: [],
                projectType: ProjectType.NEXTJS,
                targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
            };
            context.logger.info(`Plugin context prepared for ${pluginName}`);
            // Validate plugin compatibility
            context.logger.info(`Validating ${pluginName} plugin...`);
            const validation = await plugin.validate(pluginContext);
            if (!validation.valid) {
                throw new Error(`${pluginName} plugin validation failed: ${validation.errors.map((e) => e.message).join(', ')}`);
            }
            context.logger.info(`${pluginName} plugin validation passed`);
            // Execute the plugin
            context.logger.info(`Executing ${pluginName} plugin...`);
            const result = await plugin.install(pluginContext);
            if (!result.success) {
                throw new Error(`${pluginName} plugin execution failed: ${result.errors.map((e) => e.message).join(', ')}`);
            }
            context.logger.info(`${pluginName} plugin execution completed successfully`);
            return result;
        }
        catch (error) {
            context.logger.error(`Error in executeDatabasePlugin for ${pluginName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
}
//# sourceMappingURL=db-agent.js.map