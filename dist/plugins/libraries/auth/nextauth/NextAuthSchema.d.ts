/**
 * NextAuth Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the NextAuth plugin.
 * Based on: https://next-auth.js.org/
 */
import { ParameterSchema } from '../../../../types/plugins.js';
import { AuthProvider, AuthFeature } from '../../../../types/core.js';
export interface ParameterValidationRule {
    type: 'required' | 'pattern' | 'min' | 'max' | 'minLength' | 'maxLength' | 'custom';
    value?: any;
    message: string;
    validator?: (value: any, config: Record<string, any>) => boolean | string;
}
export declare class NextAuthSchema {
    static getParameterSchema(): ParameterSchema;
    static getAuthProviders(): AuthProvider[];
    static getAuthFeatures(): AuthFeature[];
    static getProviderLabel(provider: AuthProvider): string;
}
