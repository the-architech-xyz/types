/**
 * Base Email Plugin Class
 */
import { BasePlugin } from './BasePlugin.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
export class BaseEmailPlugin extends BasePlugin {
    questionGenerator;
    constructor() {
        super();
        this.questionGenerator = new DynamicQuestionGenerator();
    }
    // --- Shared Logic ---
    getBaseEmailSchema() {
        // Base schema with service selection
        return {};
    }
    async setupEmailClient(context, config) {
        // Common logic for setting up an email client (e.g., Nodemailer, Resend SDK)
    }
    generateEmailServiceEnvVars(service) {
        // Logic for RESEND_API_KEY, SENDGRID_API_KEY etc.
        return {};
    }
    // --- Interface Implementation ---
    getDynamicQuestions(context) {
        return this.questionGenerator.generateQuestions(this, context);
    }
    validateConfiguration(config) {
        return this.validateRequiredConfig(config, ['service']);
    }
}
//# sourceMappingURL=BaseEmailPlugin.js.map