/**
 * Prisma ORM Plugin - Updated with Latest Best Practices
 *
 * Provides Prisma ORM integration with multiple database providers.
 * Follows latest Prisma documentation and TypeScript best practices.
 *
 * References:
 * - https://www.prisma.io/docs/getting-started
 * - https://www.prisma.io/docs/concepts/components/prisma-schema
 * - https://www.prisma.io/docs/concepts/components/prisma-client
 * - https://www.prisma.io/docs/guides/performance-and-optimization
 */
import { BaseDatabasePlugin } from '../../../base/index.js';
import { PluginCategory } from '../../../../types/plugin.js';
import { DatabaseProvider, ORMOption, DatabaseFeature } from '../../../../types/plugin-interfaces.js';
import { PrismaSchema } from './PrismaSchema.js';
import { PrismaGenerator } from './PrismaGenerator.js';
export class PrismaPlugin extends BaseDatabasePlugin {
    generator;
    constructor() {
        super();
        this.generator = new PrismaGenerator();
    }
    // ============================================================================
    // METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'prisma',
            name: 'Prisma ORM',
            version: '1.0.0',
            description: 'Next-generation ORM for Node.js and TypeScript',
            author: 'The Architech Team',
            category: PluginCategory.ORM,
            tags: ['orm', 'database', 'typescript'],
            license: 'MIT',
        };
    }
    // ============================================================================
    // ABSTRACT METHOD IMPLEMENTATIONS
    // ============================================================================
    getParameterSchema() {
        return PrismaSchema.getParameterSchema();
    }
    getDatabaseProviders() {
        return PrismaSchema.getDatabaseProviders();
    }
    getORMOptions() {
        return [ORMOption.PRISMA];
    }
    getDatabaseFeatures() {
        return [DatabaseFeature.MIGRATIONS, DatabaseFeature.SEEDING];
    }
    getConnectionOptions(provider) {
        return []; // Prisma uses a single DATABASE_URL
    }
    getProviderLabel(provider) {
        const labels = {
            [DatabaseProvider.NEON]: 'Neon',
            [DatabaseProvider.SUPABASE]: 'Supabase',
            [DatabaseProvider.MONGODB]: 'MongoDB',
            [DatabaseProvider.PLANETSCALE]: 'PlanetScale',
            [DatabaseProvider.LOCAL]: 'Local SQLite'
        };
        return labels[provider] || provider;
    }
    getProviderDescription(provider) {
        return `Use ${this.getProviderLabel(provider)} with Prisma.`;
    }
    getFeatureLabel(feature) {
        const labels = {
            [DatabaseFeature.MIGRATIONS]: 'Migrations',
            [DatabaseFeature.SEEDING]: 'Database Seeding'
        };
        return labels[feature] || feature;
    }
    getFeatureDescription(feature) {
        const descriptions = {
            [DatabaseFeature.MIGRATIONS]: 'Enable `prisma migrate` to manage your database schema.',
            [DatabaseFeature.SEEDING]: 'Enable a `seed.ts` file to populate your database with initial data.'
        };
        return descriptions[feature] || `Enable the ${feature} feature.`;
    }
    generateUnifiedInterface(config) {
        const generated = this.generator.generateUnifiedIndex();
        return {
            category: PluginCategory.ORM,
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
            const allFiles = this.generator.generateAllFiles(config);
            for (const file of allFiles) {
                let filePath;
                if (file.path.startsWith('prisma/')) {
                    filePath = this.pathResolver.getConfigPath(file.path, true); // Place in module dir
                }
                else {
                    filePath = this.pathResolver.getLibPath('db', file.path.replace('db/', ''));
                }
                await this.generateFile(filePath, file.content);
            }
            await this.installDependencies(['@prisma/client'], ['prisma', 'tsx']);
            const scripts = this.generator.generateScripts(config);
            await this.addScripts(scripts);
            const envVars = this.generator.generateEnvConfig(config);
            // await this.addEnvVariables(envVars);
            return this.createSuccessResult([], [], Object.entries(scripts).map(([name, command]) => ({ name, command })), [], [], startTime);
        }
        catch (error) {
            return this.createErrorResult('Prisma installation failed', [error], startTime);
        }
    }
}
//# sourceMappingURL=PrismaPlugin.js.map