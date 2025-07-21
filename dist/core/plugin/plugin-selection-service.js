/**
 * Plugin Selection Service
 *
 * Handles interactive plugin selection and parameter collection
 * during project generation. This is the bridge between user input
 * and plugin configuration.
 */
import { DATABASE_PROVIDERS, ORM_LIBRARIES, AUTH_PROVIDERS, AUTH_FEATURES, UI_LIBRARIES, DEPLOYMENT_PLATFORMS, EMAIL_SERVICES, TESTING_FRAMEWORKS } from '../../types/shared-config.js';
import inquirer from 'inquirer';
export class PluginSelectionService {
    pluginSystem;
    constructor(pluginSystem) {
        this.pluginSystem = pluginSystem;
    }
    async selectPlugins(userInput) {
        return {
            database: await this.selectDatabase(userInput),
            authentication: await this.selectAuthentication(userInput),
            ui: await this.selectUI(userInput),
            deployment: await this.selectDeployment(userInput),
            testing: await this.selectTesting(userInput),
            email: await this.selectEmail(userInput),
            monitoring: await this.selectMonitoring(userInput),
            payment: await this.selectPayment(userInput),
            blockchain: await this.selectBlockchain(userInput)
        };
    }
    async selectDatabase(userInput) {
        const { enabled } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add a database to your project?',
                default: true
            }
        ]);
        if (!enabled) {
            return {
                enabled: false,
                provider: DATABASE_PROVIDERS.NEON,
                orm: ORM_LIBRARIES.DRIZZLE,
                features: {}
            };
        }
        const { orm } = await inquirer.prompt([
            {
                type: 'list',
                name: 'orm',
                message: 'Which database ORM would you like to use?',
                choices: [
                    { name: 'Drizzle ORM (Recommended)', value: ORM_LIBRARIES.DRIZZLE },
                    { name: 'Prisma ORM', value: ORM_LIBRARIES.PRISMA },
                    { name: 'TypeORM', value: ORM_LIBRARIES.TYPEORM },
                    { name: 'No ORM', value: 'none' }
                ],
                default: ORM_LIBRARIES.DRIZZLE
            }
        ]);
        if (orm === 'none') {
            return {
                enabled: true,
                provider: DATABASE_PROVIDERS.NEON,
                orm: ORM_LIBRARIES.DRIZZLE,
                features: {}
            };
        }
        // Get available providers for the selected ORM
        const availableProviders = this.getDatabaseProvidersForORM(orm);
        const { provider } = await inquirer.prompt([
            {
                type: 'list',
                name: 'provider',
                message: 'Which database provider would you like to use?',
                choices: availableProviders,
                default: availableProviders[0]?.value
            }
        ]);
        // Get available features for the selected ORM
        const availableFeatures = this.getDatabaseFeaturesForORM(orm);
        const { features } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'features',
                message: 'Which database features would you like to enable?',
                choices: availableFeatures,
                default: ['migrations', 'studio']
            }
        ]);
        // Convert features array to object
        const featuresObject = {};
        availableFeatures.forEach(feature => {
            featuresObject[feature.value] = features.includes(feature.value);
        });
        return {
            enabled: true,
            provider,
            orm,
            features: featuresObject
        };
    }
    async selectAuthentication(userInput) {
        const { enabled } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add authentication to your project?',
                default: true
            }
        ]);
        if (!enabled) {
            return {
                enabled: false,
                providers: [],
                features: {}
            };
        }
        const { providers } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'providers',
                message: 'Which authentication providers would you like to use?',
                choices: [
                    { name: 'Email/Password', value: AUTH_PROVIDERS.EMAIL, checked: true },
                    { name: 'Google', value: AUTH_PROVIDERS.GOOGLE },
                    { name: 'GitHub', value: AUTH_PROVIDERS.GITHUB },
                    { name: 'Discord', value: AUTH_PROVIDERS.DISCORD }
                ],
                default: [AUTH_PROVIDERS.EMAIL]
            }
        ]);
        const { features } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'features',
                message: 'Which authentication features would you like to enable?',
                choices: [
                    { name: 'Email Verification', value: AUTH_FEATURES.EMAIL_VERIFICATION, checked: true },
                    { name: 'Password Reset', value: AUTH_FEATURES.PASSWORD_RESET, checked: true },
                    { name: 'Social Login', value: AUTH_FEATURES.SOCIAL_LOGIN },
                    { name: 'Session Management', value: AUTH_FEATURES.SESSION_MANAGEMENT, checked: true }
                ],
                default: [AUTH_FEATURES.EMAIL_VERIFICATION, AUTH_FEATURES.PASSWORD_RESET, AUTH_FEATURES.SESSION_MANAGEMENT]
            }
        ]);
        // Convert features array to object
        const featuresObject = {};
        features.forEach((feature) => {
            featuresObject[feature] = true;
        });
        return {
            enabled: true,
            providers,
            features: featuresObject
        };
    }
    async selectUI(userInput) {
        const { enabled } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add a UI library to your project?',
                default: true
            }
        ]);
        if (!enabled) {
            return {
                enabled: false,
                library: UI_LIBRARIES.SHADCN_UI,
                features: {}
            };
        }
        const { library } = await inquirer.prompt([
            {
                type: 'list',
                name: 'library',
                message: 'Which UI library would you like to use?',
                choices: [
                    { name: 'Shadcn/ui (Recommended)', value: UI_LIBRARIES.SHADCN_UI },
                    { name: 'Chakra UI', value: UI_LIBRARIES.CHAKRA_UI },
                    { name: 'Material-UI', value: UI_LIBRARIES.MATERIAL_UI },
                    { name: 'Ant Design', value: UI_LIBRARIES.ANT_DESIGN }
                ],
                default: UI_LIBRARIES.SHADCN_UI
            }
        ]);
        const { features } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'features',
                message: 'Which UI features would you like to enable?',
                choices: [
                    { name: 'Components', value: 'components', checked: true },
                    { name: 'Theming', value: 'theming', checked: true },
                    { name: 'Responsive Design', value: 'responsive', checked: true }
                ],
                default: ['components', 'theming', 'responsive']
            }
        ]);
        // Convert features array to object
        const featuresObject = {};
        features.forEach((feature) => {
            featuresObject[feature] = true;
        });
        return {
            enabled: true,
            library,
            features: featuresObject
        };
    }
    async selectDeployment(userInput) {
        const { enabled } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to configure deployment for your project?',
                default: false
            }
        ]);
        if (!enabled) {
            return {
                enabled: false,
                platform: DEPLOYMENT_PLATFORMS.VERCEL,
                features: {}
            };
        }
        const { platform } = await inquirer.prompt([
            {
                type: 'list',
                name: 'platform',
                message: 'Which deployment platform would you like to use?',
                choices: [
                    { name: 'Vercel (Recommended)', value: DEPLOYMENT_PLATFORMS.VERCEL },
                    { name: 'Railway', value: DEPLOYMENT_PLATFORMS.RAILWAY },
                    { name: 'Netlify', value: DEPLOYMENT_PLATFORMS.NETLIFY },
                    { name: 'AWS', value: DEPLOYMENT_PLATFORMS.AWS }
                ],
                default: DEPLOYMENT_PLATFORMS.VERCEL
            }
        ]);
        const { features } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'features',
                message: 'Which deployment features would you like to enable?',
                choices: [
                    { name: 'Auto Deploy', value: 'autoDeploy', checked: true },
                    { name: 'Preview Deployments', value: 'preview', checked: true },
                    { name: 'Analytics', value: 'analytics' }
                ],
                default: ['autoDeploy', 'preview']
            }
        ]);
        // Convert features array to object
        const featuresObject = {};
        features.forEach((feature) => {
            featuresObject[feature] = true;
        });
        return {
            enabled: true,
            platform,
            features: featuresObject
        };
    }
    async selectTesting(userInput) {
        const { enabled } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add testing to your project?',
                default: true
            }
        ]);
        if (!enabled) {
            return {
                enabled: false,
                framework: TESTING_FRAMEWORKS.VITEST,
                features: {}
            };
        }
        const { framework } = await inquirer.prompt([
            {
                type: 'list',
                name: 'framework',
                message: 'Which testing framework would you like to use?',
                choices: [
                    { name: 'Vitest (Recommended)', value: TESTING_FRAMEWORKS.VITEST },
                    { name: 'Jest', value: TESTING_FRAMEWORKS.JEST },
                    { name: 'Playwright', value: TESTING_FRAMEWORKS.PLAYWRIGHT }
                ],
                default: TESTING_FRAMEWORKS.VITEST
            }
        ]);
        const { features } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'features',
                message: 'Which testing features would you like to enable?',
                choices: [
                    { name: 'Unit Tests', value: 'unit', checked: true },
                    { name: 'Integration Tests', value: 'integration' },
                    { name: 'E2E Tests', value: 'e2e' },
                    { name: 'Code Coverage', value: 'coverage', checked: true }
                ],
                default: ['unit', 'coverage']
            }
        ]);
        // Convert features array to object
        const featuresObject = {};
        features.forEach((feature) => {
            featuresObject[feature] = true;
        });
        return {
            enabled: true,
            framework,
            features: featuresObject
        };
    }
    async selectEmail(userInput) {
        const { enabled } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add email functionality to your project?',
                default: false
            }
        ]);
        if (!enabled) {
            return {
                enabled: false,
                service: EMAIL_SERVICES.RESEND,
                features: {}
            };
        }
        const { service } = await inquirer.prompt([
            {
                type: 'list',
                name: 'service',
                message: 'Which email service would you like to use?',
                choices: [
                    { name: 'Resend (Recommended)', value: EMAIL_SERVICES.RESEND },
                    { name: 'SendGrid', value: EMAIL_SERVICES.SENDGRID },
                    { name: 'Mailgun', value: EMAIL_SERVICES.MAILGUN }
                ],
                default: EMAIL_SERVICES.RESEND
            }
        ]);
        const { features } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'features',
                message: 'Which email features would you like to enable?',
                choices: [
                    { name: 'Email Templates', value: 'templates', checked: true },
                    { name: 'Email Tracking', value: 'tracking' },
                    { name: 'Analytics', value: 'analytics' }
                ],
                default: ['templates']
            }
        ]);
        // Convert features array to object
        const featuresObject = {};
        features.forEach((feature) => {
            featuresObject[feature] = true;
        });
        return {
            enabled: true,
            service,
            features: featuresObject
        };
    }
    async selectMonitoring(userInput) {
        const { enabled } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add monitoring and analytics to your project?',
                default: false
            }
        ]);
        if (!enabled) {
            return {
                enabled: false,
                services: [],
                features: {}
            };
        }
        const { services } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'services',
                message: 'Which monitoring services would you like to use?',
                choices: [
                    { name: 'Sentry (Error Tracking)', value: 'sentry' },
                    { name: 'Vercel Analytics (Web Analytics)', value: 'vercel-analytics' },
                    { name: 'Google Analytics (Web Analytics)', value: 'google-analytics' }
                ],
                default: ['sentry']
            }
        ]);
        const { features } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'features',
                message: 'Which monitoring features would you like to enable?',
                choices: [
                    { name: 'Error Tracking', value: 'errorTracking', checked: true },
                    { name: 'Performance Monitoring', value: 'performanceMonitoring' },
                    { name: 'User Analytics', value: 'analytics' },
                    { name: 'Session Recording', value: 'sessionRecording' }
                ],
                default: ['errorTracking']
            }
        ]);
        // Convert features array to object
        const featuresObject = {};
        features.forEach((feature) => {
            featuresObject[feature] = true;
        });
        return {
            enabled: true,
            services,
            features: featuresObject
        };
    }
    async selectPayment(userInput) {
        const { enabled } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add payment processing to your project?',
                default: false
            }
        ]);
        if (!enabled) {
            return {
                enabled: false,
                providers: [],
                features: {}
            };
        }
        const { providers } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'providers',
                message: 'Which payment providers would you like to use?',
                choices: [
                    { name: 'Stripe (Recommended)', value: 'stripe', checked: true },
                    { name: 'PayPal', value: 'paypal' }
                ],
                default: ['stripe']
            }
        ]);
        const { features } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'features',
                message: 'Which payment features would you like to enable?',
                choices: [
                    { name: 'One-time Payments', value: 'oneTimePayments', checked: true },
                    { name: 'Subscriptions', value: 'subscriptions' },
                    { name: 'Invoices', value: 'invoices' },
                    { name: 'Marketplace Support', value: 'marketplace' }
                ],
                default: ['oneTimePayments']
            }
        ]);
        // Convert features array to object
        const featuresObject = {};
        features.forEach((feature) => {
            featuresObject[feature] = true;
        });
        return {
            enabled: true,
            providers,
            features: featuresObject
        };
    }
    async selectBlockchain(userInput) {
        const { enabled } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'enabled',
                message: 'Would you like to add blockchain integration to your project?',
                default: false
            }
        ]);
        if (!enabled) {
            return {
                enabled: false,
                networks: [],
                features: {}
            };
        }
        const { networks } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'networks',
                message: 'Which blockchain networks would you like to support?',
                choices: [
                    { name: 'Ethereum (Recommended)', value: 'ethereum', checked: true },
                    { name: 'Polygon', value: 'polygon' },
                    { name: 'Solana', value: 'solana' }
                ],
                default: ['ethereum']
            }
        ]);
        const { features } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'features',
                message: 'Which blockchain features would you like to enable?',
                choices: [
                    { name: 'Smart Contracts', value: 'smartContracts', checked: true },
                    { name: 'NFT Support', value: 'nftSupport' },
                    { name: 'DeFi Integration', value: 'defiIntegration' },
                    { name: 'Wallet Integration', value: 'walletIntegration' }
                ],
                default: ['smartContracts']
            }
        ]);
        // Convert features array to object
        const featuresObject = {};
        features.forEach((feature) => {
            featuresObject[feature] = true;
        });
        return {
            enabled: true,
            networks,
            features: featuresObject
        };
    }
    getDatabaseProvidersForORM(orm) {
        switch (orm) {
            case ORM_LIBRARIES.DRIZZLE:
                return [
                    { name: 'Neon (PostgreSQL)', value: DATABASE_PROVIDERS.NEON },
                    { name: 'Supabase (PostgreSQL)', value: DATABASE_PROVIDERS.SUPABASE },
                    { name: 'Turso (SQLite)', value: DATABASE_PROVIDERS.TURSO },
                    { name: 'PlanetScale (MySQL)', value: DATABASE_PROVIDERS.PLANETSCALE }
                ];
            case ORM_LIBRARIES.PRISMA:
                return [
                    { name: 'Neon (PostgreSQL)', value: DATABASE_PROVIDERS.NEON },
                    { name: 'Supabase (PostgreSQL)', value: DATABASE_PROVIDERS.SUPABASE },
                    { name: 'PlanetScale (MySQL)', value: DATABASE_PROVIDERS.PLANETSCALE }
                ];
            default:
                return [
                    { name: 'Neon (PostgreSQL)', value: DATABASE_PROVIDERS.NEON },
                    { name: 'Supabase (PostgreSQL)', value: DATABASE_PROVIDERS.SUPABASE }
                ];
        }
    }
    getDatabaseFeaturesForORM(orm) {
        switch (orm) {
            case ORM_LIBRARIES.DRIZZLE:
                return [
                    { name: 'Migrations', value: 'migrations' },
                    { name: 'Seeding', value: 'seeding' },
                    { name: 'Drizzle Studio', value: 'studio' },
                    { name: 'Type Safety', value: 'typeSafety' }
                ];
            case ORM_LIBRARIES.PRISMA:
                return [
                    { name: 'Migrations', value: 'migrations' },
                    { name: 'Seeding', value: 'seeding' },
                    { name: 'Prisma Studio', value: 'studio' },
                    { name: 'Type Safety', value: 'typeSafety' }
                ];
            default:
                return [
                    { name: 'Migrations', value: 'migrations' },
                    { name: 'Seeding', value: 'seeding' }
                ];
        }
    }
}
//# sourceMappingURL=plugin-selection-service.js.map