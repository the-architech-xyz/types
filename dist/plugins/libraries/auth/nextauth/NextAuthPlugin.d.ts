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
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, IUIAuthPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
export declare class NextAuthPlugin extends BasePlugin implements IUIAuthPlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    getParameterSchema(): import("../../../../types/plugins.js").ParameterSchema;
    validateConfiguration(config: Record<string, any>): any;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    getAuthProviders(): string[];
    getAuthFeatures(): string[];
    getSessionOptions(): string[];
    getSecurityOptions(): string[];
    install(context: PluginContext): Promise<PluginResult>;
    getDependencies(): string[];
    getDevDependencies(): string[];
    getCompatibility(): any;
    getConflicts(): string[];
    getRequirements(): any[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): any;
}
