/**
 * Base Testing Plugin Class
 * 
 * Provides common functionality for all testing framework plugins.
 */

import { BasePlugin } from './BasePlugin.js';
import { IUITestingPlugin, TestingFramework, TestType, CoverageOption } from '../../types/plugin-interfaces.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
import { ValidationResult } from '../../types/agent.js';
import { PluginContext } from '../../types/plugin.js';

export abstract class BaseTestingPlugin extends BasePlugin implements IUITestingPlugin {
    private questionGenerator: DynamicQuestionGenerator;

    constructor() {
        super();
        this.questionGenerator = new DynamicQuestionGenerator();
    }

    // --- Abstract Methods for Plugin to Implement ---
    abstract getTestingFrameworks(): TestingFramework[];
    abstract getTestTypes(): TestType[];
    abstract getCoverageOptions(): CoverageOption[];

    // --- Shared Logic ---
    protected async generateTestingConfig(config: any): Promise<void> {
        // Common logic for creating vitest.config.ts, jest.config.js, etc.
    }

    protected addTestingScripts(scripts: Record<string, string>): Promise<void> {
        return this.addScripts(scripts);
    }

    getDynamicQuestions(context: PluginContext): any[] {
        return this.questionGenerator.generateQuestions(this, context);
    }

    validateConfiguration(config: Record<string, any>): ValidationResult {
        return this.validateRequiredConfig(config, ['framework']);
    }
} 