/**
 * Better Auth Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the Better Auth plugin.
 * Based on: https://better-auth.com/docs
 */
import { ParameterSchema } from '../../../../types/plugins.js';
import { AuthProvider, AuthFeature } from '../../../../types/core.js';
export interface ParameterValidationRule {
    type: 'required' | 'pattern' | 'min' | 'max' | 'minLength' | 'maxLength' | 'custom';
    value?: any;
    message: string;
    validator?: (value: any, config: Record<string, any>) => boolean | string;
}
export declare class BetterAuthSchema {
    static getParameterSchema(): ParameterSchema;
    static getAuthProviders(): AuthProvider[];
    static getAuthFeatures(): AuthFeature[];
    static getProviderLabel(provider: AuthProvider): string;
}
