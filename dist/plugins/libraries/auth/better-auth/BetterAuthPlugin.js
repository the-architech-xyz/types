/**
 * Better Auth Plugin - Updated with Latest Best Practices
 *
 * Provides Better Auth authentication integration using the official @better-auth/cli.
 * Follows latest Better Auth documentation and TypeScript best practices.
 *
 * References:
 * - https://better-auth.com/docs
 * - https://better-auth.com/docs/providers
 * - https://better-auth.com/docs/adapters
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { BetterAuthSchema } from './BetterAuthSchema.js';
import { BetterAuthGenerator } from './BetterAuthGenerator.js';
import path from 'path';
export class BetterAuthPlugin extends BasePlugin {
    generator;
    constructor() {
        super();
        this.generator = new BetterAuthGenerator();
    }
    // ============================================================================
    // METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'better-auth',
            name: 'Better Auth',
            version: '1.0.0',
            description: 'Modern, secure authentication library',
            author: 'The Architech Team',
            category: PluginCategory.AUTHENTICATION,
            tags: ['auth', 'security', 'oauth'],
            license: 'MIT',
        };
    }
    // ============================================================================
    // ENHANCED PLUGIN INTERFACE IMPLEMENTATION
    // ============================================================================
    getParameterSchema() {
        return BetterAuthSchema.getParameterSchema();
    }
    validateConfiguration(config) {
        const errors = [];
        const warnings = [];
        // Validate required fields
        if (!config.providers || config.providers.length === 0) {
            errors.push({
                field: 'providers',
                message: 'At least one auth provider is required',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        // Validate session configuration
        if (config.session && config.session.duration && config.session.duration < 300) {
            warnings.push('Session duration should be at least 5 minutes (300 seconds)');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    generateUnifiedInterface(config) {
        const generated = this.generator.generateUnifiedIndex();
        return {
            category: PluginCategory.AUTHENTICATION,
            exports: [
                {
                    name: 'auth',
                    type: 'constant',
                    implementation: 'Authentication instance',
                    documentation: 'Main authentication object',
                    examples: ['import { auth } from "@/lib/auth"']
                },
                {
                    name: 'signIn',
                    type: 'function',
                    implementation: 'Sign in function',
                    documentation: 'Sign in with a provider',
                    examples: ['await signIn("google")']
                },
                {
                    name: 'signOut',
                    type: 'function',
                    implementation: 'Sign out function',
                    documentation: 'Sign out the current user',
                    examples: ['await signOut()']
                }
            ],
            types: [
                {
                    name: 'User',
                    type: 'interface',
                    definition: 'interface User { id: string; email: string; name?: string; }',
                    documentation: 'User interface'
                },
                {
                    name: 'Session',
                    type: 'interface',
                    definition: 'interface Session { user: User; expires: Date; }',
                    documentation: 'Session interface'
                }
            ],
            utilities: [
                {
                    name: 'getSession',
                    type: 'function',
                    implementation: 'Get current session',
                    documentation: 'Get the current user session',
                    parameters: [],
                    returnType: 'Promise<Session | null>',
                    examples: ['const session = await getSession()']
                }
            ],
            constants: [
                {
                    name: 'AUTH_SECRET',
                    value: 'process.env.AUTH_SECRET',
                    documentation: 'Authentication secret key',
                    type: 'string'
                }
            ],
            documentation: generated.content || 'Better Auth unified interface for authentication'
        };
    }
    // ============================================================================
    // AUTH PLUGIN INTERFACE IMPLEMENTATION
    // ============================================================================
    getAuthProviders() {
        return ['email', 'google', 'github', 'discord', 'twitter', 'facebook', 'apple'];
    }
    getAuthFeatures() {
        return ['email_verification', 'password_reset', 'two_factor', 'social_login', 'session_management'];
    }
    getSessionOptions() {
        return ['jwt', 'database', 'redis'];
    }
    getSecurityOptions() {
        return ['csrf_protection', 'rate_limiting', 'password_hashing', 'session_encryption'];
    }
    // ============================================================================
    // PLUGIN INSTALLATION
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            // Initialize path resolver
            this.initializePathResolver(context);
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
            const allFiles = this.generator.generateAllFiles(config);
            for (const file of allFiles) {
                const filePath = this.pathResolver.getLibPath('auth', file.path.replace('auth/', ''));
                await this.generateFile(filePath, file.content);
            }
            // Handle API routes for Next.js
            const routeContent = this.generator.generateAuthConfig(config);
            await this.setupAuthRoutes(context, routeContent.content);
            // Generate environment variables
            const envVars = this.generator.generateEnvConfig(config);
            return this.createSuccessResult([
                { type: 'config', path: 'auth.config.ts', description: 'Better Auth configuration' },
                { type: 'api', path: 'app/api/auth/[...auth]/route.ts', description: 'Auth API routes' },
                { type: 'interface', path: this.pathResolver.getUnifiedInterfacePath('auth'), description: 'Unified auth interface' }
            ], dependencies, [], [
                { type: 'env', content: envVars, description: 'Auth environment variables' }
            ], validation.warnings, startTime);
        }
        catch (error) {
            return this.createErrorResult('Better Auth plugin installation failed', [error], startTime);
        }
    }
    // ============================================================================
    // DEPENDENCIES AND CONFIGURATION
    // ============================================================================
    getDependencies() {
        return [
            'better-auth',
            '@better-auth/drizzle-adapter',
            '@better-auth/utils'
        ];
    }
    getDevDependencies() {
        return ['@types/node'];
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'svelte'],
            platforms: ['node', 'browser'],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: ['nextauth', 'clerk']
        };
    }
    getConflicts() {
        return ['nextauth', 'clerk'];
    }
    getRequirements() {
        return [
            { type: 'database', name: 'Database for user storage' },
            { type: 'node', version: '>=16.0.0' }
        ];
    }
    getDefaultConfig() {
        return {
            providers: ['email'],
            session: {
                strategy: 'jwt',
                duration: 604800 // 7 days
            },
            features: ['email_verification']
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                providers: { type: 'array', items: { type: 'string' } },
                session: { type: 'object' },
                features: { type: 'array', items: { type: 'string' } }
            },
            required: ['providers']
        };
    }
    // ============================================================================
    // HELPER METHODS
    // ============================================================================
    async setupAuthRoutes(context, content) {
        const routePath = path.join(this.pathResolver['context'].projectPath, 'app', 'api', 'auth', '[...auth]', 'route.ts');
        await this.generateFile(routePath, content);
    }
}
//# sourceMappingURL=BetterAuthPlugin.js.map