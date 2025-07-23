/**
 * Base Payment Plugin Class
 */
import { BasePlugin } from './BasePlugin.js';
import { IUIPaymentPlugin, PaymentProvider, PaymentFeature, BillingOption, ParameterSchema } from '../../types/plugins.js';
import { ValidationResult } from '../../types/agents.js';
import { PluginContext } from '../../types/plugins.js';
export declare abstract class BasePaymentPlugin extends BasePlugin implements IUIPaymentPlugin {
    private questionGenerator;
    constructor();
    abstract getPaymentProviders(): PaymentProvider[];
    abstract getPaymentFeatures(): PaymentFeature[];
    abstract getBillingOptions(): BillingOption[];
    protected getBasePaymentSchema(): ParameterSchema;
    protected setupWebhookEndpoint(context: PluginContext, config: any): Promise<void>;
    protected generatePaymentProviderEnvVars(provider: PaymentProvider): Record<string, string>;
    getDynamicQuestions(context: PluginContext): any[];
    validateConfiguration(config: Record<string, any>): ValidationResult;
}
