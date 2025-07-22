/**
 * Base Monitoring Plugin Class
 */
import { BasePlugin } from './BasePlugin.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
export class BaseMonitoringPlugin extends BasePlugin {
    questionGenerator;
    constructor() {
        super();
        this.questionGenerator = new DynamicQuestionGenerator();
    }
    // --- Shared Logic ---
    getBaseMonitoringSchema() {
        // Base schema with service selection
        return {};
    }
    async setupMonitoringClient(context, config) {
        // Common logic for initializing Sentry SDK, etc.
    }
    generateMonitoringServiceEnvVars(service) {
        // Logic for SENTRY_DSN, etc.
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
//# sourceMappingURL=BaseMonitoringPlugin.js.map