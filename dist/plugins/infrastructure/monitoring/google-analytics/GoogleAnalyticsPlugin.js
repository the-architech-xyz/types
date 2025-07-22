import { PluginCategory, TargetPlatform } from '../../../../types/plugin.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { GoogleAnalyticsConfigSchema, GoogleAnalyticsDefaultConfig } from './GoogleAnalyticsSchema.js';
import { GoogleAnalyticsGenerator } from './GoogleAnalyticsGenerator.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
export class GoogleAnalyticsPlugin {
    runner;
    constructor() {
        this.runner = new CommandRunner();
    }
    getMetadata() {
        return {
            id: 'google-analytics',
            name: 'Google Analytics',
            version: '1.0.0',
            description: 'Web analytics and tracking with Google Analytics 4',
            author: 'The Architech Team',
            category: PluginCategory.MONITORING,
            tags: ['monitoring', 'analytics', 'tracking', 'google', 'ga4'],
            license: 'MIT',
            repository: 'https://github.com/googleanalytics/ga-dev-tools',
            homepage: 'https://analytics.google.com',
            documentation: 'https://developers.google.com/analytics'
        };
    }
    async validate(context) {
        const errors = [];
        const config = context.pluginConfig;
        if (!config.measurementId) {
            errors.push({ field: 'measurementId', message: 'Google Analytics Measurement ID is required.', code: 'MISSING_MEASUREMENT_ID', severity: 'error' });
        }
        return { valid: errors.length === 0, errors, warnings: [] };
    }
    async install(context) {
        const startTime = Date.now();
        try {
            await this.createProjectFiles(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    { type: 'file', path: 'src/lib/gtag.ts' },
                    { type: 'file', path: 'src/components/GoogleAnalyticsProvider.tsx' },
                ],
                dependencies: [],
                scripts: [],
                configs: [{
                        file: '.env',
                        content: GoogleAnalyticsGenerator.generateEnvConfig(context.pluginConfig),
                        mergeStrategy: 'append'
                    }],
                errors: [],
                warnings: ['Google Analytics integration requires you to wrap your application with the GoogleAnalyticsProvider.'],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install Google Analytics plugin', startTime, error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const filesToRemove = [
                path.join(context.projectPath, 'src', 'lib', 'gtag.ts'),
                path.join(context.projectPath, 'src', 'components', 'GoogleAnalyticsProvider.tsx'),
            ];
            for (const file of filesToRemove) {
                if (await fsExtra.pathExists(file)) {
                    await fsExtra.remove(file);
                }
            }
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: ['Google Analytics files have been removed.'],
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall Google Analytics plugin', startTime, error);
        }
    }
    async update(context) {
        return this.install(context);
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs'],
            platforms: [TargetPlatform.WEB],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: []
        };
    }
    getDependencies() {
        return [];
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            { type: 'config', name: 'NEXT_PUBLIC_GA_ID', description: 'Your Google Analytics Measurement ID.', optional: false },
        ];
    }
    getDefaultConfig() {
        return GoogleAnalyticsDefaultConfig;
    }
    getConfigSchema() {
        return GoogleAnalyticsConfigSchema;
    }
    async createProjectFiles(context) {
        const { projectPath, pluginConfig } = context;
        const config = pluginConfig;
        const libDir = path.join(projectPath, 'src', 'lib');
        await fsExtra.ensureDir(libDir);
        await fsExtra.writeFile(path.join(libDir, 'gtag.ts'), GoogleAnalyticsGenerator.generateGtagHelper(config));
        const componentsDir = path.join(projectPath, 'src', 'components');
        await fsExtra.ensureDir(componentsDir);
        await fsExtra.writeFile(path.join(componentsDir, 'GoogleAnalyticsProvider.tsx'), GoogleAnalyticsGenerator.generateAnalyticsProvider(config));
    }
    createErrorResult(message, startTime, error) {
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [{ code: 'GA_PLUGIN_ERROR', message, details: error, severity: 'error' }],
            warnings: [],
            duration: Date.now() - startTime
        };
    }
}
//# sourceMappingURL=GoogleAnalyticsPlugin.js.map