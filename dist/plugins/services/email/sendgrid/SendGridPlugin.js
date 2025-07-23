/**
 * SendGrid Email Plugin - Pure Technology Implementation
 *
 * Provides SendGrid email service integration with advanced analytics and marketing features.
 * Focuses only on email technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginCategory } from '../../../../types/plugins.js';
import { SendGridConfigSchema } from './SendGridSchema.js';
import { SendGridGenerator } from './SendGridGenerator.js';
export class SendGridPlugin extends BasePlugin {
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
            id: 'sendgrid',
            name: 'SendGrid',
            version: '1.0.0',
            description: 'Enterprise-grade email delivery service with advanced analytics and marketing features',
            author: 'The Architech Team',
            category: PluginCategory.EMAIL,
            tags: ['email', 'api', 'enterprise', 'analytics', 'marketing', 'sendgrid', 'transactional'],
            license: 'MIT',
            repository: 'https://github.com/sendgrid/sendgrid-nodejs',
            homepage: 'https://sendgrid.com',
            documentation: 'https://sendgrid.com/docs'
        };
    }
    // ============================================================================
    // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getParameterSchema() {
        return {
            category: PluginCategory.EMAIL,
            groups: [
                { id: 'credentials', name: 'Credentials', description: 'Configure SendGrid API credentials.', order: 1, parameters: ['apiKey'] },
                { id: 'sender', name: 'Sender Settings', description: 'Configure default sender information.', order: 2, parameters: ['fromEmail', 'fromName', 'replyTo'] },
                { id: 'testing', name: 'Testing Settings', description: 'Configure testing and development settings.', order: 3, parameters: ['sandboxMode'] }
            ],
            parameters: [
                {
                    id: 'apiKey',
                    name: 'API Key',
                    type: 'string',
                    description: 'Your SendGrid API key.',
                    required: true,
                    group: 'credentials'
                },
                {
                    id: 'fromEmail',
                    name: 'From Email',
                    type: 'string',
                    description: 'The default "from" email address for outgoing emails.',
                    required: true,
                    default: 'noreply@example.com',
                    group: 'sender'
                },
                {
                    id: 'fromName',
                    name: 'From Name',
                    type: 'string',
                    description: 'The default "from" name for outgoing emails.',
                    required: false,
                    group: 'sender'
                },
                {
                    id: 'replyTo',
                    name: 'Reply To',
                    type: 'string',
                    description: 'The default "reply-to" email address.',
                    required: false,
                    group: 'sender'
                },
                {
                    id: 'sandboxMode',
                    name: 'Sandbox Mode',
                    type: 'boolean',
                    description: 'Enable SendGrid sandbox mode for testing without sending emails.',
                    required: false,
                    default: false,
                    group: 'testing'
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
        if (!config.apiKey) {
            errors.push({
                field: 'apiKey',
                message: 'SendGrid API key is required',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        if (!config.fromEmail) {
            errors.push({
                field: 'fromEmail',
                message: 'From email address is required',
                code: 'MISSING_FIELD',
                severity: 'error'
            });
        }
        // Validate email format
        if (config.fromEmail && !this.isValidEmail(config.fromEmail)) {
            errors.push({
                field: 'fromEmail',
                message: 'Invalid email format for from email address',
                code: 'INVALID_EMAIL',
                severity: 'error'
            });
        }
        if (config.replyTo && !this.isValidEmail(config.replyTo)) {
            errors.push({
                field: 'replyTo',
                message: 'Invalid email format for reply-to address',
                code: 'INVALID_EMAIL',
                severity: 'error'
            });
        }
        // Validate API key format
        if (config.apiKey && !config.apiKey.startsWith('SG.')) {
            warnings.push('SendGrid API key should start with "SG."');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    generateUnifiedInterface(config) {
        return {
            category: PluginCategory.EMAIL,
            exports: [
                {
                    name: 'sendgrid',
                    type: 'constant',
                    implementation: 'SendGrid client configuration',
                    documentation: 'SendGrid API client for email sending'
                },
                {
                    name: 'EmailService',
                    type: 'class',
                    implementation: 'Email service class',
                    documentation: 'Unified email service for SendGrid operations'
                },
                {
                    name: 'email',
                    type: 'constant',
                    implementation: 'Email utilities',
                    documentation: 'SendGrid email processing utilities'
                }
            ],
            types: [],
            utilities: [],
            constants: [],
            documentation: 'SendGrid email service integration with advanced analytics and marketing features'
        };
    }
    // ============================================================================
    // IUIEmailPlugin INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getEmailServices() {
        return ['sendgrid', 'sendgrid-api', 'sendgrid-marketing'];
    }
    getEmailFeatures() {
        return ['transactional-emails', 'email-templates', 'email-tracking', 'analytics', 'marketing-campaigns'];
    }
    getTemplateOptions() {
        return ['dynamic-templates', 'static-templates', 'react-templates', 'handlebars'];
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing SendGrid email service...');
            // Initialize path resolver
            this.initializePathResolver(context);
            // Initialize generator
            this.generator = new SendGridGenerator();
            // Validate configuration
            const validation = this.validateConfiguration(pluginConfig);
            if (!validation.valid) {
                return this.createErrorResult('Invalid SendGrid configuration', validation.errors, startTime);
            }
            // Step 1: Install dependencies
            await this.installDependencies(['@sendgrid/mail']);
            // Step 2: Generate files using the generator
            const emailClient = SendGridGenerator.generateEmailClient(pluginConfig);
            const emailConfig = SendGridGenerator.generateEmailConfig(pluginConfig);
            const emailTypes = SendGridGenerator.generateEmailTypes();
            const emailService = SendGridGenerator.generateEmailService(pluginConfig);
            const envConfig = SendGridGenerator.generateEnvConfig(pluginConfig);
            // Step 3: Write files to project
            await this.generateFile('src/lib/email/client.ts', emailClient);
            await this.generateFile('src/lib/email/config.ts', emailConfig);
            await this.generateFile('src/lib/email/types.ts', emailTypes);
            await this.generateFile('src/lib/email/service.ts', emailService);
            await this.generateFile('.env.local', envConfig);
            const duration = Date.now() - startTime;
            return this.createSuccessResult([
                { type: 'file', path: 'src/lib/email/client.ts' },
                { type: 'file', path: 'src/lib/email/config.ts' },
                { type: 'file', path: 'src/lib/email/types.ts' },
                { type: 'file', path: 'src/lib/email/service.ts' },
                { type: 'file', path: '.env.local' }
            ], [
                {
                    name: '@sendgrid/mail',
                    version: '^8.1.0',
                    type: 'production',
                    category: PluginCategory.EMAIL
                }
            ], [], [], validation.warnings, startTime);
        }
        catch (error) {
            return this.createErrorResult('Failed to install SendGrid email service', [], startTime);
        }
    }
    // ============================================================================
    // PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    getDependencies() {
        return ['@sendgrid/mail'];
    }
    getDevDependencies() {
        return [];
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'svelte', 'express', 'fastify'],
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
                type: 'service',
                name: 'SendGrid Account',
                description: 'A SendGrid account with an API key is required.',
                optional: false
            },
            {
                type: 'config',
                name: 'SENDGRID_API_KEY',
                description: 'Your SendGrid API key, set as an environment variable.',
                optional: false
            }
        ];
    }
    getDefaultConfig() {
        return {
            apiKey: '',
            fromEmail: 'noreply@example.com',
            fromName: '',
            replyTo: '',
            sandboxMode: false
        };
    }
    getConfigSchema() {
        return SendGridConfigSchema;
    }
    // ============================================================================
    // PRIVATE UTILITY METHODS
    // ============================================================================
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
//# sourceMappingURL=SendGridPlugin.js.map