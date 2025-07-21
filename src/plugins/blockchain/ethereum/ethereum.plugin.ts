import { IPlugin, PluginMetadata, PluginCategory, PluginContext, PluginResult, ValidationResult, ConfigSchema, ConfigProperty, DependencyInfo, ScriptInfo, PluginError, CompatibilityMatrix, PluginRequirement, TargetPlatform } from '../../../types/plugin.js';
import { ValidationError } from '../../../types/agent.js';
import { AgentLogger } from '../../../core/cli/logger.js';

export class EthereumPlugin implements IPlugin {
  private logger: AgentLogger;

  constructor() {
    this.logger = new AgentLogger(false, 'EthereumPlugin');
  }

  getMetadata(): PluginMetadata {
    return {
      id: 'ethereum',
      name: 'Ethereum Blockchain',
      version: '1.0.0',
      description: 'Ethereum blockchain integration with smart contracts and Web3',
      author: 'The Architech Team',
      category: PluginCategory.CUSTOM, // Using CUSTOM for blockchain category
      tags: ['blockchain', 'ethereum', 'web3', 'smart-contracts', 'defi', 'nft'],
      license: 'MIT',
      repository: 'https://github.com/ethereum/ethereum-js',
      homepage: 'https://ethereum.org',
      documentation: 'https://docs.ethereum.org'
    };
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    this.logger.info('Validating Ethereum plugin configuration');

    const { pluginConfig } = context;
    
    if (!pluginConfig.network) {
      return {
        valid: false,
        errors: [{
          field: 'network',
          message: 'Ethereum network configuration is required',
          code: 'MISSING_NETWORK',
          severity: 'error'
        }],
        warnings: []
      };
    }

    return { 
      valid: true, 
      errors: [], 
      warnings: [] 
    };
  }

  async install(context: PluginContext): Promise<PluginResult> {
    this.logger.info('Installing Ethereum plugin');

    const { pluginConfig, projectPath } = context;

    try {
      // Install dependencies
      await this.installDependencies(projectPath);

      // Generate configuration files
      const files = await this.generateFiles(pluginConfig);

      // Add environment variables
      const envVars = this.generateEnvironmentVariables(pluginConfig);

      return {
        success: true,
        artifacts: files.map(file => ({
          type: 'file',
          path: file.path,
          content: file.content
        })),
        dependencies: [
          {
            name: 'ethers',
            version: '^6.8.1',
            type: 'production',
            category: PluginCategory.CUSTOM
          },
          {
            name: 'wagmi',
            version: '^1.4.7',
            type: 'production',
            category: PluginCategory.CUSTOM
          },
          {
            name: 'viem',
            version: '^1.19.9',
            type: 'production',
            category: PluginCategory.CUSTOM
          }
        ],
        scripts: [
          {
            name: 'blockchain:dev',
            command: 'echo "Ethereum blockchain enabled in development"',
            description: 'Development blockchain status',
            category: 'dev'
          },
          {
            name: 'blockchain:deploy',
            command: 'echo "Deploy smart contracts to Ethereum"',
            description: 'Deploy contracts to blockchain',
            category: 'deploy'
          }
        ],
        configs: [],
        errors: [],
        warnings: [],
        duration: 0
      };
    } catch (error) {
      this.logger.error('Failed to install Ethereum plugin:', error as Error);
      return {
        success: false,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [{
          code: 'INSTALL_FAILED',
          message: `Failed to setup Ethereum: ${error}`,
          severity: 'error'
        }],
        warnings: [],
        duration: 0
      };
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    this.logger.info('Uninstalling Ethereum plugin');
    
    return {
      success: true,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors: [],
      warnings: [],
      duration: 0
    };
  }

  async update(context: PluginContext): Promise<PluginResult> {
    this.logger.info('Updating Ethereum plugin');
    
    return this.install(context);
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['nextjs', 'react', 'vue', 'angular'],
      platforms: [TargetPlatform.WEB],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: []
    };
  }

  getDependencies(): string[] {
    return ['ethers', 'wagmi', 'viem'];
  }

