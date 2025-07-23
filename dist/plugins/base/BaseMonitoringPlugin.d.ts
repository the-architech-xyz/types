/**
 * Base Monitoring Plugin Class
 */
import { BasePlugin } from './BasePlugin.js';
import { IUIMonitoringPlugin, MonitoringService, AnalyticsOption, AlertOption, ParameterSchema } from '../../types/plugins.js';
import { ValidationResult } from '../../types/agents.js';
import { PluginContext } from '../../types/plugins.js';
export declare abstract class BaseMonitoringPlugin extends BasePlugin implements IUIMonitoringPlugin {
    private questionGenerator;
    constructor();
    abstract getMonitoringServices(): MonitoringService[];
    abstract getAnalyticsOptions(): AnalyticsOption[];
    abstract getAlertOptions(): AlertOption[];
    protected getBaseMonitoringSchema(): ParameterSchema;
    protected setupMonitoringClient(context: PluginContext, config: any): Promise<void>;
    protected generateMonitoringServiceEnvVars(service: MonitoringService): Record<string, string>;
    getDynamicQuestions(context: PluginContext): any[];
    validateConfiguration(config: Record<string, any>): ValidationResult;
}
