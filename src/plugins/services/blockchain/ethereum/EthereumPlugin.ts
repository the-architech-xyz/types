/**
 * Ethereum Blockchain Plugin - Pure Technology Implementation
 * 
 * Provides Ethereum blockchain integration with smart contracts and Web3 setup.
 * Focuses only on blockchain technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIBlockchainPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
import { ValidationResult, ValidationError } from '../../../../types/agents.js';
import { EthereumConfig, EthereumConfigSchema, EthereumDefaultConfig } from './EthereumSchema.js';
import { EthereumGenerator } from './EthereumGenerator.js';

export class EthereumPlugin extends BasePlugin implements IUIBlockchainPlugin {
  private generator!: EthereumGenerator;

  constructor() {
    super();
    // Generator will be initialized in install method when pathResolver is available
  }

  // ============================================================================
  // PLUGIN METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'ethereum',
      name: 'Ethereum Blockchain',
      version: '1.0.0',
      description: 'Ethereum blockchain integration with smart contracts and Web3',
      author: 'The Architech Team',
      category: PluginCategory.CUSTOM,
      tags: ['blockchain', 'ethereum', 'web3', 'smart-contracts', 'defi', 'nft', 'wallet'],
      license: 'MIT',
      repository: 'https://github.com/ethereum/ethereum-js',
      homepage: 'https://ethereum.org',
      documentation: 'https://docs.ethereum.org'
    };
  }

  // ============================================================================
  // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getParameterSchema() {
    return {
      category: PluginCategory.CUSTOM,
      groups: [
        { id: 'network', name: 'Network Settings', description: 'Configure Ethereum network connection.', order: 1, parameters: ['network', 'provider'] },
        { id: 'provider', name: 'Provider Settings', description: 'Configure RPC provider settings.', order: 2, parameters: ['apiKey', 'rpcUrl'] },
        { id: 'wallet', name: 'Wallet Integration', description: 'Configure wallet connection settings.', order: 3, parameters: ['enableWalletConnect', 'walletConnectProjectId'] }
      ],
      parameters: [
        {
          id: 'network',
          name: 'Network',
          type: 'select' as const,
          description: 'The Ethereum network to connect to.',
          required: true,
          default: 'sepolia',
          options: [
            { value: 'mainnet', label: 'Mainnet (Production)' },
            { value: 'sepolia', label: 'Sepolia (Testnet)' },
            { value: 'goerli', label: 'Goerli (Testnet)' },
            { value: 'local', label: 'Local (Development)' }
          ],
          group: 'network'
        },
        {
          id: 'provider',
          name: 'Provider',
          type: 'select' as const,
          description: 'The JSON-RPC provider to use for network access.',
          required: true,
          default: 'public',
          options: [
            { value: 'alchemy', label: 'Alchemy' },
            { value: 'infura', label: 'Infura' },
            { value: 'public', label: 'Public RPC' },
            { value: 'custom', label: 'Custom RPC' }
          ],
          group: 'network'
        },
        {
          id: 'apiKey',
          name: 'API Key',
          type: 'string' as const,
          description: 'Your API key for the selected provider (Alchemy or Infura).',
          required: false,
          group: 'provider'
        },
        {
          id: 'rpcUrl',
          name: 'Custom RPC URL',
          type: 'string' as const,
          description: 'A custom JSON-RPC URL to connect to the network.',
          required: false,
          group: 'provider'
        },
        {
          id: 'enableWalletConnect',
          name: 'Enable WalletConnect',
          type: 'boolean' as const,
          description: 'Enable WalletConnect for connecting to mobile wallets.',
          required: false,
          default: true,
          group: 'wallet'
        },
        {
          id: 'walletConnectProjectId',
          name: 'WalletConnect Project ID',
          type: 'string' as const,
          description: 'Your project ID from WalletConnect Cloud.',
          required: false,
          group: 'wallet'
        }
      ],
      dependencies: [],
      validations: []
    };
  }

  validateConfiguration(config: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.network) {
      errors.push({
        field: 'network',
        message: 'Ethereum network is required',
        code: 'MISSING_FIELD',
        severity: 'error'
      });
    }

    if (!config.provider) {
      errors.push({
        field: 'provider',
        message: 'Provider is required',
        code: 'MISSING_FIELD',
        severity: 'error'
      });
    }

    // Validate provider-specific requirements
    if (config.provider === 'custom' && !config.rpcUrl) {
      errors.push({
        field: 'rpcUrl',
        message: 'A custom RPC URL is required when the provider is set to "custom"',
        code: 'MISSING_RPC_URL',
        severity: 'error'
      });
    }

    if ((config.provider === 'alchemy' || config.provider === 'infura') && !config.apiKey) {
      errors.push({
        field: 'apiKey',
        message: `An API key is required for the "${config.provider}" provider`,
        code: 'MISSING_API_KEY',
        severity: 'error'
      });
    }

    if (config.enableWalletConnect && !config.walletConnectProjectId) {
      errors.push({
        field: 'walletConnectProjectId',
        message: 'A WalletConnect project ID is required when WalletConnect is enabled',
        code: 'MISSING_WC_PROJECT_ID',
        severity: 'error'
      });
    }

    // Validate network and provider combinations
    if (config.network === 'mainnet' && config.provider === 'public') {
      warnings.push('Using public RPC for mainnet may have rate limits. Consider using Alchemy or Infura for production.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return {
      category: PluginCategory.CUSTOM,
      exports: [
        {
          name: 'wagmiConfig',
          type: 'constant',
          implementation: 'Wagmi configuration',
          documentation: 'Wagmi configuration for Ethereum blockchain interaction'
        },
        {
          name: 'Web3Provider',
          type: 'class' as const,
          implementation: 'React provider for Web3',
          documentation: 'Provider component for Web3 context and wallet connection'
        },
        {
          name: 'ethereum',
          type: 'constant',
          implementation: 'Ethereum utilities',
          documentation: 'Ethereum blockchain interaction utilities'
        }
      ],
      types: [],
      utilities: [],
      constants: [],
      documentation: 'Ethereum blockchain integration with smart contracts and Web3'
    };
  }

  // ============================================================================
  // IUIBlockchainPlugin INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getBlockchainNetworks(): string[] {
    return ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'];
  }

  getSmartContractOptions(): string[] {
    return ['erc20', 'erc721', 'erc1155', 'defi', 'governance', 'custom'];
  }

  getWalletOptions(): string[] {
    return ['metamask', 'walletconnect', 'coinbase', 'rainbow', 'trust'];
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectName, projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Ethereum blockchain integration...');

      // Initialize path resolver
      this.initializePathResolver(context);
      
      // Initialize generator
      this.generator = new EthereumGenerator();

      // Validate configuration
      const validation = this.validateConfiguration(pluginConfig);
      if (!validation.valid) {
        return this.createErrorResult('Invalid Ethereum configuration', validation.errors, startTime);
      }

      // Step 1: Install dependencies
      await this.installDependencies(['wagmi', 'viem', '@tanstack/react-query']);

      // Step 2: Generate files using the generator
      const wagmiConfig = EthereumGenerator.generateWagmiConfig(pluginConfig as any);
      const web3Provider = EthereumGenerator.generateWeb3Provider(pluginConfig as any);
      const envConfig = EthereumGenerator.generateEnvConfig(pluginConfig as any);
      
      // Step 3: Write files to project
      await this.generateFile('src/lib/ethereum/config.ts', wagmiConfig);
      await this.generateFile('src/components/providers/Web3Provider.tsx', web3Provider);
      await this.generateFile('.env.local', envConfig);

      const duration = Date.now() - startTime;

      return this.createSuccessResult(
        [
          { type: 'file' as const, path: 'src/lib/ethereum/config.ts' },
          { type: 'file' as const, path: 'src/components/providers/Web3Provider.tsx' },
          { type: 'file' as const, path: '.env.local' }
        ],
        [
          {
            name: 'wagmi',
            version: '^2.5.7',
            type: 'production',
            category: PluginCategory.CUSTOM
          },
          {
            name: 'viem',
            version: '^2.7.12',
            type: 'production',
            category: PluginCategory.CUSTOM
          },
          {
            name: '@tanstack/react-query',
            version: '^5.22.2',
            type: 'production',
            category: PluginCategory.CUSTOM
          }
        ],
        [],
        [],
        [
          'Ethereum integration requires you to wrap your application with the Web3Provider component.',
          ...validation.warnings
        ],
        startTime
      );

    } catch (error) {
      return this.createErrorResult(
        'Failed to install Ethereum blockchain integration',
        [],
        startTime
      );
    }
  }

  // ============================================================================
  // PLUGIN INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getDependencies(): string[] {
    return ['wagmi', 'viem', '@tanstack/react-query'];
  }

  getDevDependencies(): string[] {
    return [];
  }

  getCompatibility(): any {
    return {
      frameworks: ['nextjs', 'react', 'vue', 'svelte'],
      platforms: ['web', 'mobile'],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: []
    };
  }

  getConflicts(): string[] {
    return [];
  }

  getRequirements(): any[] {
    return [
      {
        type: 'package',
        name: 'wagmi',
        description: 'React hooks for Ethereum',
        version: '^2.5.7'
      },
      {
        type: 'package',
        name: 'viem',
        description: 'TypeScript interface for Ethereum',
        version: '^2.7.12'
      },
      {
        type: 'package',
        name: '@tanstack/react-query',
        description: 'Data synchronization for React',
        version: '^5.22.2'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      network: 'sepolia',
      provider: 'public',
      apiKey: '',
      rpcUrl: '',
      enableWalletConnect: true,
      walletConnectProjectId: ''
    };
  }

  getConfigSchema(): any {
    return EthereumConfigSchema;
  }
} 