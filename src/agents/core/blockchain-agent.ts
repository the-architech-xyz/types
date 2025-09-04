/**
 * Blockchain Agent
 * 
 * Handles blockchain integration modules (Web3, Ethers, Wallet Connect, etc.)
 * Responsible for setting up blockchain interactions and wallet connections
 */

import { SimpleAgent } from '../base/simple-agent.js';
import { Module, ProjectContext, AgentResult } from '../../types/agent.js';
import { PathHandler } from '../../core/services/path/path-handler.js';

export class BlockchainAgent extends SimpleAgent {
  constructor(pathHandler: PathHandler) {
    super('blockchain', pathHandler);
  }

  /**
   * Execute a blockchain module
   */
  async execute(module: Module, context: ProjectContext): Promise<AgentResult> {
    console.log(`⛓️ Blockchain Agent executing: ${module.id}`);
    
    // Validate module
    const validation = this.validateModule(module);
    if (!validation.valid) {
      return {
        success: false,
        files: [],
        errors: validation.errors,
        warnings: []
      };
    }
    
    // Blockchain-specific validation
    const blockchainValidation = this.validateBlockchainModule(module);
    if (!blockchainValidation.valid) {
      return {
        success: false,
        files: [],
        errors: blockchainValidation.errors,
        warnings: []
      };
    }
    
    // Execute the adapter
    return await this.executeAdapter(module, context);
  }

  /**
   * Validate blockchain-specific parameters
   */
  private validateBlockchainModule(module: Module): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate blockchain ID
    const supportedBlockchains = ['web3', 'ethers', 'wallet-connect', 'wagmi'];
    if (!supportedBlockchains.includes(module.id)) {
      errors.push(`Unsupported blockchain library: ${module.id}. Supported: ${supportedBlockchains.join(', ')}`);
    }
    
    // Validate parameters based on blockchain library
    if (module.id === 'web3') {
      this.validateWeb3Parameters(module.parameters, errors);
    } else if (module.id === 'ethers') {
      this.validateEthersParameters(module.parameters, errors);
    } else if (module.id === 'wallet-connect') {
      this.validateWalletConnectParameters(module.parameters, errors);
    } else if (module.id === 'wagmi') {
      this.validateWagmiParameters(module.parameters, errors);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Web3.js specific parameters
   */
  private validateWeb3Parameters(parameters: Record<string, any>, errors: string[]): void {
    // Web3.js specific validations
    if (parameters.networks !== undefined) {
      if (!Array.isArray(parameters.networks)) {
        errors.push('Web3.js networks parameter must be an array');
      } else {
        const supportedNetworks = ['mainnet', 'sepolia', 'goerli', 'polygon', 'bsc', 'arbitrum'];
        const invalidNetworks = parameters.networks.filter((n: string) => !supportedNetworks.includes(n));
        if (invalidNetworks.length > 0) {
          errors.push(`Unsupported networks: ${invalidNetworks.join(', ')}. Supported: ${supportedNetworks.join(', ')}`);
        }
      }
    }
    
    if (parameters.features !== undefined) {
      if (!Array.isArray(parameters.features)) {
        errors.push('Web3.js features parameter must be an array');
      } else {
        const supportedFeatures = ['wallet-connection', 'contract-interaction', 'nft-support', 'defi-support'];
        const invalidFeatures = parameters.features.filter((f: string) => !supportedFeatures.includes(f));
        if (invalidFeatures.length > 0) {
          errors.push(`Unsupported features: ${invalidFeatures.join(', ')}. Supported: ${supportedFeatures.join(', ')}`);
        }
      }
    }
  }

  /**
   * Validate Ethers.js specific parameters
   */
  private validateEthersParameters(parameters: Record<string, any>, errors: string[]): void {
    // Ethers.js specific validations
    if (parameters.version !== undefined) {
      const supportedVersions = ['v5', 'v6'];
      if (!supportedVersions.includes(parameters.version)) {
        errors.push(`Unsupported Ethers.js version: ${parameters.version}. Supported: ${supportedVersions.join(', ')}`);
      }
    }
  }

  /**
   * Validate Wallet Connect specific parameters
   */
  private validateWalletConnectParameters(parameters: Record<string, any>, errors: string[]): void {
    // Wallet Connect specific validations
    if (parameters.version !== undefined) {
      const supportedVersions = ['v1', 'v2'];
      if (!supportedVersions.includes(parameters.version)) {
        errors.push(`Unsupported Wallet Connect version: ${parameters.version}. Supported: ${supportedVersions.join(', ')}`);
      }
    }
  }

  /**
   * Validate Wagmi specific parameters
   */
  private validateWagmiParameters(parameters: Record<string, any>, errors: string[]): void {
    // Wagmi specific validations
    if (parameters.chains !== undefined) {
      if (!Array.isArray(parameters.chains)) {
        errors.push('Wagmi chains parameter must be an array');
      }
    }
  }
}
