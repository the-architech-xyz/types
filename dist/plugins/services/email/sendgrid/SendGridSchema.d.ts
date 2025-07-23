import { ConfigSchema } from '../../../../types/plugins.js';
export interface SendGridConfig {
    apiKey: string;
    fromEmail: string;
    fromName?: string;
    replyTo?: string;
    sandboxMode?: boolean;
}
export declare const SendGridConfigSchema: ConfigSchema;
export declare const SendGridDefaultConfig: SendGridConfig;
