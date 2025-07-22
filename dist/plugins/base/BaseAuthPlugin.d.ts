/**
 * Base Authentication Plugin Class
 *
 * Provides common functionality for all authentication plugins.
 */
import { BasePlugin } from './BasePlugin.js';
import { IUIAuthPlugin, AuthProvider, AuthFeature, SessionOption, SecurityOption, ParameterSchema } from '../../types/plugin-interfaces.js';
import { ValidationResult } from '../../types/agent.js';
import { PluginContext } from '../../types/plugin.js';
export declare abstract class BaseAuthPlugin extends BasePlugin implements IUIAuthPlugin {
    private questionGenerator;
    constructor();
    abstract getAuthProviders(): AuthProvider[];
    abstract getAuthFeatures(): AuthFeature[];
    abstract getSessionOptions(): SessionOption[];
    abstract getSecurityOptions(): SecurityOption[];
    protected getBaseAuthSchema(): ParameterSchema;
    protected setupAuthRoutes(context: PluginContext, routeContent: string): Promise<void>;
    protected generateProviderEnvVars(providers: AuthProvider[]): Record<string, string>;
    protected abstract getProviderLabel(provider: AuthProvider): string;
    protected abstract getFeatureLabel(feature: AuthFeature): string;
    getDynamicQuestions(context: PluginContext): any[];
    validateConfiguration(config: Record<string, any>): ValidationResult;
}
