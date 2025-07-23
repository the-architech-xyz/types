import { ConfigSchema } from '../../../../types/plugins.js';
export interface GoogleAnalyticsConfig {
    measurementId: string;
    enableEcommerce?: boolean;
    debugMode?: boolean;
}
export declare const GoogleAnalyticsConfigSchema: ConfigSchema;
export declare const GoogleAnalyticsDefaultConfig: GoogleAnalyticsConfig;
