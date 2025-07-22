/**
 * NextAuth Schema Definitions
 *
 * Contains all configuration schemas and parameter definitions for the NextAuth plugin.
 * Based on: https://next-auth.js.org/configuration
 */
import { ParameterSchema, AuthProvider, AuthFeature } from '../../../../types/plugin-interfaces.js';
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
