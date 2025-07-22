/**
 * Base Testing Plugin Class
 *
 * Provides common functionality for all testing framework plugins.
 */
import { BasePlugin } from './BasePlugin.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
export class BaseTestingPlugin extends BasePlugin {
    questionGenerator;
    constructor() {
        super();
        this.questionGenerator = new DynamicQuestionGenerator();
    }
    // --- Shared Logic ---
    async generateTestingConfig(config) {
        // Common logic for creating vitest.config.ts, jest.config.js, etc.
    }
    addTestingScripts(scripts) {
        return this.addScripts(scripts);
    }
    getDynamicQuestions(context) {
        return this.questionGenerator.generateQuestions(this, context);
    }
    validateConfiguration(config) {
        return this.validateRequiredConfig(config, ['framework']);
    }
}
//# sourceMappingURL=BaseTestingPlugin.js.map