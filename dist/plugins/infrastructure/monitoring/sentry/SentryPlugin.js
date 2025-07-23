/**
 * Sentry Monitoring Plugin - Pure Technology Implementation
 *
 * Provides Sentry error tracking and performance monitoring setup.
 * Focuses only on monitoring technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { SentryConfigSchema } from './SentrySchema.js';
import { SentryGenerator } from './SentryGenerator.js';
export class SentryPlugin extends BasePlugin {
    generator;
    constructor() {
        super();
        // Generator will be initialized in install method when pathResolver is available
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'sentry',
            name: 'Sentry Monitoring',
            version: '1.0.0',
            description: 'Error tracking and performance monitoring with Sentry',
            author: 'The Architech Team',
            category: PluginCategory.MONITORING,
            tags: ['monitoring', 'error-tracking', 'performance', 'sentry', 'analytics', 'crash-reporting'],
            license: 'MIT',
            repository: 'https://github.com/getsentry/sentry-javascript',
            homepage: 'https://sentry.io',
            documentation: 'https://docs.sentry.io'
        };
    }
    // ============================================================================
    // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getParameterSchema() {
        return {
            category: PluginCategory.MONITORING,
            groups: [
                { id: 'connection', name: 'Connection Settings', description: 'Configure Sentry connection.', order: 1, parameters: ['dsn', 'environment', 'release'] },
                { id: 'sampling', name: 'Sampling Settings', description: 'Configure sampling rates.', order: 2, parameters: ['tracesSampleRate', 'replaysSessionSampleRate', 'replaysOnErrorSampleRate'] },
                { id: 'sourcemaps', name: 'Source Maps', description: 'Configure source map uploading.', order: 3, parameters: ['enableSourceMaps', 'authToken', 'org', 'project'] }
            ],
            parameters: [
                {
                    id: 'dsn',
                    name: 'DSN',
                    type: 'string',
                    description: 'Your Sentry Data Source Name (DSN).',
                    required: true,
                    group: 'connection'
                },
                {
                    id: 'environment',
                    name: 'Environment',
                    type: 'string',
                    description: 'The environment of your application (e.g., development, staging, production).',
                    required: true,
                    default: 'development',
                    group: 'connection'
                },
                {
                    id: 'release',
                    name: 'Release',
                    type: 'string',
                    description: 'The release version of your application.',
                    required: false,
                    group: 'connection'
                },
                {
                    id: 'tracesSampleRate',
                    name: 'Traces Sample Rate',
                    type: 'number',
                    description: 'The percentage of transactions to send to Sentry (0.0 to 1.0).',
                    required: false,
                    default: 1.0,
                    group: 'sampling'
                },
                {
                    id: 'replaysSessionSampleRate',
                    name: 'Session Replay Rate',
                    type: 'number',
                    description: 'The percentage of sessions to record for session replay (0.0 to 1.0).',
                    required: false,
                    default: 0.1,
                    group: 'sampling'
                },
                {
                    id: 'replaysOnErrorSampleRate',
                    name: 'Error Replay Rate',
                    type: 'number',
                    description: 'The percentage of sessions with errors to record for session replay (0.0 to 1.0).',
                    required: false,
                    default: 1.0,
                    group: 'sampling'
                },
                {
                    id: 'enableSourceMaps',
                    name: 'Enable Source Maps',
                    type: 'boolean',
                    description: 'Enable source map generation and uploading.',
                    required: false,
                    default: true,
                    group: 'sourcemaps'
                },
                {
                    id: 'authToken',
                    name: 'Auth Token',
                    type: 'string',
                    description: 'Your Sentry authentication token for uploading source maps.',
                    required: false,
                    group: 'sourcemaps'
                },
                {
                    id: 'org',
                    name: 'Organization',
                    type: 'string',
                    description: 'Your Sentry organization slug.',
                    required: false,
                    group: 'sourcemaps'
                },
                {
                    id: 'project',
                    name: 'Project',
                    type: 'string',
                    description: 'Your Sentry project slug.',
                    required: false,
                    group: 'sourcemaps'
                }
            ],
            dependencies: [],
            validations: []
        };
    }
    validateConfiguration(config) {
        const errors = [];
        const warnings = [];
        // Validate required fields
        if (!config.dsn) {
            errors.push({
                field: 'dsn',
                message: 'Sentry DSN is required',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        if (!config.environment) {
            errors.push({
                field: 'environment',
                message: 'Environment is required',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        // Validate source map configuration
        if (config.enableSourceMaps && (!config.authToken || !config.org || !config.project)) {
            errors.push({
                field: 'sourceMaps',
                message: 'Auth token, organization, and project are required for source map uploading',
                code: 'MISSING_SOURCEMAP_CONFIG',
                severity: 'error'
            });
        }
        // Validate sampling rates
        if (config.tracesSampleRate && (config.tracesSampleRate < 0 || config.tracesSampleRate > 1)) {
            warnings.push('Traces sample rate should be between 0.0 and 1.0');
        }
        if (config.replaysSessionSampleRate && (config.replaysSessionSampleRate < 0 || config.replaysSessionSampleRate > 1)) {
            warnings.push('Session replay sample rate should be between 0.0 and 1.0');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    generateUnifiedInterface(config) {
        return {
            category: PluginCategory.MONITORING,
            exports: [
                {
                    name: 'sentry',
                    type: 'constant',
                    implementation: 'Sentry configuration',
                    documentation: 'Sentry error tracking and performance monitoring configuration'
                },
                {
                    name: 'SentryClient',
                    type: 'class',
                    implementation: 'Sentry client configuration',
                    documentation: 'Sentry client-side configuration for browser'
                },
                {
                    name: 'SentryServer',
                    type: 'class',
                    implementation: 'Sentry server configuration',
                    documentation: 'Sentry server-side configuration for Node.js'
                }
            ],
            types: [],
            utilities: [],
            constants: [],
            documentation: 'Sentry error tracking and performance monitoring integration'
        };
    }
    // ============================================================================
    // IUIMonitoringPlugin INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getMonitoringServices() {
        return ['sentry', 'error-tracking', 'performance-monitoring'];
    }
    getAnalyticsOptions() {
        return ['error-tracking', 'performance-monitoring', 'session-replay', 'crash-reporting'];
    }
    getAlertOptions() {
        return ['error-alerts', 'performance-alerts', 'crash-alerts', 'custom-alerts'];
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Sentry monitoring...');
            // Initialize path resolver
            this.initializePathResolver(context);
            // Initialize generator
            this.generator = new SentryGenerator();
            // Validate configuration
            const validation = this.validateConfiguration(pluginConfig);
            if (!validation.valid) {
                return this.createErrorResult('Invalid Sentry configuration', validation.errors, startTime);
            }
            // Step 1: Install dependencies
            await this.installDependencies(['@sentry/nextjs']);
            // Step 2: Generate files using the generator
            const sentryClientConfig = SentryGenerator.generateSentryClientConfig(pluginConfig);
            const sentryServerConfig = SentryGenerator.generateSentryServerConfig(pluginConfig);
            const envConfig = SentryGenerator.generateEnvConfig(pluginConfig);
            // Step 3: Write files to project
            await this.generateFile('sentry.client.config.ts', sentryClientConfig);
            await this.generateFile('sentry.server.config.ts', sentryServerConfig);
            await this.generateFile('.env.local', envConfig);
            // Step 4: Generate Next.js config if source maps are enabled
            if (pluginConfig.enableSourceMaps) {
                const nextConfig = SentryGenerator.generateNextConfig(pluginConfig);
                await this.generateFile('next.config.sentry.js', nextConfig);
            }
            const duration = Date.now() - startTime;
            return this.createSuccessResult([
                { type: 'file', path: 'sentry.client.config.ts' },
                { type: 'file', path: 'sentry.server.config.ts' },
                { type: 'file', path: '.env.local' },
                ...(pluginConfig.enableSourceMaps ? [{ type: 'file', path: 'next.config.sentry.js' }] : [])
            ], [
                {
                    name: '@sentry/nextjs',
                    version: '^7.0.0',
                    type: 'production',
                    category: PluginCategory.MONITORING
                }
            ], [], [], [
                'Sentry integration requires manual wrapping of your Next.js config. A `next.config.sentry.js` file has been created as a reference.',
                ...validation.warnings
            ], startTime);
        }
        catch (error) {
            return this.createErrorResult('Failed to install Sentry monitoring', [], startTime);
        }
    }
    // ============================================================================
    // PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getDependencies() {
        return ['@sentry/nextjs'];
    }
    getDevDependencies() {
        return [];
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'svelte'],
            platforms: ['web', 'server'],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: []
        };
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: '@sentry/nextjs',
                description: 'The Sentry SDK for Next.js.',
                version: '^7.0.0'
            },
            {
                type: 'config',
                name: 'SENTRY_DSN',
                description: 'Your Sentry Data Source Name.',
                optional: false
            }
        ];
    }
    getDefaultConfig() {
        return {
            dsn: '',
            environment: 'development',
            release: '',
            tracesSampleRate: 1.0,
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
            enableSourceMaps: true,
            authToken: '',
            org: '',
            project: ''
        };
    }
    getConfigSchema() {
        return SentryConfigSchema;
    }
}
//# sourceMappingURL=SentryPlugin.js.map