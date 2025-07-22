import { ResendConfig } from './ResendSchema.js';
export declare class ResendGenerator {
    static generateEmailClient(config: ResendConfig): string;
    static generateEmailConfig(config: ResendConfig): string;
    static generateEmailTypes(): string;
    static generateEmailService(): string;
    static generateEnvConfig(config: ResendConfig): string;
    static generatePackageJson(config: ResendConfig): string;
    static generateReadme(): string;
}
