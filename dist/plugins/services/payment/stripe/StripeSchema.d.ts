import { ConfigSchema } from '../../../../types/plugins.js';
export interface StripeConfig {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    features: {
        enableSubscriptions: boolean;
        enableInvoices: boolean;
        enableTaxes: boolean;
        enableConnect: boolean;
        enablePaymentIntents: boolean;
        enableSetupIntents: boolean;
        enableCheckout: boolean;
        enableBillingPortal: boolean;
    };
    paymentMethods: {
        enableCards: boolean;
        enableBankTransfers: boolean;
        enableDigitalWallets: boolean;
        enableCrypto: boolean;
        enableLocalPayments: boolean;
    };
    subscriptions: {
        enableTrialPeriods: boolean;
        enableProration: boolean;
        enableUsageBasedBilling: boolean;
        enableMeteredBilling: boolean;
        enableQuantityUpdates: boolean;
    };
    security: {
        enable3DSecure: boolean;
        enableSCA: boolean;
        enableFraudDetection: boolean;
        enableDisputeHandling: boolean;
        enableChargebackProtection: boolean;
    };
    webhooks: {
        enablePaymentSuccess: boolean;
        enablePaymentFailure: boolean;
        enableSubscriptionEvents: boolean;
        enableInvoiceEvents: boolean;
        enableCustomerEvents: boolean;
    };
    taxes: {
        enableAutomaticTax: boolean;
        enableTaxCalculation: boolean;
        enableTaxReporting: boolean;
        enableVATHandling: boolean;
    };
    connect: {
        enableExpressAccounts: boolean;
        enableCustomAccounts: boolean;
        enableAccountLinks: boolean;
        enablePayouts: boolean;
    };
    currency: string;
    locale: string;
    rateLimiting: {
        maxRequestsPerSecond: number;
        maxRequestsPerMinute: number;
        enableRetryLogic: boolean;
        retryAttempts: number;
    };
}
export declare const StripeConfigSchema: ConfigSchema;
export declare const StripeDefaultConfig: StripeConfig;
