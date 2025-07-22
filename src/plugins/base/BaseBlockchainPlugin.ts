/**
 * Base Blockchain Plugin Class
 */
import { BasePlugin } from './BasePlugin.js';
import { IUIBlockchainPlugin, BlockchainNetwork, SmartContractOption, WalletOption, ParameterSchema } from '../../types/plugin-interfaces.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
import { ValidationResult } from '../../types/agent.js';
import { PluginContext } from '../../types/plugin.js';

export abstract class BaseBlockchainPlugin extends BasePlugin implements IUIBlockchainPlugin {
    private questionGenerator: DynamicQuestionGenerator;

    constructor() {
        super();
        this.questionGenerator = new DynamicQuestionGenerator();
    }

    // --- Abstract Methods ---
    abstract getBlockchainNetworks(): BlockchainNetwork[];
    abstract getSmartContractOptions(): SmartContractOption[];
    abstract getWalletOptions(): WalletOption[];

    // --- Shared Logic ---
    protected getBaseBlockchainSchema(): ParameterSchema {
        // Base schema with network selection
        return {} as ParameterSchema;
    }

    protected async setupRPCClient(context: PluginContext, config: any): Promise<void> {
        // Common logic for setting up an ethers.js or web3.js provider
    }

    protected generateNetworkEnvVars(network: BlockchainNetwork): Record<string, string> {
        // Logic for INFURA_API_KEY, ALCHEMY_ID etc.
        return {};
    }

    // --- Interface Implementation ---
    getDynamicQuestions(context: PluginContext): any[] {
        return this.questionGenerator.generateQuestions(this, context);
    }

    validateConfiguration(config: Record<string, any>): ValidationResult {
        return this.validateRequiredConfig(config, ['network']);
    }
} 