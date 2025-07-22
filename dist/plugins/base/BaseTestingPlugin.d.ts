/**
 * Base Testing Plugin Class
 *
 * Provides common functionality for all testing framework plugins.
 */
import { BasePlugin } from './BasePlugin.js';
import { IUITestingPlugin, TestingFramework, TestType, CoverageOption } from '../../types/plugin-interfaces.js';
import { ValidationResult } from '../../types/agent.js';
import { PluginContext } from '../../types/plugin.js';
export declare abstract class BaseTestingPlugin extends BasePlugin implements IUITestingPlugin {
    private questionGenerator;
    constructor();
    abstract getTestingFrameworks(): TestingFramework[];
    abstract getTestTypes(): TestType[];
    abstract getCoverageOptions(): CoverageOption[];
    protected generateTestingConfig(config: any): Promise<void>;
    protected addTestingScripts(scripts: Record<string, string>): Promise<void>;
    getDynamicQuestions(context: PluginContext): any[];
    validateConfiguration(config: Record<string, any>): ValidationResult;
}
