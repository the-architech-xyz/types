import { ConfigSchema } from '../../../../types/plugin.js';
export interface ResendConfig {
    apiKey: string;
    fromEmail: string;
    fromName?: string;
    replyTo?: string;
    webhookUrl?: string;
    sandboxMode: boolean;
    templates: {
        welcome: boolean;
        verification: boolean;
        resetPassword: boolean;
        notification: boolean;
        marketing: boolean;
        orderConfirmation: boolean;
        invoice: boolean;
        newsletter: boolean;
    };
    features: {
        analytics: boolean;
        webhooks: boolean;
        templates: boolean;
        validation: boolean;
        scheduling: boolean;
        attachments: boolean;
        tracking: boolean;
    };
    delivery: {
        retryAttempts: number;
        retryDelay: number;
        timeout: number;
        priority: 'high' | 'normal' | 'low';
        batchSize: number;
    };
    security: {
        enableDKIM: boolean;
        enableSPF: boolean;
        enableDMARC: boolean;
        enableTLS: boolean;
        requireAuthentication: boolean;
    };
    analytics: {
        enableOpenTracking: boolean;
        enableClickTracking: boolean;
        enableUnsubscribeTracking: boolean;
        enableBounceTracking: boolean;
        enableSpamTracking: boolean;
    };
    rateLimiting: {
        maxEmailsPerSecond: number;
        maxEmailsPerMinute: number;
        maxEmailsPerHour: number;
        maxEmailsPerDay: number;
    };
}
export declare const ResendConfigSchema: ConfigSchema;
export declare const ResendDefaultConfig: ResendConfig;
