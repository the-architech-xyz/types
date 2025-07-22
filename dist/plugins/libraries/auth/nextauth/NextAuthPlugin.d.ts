/**
 * NextAuth Plugin - Updated with Latest Best Practices
 *
 * Provides NextAuth authentication integration using the official NextAuth.js.
 * Follows latest NextAuth documentation and TypeScript best practices.
 *
 * References:
 * - https://next-auth.js.org/configuration
 * - https://next-auth.js.org/providers
 * - https://next-auth.js.org/adapters
 */
import { BaseAuthPlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata } from '../../../../types/plugin.js';
import { AuthProvider, AuthFeature, SessionOption, SecurityOption, ParameterSchema, UnifiedInterfaceTemplate } from '../../../../types/plugin-interfaces.js';
export declare class NextAuthPlugin extends BaseAuthPlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    getParameterSchema(): ParameterSchema;
    getAuthProviders(): AuthProvider[];
    getAuthFeatures(): AuthFeature[];
    getSessionOptions(): SessionOption[];
    getSecurityOptions(): SecurityOption[];
    protected getProviderLabel(provider: AuthProvider): string;
    protected getFeatureLabel(feature: AuthFeature): string;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    install(context: PluginContext): Promise<PluginResult>;
}
