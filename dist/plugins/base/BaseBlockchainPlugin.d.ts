/**
 * Base Blockchain Plugin Class
 */
import { BasePlugin } from './BasePlugin.js';
import { IUIBlockchainPlugin, BlockchainNetwork, SmartContractOption, WalletOption, ParameterSchema } from '../../types/plugin-interfaces.js';
import { ValidationResult } from '../../types/agent.js';
import { PluginContext } from '../../types/plugin.js';
export declare abstract class BaseBlockchainPlugin extends BasePlugin implements IUIBlockchainPlugin {
    private questionGenerator;
    constructor();
    abstract getBlockchainNetworks(): BlockchainNetwork[];
    abstract getSmartContractOptions(): SmartContractOption[];
    abstract getWalletOptions(): WalletOption[];
    protected getBaseBlockchainSchema(): ParameterSchema;
    protected setupRPCClient(context: PluginContext, config: any): Promise<void>;
    protected generateNetworkEnvVars(network: BlockchainNetwork): Record<string, string>;
    getDynamicQuestions(context: PluginContext): any[];
    validateConfiguration(config: Record<string, any>): ValidationResult;
}
