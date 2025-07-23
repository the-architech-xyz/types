/**
 * NextAuth Plugin - Updated with Latest Best Practices
 *
 * Provides NextAuth authentication integration using the official NextAuth.js.
 * Follows latest NextAuth documentation and TypeScript best practices.
 *
 * References:
 * - https://next-auth.js.org/configuration
 * - https://next-auth.js.org/providers
 * - https://next-auth.js.org/adapters
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { NextAuthSchema } from './NextAuthSchema.js';
import { NextAuthGenerator } from './NextAuthGenerator.js';
export class NextAuthPlugin extends BasePlugin {
    generator;
    constructor() {
        super();
        this.generator = new NextAuthGenerator();
    }
    // ============================================================================
    // METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'next-auth',
            name: 'NextAuth.js',
            version: '1.0.0',
            description: 'Authentication for Next.js',
            author: 'The Architech Team',
            category: PluginCategory.AUTHENTICATION,
            tags: ['auth', 'nextjs', 'oauth'],
            license: 'ISC',
        };
    }
    // ============================================================================
    // ENHANCED PLUGIN INTERFACE IMPLEMENTATION
    // ============================================================================
    getParameterSchema() {
        return NextAuthSchema.getParameterSchema();
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
                    name: 'getServerSession',
                    type: 'function',
                    implementation: 'Get server session',
                    documentation: 'Get session on the server side',
                    examples: ['const session = await getServerSession(req, res, authOptions)']
                },
                {
                    name: 'useSession',
                    type: 'function',
                    implementation: 'Use session hook',
                    documentation: 'React hook for client-side session',
                    examples: ['const { data: session } = useSession()']
                }
            ],
            types: [
                {
                    name: 'Session',
                    type: 'interface',
                    definition: 'interface Session { user: User; expires: string; }',
                    documentation: 'NextAuth session interface'
                },
                {
                    name: 'User',
                    type: 'interface',
                    definition: 'interface User { id: string; email: string; name?: string; image?: string; }',
                    documentation: 'NextAuth user interface'
                }
            ],
            utilities: [
                {
                    name: 'signIn',
                    type: 'function',
                    implementation: 'Sign in function',
                    documentation: 'Sign in with a provider',
                    parameters: [],
                    returnType: 'Promise<void>',
                    examples: ['await signIn("google")']
                },
                {
                    name: 'signOut',
                    type: 'function',
                    implementation: 'Sign out function',
                    documentation: 'Sign out the current user',
                    parameters: [],
                    returnType: 'Promise<void>',
                    examples: ['await signOut()']
                }
            ],
            constants: [
                {
                    name: 'NEXTAUTH_SECRET',
                    value: 'process.env.NEXTAUTH_SECRET',
                    documentation: 'NextAuth secret key',
                    type: 'string'
                }
            ],
            documentation: generated.content || 'NextAuth.js unified interface for authentication'
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
        return ['jwt', 'database'];
    }
    getSecurityOptions() {
        return ['csrf_protection', 'rate_limiting', 'password_hashing'];
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
                let filePath;
                if (file.path.startsWith('auth/')) {
                    filePath = this.pathResolver.getLibPath('auth', file.path.replace('auth/', ''));
                }
                else if (file.path.startsWith('prisma/')) {
                    filePath = this.pathResolver.getConfigPath('prisma/schema.prisma');
                }
                else {
                    filePath = this.pathResolver.getConfigPath(file.path);
                }
                await this.generateFile(filePath, file.content);
            }
            // Add scripts
            await this.addScripts({
                "prisma:generate": "prisma generate"
            });
            return this.createSuccessResult([
                { type: 'config', path: 'auth.config.ts', description: 'NextAuth configuration' },
                { type: 'api', path: 'app/api/auth/[...nextauth]/route.ts', description: 'NextAuth API routes' },
                { type: 'interface', path: this.pathResolver.getUnifiedInterfacePath('auth'), description: 'Unified auth interface' }
            ], dependencies, ['prisma:generate'], [], validation.warnings, startTime);
        }
        catch (error) {
            return this.createErrorResult('NextAuth plugin installation failed', [error], startTime);
        }
    }
    // ============================================================================
    // DEPENDENCIES AND CONFIGURATION
    // ============================================================================
    getDependencies() {
        return ['next-auth', '@auth/prisma-adapter', '@prisma/client', 'bcryptjs'];
    }
    getDevDependencies() {
        return ['prisma'];
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react'],
            platforms: ['node', 'browser'],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: ['better-auth', 'clerk']
        };
    }
    getConflicts() {
        return ['better-auth', 'clerk'];
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
                maxAge: 604800 // 7 days
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
}
//# sourceMappingURL=NextAuthPlugin.js.map