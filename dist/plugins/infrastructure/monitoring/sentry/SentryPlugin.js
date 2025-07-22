/**
 * Sentry Monitoring Plugin - Pure Technology Implementation
 *
 * Provides Sentry error tracking and performance monitoring setup.
 * Focuses only on monitoring technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../../../types/plugin.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { SentryConfigSchema, SentryDefaultConfig } from './SentrySchema.js';
import { SentryGenerator } from './SentryGenerator.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
export class SentryPlugin {
    runner;
    constructor() {
        this.runner = new CommandRunner();
    }
    getMetadata() {
        return {
            id: 'sentry',
            name: 'Sentry Monitoring',
            version: '1.0.0',
            description: 'Error tracking and performance monitoring with Sentry',
            author: 'The Architech Team',
            category: PluginCategory.MONITORING,
            tags: ['monitoring', 'error-tracking', 'performance', 'sentry', 'analytics'],
            license: 'MIT',
            repository: 'https://github.com/getsentry/sentry-javascript',
            homepage: 'https://sentry.io',
            documentation: 'https://docs.sentry.io'
        };
    }
    async validate(context) {
        const errors = [];
        const config = context.pluginConfig;
        if (!config.dsn) {
            errors.push({ field: 'dsn', message: 'Sentry DSN is required.', code: 'MISSING_DSN', severity: 'error' });
        }
        if (config.enableSourceMaps && (!config.authToken || !config.org || !config.project)) {
            errors.push({ field: 'sourceMaps', message: 'Auth token, organization, and project are required for source map uploading.', code: 'MISSING_SOURCEMAP_CONFIG', severity: 'error' });
        }
        return { valid: errors.length === 0, errors, warnings: [] };
    }
    async install(context) {
        const startTime = Date.now();
        try {
            await this.installDependencies(context);
            await this.createProjectFiles(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    { type: 'file', path: 'sentry.client.config.ts' },
                    { type: 'file', path: 'sentry.server.config.ts' },
                    { type: 'file', path: 'next.config.sentry.js' },
                ],
                dependencies: [{ name: '@sentry/nextjs', version: '^7.0.0', type: 'production', category: PluginCategory.MONITORING }],
                scripts: [],
                configs: [{
                        file: '.env',
                        content: SentryGenerator.generateEnvConfig(context.pluginConfig),
                        mergeStrategy: 'append'
                    }],
                errors: [],
                warnings: ['Sentry integration requires manual wrapping of your Next.js config. A `next.config.sentry.js` file has been created as a reference.'],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install Sentry plugin', startTime, error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            await this.runner.execCommand(['npm', 'uninstall', '@sentry/nextjs'], { cwd: context.projectPath });
            const filesToRemove = ['sentry.client.config.ts', 'sentry.server.config.ts', 'next.config.sentry.js'];
            for (const file of filesToRemove) {
                const filePath = path.join(context.projectPath, file);
                if (await fsExtra.pathExists(filePath)) {
                    await fsExtra.remove(filePath);
                }
            }
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: ['Sentry files and dependencies have been removed.'],
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall Sentry plugin', startTime, error);
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
        return ['@sentry/nextjs'];
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            { type: 'package', name: '@sentry/nextjs', description: 'The Sentry SDK for Next.js.', version: '^7.0.0' },
            { type: 'config', name: 'SENTRY_DSN', description: 'Your Sentry Data Source Name.', optional: false },
        ];
    }
    getDefaultConfig() {
        return SentryDefaultConfig;
    }
    getConfigSchema() {
        return SentryConfigSchema;
    }
    async installDependencies(context) {
        await this.runner.execCommand(['npm', 'install', '@sentry/nextjs'], { cwd: context.projectPath });
    }
    async createProjectFiles(context) {
        const { projectPath, pluginConfig } = context;
        const config = pluginConfig;
        await fsExtra.writeFile(path.join(projectPath, 'sentry.client.config.ts'), SentryGenerator.generateSentryClientConfig(config));
        await fsExtra.writeFile(path.join(projectPath, 'sentry.server.config.ts'), SentryGenerator.generateSentryServerConfig(config));
        if (config.enableSourceMaps) {
            await fsExtra.writeFile(path.join(projectPath, 'next.config.sentry.js'), SentryGenerator.generateNextConfig(config));
        }
    }
    createErrorResult(message, startTime, error) {
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [{ code: 'SENTRY_PLUGIN_ERROR', message, details: error, severity: 'error' }],
            warnings: [],
            duration: Date.now() - startTime
        };
    }
}
//# sourceMappingURL=SentryPlugin.js.map