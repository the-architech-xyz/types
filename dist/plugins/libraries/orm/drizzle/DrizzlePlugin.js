/**
 * Drizzle Plugin - Refactored with New Architecture
 *
 * Uses the new base classes and separated concerns:
 * - DrizzleSchema: Parameter schema and configuration
 * - DrizzleGenerator: File generation logic
 * - DrizzlePlugin: Main plugin class (this file)
 */
import { BaseDatabasePlugin } from '../../../base/index.js';
import { PluginCategory } from '../../../../types/plugin.js';
import { DrizzleSchema } from './DrizzleSchema.js';
import { DrizzleGenerator } from './DrizzleGenerator.js';
export class DrizzlePlugin extends BaseDatabasePlugin {
    generator;
    constructor() {
        super();
        this.generator = new DrizzleGenerator();
    }
    // ============================================================================
    // METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'drizzle',
            name: 'Drizzle ORM',
            version: '1.0.0',
            description: 'Modern TypeScript ORM for SQL databases',
            author: 'The Architech Team',
            category: PluginCategory.DATABASE,
            tags: ['orm', 'typescript', 'database'],
            license: 'MIT', // <-- Added missing property
        };
    }
    // ============================================================================
    // IMPLEMENTATION OF ABSTRACT METHODS
    // ============================================================================
    getParameterSchema() {
        return DrizzleSchema.getParameterSchema();
    }
    getDatabaseProviders() {
        return DrizzleSchema.getDatabaseProviders();
    }
    getORMOptions() {
        return DrizzleSchema.getORMOptions();
    }
    getDatabaseFeatures() {
        return DrizzleSchema.getDatabaseFeatures();
    }
    // Making methods public to match base class
    getProviderLabel(provider) {
        return DrizzleSchema.getProviderLabel(provider);
    }
    getFeatureLabel(feature) {
        return DrizzleSchema.getFeatureLabel(feature);
    }
    // Implemented missing abstract methods
    getConnectionOptions(provider) {
        // Return specific connection options based on provider
        return [];
    }
    getProviderDescription(provider) {
        return DrizzleSchema.getProviderDescription(provider);
    }
    getFeatureDescription(feature) {
        return DrizzleSchema.getFeatureDescription(feature);
    }
    generateUnifiedInterface(config) {
        const generated = this.generator.generateUnifiedInterface(config); // <-- Cast to correct type
        return {
            category: PluginCategory.DATABASE,
            exports: [],
            types: [],
            utilities: [],
            constants: [],
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
            // 2. Use BasePlugin to write files
            for (const file of allFiles) {
                // Correctly determine if it's a root config or a lib file
                const isRootConfig = file.path === 'drizzle.config.ts';
                const filePath = isRootConfig
                    ? this.pathResolver.getConfigPath(file.path)
                    : this.pathResolver.getLibPath('db', file.path.replace('db/', ''));
                await this.generateFile(filePath, file.content);
            }
            // 3. Add dependencies
            await this.installDependencies(['drizzle-orm', 'postgres'], ['drizzle-kit', 'dotenv']);
            // 4. Add scripts
            const scripts = this.generator.generateScripts(config);
            await this.addScripts(scripts);
            // 5. Add environment variables
            const envVars = this.generator.generateEnvVars(config);
            // await this.addEnvVariables(envVars); // Assuming a method exists in BasePlugin
            return this.createSuccessResult([], [], Object.entries(scripts).map(([name, command]) => ({ name, command })), [], [], startTime);
        }
        catch (error) {
            return this.createErrorResult('Drizzle installation failed', [error], startTime);
        }
    }
}
//# sourceMappingURL=DrizzlePlugin.js.map