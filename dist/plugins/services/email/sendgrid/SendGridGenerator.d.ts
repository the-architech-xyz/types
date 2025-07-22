import { SendGridConfig } from './SendGridSchema.js';
export declare class SendGridGenerator {
    static generateEmailClient(config: SendGridConfig): string;
    static generateEmailConfig(config: SendGridConfig): string;
    static generateEmailTypes(): string;
    static generateEmailService(config: SendGridConfig): string;
    static generateEnvConfig(config: SendGridConfig): string;
    static generatePackageJson(config: SendGridConfig): string;
    static generateReadme(): string;
}
