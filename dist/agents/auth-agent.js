/**
 * Auth Agent - Authentication Package Generator
 *
 * Sets up the packages/auth authentication layer with:
 * - Better Auth configuration
 * - Database integration with Drizzle
 * - Social login providers
 * - Session management utilities
 *
 * Enhanced to integrate with the plugin system for modularity.
 */
import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { templateService } from '../utils/template-service.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { ProjectType, TargetPlatform } from '../types/plugin.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
// Dynamic import for inquirer
let inquirerModule = null;
async function getInquirer() {
    if (!inquirerModule) {
        inquirerModule = await import('inquirer');
    }
    return inquirerModule.default;
}
export class AuthAgent extends AbstractAgent {
    templateService;
    pluginSystem;
    constructor() {
        super();
        this.templateService = templateService;
        this.pluginSystem = PluginSystem.getInstance();
    }
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
        return {
            name: 'AuthAgent',
            version: '2.0.0',
            description: 'Sets up the authentication package with Better Auth using plugin system',
            author: 'The Architech Team',
            category: AgentCategory.AUTHENTICATION,
            tags: ['authentication', 'better-auth', 'oauth', 'session', 'security', 'plugin-integration'],
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
                },
                {
                    type: 'file',
                    name: 'packages/auth',
                    description: 'Authentication package directory'
                },
                {
                    type: 'file',
                    name: 'packages/db',
                    description: 'Database package for auth integration'
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
                description: 'Creates a complete authentication setup with Better Auth using plugin system',
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
                    },
                    {
                        name: 'usePlugin',
                        type: 'boolean',
                        required: false,
                        description: 'Whether to use the Better Auth plugin for core setup',
                        defaultValue: true
                    }
                ],
                examples: [
                    {
                        name: 'Setup email authentication with plugin',
                        description: 'Creates authentication with email/password using plugin',
                        parameters: { providers: ['email'], requireEmailVerification: true, usePlugin: true },
                        expectedResult: 'Complete authentication package with email auth via plugin'
                    },
                    {
                        name: 'Setup social authentication with plugin',
                        description: 'Creates authentication with social providers using plugin',
                        parameters: { providers: ['email', 'github', 'google'], usePlugin: true },
                        expectedResult: 'Authentication package with social login support via plugin'
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
                    },
                    {
                        name: 'usePlugin',
                        type: 'boolean',
                        required: false,
                        description: 'Whether to use the Better Auth plugin for configuration',
                        defaultValue: true
                    }
                ],
                examples: [
                    {
                        name: 'Configure GitHub OAuth via plugin',
                        description: 'Adds GitHub OAuth configuration using plugin',
                        parameters: { provider: 'github', usePlugin: true },
                        expectedResult: 'GitHub OAuth configured in auth package via plugin'
                    }
                ],
                category: CapabilityCategory.CONFIGURATION
            },
            {
                name: 'enhance-auth-package',
                description: 'Adds agent-specific enhancements to the auth package',
                parameters: [
                    {
                        name: 'security',
                        type: 'boolean',
                        required: false,
                        description: 'Whether to add security utilities',
                        defaultValue: true
                    },
                    {
                        name: 'monitoring',
                        type: 'boolean',
                        required: false,
                        description: 'Whether to add auth monitoring utilities',
                        defaultValue: true
                    },
                    {
                        name: 'aiFeatures',
                        type: 'boolean',
                        required: false,
                        description: 'Whether to add AI-powered auth features',
                        defaultValue: true
                    }
                ],
                examples: [
                    {
                        name: 'Add all enhancements',
                        description: 'Adds all agent-specific enhancements to the auth package',
                        parameters: { security: true, monitoring: true, aiFeatures: true },
                        expectedResult: 'Enhanced auth package with security, monitoring, and AI features'
                    }
                ],
                category: CapabilityCategory.INTEGRATION
            }
        ];
    }
    // ============================================================================
    // CORE EXECUTION
    // ============================================================================
    async executeInternal(context) {
        const { projectName, projectPath } = context;
        const authPackagePath = path.join(projectPath, 'packages', 'auth');
        context.logger.info(`Setting up authentication package: ${projectName}/packages/auth`);
        try {
            // Get authentication configuration
            const authConfig = await this.getAuthConfig(context);
            // Get parameters from context config
            const usePlugin = context.config?.usePlugin !== false; // Default to true
            let pluginResult = null;
            // Use plugin for core setup if enabled
            if (usePlugin) {
                context.logger.info('Using Better Auth plugin for core setup...');
                pluginResult = await this.executeBetterAuthPlugin(context, authPackagePath, authConfig);
            }
            // Always run agent-specific enhancements
            await this.enhanceAuthPackage(authPackagePath, context, authConfig);
            const artifacts = [
                {
                    type: 'directory',
                    path: authPackagePath,
                    metadata: {
                        package: 'auth',
                        framework: 'better-auth',
                        providers: authConfig.providers,
                        features: ['authentication', 'session-management', 'security', 'enhancements'],
                        pluginUsed: usePlugin
                    }
                },
                {
                    type: 'file',
                    path: path.join(authPackagePath, 'package.json'),
                    metadata: { type: 'package-config' }
                },
                {
                    type: 'file',
                    path: path.join(authPackagePath, 'auth.config.ts'),
                    metadata: { type: 'auth-config' }
                }
            ];
            // Add plugin artifacts if plugin was used
            if (pluginResult?.artifacts) {
                artifacts.push(...pluginResult.artifacts);
            }
            return this.createSuccessResult({
                packagePath: authPackagePath,
                providers: authConfig.providers,
                framework: 'better-auth',
                pluginUsed: usePlugin,
                enhancements: ['security', 'monitoring', 'ai-features']
            }, artifacts, [
                'Authentication package structure created',
                'Better Auth configured',
                'Provider setup completed',
                'Agent-specific enhancements added',
                'Ready for authentication development'
            ]);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            context.logger.error(`Failed to setup auth package: ${errorMessage}`, error);
            return this.createErrorResult('AUTH_SETUP_FAILED', `Failed to setup auth package: ${errorMessage}`, [], 0, error);
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
        // Check if Auth package directory exists
        const authPackagePath = path.join(context.projectPath, 'packages', 'auth');
        if (!existsSync(authPackagePath)) {
            errors.push({
                field: 'authPackagePath',
                message: 'Auth package directory does not exist',
                code: 'AUTH_PACKAGE_MISSING'
            });
        }
        // Check if DB package exists (required for auth)
        const dbPackagePath = path.join(context.projectPath, 'packages', 'db');
        if (!existsSync(dbPackagePath)) {
            errors.push({
                field: 'dbPackagePath',
                message: 'Database package is required for authentication',
                code: 'DB_PACKAGE_MISSING'
            });
        }
        // Check for required environment variables
        const envFile = path.join(context.projectPath, '.env.local');
        if (!existsSync(envFile)) {
            warnings.push('Environment file (.env.local) not found - will be created');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    async getAuthConfig(context) {
        // If useDefaults is true, return default configuration
        if (context.options.useDefaults) {
            return {
                providers: ['email'],
                requireEmailVerification: true,
                sessionDuration: 7 * 24 * 60 * 60 // 7 days in seconds
            };
        }
        const questions = [
            {
                type: 'checkbox',
                name: 'providers',
                message: 'Select authentication providers:',
                choices: [
                    { name: 'Email & Password', value: 'email', checked: true },
                    { name: 'GitHub OAuth', value: 'github' },
                    { name: 'Google OAuth', value: 'google' }
                ],
                validate: (input) => {
                    if (input.length === 0) {
                        return 'Please select at least one authentication provider';
                    }
                    return true;
                }
            },
            {
                type: 'confirm',
                name: 'requireEmailVerification',
                message: 'Require email verification for new accounts?',
                default: true
            },
            {
                type: 'number',
                name: 'sessionDuration',
                message: 'Session duration in days:',
                default: 7,
                validate: (input) => {
                    if (input < 1 || input > 30) {
                        return 'Session duration must be between 1 and 30 days';
                    }
                    return true;
                },
                filter: (input) => input * 24 * 60 * 60 // Convert to seconds
            }
        ];
        const inquirer = await getInquirer();
        const answers = await inquirer.prompt(questions);
        return {
            providers: answers.providers,
            requireEmailVerification: answers.requireEmailVerification,
            sessionDuration: answers.sessionDuration
        };
    }
    async updatePackageJson(authPackagePath, context) {
        const packageJson = {
            name: `@${context.projectName}/auth`,
            version: "0.1.0",
            private: true,
            description: "Authentication layer with Better Auth",
            main: "index.ts",
            types: "index.ts",
            scripts: {
                "build": "tsc",
                "dev": "tsc --watch",
                "lint": "eslint . --ext .ts",
                "type-check": "tsc --noEmit"
            },
            dependencies: {
                "better-auth": "^1.2.12",
                "@better-auth/utils": "^0.2.6",
                "jose": "^6.0.11",
                "bcryptjs": "^2.4.3",
                "zod": "^3.24.1"
            },
            devDependencies: {
                "@types/bcryptjs": "^2.4.6",
                "typescript": "^5.2.2"
            },
            peerDependencies: {
                "react": "^18.0.0",
                "next": "^14.0.0"
            }
        };
        await fsExtra.writeJSON(path.join(authPackagePath, 'package.json'), packageJson, { spaces: 2 });
    }
    async createESLintConfig(authPackagePath) {
        const eslintConfig = {
            extends: ["../../.eslintrc.json"]
        };
        await fsExtra.writeJSON(path.join(authPackagePath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
    }
    async createAuthConfig(authPackagePath, context, authConfig) {
        const socialProvidersConfig = authConfig.providers.includes('github') || authConfig.providers.includes('google')
            ? `
  socialProviders: {
    ${authConfig.providers.includes('github') ? `
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },` : ''}
    ${authConfig.providers.includes('google') ? `
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },` : ''}
  },`
            : '';
        const templateData = {
            projectName: context.projectName,
            providers: authConfig.providers,
            requireEmailVerification: authConfig.requireEmailVerification,
            sessionDuration: authConfig.sessionDuration,
            socialProvidersConfig
        };
        const content = await this.templateService.renderTemplate('auth', 'auth.ts.ejs', templateData, { logger: context.logger });
        await fsExtra.writeFile(path.join(authPackagePath, 'auth.ts'), content);
    }
    async createAuthUtils(authPackagePath, context) {
        const clientContent = await this.templateService.renderTemplate('auth', 'client.ts.ejs', {}, { logger: context.logger });
        await fsExtra.writeFile(path.join(authPackagePath, 'client.ts'), clientContent);
        const serverContent = await this.templateService.renderTemplate('auth', 'server.ts.ejs', {}, { logger: context.logger });
        await fsExtra.writeFile(path.join(authPackagePath, 'server.ts'), serverContent);
    }
    async createAuthMiddleware(authPackagePath, context) {
        const content = await this.templateService.renderTemplate('auth', 'middleware.ts.ejs', {}, { logger: context.logger });
        await fsExtra.writeFile(path.join(authPackagePath, 'middleware.ts'), content);
    }
    async createIndex(authPackagePath) {
        const content = await this.templateService.renderTemplate('auth', 'index.ts.ejs', {});
        await fsExtra.writeFile(path.join(authPackagePath, 'index.ts'), content);
    }
    async updateEnvConfig(projectPath, authConfig, context) {
        const envFile = path.join(projectPath, '.env.local');
        let envContent = '';
        // Read existing env file if it exists
        if (existsSync(envFile)) {
            envContent = await fsExtra.readFile(envFile, 'utf-8');
        }
        // Generate auth environment variables using template
        const authEnvVars = await this.templateService.renderTemplate('auth', 'env-vars.ejs', { providers: authConfig.providers }, { logger: context.logger });
        // Only add if not already present
        const newVars = authEnvVars.split('\n').filter(varLine => {
            const varName = varLine.split('=')[0];
            return varName && !envContent.includes(varName);
        });
        if (newVars.length > 0) {
            await fsExtra.appendFile(envFile, '\n' + newVars.join('\n'));
        }
    }
    displayAuthSetupInstructions(authConfig) {
        console.log('\n🔐 Authentication Setup Instructions:');
        console.log('=====================================');
        console.log('');
        console.log('1. Environment Variables:');
        console.log('   - Update .env.local with your actual values');
        console.log('   - Generate a secure AUTH_SECRET (32+ characters)');
        console.log('');
        if (authConfig.providers.includes('github')) {
            console.log('2. GitHub OAuth Setup:');
            console.log('   - Go to GitHub Settings > Developer settings > OAuth Apps');
            console.log('   - Create a new OAuth App');
            console.log('   - Set Authorization callback URL to: http://localhost:3000/api/auth/callback/github');
            console.log('   - Update GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env.local');
            console.log('');
        }
        if (authConfig.providers.includes('google')) {
            console.log('3. Google OAuth Setup:');
            console.log('   - Go to Google Cloud Console > APIs & Services > Credentials');
            console.log('   - Create OAuth 2.0 Client ID');
            console.log('   - Set Authorized redirect URIs to: http://localhost:3000/api/auth/callback/google');
            console.log('   - Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local');
            console.log('');
        }
        console.log('4. Usage:');
        console.log('   - Import auth utilities in your components');
        console.log('   - Use useSession() for client-side auth state');
        console.log('   - Use getServerSession() for server-side auth checks');
        console.log('   - Add authMiddleware to your Next.js middleware');
        console.log('');
    }
    // ============================================================================
    // PLUGIN INTEGRATION
    // ============================================================================
    async executeBetterAuthPlugin(context, authPackagePath, authConfig) {
        try {
            const registry = this.pluginSystem.getRegistry();
            const betterAuthPlugin = registry.get('better-auth');
            if (!betterAuthPlugin) {
                throw new Error('Better Auth plugin not found in registry');
            }
            const pluginContext = {
                ...context,
                pluginId: 'better-auth',
                pluginConfig: {
                    providers: authConfig.providers,
                    requireEmailVerification: authConfig.requireEmailVerification,
                    sessionDuration: authConfig.sessionDuration,
                    targetPath: authPackagePath
                },
                installedPlugins: [],
                projectType: ProjectType.NEXTJS,
                targetPlatform: [TargetPlatform.WEB]
            };
            context.logger.info('Executing Better Auth plugin...');
            const result = await betterAuthPlugin.install(pluginContext);
            if (!result.success) {
                throw new Error(`Plugin execution failed: ${result.errors?.[0]?.message || 'Unknown error'}`);
            }
            context.logger.info('Better Auth plugin executed successfully');
            return result;
        }
        catch (error) {
            context.logger.warn(`Plugin execution failed, falling back to manual setup: ${error}`);
            // Fall back to manual setup
            await this.manualSetup(authPackagePath, context, authConfig);
            return null;
        }
    }
    // ============================================================================
    // AGENT-SPECIFIC ENHANCEMENTS
    // ============================================================================
    async enhanceAuthPackage(authPackagePath, context, authConfig) {
        context.logger.info('Adding agent-specific enhancements to auth package...');
        // Add security utilities
        await this.createSecurityUtils(authPackagePath, context);
        // Add monitoring utilities
        await this.createMonitoringUtils(authPackagePath, context);
        // Add AI-powered auth features
        await this.createAIFeatures(authPackagePath, context);
        // Add enhanced auth utilities
        await this.createEnhancedAuthUtils(authPackagePath, context);
        // Add development utilities
        await this.createDevUtilities(authPackagePath, context);
    }
    async createSecurityUtils(authPackagePath, context) {
        const securityPath = path.join(authPackagePath, 'lib', 'security');
        await fsExtra.ensureDir(securityPath);
        // Rate limiting utilities
        await this.templateService.renderTemplate('auth/rate-limiting.ts', path.join(securityPath, 'rate-limiting.ts'), {
            projectName: context.projectName
        });
        // Password strength checker
        await this.templateService.renderTemplate('auth/password-strength.ts', path.join(securityPath, 'password-strength.ts'), {
            projectName: context.projectName
        });
        // Session security utilities
        await this.templateService.renderTemplate('auth/session-security.ts', path.join(securityPath, 'session-security.ts'), {
            projectName: context.projectName
        });
        // CSRF protection utilities
        await this.templateService.renderTemplate('auth/csrf-protection.ts', path.join(securityPath, 'csrf-protection.ts'), {
            projectName: context.projectName
        });
    }
    async createMonitoringUtils(authPackagePath, context) {
        const monitoringPath = path.join(authPackagePath, 'lib', 'monitoring');
        await fsExtra.ensureDir(monitoringPath);
        // Auth event logger
        await this.templateService.renderTemplate('auth/auth-logger.ts', path.join(monitoringPath, 'auth-logger.ts'), {
            projectName: context.projectName
        });
        // Security audit utilities
        await this.templateService.renderTemplate('auth/security-audit.ts', path.join(monitoringPath, 'security-audit.ts'), {
            projectName: context.projectName
        });
        // Performance monitoring
        await this.templateService.renderTemplate('auth/performance-monitor.ts', path.join(monitoringPath, 'performance-monitor.ts'), {
            projectName: context.projectName
        });
    }
    async createAIFeatures(authPackagePath, context) {
        const aiPath = path.join(authPackagePath, 'lib', 'ai');
        await fsExtra.ensureDir(aiPath);
        // AI-powered fraud detection
        await this.templateService.renderTemplate('auth/ai-fraud-detection.ts', path.join(aiPath, 'fraud-detection.ts'), {
            projectName: context.projectName
        });
        // AI-powered risk assessment
        await this.templateService.renderTemplate('auth/ai-risk-assessment.ts', path.join(aiPath, 'risk-assessment.ts'), {
            projectName: context.projectName
        });
        // AI-powered user behavior analysis
        await this.templateService.renderTemplate('auth/ai-behavior-analysis.ts', path.join(aiPath, 'behavior-analysis.ts'), {
            projectName: context.projectName
        });
    }
    async createEnhancedAuthUtils(authPackagePath, context) {
        const utilsPath = path.join(authPackagePath, 'lib', 'utils');
        await fsExtra.ensureDir(utilsPath);
        // Enhanced auth utilities
        await this.templateService.renderTemplate('auth/enhanced-auth-utils.ts', path.join(utilsPath, 'enhanced.ts'), {
            projectName: context.projectName
        });
        // Provider utilities
        await this.templateService.renderTemplate('auth/provider-utils.ts', path.join(utilsPath, 'providers.ts'), {
            projectName: context.projectName
        });
        // Session utilities
        await this.templateService.renderTemplate('auth/session-utils.ts', path.join(utilsPath, 'session.ts'), {
            projectName: context.projectName
        });
        // Permission utilities
        await this.templateService.renderTemplate('auth/permission-utils.ts', path.join(utilsPath, 'permissions.ts'), {
            projectName: context.projectName
        });
    }
    async createDevUtilities(authPackagePath, context) {
        const devPath = path.join(authPackagePath, 'lib', 'dev');
        await fsExtra.ensureDir(devPath);
        // Development utilities
        await this.templateService.renderTemplate('auth/dev-utils.ts', path.join(devPath, 'utils.ts'), {
            projectName: context.projectName
        });
        // Auth playground
        await this.templateService.renderTemplate('auth/auth-playground.tsx', path.join(devPath, 'playground.tsx'), {
            projectName: context.projectName
        });
        // Testing utilities
        await this.templateService.renderTemplate('auth/testing-utils.ts', path.join(devPath, 'testing.ts'), {
            projectName: context.projectName
        });
    }
    // ============================================================================
    // FALLBACK MANUAL SETUP
    // ============================================================================
    async manualSetup(authPackagePath, context, authConfig) {
        context.logger.info('Performing manual auth setup...');
        // Update package.json with dependencies
        await this.updatePackageJson(authPackagePath, context);
        // Create ESLint config
        await this.createESLintConfig(authPackagePath);
        // Create auth configuration
        await this.createAuthConfig(authPackagePath, context, authConfig);
        // Create auth utilities
        await this.createAuthUtils(authPackagePath, context);
        // Create auth middleware
        await this.createAuthMiddleware(authPackagePath, context);
        // Create index exports
        await this.createIndex(authPackagePath);
        // Update environment configuration
        await this.updateEnvConfig(context.projectPath, authConfig, context);
    }
    // ============================================================================
    // ROLLBACK
    // ============================================================================
    async rollback(context) {
        const authPackagePath = path.join(context.projectPath, 'packages', 'auth');
        context.logger.info('Rolling back authentication package...');
        try {
            if (existsSync(authPackagePath)) {
                await fsExtra.remove(authPackagePath);
                context.logger.success('Authentication package removed');
            }
        }
        catch (error) {
            context.logger.error('Failed to rollback authentication package', error);
        }
    }
}
//# sourceMappingURL=auth-agent.js.map