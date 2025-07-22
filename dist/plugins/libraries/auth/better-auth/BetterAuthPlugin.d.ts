/**
 * Better Auth Plugin - Updated with Latest Best Practices
 *
 * Provides Better Auth authentication integration using the official @better-auth/cli.
 * Follows latest Better Auth documentation and TypeScript best practices.
 *
 * References:
 * - https://better-auth.com/docs
 * - https://better-auth.com/docs/providers
 * - https://better-auth.com/docs/adapters
 */
import { BaseAuthPlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata } from '../../../../types/plugin.js';
import { AuthProvider, AuthFeature, SessionOption, SecurityOption, ParameterSchema, UnifiedInterfaceTemplate } from '../../../../types/plugin-interfaces.js';
export declare class BetterAuthPlugin extends BaseAuthPlugin {
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
