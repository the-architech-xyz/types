import { ConfigSchema } from '../../../../types/plugin.js';
export interface GoogleAnalyticsConfig {
    measurementId: string;
    enableEcommerce?: boolean;
    debugMode?: boolean;
}
export declare const GoogleAnalyticsConfigSchema: ConfigSchema;
export declare const GoogleAnalyticsDefaultConfig: GoogleAnalyticsConfig;
