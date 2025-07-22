/**
 * Base Monitoring Plugin Class
 */
import { BasePlugin } from './BasePlugin.js';
import { IUIMonitoringPlugin, MonitoringService, AnalyticsOption, AlertOption, ParameterSchema } from '../../types/plugin-interfaces.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
import { ValidationResult } from '../../types/agent.js';
import { PluginContext } from '../../types/plugin.js';

export abstract class BaseMonitoringPlugin extends BasePlugin implements IUIMonitoringPlugin {
    private questionGenerator: DynamicQuestionGenerator;

    constructor() {
        super();
        this.questionGenerator = new DynamicQuestionGenerator();
    }

    // --- Abstract Methods ---
    abstract getMonitoringServices(): MonitoringService[];
    abstract getAnalyticsOptions(): AnalyticsOption[];
    abstract getAlertOptions(): AlertOption[];

    // --- Shared Logic ---
    protected getBaseMonitoringSchema(): ParameterSchema {
        // Base schema with service selection
        return {} as ParameterSchema;
    }

    protected async setupMonitoringClient(context: PluginContext, config: any): Promise<void> {
        // Common logic for initializing Sentry SDK, etc.
    }

    protected generateMonitoringServiceEnvVars(service: MonitoringService): Record<string, string> {
        // Logic for SENTRY_DSN, etc.
        return {};
    }

    // --- Interface Implementation ---
    getDynamicQuestions(context: PluginContext): any[] {
        return this.questionGenerator.generateQuestions(this, context);
    }

    validateConfiguration(config: Record<string, any>): ValidationResult {
        return this.validateRequiredConfig(config, ['service']);
    }
} 