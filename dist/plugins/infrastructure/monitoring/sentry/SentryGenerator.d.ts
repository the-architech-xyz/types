import { SentryConfig } from './SentrySchema.js';
export declare class SentryGenerator {
    static generateSentryClientConfig(config: SentryConfig): string;
    static generateSentryServerConfig(config: SentryConfig): string;
    static generateNextConfig(config: SentryConfig): string;
    static generateEnvConfig(config: SentryConfig): string;
    static generatePackageJson(config: SentryConfig): string;
    static generateReadme(): string;
}
