import { StripeConfig } from './StripeSchema.js';
export declare class StripeGenerator {
    static generateStripeClient(config: StripeConfig): string;
    static generateWebhookRoute(config: StripeConfig): string;
    static generatePaymentService(config: StripeConfig): string;
    static generateEnvConfig(config: StripeConfig): string;
    static generatePackageJson(config: StripeConfig): string;
    static generateReadme(): string;
}
