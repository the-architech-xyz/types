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
import { BaseAuthPlugin } from '../../../base/index.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { NextAuthSchema } from './NextAuthSchema.js';
import { NextAuthGenerator } from './NextAuthGenerator.js';
export class NextAuthPlugin extends BaseAuthPlugin {
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
    // ABSTRACT METHOD IMPLEMENTATIONS
    // ============================================================================
    getParameterSchema() {
        return NextAuthSchema.getParameterSchema();
    }
    getAuthProviders() {
        return NextAuthSchema.getAuthProviders();
    }
    getAuthFeatures() {
        return NextAuthSchema.getAuthFeatures();
    }
    getSessionOptions() { return []; }
    getSecurityOptions() { return []; }
    getProviderLabel(provider) {
        return NextAuthSchema.getProviderLabel(provider);
    }
    getFeatureLabel(feature) {
        return feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
    generateUnifiedInterface(config) {
        const generated = this.generator.generateUnifiedIndex();
        return {
            category: PluginCategory.AUTHENTICATION,
            exports: [], types: [], utilities: [], constants: [],
            documentation: generated.content,
        };
    }
    // ============================================================================
    // MAIN INSTALL METHOD
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        const config = context.pluginConfig;
        try {
            // 1. Generate all file contents
            const allFiles = this.generator.generateAllFiles(config);
            // 2. Use BasePlugin methods to write files
            for (const file of allFiles) {
                let filePath;
                if (file.path.startsWith('auth/')) {
                    filePath = this.pathResolver.getLibPath('auth', file.path.replace('auth/', ''));
                }
                else if (file.path.startsWith('prisma/')) {
                    // Special handling for prisma schema
                    filePath = this.pathResolver.getConfigPath('prisma/schema.prisma');
                }
                else {
                    filePath = this.pathResolver.getConfigPath(file.path);
                }
                await this.generateFile(filePath, file.content);
            }
            // 3. Add dependencies
            await this.installDependencies(['next-auth', '@auth/prisma-adapter', '@prisma/client', 'bcryptjs'], ['prisma']);
            // 4. Add scripts
            await this.addScripts({
                "prisma:generate": "prisma generate"
            });
            return this.createSuccessResult([], [], [], [], [], startTime);
        }
        catch (error) {
            return this.createErrorResult('NextAuth.js installation failed', [error], startTime);
        }
    }
}
//# sourceMappingURL=NextAuthPlugin.js.map