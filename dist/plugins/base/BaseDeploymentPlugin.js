/**
 * Base Deployment Plugin Class
 *
 * Provides common functionality for all deployment-related plugins.
 */
import { BasePlugin } from './BasePlugin.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
export class BaseDeploymentPlugin extends BasePlugin {
    questionGenerator;
    constructor() {
        super();
        this.questionGenerator = new DynamicQuestionGenerator();
    }
    // --- Shared Logic ---
    async generateDeploymentConfig(config) {
        // Common logic for creating vercel.json, Dockerfile, etc.
    }
    addDeploymentScripts(scripts) {
        // Common logic for adding 'deploy' scripts to package.json
        return this.addScripts(scripts);
    }
    getDynamicQuestions(context) {
        return this.questionGenerator.generateQuestions(this, context);
    }
    validateConfiguration(config) {
        // Basic validation, can be extended by child classes
        return this.validateRequiredConfig(config, ['platform']);
    }
}
//# sourceMappingURL=BaseDeploymentPlugin.js.map