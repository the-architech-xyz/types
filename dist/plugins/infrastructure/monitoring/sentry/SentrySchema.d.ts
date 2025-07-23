import { ConfigSchema } from '../../../../types/plugins.js';
export interface SentryConfig {
    dsn: string;
    environment: string;
    release?: string;
    tracesSampleRate: number;
    replaysSessionSampleRate?: number;
    replaysOnErrorSampleRate?: number;
    enableSourceMaps: boolean;
    authToken?: string;
    org?: string;
    project?: string;
}
export declare const SentryConfigSchema: ConfigSchema;
export declare const SentryDefaultConfig: SentryConfig;
