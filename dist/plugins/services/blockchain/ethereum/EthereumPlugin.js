import { PluginCategory, TargetPlatform } from '../../../../types/plugins.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { EthereumConfigSchema, EthereumDefaultConfig } from './EthereumSchema.js';
import { EthereumGenerator } from './EthereumGenerator.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
export class EthereumPlugin {
    runner;
    constructor() {
        this.runner = new CommandRunner();
    }
    getMetadata() {
        return {
            id: 'ethereum',
            name: 'Ethereum Blockchain',
            version: '1.0.0',
            description: 'Ethereum blockchain integration with smart contracts and Web3',
            author: 'The Architech Team',
            category: PluginCategory.CUSTOM,
            tags: ['blockchain', 'ethereum', 'web3', 'smart-contracts', 'defi', 'nft'],
            license: 'MIT',
            repository: 'https://github.com/ethereum/ethereum-js',
            homepage: 'https://ethereum.org',
            documentation: 'https://docs.ethereum.org'
        };
    }
    async validate(context) {
        const errors = [];
        const { pluginConfig } = context;
        const config = pluginConfig;
        if (config.provider === 'custom' && !config.rpcUrl) {
            errors.push({ field: 'rpcUrl', message: 'A custom RPC URL is required when the provider is set to "custom".', code: 'MISSING_RPC_URL', severity: 'error' });
        }
        if ((config.provider === 'alchemy' || config.provider === 'infura') && !config.apiKey) {
            errors.push({ field: 'apiKey', message: `An API key is required for the "${config.provider}" provider.`, code: 'MISSING_API_KEY', severity: 'error' });
        }
        if (config.enableWalletConnect && !config.walletConnectProjectId) {
            errors.push({ field: 'walletConnectProjectId', message: 'A WalletConnect project ID is required when WalletConnect is enabled.', code: 'MISSING_WC_PROJECT_ID', severity: 'error' });
        }
        return { valid: errors.length === 0, errors, warnings: [] };
    }
    async install(context) {
        const startTime = Date.now();
        try {
            await this.installDependencies(context);
            await this.createProjectFiles(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    { type: 'file', path: path.join('src', 'lib', 'ethereum', 'config.ts') },
                    { type: 'file', path: path.join('src', 'components', 'providers', 'Web3Provider.tsx') },
                ],
                dependencies: [
                    { name: 'wagmi', version: '^2.5.7', type: 'production', category: PluginCategory.CUSTOM },
                    { name: 'viem', version: '^2.7.12', type: 'production', category: PluginCategory.CUSTOM },
                    { name: '@tanstack/react-query', version: '^5.22.2', type: 'production', category: PluginCategory.CUSTOM },
                ],
                scripts: [],
                configs: [{
                        file: '.env',
                        content: EthereumGenerator.generateEnvConfig(context.pluginConfig),
                        mergeStrategy: 'append'
                    }],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install Ethereum plugin', startTime, error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            await this.runner.execCommand(['npm', 'uninstall', 'wagmi', 'viem', '@tanstack/react-query'], { cwd: context.projectPath });
            const libDir = path.join(context.projectPath, 'src', 'lib', 'ethereum');
            if (await fsExtra.pathExists(libDir))
                await fsExtra.remove(libDir);
            const componentsDir = path.join(context.projectPath, 'src', 'components', 'providers', 'Web3Provider.tsx');
            if (await fsExtra.pathExists(componentsDir))
                await fsExtra.remove(componentsDir);
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: ['Ethereum files and dependencies have been removed.'],
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall Ethereum plugin', startTime, error);
        }
    }
    async update(context) {
        return this.install(context);
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react'],
            platforms: [TargetPlatform.WEB],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['wagmi', 'viem', '@tanstack/react-query'];
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            { type: 'package', name: 'wagmi', description: 'React Hooks for Ethereum.', version: '^2.5.7' },
            { type: 'package', name: 'viem', description: 'A TypeScript interface for Ethereum.', version: '^2.7.12' },
            { type: 'package', name: '@tanstack/react-query', description: 'Data-fetching and state management for React.', version: '^5.22.2' },
        ];
    }
    getDefaultConfig() {
        return EthereumDefaultConfig;
    }
    getConfigSchema() {
        return EthereumConfigSchema;
    }
    async installDependencies(context) {
        await this.runner.execCommand(['npm', 'install', 'wagmi', 'viem', '@tanstack/react-query'], { cwd: context.projectPath });
    }
    async createProjectFiles(context) {
        const { projectPath, pluginConfig } = context;
        const config = pluginConfig;
        const libDir = path.join(projectPath, 'src', 'lib', 'ethereum');
        await fsExtra.ensureDir(libDir);
        await fsExtra.writeFile(path.join(libDir, 'config.ts'), EthereumGenerator.generateWagmiConfig(config));
        const componentsDir = path.join(projectPath, 'src', 'components', 'providers');
        await fsExtra.ensureDir(componentsDir);
        await fsExtra.writeFile(path.join(componentsDir, 'Web3Provider.tsx'), EthereumGenerator.generateWeb3Provider(config));
    }
    createErrorResult(message, startTime, error) {
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [{ code: 'ETHEREUM_PLUGIN_ERROR', message, details: error, severity: 'error' }],
            warnings: [],
            duration: Date.now() - startTime
        };
    }
}
//# sourceMappingURL=EthereumPlugin.js.map