import { PayPalConfig } from './PayPalSchema.js';
export declare class PayPalGenerator {
    static generatePayPalClient(config: PayPalConfig): string;
    static generateCreateOrderRoute(config: PayPalConfig): string;
    static generateCaptureOrderRoute(config: PayPalConfig): string;
    static generateWebhookRoute(config: PayPalConfig): string;
    static generateEnvConfig(config: PayPalConfig): string;
    static generatePackageJson(config: PayPalConfig): string;
    static generateReadme(): string;
}
