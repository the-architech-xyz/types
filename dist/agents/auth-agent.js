/**
 * Auth Agent - Authentication Orchestrator
 *
 * Pure orchestrator for authentication setup using unified interfaces.
 * Handles user interaction, decision making, and coordinates auth plugins through unified interfaces.
 * No direct installation logic - delegates everything to plugins through adapters.
 */
import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { PluginSystem } from '../core/plugin/plugin-system.js';
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
                    },
                    {
                        name: 'features',
                        type: 'object',
                        description: 'Advanced authentication features',
                        required: false,
                        defaultValue: {
                            rbac: false,
                            mfa: false,
                            socialLogin: false,
                            sessionManagement: true,
                            passwordReset: true,
                            accountLinking: false
                        }
                    },
                    {
                        name: 'rbac',
                        type: 'object',
                        description: 'Role-based access control configuration',
                        required: false,
                        defaultValue: {
                            roles: ['user', 'admin'],
                            permissions: ['read', 'write', 'delete'],
                            defaultRole: 'user'
                        }
                    },
                    {
                        name: 'mfa',
                        type: 'object',
                        description: 'Multi-factor authentication configuration',
                        required: false,
                        defaultValue: {
                            methods: ['totp'],
                            required: false
                        }
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
                    },
                    {
                        name: 'Setup advanced authentication',
                        description: 'Creates authentication with RBAC and MFA using unified interfaces',
                        parameters: {
                            providers: ['email', 'github'],
                            features: { rbac: true, mfa: true },
                            rbac: { roles: ['user', 'admin', 'moderator'], permissions: ['read', 'write', 'delete', 'moderate'] },
                            mfa: { methods: ['totp', 'email'], required: true }
                        },
                        expectedResult: 'Advanced authentication setup with RBAC and MFA via unified interface'
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
            },
            {
                name: 'auth-rbac-setup',
                description: 'Setup role-based access control',
                category: CapabilityCategory.SETUP,
                parameters: [
                    {
                        name: 'roles',
                        type: 'array',
                        description: 'Roles to create',
                        required: true
                    },
                    {
                        name: 'permissions',
                        type: 'array',
                        description: 'Permissions to define',
                        required: true
                    },
                    {
                        name: 'defaultRole',
                        type: 'string',
                        description: 'Default role for new users',
                        required: false,
                        defaultValue: 'user'
                    }
                ],
                examples: [
                    {
                        name: 'Setup RBAC',
                        description: 'Creates role-based access control system',
                        parameters: {
                            roles: ['user', 'admin', 'moderator'],
                            permissions: ['read', 'write', 'delete', 'moderate'],
                            defaultRole: 'user'
                        },
                        expectedResult: 'RBAC system setup with roles and permissions'
                    }
                ]
            },
            {
                name: 'auth-mfa-setup',
                description: 'Setup multi-factor authentication',
                category: CapabilityCategory.SETUP,
                parameters: [
                    {
                        name: 'methods',
                        type: 'array',
                        description: 'MFA methods to enable',
                        required: true
                    },
                    {
                        name: 'required',
                        type: 'boolean',
                        description: 'Whether MFA is required for all users',
                        required: false,
                        defaultValue: false
                    }
                ],
                examples: [
                    {
                        name: 'Setup MFA',
                        description: 'Creates multi-factor authentication system',
                        parameters: {
                            methods: ['totp', 'email'],
                            required: true
                        },
                        expectedResult: 'MFA system setup with TOTP and email methods'
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
        context.logger.info(`Executing ${pluginName} plugin with unified interface...`);
        try {
            // Get plugin from registry
            const plugin = this.pluginSystem.getRegistry().get(pluginName);
            if (!plugin) {
                throw new Error(`Auth plugin not found: ${pluginName}`);
            }
            // Determine the correct project path for the plugin
            const isMonorepo = context.projectStructure?.type === 'monorepo';
            const pluginProjectPath = isMonorepo
                ? path.join(context.projectPath, 'packages', 'auth')
                : context.projectPath;
            context.logger.info(`Plugin will generate files in: ${pluginProjectPath}`);
            // Prepare plugin context with correct project path
            const pluginContext = {
                ...context,
                projectPath: pluginProjectPath, // Use the correct path for the plugin
                pluginId: pluginName,
                pluginConfig: this.getPluginConfig(authConfig, pluginName),
                installedPlugins: [],
                projectType: ProjectType.NEXTJS,
                targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
            };
            // Install plugin (this will generate the unified interface files)
            const result = await plugin.install(pluginContext);
            if (!result.success) {
                throw new Error(`Failed to install ${pluginName}: ${result.errors.map((e) => e.message).join(', ')}`);
            }
            context.logger.success(`${pluginName} plugin installed successfully`);
            return result;
        }
        catch (error) {
            context.logger.error(`Failed to execute ${pluginName} plugin: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async validateAuthSetupUnified(context, pluginName, installPath) {
        context.logger.info(`Validating ${pluginName} setup with unified interface...`);
        try {
            // Check if unified interface files were generated
            const authLibPath = path.join(installPath, 'src', 'lib', 'auth');
            const authIndexPath = path.join(authLibPath, 'index.ts');
            if (!existsSync(authIndexPath)) {
                throw new Error(`Unified auth interface not found at ${authIndexPath}`);
            }
            // Check if auth components were generated
            const authComponentsPath = path.join(authLibPath, 'components.tsx');
            if (!existsSync(authComponentsPath)) {
                context.logger.warn('Auth components file not found, but continuing...');
            }
            context.logger.success(`${pluginName} unified interface validation passed`);
        }
        catch (error) {
            context.logger.error(`Failed to validate ${pluginName} setup: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
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
        const isMonorepo = context.projectStructure?.type === 'monorepo';
        if (isMonorepo) {
            return path.join(context.projectPath, 'packages', packageName);
        }
        else {
            // For single-app, install in the root directory (Next.js project)
            return context.projectPath;
        }
    }
    async ensurePackageDirectory(context, packageName, packagePath) {
        const isMonorepo = context.projectStructure?.type === 'monorepo';
        if (isMonorepo) {
            // Create package directory and basic structure
            await fsExtra.ensureDir(packagePath);
            // Create package.json for the Auth package
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
            await fsExtra.writeJSON(path.join(packagePath, 'package.json'), packageJson, { spaces: 2 });
            // Create index.ts
            await fsExtra.writeFile(path.join(packagePath, 'index.ts'), `// ${packageName} package exports\n`);
            // Create tsconfig.json
            const tsconfig = {
                extends: "../../tsconfig.json",
                compilerOptions: {
                    outDir: "./dist",
                    rootDir: "."
                },
                include: ["./**/*"],
                exclude: ["node_modules", "dist"]
            };
            await fsExtra.writeJSON(path.join(packagePath, 'tsconfig.json'), tsconfig, { spaces: 2 });
            context.logger.info(`Created ${packageName} package at: ${packagePath}`);
        }
        else {
            // For single-app, just ensure the directory exists (Next.js project already has structure)
            await fsExtra.ensureDir(packagePath);
            context.logger.info(`Using existing Next.js project at: ${packagePath}`);
        }
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
            databaseUrl: dbConfig.connectionString || dbConfig.databaseUrl || '',
            features: {
                rbac: userConfig.features?.rbac || false,
                mfa: userConfig.features?.mfa || false,
                socialLogin: userConfig.features?.socialLogin || false,
                sessionManagement: userConfig.features?.sessionManagement || false,
                passwordReset: userConfig.features?.passwordReset || false,
                accountLinking: userConfig.features?.accountLinking || false,
            },
            rbac: userConfig.rbac,
            mfa: userConfig.mfa,
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
            skipPlugins: false,
            features: authConfig.features,
            rbac: authConfig.rbac,
            mfa: authConfig.mfa,
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