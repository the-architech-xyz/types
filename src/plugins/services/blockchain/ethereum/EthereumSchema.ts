import { ConfigSchema } from '../../../../types/plugins.js';

export interface EthereumConfig {
  network: 'mainnet' | 'sepolia' | 'goerli' | 'local';
  provider: 'alchemy' | 'infura' | 'public' | 'custom';
  apiKey?: string;
  rpcUrl?: string;
  enableWalletConnect: boolean;
  walletConnectProjectId?: string;
}

export const EthereumConfigSchema: ConfigSchema = {
  type: 'object',
  properties: {
    network: {
      type: 'string',
      description: 'The Ethereum network to connect to.',
      enum: ['mainnet', 'sepolia', 'goerli', 'local'],
      default: 'sepolia',
    },
    provider: {
      type: 'string',
      description: 'The JSON-RPC provider to use for network access.',
      enum: ['alchemy', 'infura', 'public', 'custom'],
      default: 'public',
    },
    apiKey: {
      type: 'string',
      description: 'Your API key for the selected provider (Alchemy or Infura).',
    },
    rpcUrl: {
      type: 'string',
      description: 'A custom JSON-RPC URL to connect to the network.',
    },
    enableWalletConnect: {
      type: 'boolean',
      description: 'Enable WalletConnect for connecting to mobile wallets.',
      default: true,
    },
    walletConnectProjectId: {
      type: 'string',
      description: 'Your project ID from WalletConnect Cloud.',
    },
  },
  required: ['network', 'provider'],
  additionalProperties: false,
};

export const EthereumDefaultConfig: EthereumConfig = {
  network: 'sepolia',
  provider: 'public',
  enableWalletConnect: true,
}; 