/**
 * Expert Mode Service
 *
 * Handles expert mode detection and provides advanced configuration options
 * for power users who want full control over their project setup.
 */
import { DynamicQuestionGenerator } from './dynamic-question-generator.js';
import { PluginSystem } from '../plugin/plugin-system.js';
export class ExpertModeService {
    questionGenerator;
    pluginSystem;
    constructor() {
        this.questionGenerator = new DynamicQuestionGenerator();
        this.pluginSystem = PluginSystem.getInstance();
    }
    /**
     * Check if expert mode is enabled
     */
    isExpertMode(context) {
        return context.options.verbose ||
            context.config.expertMode === true;
    }
    /**
     * Get expert mode options from context
     */
    getExpertModeOptions(context) {
        return {
            expertMode: this.isExpertMode(context),
            verbose: context.options.verbose || false,
            interactive: !context.options.useDefaults,
            customConfig: context.config.customConfig === true
        };
    }
    /**
     * Get expert questions for a specific category
     */
    getExpertQuestions(category) {
        switch (category) {
            case 'database':
                return this.getDatabaseExpertQuestions();
            case 'authentication':
                return this.getAuthenticationExpertQuestions();
            case 'ui':
                return this.getUIExpertQuestions();
            case 'deployment':
                return this.getDeploymentExpertQuestions();
            case 'testing':
                return this.getTestingExpertQuestions();
            case 'email':
                return this.getEmailExpertQuestions();
            case 'monitoring':
                return this.getMonitoringExpertQuestions();
            case 'payment':
                return this.getPaymentExpertQuestions();
            case 'blockchain':
                return this.getBlockchainExpertQuestions();
            default:
                return [];
        }
    }
    /**
     * Get dynamic questions from a specific plugin
     */
    async getDynamicQuestions(pluginId, context) {
        const plugin = this.pluginSystem.getRegistry().get(pluginId);
        if (plugin && this.isEnhancedPlugin(plugin)) {
            // Use plugin's dynamic question generation
            const pluginContext = {
                ...context,
                pluginId,
                pluginConfig: {},
                installedPlugins: [],
                projectType: 'nextjs',
                targetPlatform: ['web', 'server']
            };
            const questions = plugin.getDynamicQuestions(pluginContext);
            return this.convertToPluginPrompts(questions);
        }
        // Fallback to generic category questions
        const category = this.getCategoryFromPluginId(pluginId);
        return this.getExpertQuestions(category);
    }
    /**
     * Get dynamic questions for a category when no specific plugin is selected
     */
    getCategoryDynamicQuestions(category) {
        const questions = this.questionGenerator.generateCategoryQuestions(category);
        return this.convertToPluginPrompts(questions);
    }
    /**
     * Validate expert mode choices
     */
    validateExpertChoices(choices, category) {
        const errors = [];
        switch (category) {
            case 'database':
                if (choices.provider && !choices.orm) {
                    errors.push('Database provider selected but no ORM specified');
                }
                break;
            case 'authentication':
                if (choices.providers && choices.providers.length === 0) {
                    errors.push('At least one authentication provider must be selected');
                }
                break;
            case 'ui':
                if (choices.library && !choices.components) {
                    errors.push('UI library selected but no components specified');
                }
                break;
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    // ============================================================================
    // CATEGORY-SPECIFIC EXPERT QUESTIONS
    // ============================================================================
    getDatabaseExpertQuestions() {
        return [
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add a database to your project?',
                default: true
            },
            {
                type: 'select',
                name: 'provider',
                message: 'Select database provider:',
                choices: [
                    { name: 'Neon (PostgreSQL - Recommended)', value: 'neon' },
                    { name: 'Supabase (PostgreSQL)', value: 'supabase' },
                    { name: 'MongoDB Atlas', value: 'mongodb' },
                    { name: 'PlanetScale (MySQL)', value: 'planetscale' },
                    { name: 'Local PostgreSQL', value: 'local' }
                ],
                default: 'neon',
                when: (answers) => answers.enabled
            },
            {
                type: 'select',
                name: 'orm',
                message: 'Select ORM library:',
                choices: [
                    { name: 'Drizzle ORM (TypeScript-first)', value: 'drizzle' },
                    { name: 'Prisma (Full-featured)', value: 'prisma' },
                    { name: 'TypeORM (Traditional)', value: 'typeorm' },
                    { name: 'Mongoose (MongoDB)', value: 'mongoose' }
                ],
                default: 'drizzle',
                when: (answers) => answers.enabled
            },
            {
                type: 'checkbox',
                name: 'features',
                message: 'Select database features:',
                choices: [
                    { name: 'Database Seeding', value: 'seeding' },
                    { name: 'Automatic Backups', value: 'backup' },
                    { name: 'Connection Pooling', value: 'connectionPooling' },
                    { name: 'SSL Encryption', value: 'ssl' },
                    { name: 'Read Replicas', value: 'readReplicas' },
                    { name: 'Database Migrations', value: 'migrations' }
                ],
                default: ['migrations', 'seeding'],
                when: (answers) => answers.enabled
            }
        ];
    }
    getAuthenticationExpertQuestions() {
        return [
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add authentication to your project?',
                default: true
            },
            {
                type: 'checkbox',
                name: 'providers',
                message: 'Select authentication providers:',
                choices: [
                    { name: 'Email/Password', value: 'credentials' },
                    { name: 'Google OAuth', value: 'google' },
                    { name: 'GitHub OAuth', value: 'github' },
                    { name: 'Discord OAuth', value: 'discord' },
                    { name: 'Twitter OAuth', value: 'twitter' },
                    { name: 'Facebook OAuth', value: 'facebook' },
                    { name: 'Apple OAuth', value: 'apple' }
                ],
                default: ['credentials'],
                when: (answers) => answers.enabled
            },
            {
                type: 'checkbox',
                name: 'features',
                message: 'Select authentication features:',
                choices: [
                    { name: 'Email Verification', value: 'emailVerification' },
                    { name: 'Password Reset', value: 'passwordReset' },
                    { name: 'Two-Factor Authentication', value: 'twoFactor' },
                    { name: 'Session Management', value: 'sessionManagement' },
                    { name: 'Role-Based Access Control', value: 'rbac' },
                    { name: 'OAuth Callback Handling', value: 'oauthCallbacks' }
                ],
                default: ['emailVerification', 'passwordReset'],
                when: (answers) => answers.enabled
            },
            {
                type: 'input',
                name: 'sessionDuration',
                message: 'Session duration (in hours):',
                default: '24',
                validate: (input) => {
                    const hours = parseInt(input);
                    return hours > 0 && hours <= 8760 ? true : 'Please enter a valid duration (1-8760 hours)';
                },
                when: (answers) => answers.enabled
            }
        ];
    }
    getUIExpertQuestions() {
        return [
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add a UI library to your project?',
                default: true
            },
            {
                type: 'select',
                name: 'library',
                message: 'Select UI library:',
                choices: [
                    { name: 'Shadcn/ui (Recommended)', value: 'shadcn-ui' },
                    { name: 'Chakra UI', value: 'chakra-ui' },
                    { name: 'Material-UI (MUI)', value: 'mui' },
                    { name: 'Tamagui', value: 'tamagui' },
                    { name: 'Ant Design', value: 'antd' },
                    { name: 'Radix UI (Headless)', value: 'radix' }
                ],
                default: 'shadcn-ui',
                when: (answers) => answers.enabled
            },
            {
                type: 'select',
                name: 'theme',
                message: 'Select theme mode:',
                choices: [
                    { name: 'Light', value: 'light' },
                    { name: 'Dark', value: 'dark' },
                    { name: 'Auto (system preference)', value: 'auto' }
                ],
                default: 'auto',
                when: (answers) => answers.enabled
            },
            {
                type: 'checkbox',
                name: 'components',
                message: 'Select components to include:',
                choices: [
                    { name: 'Button', value: 'button' },
                    { name: 'Card', value: 'card' },
                    { name: 'Input', value: 'input' },
                    { name: 'Form', value: 'form' },
                    { name: 'Modal/Dialog', value: 'modal' },
                    { name: 'Table', value: 'table' },
                    { name: 'Navigation', value: 'navigation' },
                    { name: 'Dropdown/Select', value: 'select' },
                    { name: 'Checkbox/Radio', value: 'checkbox' },
                    { name: 'Switch/Toggle', value: 'switch' },
                    { name: 'Badge', value: 'badge' },
                    { name: 'Avatar', value: 'avatar' },
                    { name: 'Alert/Toast', value: 'alert' }
                ],
                default: ['button', 'card', 'input', 'form'],
                when: (answers) => answers.enabled
            },
            {
                type: 'checkbox',
                name: 'features',
                message: 'Select advanced features:',
                choices: [
                    { name: 'Animations', value: 'animations' },
                    { name: 'Responsive Design', value: 'responsiveDesign' },
                    { name: 'Theme Customization', value: 'themeCustomization' },
                    { name: 'Icon Library', value: 'iconLibrary' },
                    { name: 'Accessibility (a11y)', value: 'accessibility' },
                    { name: 'Internationalization (i18n)', value: 'internationalization' }
                ],
                default: ['responsiveDesign', 'accessibility'],
                when: (answers) => answers.enabled
            }
        ];
    }
    getDeploymentExpertQuestions() {
        return [
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to configure deployment?',
                default: false
            },
            {
                type: 'select',
                name: 'platform',
                message: 'Select deployment platform:',
                choices: [
                    { name: 'Vercel (Recommended for Next.js)', value: 'vercel' },
                    { name: 'Railway', value: 'railway' },
                    { name: 'Netlify', value: 'netlify' },
                    { name: 'AWS', value: 'aws' },
                    { name: 'Google Cloud', value: 'gcp' },
                    { name: 'Docker', value: 'docker' }
                ],
                default: 'vercel',
                when: (answers) => answers.enabled
            },
            {
                type: 'select',
                name: 'environment',
                message: 'Select deployment environment:',
                choices: [
                    { name: 'Production', value: 'production' },
                    { name: 'Staging', value: 'staging' },
                    { name: 'Development', value: 'development' }
                ],
                default: 'production',
                when: (answers) => answers.enabled
            },
            {
                type: 'checkbox',
                name: 'features',
                message: 'Select deployment features:',
                choices: [
                    { name: 'Automatic Deployments', value: 'autoDeploy' },
                    { name: 'Preview Deployments', value: 'previewDeployments' },
                    { name: 'Custom Domain', value: 'customDomain' },
                    { name: 'SSL Certificate', value: 'ssl' },
                    { name: 'CI/CD Pipeline', value: 'ciCd' },
                    { name: 'Environment Variables', value: 'envVars' }
                ],
                default: ['autoDeploy', 'ssl', 'envVars'],
                when: (answers) => answers.enabled
            }
        ];
    }
    getTestingExpertQuestions() {
        return [
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add testing to your project?',
                default: true
            },
            {
                type: 'select',
                name: 'framework',
                message: 'Select testing framework:',
                choices: [
                    { name: 'Vitest (Recommended)', value: 'vitest' },
                    { name: 'Jest', value: 'jest' },
                    { name: 'Playwright (E2E)', value: 'playwright' },
                    { name: 'Cypress (E2E)', value: 'cypress' }
                ],
                default: 'vitest',
                when: (answers) => answers.enabled
            },
            {
                type: 'checkbox',
                name: 'features',
                message: 'Select testing features:',
                choices: [
                    { name: 'Unit Testing', value: 'unitTesting' },
                    { name: 'Integration Testing', value: 'integrationTesting' },
                    { name: 'End-to-End Testing', value: 'e2eTesting' },
                    { name: 'Coverage Reporting', value: 'coverageReporting' },
                    { name: 'Test Utilities', value: 'testUtilities' },
                    { name: 'Mocking Support', value: 'mockingSupport' }
                ],
                default: ['unitTesting', 'coverageReporting', 'testUtilities'],
                when: (answers) => answers.enabled
            }
        ];
    }
    getEmailExpertQuestions() {
        return [
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add email functionality?',
                default: false
            },
            {
                type: 'select',
                name: 'service',
                message: 'Select email service:',
                choices: [
                    { name: 'Resend (Recommended)', value: 'resend' },
                    { name: 'SendGrid', value: 'sendgrid' },
                    { name: 'Mailgun', value: 'mailgun' },
                    { name: 'AWS SES', value: 'ses' }
                ],
                default: 'resend',
                when: (answers) => answers.enabled
            },
            {
                type: 'checkbox',
                name: 'features',
                message: 'Select email features:',
                choices: [
                    { name: 'Welcome Emails', value: 'welcomeEmails' },
                    { name: 'Password Reset', value: 'passwordReset' },
                    { name: 'Email Verification', value: 'emailVerification' },
                    { name: 'Marketing Emails', value: 'marketingEmails' },
                    { name: 'Transactional Emails', value: 'transactionalEmails' },
                    { name: 'Email Templates', value: 'emailTemplates' }
                ],
                default: ['emailTemplates'],
                when: (answers) => answers.enabled
            }
        ];
    }
    getMonitoringExpertQuestions() {
        return [
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add monitoring and analytics?',
                default: false
            },
            {
                type: 'checkbox',
                name: 'services',
                message: 'Select monitoring services:',
                choices: [
                    { name: 'Sentry (Error Tracking)', value: 'sentry' },
                    { name: 'Vercel Analytics', value: 'vercelAnalytics' },
                    { name: 'Google Analytics', value: 'googleAnalytics' },
                    { name: 'PostHog', value: 'posthog' },
                    { name: 'Mixpanel', value: 'mixpanel' }
                ],
                when: (answers) => answers.enabled
            },
            {
                type: 'checkbox',
                name: 'features',
                message: 'Select monitoring features:',
                choices: [
                    { name: 'Error Tracking', value: 'errorTracking' },
                    { name: 'Performance Monitoring', value: 'performanceMonitoring' },
                    { name: 'User Analytics', value: 'userAnalytics' },
                    { name: 'Health Checks', value: 'healthChecks' },
                    { name: 'Alerts & Notifications', value: 'alerts' }
                ],
                when: (answers) => answers.enabled
            }
        ];
    }
    getPaymentExpertQuestions() {
        return [
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add payment processing?',
                default: false
            },
            {
                type: 'checkbox',
                name: 'providers',
                message: 'Select payment providers:',
                choices: [
                    { name: 'Stripe (Recommended)', value: 'stripe' },
                    { name: 'PayPal', value: 'paypal' },
                    { name: 'Square', value: 'square' },
                    { name: 'Paddle', value: 'paddle' }
                ],
                when: (answers) => answers.enabled
            },
            {
                type: 'checkbox',
                name: 'features',
                message: 'Select payment features:',
                choices: [
                    { name: 'One-time Payments', value: 'oneTimePayments' },
                    { name: 'Subscriptions', value: 'subscriptions' },
                    { name: 'Payment Links', value: 'paymentLinks' },
                    { name: 'Webhooks', value: 'webhooks' },
                    { name: 'Customer Portal', value: 'customerPortal' }
                ],
                when: (answers) => answers.enabled
            }
        ];
    }
    getBlockchainExpertQuestions() {
        return [
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add blockchain integration?',
                default: false
            },
            {
                type: 'checkbox',
                name: 'networks',
                message: 'Select blockchain networks:',
                choices: [
                    { name: 'Ethereum', value: 'ethereum' },
                    { name: 'Polygon', value: 'polygon' },
                    { name: 'Solana', value: 'solana' },
                    { name: 'Binance Smart Chain', value: 'bsc' }
                ],
                when: (answers) => answers.enabled
            },
            {
                type: 'checkbox',
                name: 'features',
                message: 'Select blockchain features:',
                choices: [
                    { name: 'Smart Contracts', value: 'smartContracts' },
                    { name: 'NFT Support', value: 'nftSupport' },
                    { name: 'DeFi Integration', value: 'defiIntegration' },
                    { name: 'Wallet Integration', value: 'walletIntegration' }
                ],
                when: (answers) => answers.enabled
            }
        ];
    }
    /**
     * Convert PluginQuestion to PluginPrompt for compatibility
     */
    convertToPluginPrompts(questions) {
        return questions.map(q => ({
            type: q.type,
            name: q.name,
            message: q.message,
            choices: q.choices,
            default: q.default,
            when: q.when,
            validate: q.validate,
            description: q.description
        }));
    }
    /**
     * Check if plugin implements enhanced interface
     */
    isEnhancedPlugin(plugin) {
        return plugin &&
            typeof plugin.getParameterSchema === 'function' &&
            typeof plugin.getDynamicQuestions === 'function';
    }
    /**
     * Get category from plugin ID
     */
    getCategoryFromPluginId(pluginId) {
        if (pluginId.includes('drizzle') || pluginId.includes('prisma') || pluginId.includes('neon') || pluginId.includes('supabase')) {
            return 'database';
        }
        if (pluginId.includes('auth') || pluginId.includes('nextauth')) {
            return 'authentication';
        }
        if (pluginId.includes('ui') || pluginId.includes('shadcn') || pluginId.includes('chakra')) {
            return 'ui';
        }
        if (pluginId.includes('deploy') || pluginId.includes('vercel') || pluginId.includes('railway')) {
            return 'deployment';
        }
        if (pluginId.includes('test') || pluginId.includes('vitest') || pluginId.includes('jest')) {
            return 'testing';
        }
        if (pluginId.includes('email') || pluginId.includes('resend') || pluginId.includes('sendgrid')) {
            return 'email';
        }
        if (pluginId.includes('monitor') || pluginId.includes('sentry') || pluginId.includes('analytics')) {
            return 'monitoring';
        }
        if (pluginId.includes('payment') || pluginId.includes('stripe') || pluginId.includes('paypal')) {
            return 'payment';
        }
        if (pluginId.includes('blockchain') || pluginId.includes('ethereum') || pluginId.includes('solana')) {
            return 'blockchain';
        }
        return 'custom';
    }
}
//# sourceMappingURL=expert-mode-service.js.map