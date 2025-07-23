/**
 * Google Analytics Monitoring Plugin - Pure Technology Implementation
 *
 * Provides Google Analytics 4 monitoring and tracking setup.
 * Focuses only on monitoring technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { GoogleAnalyticsConfigSchema } from './GoogleAnalyticsSchema.js';
import { GoogleAnalyticsGenerator } from './GoogleAnalyticsGenerator.js';
export class GoogleAnalyticsPlugin extends BasePlugin {
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
            id: 'google-analytics',
            name: 'Google Analytics',
            version: '1.0.0',
            description: 'Web analytics and tracking with Google Analytics 4',
            author: 'The Architech Team',
            category: PluginCategory.MONITORING,
            tags: ['monitoring', 'analytics', 'tracking', 'google', 'ga4', 'web-analytics'],
            license: 'MIT',
            repository: 'https://github.com/googleanalytics/ga-dev-tools',
            homepage: 'https://analytics.google.com',
            documentation: 'https://developers.google.com/analytics'
        };
    }
    // ============================================================================
    // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getParameterSchema() {
        return {
            category: PluginCategory.MONITORING,
            groups: [
                { id: 'tracking', name: 'Tracking Settings', description: 'Configure Google Analytics tracking.', order: 1, parameters: ['measurementId', 'enableEcommerce', 'debugMode'] },
                { id: 'events', name: 'Event Tracking', description: 'Configure custom event tracking.', order: 2, parameters: ['enableCustomEvents', 'enablePageViews', 'enableUserTiming'] },
                { id: 'privacy', name: 'Privacy Settings', description: 'Configure privacy and consent settings.', order: 3, parameters: ['enableConsentMode', 'enableAnonymization'] }
            ],
            parameters: [
                {
                    id: 'measurementId',
                    name: 'Measurement ID',
                    type: 'string',
                    description: 'Your Google Analytics 4 Measurement ID (e.g., G-XXXXXXXXXX).',
                    required: true,
                    group: 'tracking'
                },
                {
                    id: 'enableEcommerce',
                    name: 'Enable E-commerce',
                    type: 'boolean',
                    description: 'Enable e-commerce tracking features.',
                    required: false,
                    default: false,
                    group: 'tracking'
                },
                {
                    id: 'debugMode',
                    name: 'Debug Mode',
                    type: 'boolean',
                    description: 'Enable debug mode to see events in the DebugView.',
                    required: false,
                    default: false,
                    group: 'tracking'
                },
                {
                    id: 'enableCustomEvents',
                    name: 'Custom Events',
                    type: 'boolean',
                    description: 'Enable custom event tracking.',
                    required: false,
                    default: true,
                    group: 'events'
                },
                {
                    id: 'enablePageViews',
                    name: 'Page Views',
                    type: 'boolean',
                    description: 'Enable automatic page view tracking.',
                    required: false,
                    default: true,
                    group: 'events'
                },
                {
                    id: 'enableUserTiming',
                    name: 'User Timing',
                    type: 'boolean',
                    description: 'Enable user timing measurements.',
                    required: false,
                    default: false,
                    group: 'events'
                },
                {
                    id: 'enableConsentMode',
                    name: 'Consent Mode',
                    type: 'boolean',
                    description: 'Enable Google Analytics consent mode.',
                    required: false,
                    default: false,
                    group: 'privacy'
                },
                {
                    id: 'enableAnonymization',
                    name: 'IP Anonymization',
                    type: 'boolean',
                    description: 'Enable IP address anonymization.',
                    required: false,
                    default: true,
                    group: 'privacy'
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
        if (!config.measurementId) {
            errors.push({
                field: 'measurementId',
                message: 'Google Analytics Measurement ID is required',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        // Validate measurement ID format
        if (config.measurementId && !config.measurementId.match(/^G-[A-Z0-9]{10}$/)) {
            warnings.push('Measurement ID should be in format G-XXXXXXXXXX');
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
                    name: 'gtag',
                    type: 'constant',
                    implementation: 'Google Analytics tracking utilities',
                    documentation: 'Google Analytics 4 tracking functions and configuration'
                },
                {
                    name: 'GoogleAnalyticsProvider',
                    type: 'class',
                    implementation: 'React component for GA4 integration',
                    documentation: 'Provider component for Google Analytics integration'
                },
                {
                    name: 'analytics',
                    type: 'constant',
                    implementation: 'Analytics configuration',
                    documentation: 'Google Analytics configuration and setup'
                }
            ],
            types: [],
            utilities: [],
            constants: [],
            documentation: 'Google Analytics 4 web analytics and tracking integration'
        };
    }
    // ============================================================================
    // IUIMonitoringPlugin INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getMonitoringServices() {
        return ['google-analytics', 'google-tag-manager'];
    }
    getAnalyticsOptions() {
        return ['page-views', 'custom-events', 'ecommerce', 'user-timing', 'conversions'];
    }
    getAlertOptions() {
        return ['anomaly-detection', 'goal-completion', 'traffic-spikes', 'error-tracking'];
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Google Analytics monitoring...');
            // Initialize path resolver
            this.initializePathResolver(context);
            // Initialize generator
            this.generator = new GoogleAnalyticsGenerator();
            // Validate configuration
            const validation = this.validateConfiguration(pluginConfig);
            if (!validation.valid) {
                return this.createErrorResult('Invalid Google Analytics configuration', validation.errors, startTime);
            }
            // Step 1: Generate files using the generator
            const gtagHelper = GoogleAnalyticsGenerator.generateGtagHelper(pluginConfig);
            const analyticsProvider = GoogleAnalyticsGenerator.generateAnalyticsProvider(pluginConfig);
            const envConfig = GoogleAnalyticsGenerator.generateEnvConfig(pluginConfig);
            // Step 2: Write files to project
            await this.generateFile('src/lib/gtag.ts', gtagHelper);
            await this.generateFile('src/components/GoogleAnalyticsProvider.tsx', analyticsProvider);
            await this.generateFile('.env.local', envConfig);
            const duration = Date.now() - startTime;
            return this.createSuccessResult([
                { type: 'file', path: 'src/lib/gtag.ts' },
                { type: 'file', path: 'src/components/GoogleAnalyticsProvider.tsx' },
                { type: 'file', path: '.env.local' }
            ], [], [], [], [
                'Google Analytics integration requires you to wrap your application with the GoogleAnalyticsProvider.',
                ...validation.warnings
            ], startTime);
        }
        catch (error) {
            return this.createErrorResult('Failed to install Google Analytics monitoring', [], startTime);
        }
    }
    // ============================================================================
    // PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getDependencies() {
        return [];
    }
    getDevDependencies() {
        return [];
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'svelte'],
            platforms: ['web'],
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
                type: 'config',
                name: 'NEXT_PUBLIC_GA_ID',
                description: 'Your Google Analytics Measurement ID.',
                optional: false
            }
        ];
    }
    getDefaultConfig() {
        return {
            measurementId: '',
            enableEcommerce: false,
            debugMode: false,
            enableCustomEvents: true,
            enablePageViews: true,
            enableUserTiming: false,
            enableConsentMode: false,
            enableAnonymization: true
        };
    }
    getConfigSchema() {
        return GoogleAnalyticsConfigSchema;
    }
}
//# sourceMappingURL=GoogleAnalyticsPlugin.js.map