import { ConfigSchema } from '../../../../types/plugins.js';
export interface EthereumConfig {
    network: 'mainnet' | 'sepolia' | 'goerli' | 'local';
    provider: 'alchemy' | 'infura' | 'public' | 'custom';
    apiKey?: string;
    rpcUrl?: string;
    enableWalletConnect: boolean;
    walletConnectProjectId?: string;
}
export declare const EthereumConfigSchema: ConfigSchema;
export declare const EthereumDefaultConfig: EthereumConfig;
