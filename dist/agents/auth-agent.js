/**
 * Auth Agent - Authentication Orchestrator
 *
 * Pure orchestrator for authentication setup using unified interfaces.
 * Handles user interaction, decision making, and coordinates auth plugins through unified interfaces.
 * No direct installation logic - delegates everything to plugins through adapters.
 */
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { PluginSystem } from '../core/plugin/plugin-system.js';
import { ProjectType, TargetPlatform } from '../types/plugin.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
import { structureService } from '../core/project/structure-service.js';
export class AuthAgent extends AbstractAgent {
    pluginSystem;
    constructor() {
        super();
        this.pluginSystem = PluginSystem.getInstance();
    }
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
        return {
            name: 'AuthAgent',
            version: '2.0.0',
            description: 'Orchestrates authentication setup using unified interfaces',
            author: 'The Architech Team',
            category: AgentCategory.AUTHENTICATION,
            tags: ['auth', 'authentication', 'security', 'unified-interface'],
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
                name: 'auth-setup',
                description: 'Setup authentication with unified interfaces',
                category: CapabilityCategory.SETUP,
                parameters: [
                    {
                        name: 'providers',
                        type: 'array',
                        description: 'Authentication providers to enable',
                        required: false,
                        defaultValue: ['email']
                    },
                    {
                        name: 'requireEmailVerification',
                        type: 'boolean',
                        description: 'Whether to require email verification',
                        required: false,
                        defaultValue: true
                    },
                    {
                        name: 'sessionDuration',
                        type: 'number',
                        description: 'Session duration in seconds',
                        required: false,
                        defaultValue: 30 * 24 * 60 * 60 // 30 days
                    }
                ],
                examples: [
                    {
                        name: 'Setup email authentication',
                        description: 'Creates authentication with email/password using unified interfaces',
                        parameters: { providers: ['email'], requireEmailVerification: true },
                        expectedResult: 'Complete authentication setup with email auth via unified interface'
                    },
                    {
                        name: 'Setup social authentication',
                        description: 'Creates authentication with social providers using unified interfaces',
                        parameters: { providers: ['email', 'github', 'google'] },
                        expectedResult: 'Authentication setup with social login support via unified interface'
                    }
                ]
            },
            {
                name: 'auth-validation',
                description: 'Validate authentication setup',
                category: CapabilityCategory.VALIDATION,
                parameters: [],
                examples: [
                    {
                        name: 'Validate auth setup',
                        description: 'Validates the authentication setup using unified interfaces',
                        parameters: {},
                        expectedResult: 'Authentication setup validation report'
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
            context.logger.info('Setting up authentication for project: ' + context.projectName);
            // For monorepo, install Better Auth in the auth package directory
            const isMonorepo = context.projectStructure?.type === 'monorepo';
            let installPath;
            if (isMonorepo) {
                // Install in the auth package directory (packages/auth)
                installPath = path.join(context.projectPath, 'packages', 'auth');
                context.logger.info(`Authentication package path: ${installPath}`);
                // Ensure the auth package directory exists
                await fsExtra.ensureDir(installPath);
                context.logger.info(`Using auth package directory for auth setup: ${installPath}`);
            }
            else {
                // For single-app, use the project root
                installPath = context.projectPath;
                context.logger.info(`Using project root for auth setup: ${installPath}`);
            }
            // Get authentication configuration
            const authConfig = await this.getAuthConfig(context);
            // Select auth plugin based on user preferences or project requirements
            const selectedPlugin = await this.selectAuthPlugin(context);
            // Execute auth plugin through unified interface
            context.logger.info(`Executing ${selectedPlugin} plugin through unified interface...`);
            const result = await this.executeAuthPluginUnified(context, selectedPlugin, authConfig, installPath);
            // Validate the setup using unified interface
            await this.validateAuthSetupUnified(context, selectedPlugin, installPath);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: result.artifacts || [],
                data: {
                    plugin: selectedPlugin,
                    installPath,
                    providers: authConfig.providers,
                    unifiedInterface: true
                },
                errors: [],
                warnings: result.warnings || [],
                duration
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`Authentication setup failed: ${errorMessage}`);
            return this.createErrorResult('AUTH_SETUP_FAILED', `Failed to setup authentication: ${errorMessage}`, [], startTime, error);
        }
    }
    // ============================================================================
    // UNIFIED INTERFACE EXECUTION
    // ============================================================================
    async executeAuthPluginUnified(context, pluginName, authConfig, installPath) {
        try {
            context.logger.info(`Starting unified execution of ${pluginName} plugin...`);
            // Get the selected plugin
            const plugin = this.pluginSystem.getRegistry().get(pluginName);
            if (!plugin) {
                throw new Error(`${pluginName} plugin not found in registry`);
            }
            context.logger.info(`Found ${pluginName} plugin in registry`);
            // Prepare plugin context with correct path
            const pluginContext = {
                ...context,
                projectPath: installPath,
                pluginId: pluginName,
                pluginConfig: this.getPluginConfig(authConfig, pluginName),
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
            context.logger.error(`Error in executeAuthPluginUnified for ${pluginName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async validateAuthSetupUnified(context, pluginName, installPath) {
        const structure = context.projectStructure;
        const unifiedPath = structureService.getUnifiedInterfacePath(context.projectPath, structure, 'auth');
        // Check for unified interface files
        const requiredFiles = [
            'index.ts',
            'components.tsx',
            'config.ts'
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
    async selectAuthPlugin(context) {
        // Get plugin selection from context to determine which auth to use
        const pluginSelection = context.state.get('pluginSelection');
        const selectedAuth = pluginSelection?.authentication?.type;
        if (selectedAuth && selectedAuth !== 'none') {
            context.logger.info(`Using user selection for auth: ${selectedAuth}`);
            return selectedAuth;
        }
        // Check if user has specified a preference
        const userPreference = context.state.get('authTechnology');
        if (userPreference) {
            context.logger.info(`Using user preference for auth: ${userPreference}`);
            return userPreference;
        }
        // Check if project has specified auth technology
        const projectAuth = context.config.auth?.technology;
        if (projectAuth) {
            context.logger.info(`Using project auth technology: ${projectAuth}`);
            return projectAuth;
        }
        // Default to Better Auth for Next.js projects
        context.logger.info('Using default auth technology: better-auth');
        return 'better-auth';
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
        // Check if authentication package exists (but don't fail if it doesn't - we'll create it)
        const packagePath = this.getPackagePath(context, 'auth');
        if (!await fsExtra.pathExists(packagePath)) {
            warnings.push(`Authentication package directory will be created at: ${packagePath}`);
        }
        // Check if Better Auth plugin is available
        const betterAuthPlugin = this.pluginSystem.getRegistry().get('better-auth');
        if (!betterAuthPlugin) {
            errors.push({
                field: 'plugin',
                message: 'Better Auth plugin not found in registry',
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
    // PRIVATE METHODS - Authentication Setup
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
    async validateAuthSetup(context, installPath) {
        context.logger.info('Validating authentication setup...');
        // Check for essential auth files
        const essentialFiles = [
            'lib/auth.ts',
            '.env.local'
        ];
        for (const file of essentialFiles) {
            const filePath = path.join(installPath, file);
            if (!await fsExtra.pathExists(filePath)) {
                throw new Error(`Authentication file missing: ${file}`);
            }
        }
        context.logger.success('Authentication setup validation passed');
    }
    async getAuthConfig(context) {
        // Get configuration from context or use defaults
        const userConfig = context.config.authentication || {};
        const dbConfig = context.config.database || {};
        return {
            providers: userConfig.providers || ['email'],
            requireEmailVerification: userConfig.requireEmailVerification !== false,
            sessionDuration: userConfig.sessionDuration || 604800,
            databaseUrl: dbConfig.connectionString || dbConfig.databaseUrl || ''
        };
    }
    getPluginConfig(authConfig, pluginName) {
        const config = {
            providers: authConfig.providers,
            requireEmailVerification: authConfig.requireEmailVerification,
            sessionDuration: authConfig.sessionDuration,
            databaseUrl: authConfig.databaseUrl,
            secret: process.env.AUTH_SECRET || 'your-secret-key-here',
            skipDb: false,
            skipPlugins: false
        };
        // Add specific plugin-specific configurations if needed
        if (pluginName === 'better-auth') {
            config.skipDb = true; // Better Auth handles its own DB
            config.skipPlugins = true; // Better Auth handles its own plugins
        }
        return config;
    }
    // ============================================================================
    // ROLLBACK
    // ============================================================================
    async rollback(context) {
        context.logger.warn('Rolling back authentication setup...');
        try {
            // Get the Better Auth plugin for uninstallation
            const betterAuthPlugin = this.pluginSystem.getRegistry().get('better-auth');
            if (betterAuthPlugin) {
                const packagePath = this.getPackagePath(context, 'auth');
                const pluginContext = {
                    ...context,
                    projectPath: packagePath, // Use package path for uninstallation
                    pluginId: 'better-auth',
                    pluginConfig: {},
                    installedPlugins: [],
                    projectType: ProjectType.NEXTJS,
                    targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
                };
                await betterAuthPlugin.uninstall(pluginContext);
            }
            context.logger.success('Authentication setup rollback completed');
        }
        catch (error) {
            context.logger.error('Authentication rollback failed', error);
        }
    }
}
//# sourceMappingURL=auth-agent.js.map