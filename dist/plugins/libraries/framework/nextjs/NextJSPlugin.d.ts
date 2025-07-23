/**
 * Next.js Framework Plugin - Pure Technology Implementation
 *
 * Provides Next.js framework integration using the official create-next-app CLI.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, IUIFrameworkPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
export declare class NextJSPlugin extends BasePlugin implements IUIFrameworkPlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    getParameterSchema(): import("../../../../types/plugins.js").ParameterSchema;
    validateConfiguration(config: Record<string, any>): any;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    getFrameworkOptions(): string[];
    getBuildOptions(): string[];
    getDeploymentOptions(): string[];
    install(context: PluginContext): Promise<PluginResult>;
    getDependencies(): string[];
    getDevDependencies(): string[];
    getCompatibility(): any;
    getConflicts(): string[];
    getRequirements(): any[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): any;
}
