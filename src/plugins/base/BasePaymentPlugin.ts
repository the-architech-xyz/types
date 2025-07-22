/**
 * Base Payment Plugin Class
 */
import { BasePlugin } from './BasePlugin.js';
import { IUIPaymentPlugin, PaymentProvider, PaymentFeature, BillingOption, ParameterSchema } from '../../types/plugin-interfaces.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
import { ValidationResult } from '../../types/agent.js';
import { PluginContext } from '../../types/plugin.js';

export abstract class BasePaymentPlugin extends BasePlugin implements IUIPaymentPlugin {
    private questionGenerator: DynamicQuestionGenerator;

    constructor() {
        super();
        this.questionGenerator = new DynamicQuestionGenerator();
    }

    // --- Abstract Methods ---
    abstract getPaymentProviders(): PaymentProvider[];
    abstract getPaymentFeatures(): PaymentFeature[];
    abstract getBillingOptions(): BillingOption[];

    // --- Shared Logic ---
    protected getBasePaymentSchema(): ParameterSchema {
        // Base schema with provider selection
        return {} as ParameterSchema;
    }

    protected async setupWebhookEndpoint(context: PluginContext, config: any): Promise<void> {
        // Common logic for creating a /api/webhooks/{provider} endpoint
    }

    protected generatePaymentProviderEnvVars(provider: PaymentProvider): Record<string, string> {
        // Logic for STRIPE_SECRET_KEY, PAYPAL_CLIENT_ID etc.
        return {};
    }

    // --- Interface Implementation ---
    getDynamicQuestions(context: PluginContext): any[] {
        return this.questionGenerator.generateQuestions(this, context);
    }

    validateConfiguration(config: Record<string, any>): ValidationResult {
        return this.validateRequiredConfig(config, ['provider']);
    }
} 