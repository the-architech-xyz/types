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
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, IUIAuthPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
export declare class BetterAuthPlugin extends BasePlugin implements IUIAuthPlugin {
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
    private setupAuthRoutes;
}
