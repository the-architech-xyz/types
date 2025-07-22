import { GoogleAnalyticsConfig } from './GoogleAnalyticsSchema.js';
export declare class GoogleAnalyticsGenerator {
    static generateAnalyticsProvider(config: GoogleAnalyticsConfig): string;
    static generateGtagHelper(config: GoogleAnalyticsConfig): string;
    static generateEnvConfig(config: GoogleAnalyticsConfig): string;
}
