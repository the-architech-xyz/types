/**
 * Base Payment Plugin Class
 */
import { BasePlugin } from './BasePlugin.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
export class BasePaymentPlugin extends BasePlugin {
    questionGenerator;
    constructor() {
        super();
        this.questionGenerator = new DynamicQuestionGenerator();
    }
    // --- Shared Logic ---
    getBasePaymentSchema() {
        // Base schema with provider selection
        return {};
    }
    async setupWebhookEndpoint(context, config) {
        // Common logic for creating a /api/webhooks/{provider} endpoint
    }
    generatePaymentProviderEnvVars(provider) {
        // Logic for STRIPE_SECRET_KEY, PAYPAL_CLIENT_ID etc.
        return {};
    }
    // --- Interface Implementation ---
    getDynamicQuestions(context) {
        return this.questionGenerator.generateQuestions(this, context);
    }
    validateConfiguration(config) {
        return this.validateRequiredConfig(config, ['provider']);
    }
}
//# sourceMappingURL=BasePaymentPlugin.js.map