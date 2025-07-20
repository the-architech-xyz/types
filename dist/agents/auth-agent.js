/**
 * Auth Agent - Authentication Orchestrator
 *
 * Pure orchestrator for authentication setup using the Better Auth plugin.
 * Handles user interaction, decision making, and coordinates the Better Auth plugin.
 * No direct installation logic - delegates everything to plugins.
 */
import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { ProjectType, TargetPlatform } from '../types/plugin.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
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
            description: 'Authentication orchestrator - coordinates Better Auth plugin for authentication setup',
            author: 'The Architech Team',
            category: AgentCategory.AUTHENTICATION,
            tags: ['authentication', 'orchestrator', 'plugin-coordinator', 'better-auth'],
            dependencies: ['BaseProjectAgent', 'DBAgent'],
            conflicts: [],
            requirements: [
                {
                    type: 'package',
                    name: 'better-auth',
                    description: 'Better Auth for authentication'
                },
                {
                    type: 'package',
                    name: '@better-auth/utils',
                    description: 'Better Auth utilities'
                }
            ],
            license: 'MIT',
            repository: 'https://github.com/the-architech/cli'
        };
    }
    getAgentCapabilities() {
        return [
            {
                name: 'setup-authentication',
                description: 'Creates a complete authentication setup using Better Auth plugin',
                parameters: [
                    {
                        name: 'providers',
                        type: 'array',
                        required: false,
                        description: 'Authentication providers to enable',
                        defaultValue: ['email'],
                        validation: [
                            {
                                type: 'enum',
                                value: ['email', 'github', 'google'],
                                message: 'Providers must be email, github, or google'
                            }
                        ]
                    },
                    {
                        name: 'requireEmailVerification',
                        type: 'boolean',
                        required: false,
                        description: 'Whether to require email verification',
                        defaultValue: true
                    },
                    {
                        name: 'sessionDuration',
                        type: 'number',
                        required: false,
                        description: 'Session duration in seconds',
                        defaultValue: 604800,
                        validation: [
                            {
                                type: 'range',
                                value: [3600, 2592000],
                                message: 'Session duration must be between 1 hour and 30 days'
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        name: 'Setup email authentication',
                        description: 'Creates authentication with email/password using Better Auth plugin',
                        parameters: { providers: ['email'], requireEmailVerification: true },
                        expectedResult: 'Complete authentication setup with email auth via plugin'
                    },
                    {
                        name: 'Setup social authentication',
                        description: 'Creates authentication with social providers using Better Auth plugin',
                        parameters: { providers: ['email', 'github', 'google'] },
                        expectedResult: 'Authentication setup with social login support via plugin'
                    }
                ],
                category: CapabilityCategory.SETUP
            },
            {
                name: 'configure-providers',
                description: 'Configures additional authentication providers using plugin system',
                parameters: [
                    {
                        name: 'provider',
                        type: 'string',
                        required: true,
                        description: 'Provider to configure (github, google)',
                        validation: [
                            {
                                type: 'enum',
                                value: ['github', 'google'],
                                message: 'Provider must be github or google'
                            }
                        ]
                    }
                ],
                examples: [
                    {
                        name: 'Configure GitHub OAuth',
                        description: 'Adds GitHub OAuth configuration using Better Auth plugin',
                        parameters: { provider: 'github' },
                        expectedResult: 'GitHub OAuth configured via plugin'
                    }
                ],
                category: CapabilityCategory.CONFIGURATION
            }
        ];
    }
    // ============================================================================
    // CORE EXECUTION - Pure Plugin Orchestration
    // ============================================================================
    async executeInternal(context) {
        const { projectName, projectPath } = context;
        context.logger.info(`Setting up authentication for project: ${projectName}`);
        try {
            // Start spinner for actual work
            await this.startSpinner(`🔐 Setting up authentication with Better Auth...`, context);
            // Step 1: Get authentication configuration
            const authConfig = await this.getAuthConfig(context);
            // Step 2: Execute Better Auth plugin
            const pluginResult = await this.executeBetterAuthPlugin(context, authConfig);
            // Step 3: Validate authentication setup
            await this.validateAuthenticationSetup(context);
            await this.succeedSpinner(`✅ Authentication setup completed successfully`);
            return {
                success: true,
                data: {
                    providers: authConfig.providers,
                    plugin: 'better-auth',
                    artifacts: pluginResult.artifacts.length,
                    dependencies: pluginResult.dependencies.length,
                    scripts: pluginResult.scripts.length
                },
                artifacts: pluginResult.artifacts,
                warnings: pluginResult.warnings,
                duration: Date.now() - this.startTime
            };
        }
        catch (error) {
            await this.failSpinner(`❌ Authentication setup failed`);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return this.createErrorResult('AUTHENTICATION_SETUP_FAILED', `Authentication setup failed: ${errorMessage}`, [], this.startTime, error);
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
        // Check if project directory exists
        if (!existsSync(context.projectPath)) {
            errors.push({
                field: 'projectPath',
                message: `Project directory does not exist: ${context.projectPath}`,
                code: 'PROJECT_NOT_FOUND',
                severity: 'error'
            });
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
        // Check for database configuration (Better Auth requires a database)
        const dbConfig = context.config.database || {};
        if (!dbConfig.connectionString && !dbConfig.databaseUrl) {
            warnings.push('Database connection string not configured - Better Auth requires a database');
        }
        // Check for authentication configuration
        const authConfig = context.config.authentication || {};
        if (!authConfig.secret) {
            warnings.push('AUTH_SECRET not configured - you will need to set this environment variable');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    // ============================================================================
    // PRIVATE METHODS - Plugin Orchestration
    // ============================================================================
    async executeBetterAuthPlugin(context, authConfig) {
        // Get the Better Auth plugin
        const betterAuthPlugin = this.pluginSystem.getRegistry().get('better-auth');
        if (!betterAuthPlugin) {
            throw new Error('Better Auth plugin not found in registry');
        }
        // Prepare plugin context
        const pluginContext = {
            ...context,
            pluginId: 'better-auth',
            pluginConfig: this.getPluginConfig(authConfig),
            installedPlugins: [],
            projectType: ProjectType.NEXTJS,
            targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
        };
        // Validate plugin compatibility
        const validation = await betterAuthPlugin.validate(pluginContext);
        if (!validation.valid) {
            throw new Error(`Better Auth plugin validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }
        // Execute the plugin
        context.logger.info('Executing Better Auth plugin...');
        const result = await betterAuthPlugin.install(pluginContext);
        if (!result.success) {
            throw new Error(`Better Auth plugin execution failed: ${result.errors.map(e => e.message).join(', ')}`);
        }
        return result;
    }
    async validateAuthenticationSetup(context) {
        const { projectPath } = context;
        context.logger.info('Validating authentication setup...');
        // Check for essential authentication files
        const essentialFiles = ['auth.ts', 'lib/auth.ts'];
        for (const file of essentialFiles) {
            const filePath = path.join(projectPath, file);
            if (!await fsExtra.pathExists(filePath)) {
                throw new Error(`Authentication file missing: ${file}`);
            }
        }
        // Check for package.json dependencies
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (await fsExtra.pathExists(packageJsonPath)) {
            const packageJson = await fsExtra.readJSON(packageJsonPath);
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
            if (!dependencies['better-auth']) {
                throw new Error('Better Auth dependency not found in package.json');
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
    getPluginConfig(authConfig) {
        return {
            providers: authConfig.providers,
            requireEmailVerification: authConfig.requireEmailVerification,
            sessionDuration: authConfig.sessionDuration,
            databaseUrl: authConfig.databaseUrl,
            secret: process.env.AUTH_SECRET || 'your-secret-key-here',
            skipDb: false,
            skipPlugins: false
        };
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
                const pluginContext = {
                    ...context,
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