  getConflicts(): string[] {
    return [];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'ethers',
        description: 'Ethereum library for interacting with the blockchain',
        version: '^6.8.1'
      },
      {
        type: 'package',
        name: 'wagmi',
        description: 'React hooks for Ethereum',
        version: '^1.4.7'
      },
      {
        type: 'package',
        name: 'viem',
        description: 'TypeScript interface for Ethereum',
        version: '^1.19.9'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      network: 'sepolia',
      enableSmartContracts: true,
      enableNFT: false,
      enableDeFi: false,
      enableWalletConnect: true,
      enableMetaMask: true,
      enableCoinbaseWallet: false,
      enableWalletConnectV2: true,
      rpcUrl: '',
      chainId: 11155111, // Sepolia testnet
      blockExplorer: 'https://sepolia.etherscan.io',
      enableHardhat: false,
      enableTruffle: false
    };
  }

  getConfigSchema(): ConfigSchema {
    return {
      type: 'object',
      properties: {
        network: {
          type: 'string',
          description: 'Ethereum network (mainnet, sepolia, goerli, local)',
          default: 'sepolia',
          enum: ['mainnet', 'sepolia', 'goerli', 'local']
        },
        enableSmartContracts: {
          type: 'boolean',
          description: 'Enable smart contract development and deployment',
          default: true
        },
        enableNFT: {
          type: 'boolean',
          description: 'Enable NFT functionality',
          default: false
        },
        enableDeFi: {
          type: 'boolean',
          description: 'Enable DeFi protocols integration',
          default: false
        },
        enableWalletConnect: {
          type: 'boolean',
          description: 'Enable WalletConnect integration',
          default: true
        },
        enableMetaMask: {
          type: 'boolean',
          description: 'Enable MetaMask wallet integration',
          default: true
        },
        enableCoinbaseWallet: {
          type: 'boolean',
          description: 'Enable Coinbase Wallet integration',
          default: false
        },
        enableWalletConnectV2: {
          type: 'boolean',
          description: 'Enable WalletConnect v2',
          default: true
        },
        rpcUrl: {
          type: 'string',
          description: 'Custom RPC URL for the network',
          default: ''
        },
        chainId: {
          type: 'number',
          description: 'Chain ID for the network',
          default: 11155111
        },
        blockExplorer: {
          type: 'string',
          description: 'Block explorer URL',
          default: 'https://sepolia.etherscan.io'
        },
        enableHardhat: {
          type: 'boolean',
          description: 'Enable Hardhat development environment',
          default: false
        },
        enableTruffle: {
          type: 'boolean',
          description: 'Enable Truffle development environment',
          default: false
        }
      },
      required: ['network']
    };
  }

  private async installDependencies(projectPath: string): Promise<void> {
    this.logger.info('Installing Ethereum dependencies');
    
    // This would be handled by the package manager
    // For now, we just log the required packages
    this.logger.info('Required packages: ethers, wagmi, viem');
  }

  private async generateFiles(config: Record<string, any>): Promise<Array<{ path: string; content: string; mergeStrategy: 'append' | 'replace' | 'merge' }>> {
    const files = [];

    // Generate Ethereum configuration
    files.push({
      path: 'src/lib/ethereum.ts',
      content: this.generateEthereumConfig(config),
      mergeStrategy: 'replace' as const
    });

    // Generate Web3 provider component
    files.push({
      path: 'src/components/providers/web3-provider.tsx',
      content: this.generateWeb3Provider(config),
      mergeStrategy: 'replace' as const
    });

    // Generate Ethereum utilities
    files.push({
      path: 'src/lib/ethereum-utils.ts',
      content: this.generateEthereumUtils(config),
      mergeStrategy: 'replace' as const
    });

    // Generate smart contract utilities
    if (config.enableSmartContracts) {
      files.push({
        path: 'src/lib/contracts.ts',
        content: this.generateContractUtils(config),
        mergeStrategy: 'replace' as const
      });
    }

    // Generate NFT utilities
    if (config.enableNFT) {
      files.push({
        path: 'src/lib/nft.ts',
        content: this.generateNFTUtils(config),
        mergeStrategy: 'replace' as const
      });
    }

    // Generate DeFi utilities
    if (config.enableDeFi) {
      files.push({
        path: 'src/lib/defi.ts',
        content: this.generateDeFiUtils(config),
        mergeStrategy: 'replace' as const
      });
    }

    return files;
  }

  private generateEthereumConfig(config: Record<string, any>): string {
    const enableSmartContracts = config.enableSmartContracts !== false;
    const enableNFT = config.enableNFT === true;
    const enableDeFi = config.enableDeFi === true;
    const enableWalletConnect = config.enableWalletConnect !== false;
    const enableMetaMask = config.enableMetaMask !== false;
    const enableCoinbaseWallet = config.enableCoinbaseWallet === true;
    const enableWalletConnectV2 = config.enableWalletConnectV2 !== false;

    return `import { ethers } from 'ethers';
import { createConfig, configureChains, mainnet, sepolia, goerli } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';

// ============================================================================
// ETHEREUM CONFIGURATION
// ============================================================================

export const ethereumConfig = {
  // Network configuration
  network: '${config.network}',
  chainId: ${config.chainId},
  rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || '${config.rpcUrl}',
  blockExplorer: '${config.blockExplorer}',
  
  // Feature flags
  enableSmartContracts: ${enableSmartContracts},
  enableNFT: ${enableNFT},
  enableDeFi: ${enableDeFi},
  enableWalletConnect: ${enableWalletConnect},
  enableMetaMask: ${enableMetaMask},
  enableCoinbaseWallet: ${enableCoinbaseWallet},
  enableWalletConnectV2: ${enableWalletConnectV2},
  
  // Development tools
  enableHardhat: ${config.enableHardhat === true},
  enableTruffle: ${config.enableTruffle === true},
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
};

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================

const getNetworkConfig = () => {
  switch (ethereumConfig.network) {
    case 'mainnet':
      return mainnet;
    case 'sepolia':
      return sepolia;
    case 'goerli':
      return goerli;
    case 'local':
      return {
        id: 31337,
        name: 'Local Hardhat',
        network: 'hardhat',
        nativeCurrency: {
          decimals: 18,
          name: 'Ether',
          symbol: 'ETH',
        },
        rpcUrls: {
          default: { http: ['http://127.0.0.1:8545'] },
          public: { http: ['http://127.0.0.1:8545'] },
        },
      };
    default:
      return sepolia;
  }
};

// ============================================================================
// WAGMI CONFIGURATION
// ============================================================================

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [getNetworkConfig()],
  [
    publicProvider(),
    // Add custom RPC provider if provided
    ...(ethereumConfig.rpcUrl ? [
      new ethers.providers.JsonRpcProvider(ethereumConfig.rpcUrl)
    ] : []),
  ]
);

const connectors = [
  ${enableMetaMask ? `
  new MetaMaskConnector({ chains }),` : ''}
  ${enableWalletConnect ? `
  new WalletConnectConnector({
    chains,
    options: {
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
      showQrModal: true,
    },
  }),` : ''}
  ${enableCoinbaseWallet ? `
  new CoinbaseWalletConnector({
    chains,
    options: {
      appName: 'Your App Name',
      jsonRpcUrl: ethereumConfig.rpcUrl,
    },
  }),` : ''}
];

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

// ============================================================================
// PROVIDER UTILITIES
// ============================================================================

export function getProvider(): ethers.providers.Provider {
  if (ethereumConfig.rpcUrl) {
    return new ethers.providers.JsonRpcProvider(ethereumConfig.rpcUrl);
  }
  
  switch (ethereumConfig.network) {
    case 'mainnet':
      return ethers.getDefaultProvider('mainnet');
    case 'sepolia':
      return ethers.getDefaultProvider('sepolia');
    case 'goerli':
      return ethers.getDefaultProvider('goerli');
    case 'local':
      return new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    default:
      return ethers.getDefaultProvider('sepolia');
  }
}

export function getSigner(): ethers.Signer | null {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum).getSigner();
  }
  return null;
}

// ============================================================================
// NETWORK UTILITIES
// ============================================================================

export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 11155111:
      return 'Sepolia Testnet';
    case 5:
      return 'Goerli Testnet';
    case 31337:
      return 'Local Hardhat';
    default:
      return 'Unknown Network';
  }
}

export function getBlockExplorerUrl(chainId: number): string {
  switch (chainId) {
    case 1:
      return 'https://etherscan.io';
    case 11155111:
      return 'https://sepolia.etherscan.io';
    case 5:
      return 'https://goerli.etherscan.io';
    case 31337:
      return '';
    default:
      return '';
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ethers };
`;
  }

  private generateWeb3Provider(config: Record<string, any>): string {
    return `'use client';

import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from '../../lib/ethereum';

// ============================================================================
// WEB3 PROVIDER COMPONENT
// ============================================================================

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      {children}
    </WagmiConfig>
  );
}

// ============================================================================
// WEB3 HOOKS
// ============================================================================

import { useAccount, useConnect, useDisconnect, useNetwork, useBalance } from 'wagmi';

export function useWeb3() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error: connectError, isLoading: connectLoading } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain, chains } = useNetwork();
  const { data: balance } = useBalance({
    address,
  });

  return {
    // Account
    address,
    isConnected,
    isConnecting,
    
    // Connection
    connect,
    connectors,
    connectError,
    connectLoading,
    disconnect,
    
    // Network
    chain,
    chains,
    
    // Balance
    balance,
  };
}

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect, disconnect } = useWeb3();

  const connectWallet = async (connector: any) => {
    try {
      await connect({ connector });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  return {
    address,
    isConnected,
    connectWallet,
    disconnectWallet,
  };
}
`;
  }

  private generateEthereumUtils(config: Record<string, any>): string {
    const enableSmartContracts = config.enableSmartContracts !== false;
    const enableNFT = config.enableNFT === true;
    const enableDeFi = config.enableDeFi === true;

    return `import { ethers } from 'ethers';
import { getProvider, getSigner, getNetworkName, getBlockExplorerUrl } from './ethereum';

// ============================================================================
// ETHEREUM UTILITIES
// ============================================================================

/**
 * Format Ethereum address
 */
export function formatAddress(address: string, length: number = 6): string {
  if (!address) return '';
  return \`\${address.slice(0, length)}...\${address.slice(-length)}\`;
}

/**
 * Format Ethereum balance
 */
export function formatBalance(balance: ethers.BigNumber, decimals: number = 18): string {
  return ethers.utils.formatUnits(balance, decimals);
}

/**
 * Parse Ethereum amount
 */
export function parseAmount(amount: string, decimals: number = 18): ethers.BigNumber {
  return ethers.utils.parseUnits(amount, decimals);
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return ethers.utils.isAddress(address);
}

/**
 * Get transaction URL
 */
export function getTransactionUrl(txHash: string, chainId: number): string {
  const explorerUrl = getBlockExplorerUrl(chainId);
  return \`\${explorerUrl}/tx/\${txHash}\`;
}

/**
 * Get address URL
 */
export function getAddressUrl(address: string, chainId: number): string {
  const explorerUrl = getBlockExplorerUrl(chainId);
  return \`\${explorerUrl}/address/\${address}\`;
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  txHash: string,
  confirmations: number = 1
): Promise<ethers.providers.TransactionReceipt> {
  const provider = getProvider();
  return await provider.waitForTransaction(txHash, confirmations);
}

/**
 * Get gas price
 */
export async function getGasPrice(): Promise<ethers.BigNumber> {
  const provider = getProvider();
  return await provider.getGasPrice();
}

/**
 * Estimate gas for transaction
 */
export async function estimateGas(transaction: ethers.providers.TransactionRequest): Promise<ethers.BigNumber> {
  const provider = getProvider();
  return await provider.estimateGas(transaction);
}

${enableSmartContracts ? `
/**
 * Deploy smart contract
 */
export async function deployContract(
  abi: any[],
  bytecode: string,
  args: any[] = []
): Promise<ethers.Contract> {
  const signer = getSigner();
  if (!signer) {
    throw new Error('No signer available');
  }

  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(...args);
  await contract.deployed();
  
  return contract;
}

/**
 * Load existing contract
 */
export function loadContract(
  address: string,
  abi: any[]
): ethers.Contract {
  const signer = getSigner();
  const provider = getProvider();
  
  if (signer) {
    return new ethers.Contract(address, abi, signer);
  }
  
  return new ethers.Contract(address, abi, provider);
}
` : ''}

${enableNFT ? `
/**
 * Get NFT metadata
 */
export async function getNFTMetadata(
  contractAddress: string,
  tokenId: string,
  abi: any[]
): Promise<any> {
  const contract = loadContract(contractAddress, abi);
  
  try {
    const tokenURI = await contract.tokenURI(tokenId);
    const response = await fetch(tokenURI);
    return await response.json();
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
}

/**
 * Mint NFT
 */
export async function mintNFT(
  contractAddress: string,
  abi: any[],
  to: string,
  tokenURI: string
): Promise<ethers.ContractTransaction> {
  const contract = loadContract(contractAddress, abi);
  return await contract.mint(to, tokenURI);
}
` : ''}

${enableDeFi ? `
/**
 * Get token balance
 */
export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string,
  abi: any[]
): Promise<ethers.BigNumber> {
  const contract = loadContract(tokenAddress, abi);
  return await contract.balanceOf(walletAddress);
}

/**
 * Transfer tokens
 */
export async function transferTokens(
  tokenAddress: string,
  abi: any[],
  to: string,
  amount: ethers.BigNumber
): Promise<ethers.ContractTransaction> {
  const contract = loadContract(tokenAddress, abi);
  return await contract.transfer(to, amount);
}

/**
 * Approve tokens
 */
export async function approveTokens(
  tokenAddress: string,
  abi: any[],
  spender: string,
  amount: ethers.BigNumber
): Promise<ethers.ContractTransaction> {
  const contract = loadContract(tokenAddress, abi);
  return await contract.approve(spender, amount);
}
` : ''}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class EthereumError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'EthereumError';
  }
}

export function handleEthereumError(error: any): EthereumError {
  if (error instanceof EthereumError) {
    return error;
  }

  return new EthereumError(
    error.message || 'Ethereum operation failed',
    error.code || 'UNKNOWN_ERROR',
    error.details
  );
}
`;
  }

  private generateContractUtils(config: Record<string, any>): string {
    return `import { ethers } from 'ethers';
import { deployContract, loadContract, waitForTransaction } from './ethereum-utils';

// ============================================================================
// SMART CONTRACT UTILITIES
// ============================================================================

/**
 * ERC20 Token ABI
 */
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

/**
 * ERC721 NFT ABI
 */
export const ERC721_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'function mint(address to, string memory tokenURI) returns (uint256)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function approve(address to, uint256 tokenId)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
];

/**
 * Simple Storage Contract ABI
 */
export const SIMPLE_STORAGE_ABI = [
  'function store(uint256 _value)',
  'function retrieve() view returns (uint256)',
  'event Stored(uint256 indexed value)',
];

/**
 * Simple Storage Contract Bytecode
 */
export const SIMPLE_STORAGE_BYTECODE = '608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea264697066735822122032ba69653c1c19b6e9b6e9b6e9b6e9b6e9b6e9b6e9b6e9b6e9b6e9b6e9b6e9b64736f6c63430008120033';

/**
 * Deploy Simple Storage Contract
 */
export async function deploySimpleStorage(initialValue: number = 0): Promise<ethers.Contract> {
  return await deployContract(SIMPLE_STORAGE_ABI, SIMPLE_STORAGE_BYTECODE, [initialValue]);
}

/**
 * Load Simple Storage Contract
 */
export function loadSimpleStorage(address: string): ethers.Contract {
  return loadContract(address, SIMPLE_STORAGE_ABI);
}

/**
 * Store value in Simple Storage
 */
export async function storeValue(
  contractAddress: string,
  value: number
): Promise<ethers.ContractTransaction> {
  const contract = loadSimpleStorage(contractAddress);
  return await contract.store(value);
}

/**
 * Retrieve value from Simple Storage
 */
export async function retrieveValue(contractAddress: string): Promise<number> {
  const contract = loadSimpleStorage(contractAddress);
  const value = await contract.retrieve();
  return value.toNumber();
}

/**
 * Load ERC20 Token Contract
 */
export function loadERC20Token(address: string): ethers.Contract {
  return loadContract(address, ERC20_ABI);
}

/**
 * Load ERC721 NFT Contract
 */
export function loadERC721NFT(address: string): ethers.Contract {
  return loadContract(address, ERC721_ABI);
}

/**
 * Get contract events
 */
export async function getContractEvents(
  contractAddress: string,
  abi: any[],
  eventName: string,
  fromBlock: number = 0,
  toBlock: number = 'latest'
): Promise<ethers.Event[]> {
  const contract = loadContract(contractAddress, abi);
  const filter = contract.filters[eventName]();
  return await contract.queryFilter(filter, fromBlock, toBlock);
}
`;
  }

  private generateNFTUtils(config: Record<string, any>): string {
    return `import { ethers } from 'ethers';
import { loadERC721NFT, getNFTMetadata } from './contracts';

// ============================================================================
// NFT UTILITIES
// ============================================================================

/**
 * NFT Metadata Interface
 */
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Mint NFT
 */
export async function mintNFT(
  contractAddress: string,
  to: string,
  tokenURI: string
): Promise<ethers.ContractTransaction> {
  const contract = loadERC721NFT(contractAddress);
  return await contract.mint(to, tokenURI);
}

/**
 * Get NFT owner
 */
export async function getNFTOwner(
  contractAddress: string,
  tokenId: string
): Promise<string> {
  const contract = loadERC721NFT(contractAddress);
  return await contract.ownerOf(tokenId);
}

/**
 * Get NFT balance
 */
export async function getNFTBalance(
  contractAddress: string,
  owner: string
): Promise<number> {
  const contract = loadERC721NFT(contractAddress);
  const balance = await contract.balanceOf(owner);
  return balance.toNumber();
}

/**
 * Transfer NFT
 */
export async function transferNFT(
  contractAddress: string,
  from: string,
  to: string,
  tokenId: string
): Promise<ethers.ContractTransaction> {
  const contract = loadERC721NFT(contractAddress);
  return await contract.transferFrom(from, to, tokenId);
}

/**
 * Get NFT metadata
 */
export async function getNFTMetadata(
  contractAddress: string,
  tokenId: string
): Promise<NFTMetadata | null> {
  return await getNFTMetadata(contractAddress, tokenId, loadERC721NFT(contractAddress).interface.abi);
}

/**
 * Create NFT metadata
 */
export function createNFTMetadata(
  name: string,
  description: string,
  imageUrl: string,
  attributes?: Array<{ trait_type: string; value: string | number }>
): NFTMetadata {
  return {
    name,
    description,
    image: imageUrl,
    attributes,
  };
}

/**
 * Upload NFT metadata to IPFS
 */
export async function uploadNFTMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
  // This would integrate with IPFS service like Pinata or Infura
  // For now, return a placeholder
  console.log('Uploading NFT metadata to IPFS:', metadata);
  return 'ipfs://placeholder-hash';
}

/**
 * Get NFT collection info
 */
export async function getNFTCollectionInfo(contractAddress: string): Promise<{
  name: string;
  symbol: string;
  totalSupply: number;
}> {
  const contract = loadERC721NFT(contractAddress);
  
  const [name, symbol, totalSupply] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.totalSupply(),
  ]);
  
  return {
    name,
    symbol,
    totalSupply: totalSupply.toNumber(),
  };
}
`;
  }

  private generateDeFiUtils(config: Record<string, any>): string {
    return `import { ethers } from 'ethers';
import { loadERC20Token, getTokenBalance, transferTokens, approveTokens } from './contracts';

// ============================================================================
// DEFI UTILITIES
// ============================================================================

/**
 * Token Info Interface
 */
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: ethers.BigNumber;
}

/**
 * Get token info
 */
export async function getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
  const contract = loadERC20Token(tokenAddress);
  
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.totalSupply(),
  ]);
  
  return {
    name,
    symbol,
    decimals,
    totalSupply,
  };
}

/**
 * Get token balance
 */
export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<ethers.BigNumber> {
  const contract = loadERC20Token(tokenAddress);
  return await contract.balanceOf(walletAddress);
}

/**
 * Transfer tokens
 */
export async function transferTokens(
  tokenAddress: string,
  to: string,
  amount: ethers.BigNumber
): Promise<ethers.ContractTransaction> {
  const contract = loadERC20Token(tokenAddress);
  return await contract.transfer(to, amount);
}

/**
 * Approve tokens for spending
 */
export async function approveTokens(
  tokenAddress: string,
  spender: string,
  amount: ethers.BigNumber
): Promise<ethers.ContractTransaction> {
  const contract = loadERC20Token(tokenAddress);
  return await contract.approve(spender, amount);
}

/**
 * Get token allowance
 */
export async function getTokenAllowance(
  tokenAddress: string,
  owner: string,
  spender: string
): Promise<ethers.BigNumber> {
  const contract = loadERC20Token(tokenAddress);
  return await contract.allowance(owner, spender);
}

/**
 * Common token addresses
 */
export const TOKEN_ADDRESSES = {
  // Mainnet
  mainnet: {
    USDC: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  // Sepolia
  sepolia: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    USDT: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
    DAI: '0x68194a729C2450ad26072b3D33ADaCbcef39D574',
    WETH: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
  },
  // Goerli
  goerli: {
    USDC: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
    USDT: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9',
    DAI: '0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844',
    WETH: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  },
};

/**
 * Get token address by symbol and network
 */
export function getTokenAddress(symbol: string, network: string = 'sepolia'): string {
  const networkTokens = TOKEN_ADDRESSES[network as keyof typeof TOKEN_ADDRESSES];
  if (!networkTokens) {
    throw new Error(\`Network \${network} not supported\`);
  }
  
  const address = networkTokens[symbol as keyof typeof networkTokens];
  if (!address) {
    throw new Error(\`Token \${symbol} not found on \${network}\`);
  }
  
  return address;
}

/**
 * Swap tokens (placeholder for DEX integration)
 */
export async function swapTokens(
  tokenIn: string,
  tokenOut: string,
  amountIn: ethers.BigNumber,
  slippageTolerance: number = 0.5
): Promise<ethers.ContractTransaction> {
  // This would integrate with a DEX like Uniswap
  // For now, return a placeholder transaction
  console.log('Swapping tokens:', { tokenIn, tokenOut, amountIn, slippageTolerance });
  throw new Error('Token swapping not implemented yet');
}

/**
 * Add liquidity to pool (placeholder for DEX integration)
 */
export async function addLiquidity(
  tokenA: string,
  tokenB: string,
  amountA: ethers.BigNumber,
  amountB: ethers.BigNumber
): Promise<ethers.ContractTransaction> {
  // This would integrate with a DEX like Uniswap
  // For now, return a placeholder transaction
  console.log('Adding liquidity:', { tokenA, tokenB, amountA, amountB });
  throw new Error('Liquidity provision not implemented yet');
}
`;
  }

  private generateEnvironmentVariables(config: Record<string, any>): Record<string, string> {
    return {
      NEXT_PUBLIC_ETHEREUM_NETWORK: config.network,
      NEXT_PUBLIC_ETHEREUM_CHAIN_ID: config.chainId.toString(),
      NEXT_PUBLIC_ETHEREUM_RPC_URL: config.rpcUrl,
      NEXT_PUBLIC_ETHEREUM_BLOCK_EXPLORER: config.blockExplorer,
      NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: '',
      NEXT_PUBLIC_ENABLE_ETHEREUM: 'true',
      NEXT_PUBLIC_ETHEREUM_DEBUG: process.env.NODE_ENV === 'development' ? 'true' : 'false'
    };
  }
} 