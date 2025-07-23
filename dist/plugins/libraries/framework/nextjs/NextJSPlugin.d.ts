/**
 * Next.js Framework Plugin - Pure Technology Implementation
 *
 * Provides Next.js framework integration using the official create-next-app CLI.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BaseFrameworkPlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata } from '../../../../types/plugins.js';
import { FrameworkOption, BuildOption, DeploymentOption, ParameterSchema, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
export declare class NextJSPlugin extends BaseFrameworkPlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    getParameterSchema(): ParameterSchema;
    getFrameworkOptions(): FrameworkOption[];
    getBuildOptions(): BuildOption[];
    getDeploymentOptions(): DeploymentOption[];
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    install(context: PluginContext): Promise<PluginResult>;
}
