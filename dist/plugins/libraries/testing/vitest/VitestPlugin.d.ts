import { BaseTestingPlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata } from '../../../../types/plugins.js';
import { TestingFramework, TestType, CoverageOption, ParameterSchema, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
export declare class VitestPlugin extends BaseTestingPlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    getParameterSchema(): ParameterSchema;
    getTestingFrameworks(): TestingFramework[];
    getTestTypes(): TestType[];
    getCoverageOptions(): CoverageOption[];
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    install(context: PluginContext): Promise<PluginResult>;
}
