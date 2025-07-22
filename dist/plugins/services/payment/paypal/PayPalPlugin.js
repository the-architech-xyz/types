import { PluginCategory, TargetPlatform } from '../../../../types/plugin.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { PayPalConfigSchema, PayPalDefaultConfig } from './PayPalSchema.js';
import { PayPalGenerator } from './PayPalGenerator.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
export class PayPalPlugin {
    runner;
    constructor() {
        this.runner = new CommandRunner();
    }
    getMetadata() {
        return {
            id: 'paypal',
            name: 'PayPal Payments',
            version: '1.0.0',
            description: 'Payment processing and subscription management with PayPal',
            author: 'The Architech Team',
            category: PluginCategory.PAYMENT,
            tags: ['payment', 'paypal', 'subscriptions', 'invoices', 'marketplace'],
            license: 'MIT',
            repository: 'https://github.com/paypal/paypal-checkout-components',
            homepage: 'https://www.paypal.com',
            documentation: 'https://developer.paypal.com'
        };
    }
    async validate(context) {
        const errors = [];
        const { pluginConfig } = context;
        if (!pluginConfig.clientId) {
            errors.push({ field: 'clientId', message: 'PayPal client ID is required', code: 'MISSING_CLIENT_ID', severity: 'error' });
        }
        if (!pluginConfig.clientSecret) {
            errors.push({ field: 'clientSecret', message: 'PayPal client secret is required', code: 'MISSING_CLIENT_SECRET', severity: 'error' });
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
                    { type: 'file', path: path.join('src', 'lib', 'paypal', 'client.ts') },
                    { type: 'file', path: path.join('src', 'pages', 'api', 'paypal', 'orders', 'index.ts') },
                    { type: 'file', path: path.join('src', 'pages', 'api', 'paypal', 'orders', '[orderID]', 'capture.ts') },
                ],
                dependencies: [
                    { name: '@paypal/checkout-server-sdk', version: '^1.0.3', type: 'production', category: PluginCategory.PAYMENT },
                    { name: '@paypal/react-paypal-js', version: '^8.1.3', type: 'production', category: PluginCategory.PAYMENT },
                ],
                scripts: [],
                configs: [{
                        file: '.env',
                        content: PayPalGenerator.generateEnvConfig(context.pluginConfig),
                        mergeStrategy: 'append'
                    }],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install PayPal plugin', startTime, error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            await this.runner.execCommand(['npm', 'uninstall', '@paypal/checkout-server-sdk', '@paypal/react-paypal-js'], { cwd: context.projectPath });
            const libDir = path.join(context.projectPath, 'src', 'lib', 'paypal');
            if (await fsExtra.pathExists(libDir))
                await fsExtra.remove(libDir);
            const apiDir = path.join(context.projectPath, 'src', 'pages', 'api', 'paypal');
            if (await fsExtra.pathExists(apiDir))
                await fsExtra.remove(apiDir);
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: ['PayPal files and dependencies have been removed.'],
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall PayPal plugin', startTime, error);
        }
    }
    async update(context) {
        return this.install(context);
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react'],
            platforms: [TargetPlatform.WEB],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: ['stripe']
        };
    }
    getDependencies() {
        return ['@paypal/checkout-server-sdk', '@paypal/react-paypal-js'];
    }
    getConflicts() {
        return ['stripe'];
    }
    getRequirements() {
        return [
            { type: 'package', name: '@paypal/checkout-server-sdk', description: 'PayPal Checkout Server SDK', version: '^1.0.3' },
            { type: 'package', name: '@paypal/react-paypal-js', description: 'React components for PayPal JS SDK', version: '^8.1.3' },
        ];
    }
    getDefaultConfig() {
        return PayPalDefaultConfig;
    }
    getConfigSchema() {
        return PayPalConfigSchema;
    }
    async installDependencies(context) {
        await this.runner.execCommand(['npm', 'install', '@paypal/checkout-server-sdk', '@paypal/react-paypal-js'], { cwd: context.projectPath });
    }
    async createProjectFiles(context) {
        const { projectPath, pluginConfig } = context;
        const config = pluginConfig;
        const libDir = path.join(projectPath, 'src', 'lib', 'paypal');
        await fsExtra.ensureDir(libDir);
        await fsExtra.writeFile(path.join(libDir, 'client.ts'), PayPalGenerator.generatePayPalClient(config));
        const apiDir = path.join(projectPath, 'src', 'pages', 'api', 'paypal');
        await fsExtra.ensureDir(path.join(apiDir, 'orders', '[orderID]'));
        await fsExtra.writeFile(path.join(apiDir, 'orders', 'index.ts'), PayPalGenerator.generateCreateOrderRoute(config));
        await fsExtra.writeFile(path.join(apiDir, 'orders', '[orderID]', 'capture.ts'), PayPalGenerator.generateCaptureOrderRoute(config));
        if (config.webhookId) {
            await fsExtra.writeFile(path.join(apiDir, 'webhook.ts'), PayPalGenerator.generateWebhookRoute(config));
        }
    }
    createErrorResult(message, startTime, error) {
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [{ code: 'PAYPAL_PLUGIN_ERROR', message, details: error, severity: 'error' }],
            warnings: [],
            duration: Date.now() - startTime
        };
    }
}
//# sourceMappingURL=PayPalPlugin.js.map