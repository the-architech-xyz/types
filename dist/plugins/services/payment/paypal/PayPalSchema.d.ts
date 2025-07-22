import { ConfigSchema } from '../../../../types/plugin.js';
export interface PayPalConfig {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'live';
    currency: string;
    intent: 'capture' | 'authorize';
    enableSubscriptions: boolean;
    webhookId?: string;
}
export declare const PayPalConfigSchema: ConfigSchema;
export declare const PayPalDefaultConfig: PayPalConfig;
