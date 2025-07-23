import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, IUITestingPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
export declare class VitestPlugin extends BasePlugin implements IUITestingPlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    getParameterSchema(): import("../../../../types/plugins.js").ParameterSchema;
    validateConfiguration(config: Record<string, any>): any;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    getTestingFrameworks(): string[];
    getTestTypes(): string[];
    getCoverageOptions(): string[];
    getEnvironmentOptions(): string[];
    install(context: PluginContext): Promise<PluginResult>;
    getDependencies(): string[];
    getDevDependencies(): string[];
    getCompatibility(): any;
    getConflicts(): string[];
    getRequirements(): any[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): any;
}
