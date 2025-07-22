import { EthereumConfig } from './EthereumSchema.js';
export declare class EthereumGenerator {
    static generateWagmiConfig(config: EthereumConfig): string;
    static generateWeb3Provider(config: EthereumConfig): string;
    static generateEnvConfig(config: EthereumConfig): string;
    static generatePackageJson(config: EthereumConfig): string;
    static generateReadme(): string;
}
