/**
 * Web3.js Blockchain Integration Blueprint
 * 
 * Sets up complete Web3.js integration for Ethereum blockchain interactions
 * Creates wallet connection, contract interaction, and blockchain utilities
 */

import { Blueprint } from '../../../types/adapter.js';

export const web3Blueprint: Blueprint = {
  id: 'web3-base-setup',
  name: 'Web3.js Base Setup',
  actions: [
    {
      type: 'INSTALL_PACKAGES',
      packages: ['web3']
    },
    {
      type: 'INSTALL_PACKAGES',
      packages: ['@types/web3'],
      isDev: true
    },
    {
      type: 'CREATE_FILE',
      path: 'src/lib/web3/config.ts',
      content: `import Web3 from 'web3';

// Network configurations
export const NETWORKS = {
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    blockExplorer: 'https://etherscan.io'
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com'
  },
  bsc: {
    chainId: 56,
    name: 'BSC Mainnet',
    rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    blockExplorer: 'https://bscscan.com'
  }
};

// Current network configuration
export const getCurrentNetwork = () => {
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1');
  return Object.values(NETWORKS).find(network => network.chainId === chainId) || NETWORKS.mainnet;
};

// Web3 instance
export const createWeb3Instance = (rpcUrl?: string) => {
  const network = getCurrentNetwork();
  return new Web3(rpcUrl || network.rpcUrl);
};`
    },
    {
      type: 'ADD_CONTENT',
      target: '.env.example',
      strategy: 'append',
      fileType: 'env',
      content: `# Web3 Blockchain Configuration
NEXT_PUBLIC_RPC_URL="https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
NEXT_PUBLIC_CHAIN_ID="1"

# Network RPC URLs
NEXT_PUBLIC_MAINNET_RPC_URL="https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
NEXT_PUBLIC_SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
NEXT_PUBLIC_POLYGON_RPC_URL="https://polygon-rpc.com"
NEXT_PUBLIC_BSC_RPC_URL="https://bsc-dataseed.binance.org"

# Add your environment variables here`
    }
  ]
};
