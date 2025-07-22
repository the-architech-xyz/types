/**
 * Base Blockchain Plugin Class
 */
import { BasePlugin } from './BasePlugin.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
export class BaseBlockchainPlugin extends BasePlugin {
    questionGenerator;
    constructor() {
        super();
        this.questionGenerator = new DynamicQuestionGenerator();
    }
    // --- Shared Logic ---
    getBaseBlockchainSchema() {
        // Base schema with network selection
        return {};
    }
    async setupRPCClient(context, config) {
        // Common logic for setting up an ethers.js or web3.js provider
    }
    generateNetworkEnvVars(network) {
        // Logic for INFURA_API_KEY, ALCHEMY_ID etc.
        return {};
    }
    // --- Interface Implementation ---
    getDynamicQuestions(context) {
        return this.questionGenerator.generateQuestions(this, context);
    }
    validateConfiguration(config) {
        return this.validateRequiredConfig(config, ['network']);
    }
}
//# sourceMappingURL=BaseBlockchainPlugin.js.map