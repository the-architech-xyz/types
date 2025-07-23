/**
 * Base Email Plugin Class
 */
import { BasePlugin } from './BasePlugin.js';
import { IUIEmailPlugin, EmailService, EmailFeature, TemplateOption, ParameterSchema } from '../../types/plugins.js';
import { ValidationResult } from '../../types/agents.js';
import { PluginContext } from '../../types/plugins.js';
export declare abstract class BaseEmailPlugin extends BasePlugin implements IUIEmailPlugin {
    private questionGenerator;
    constructor();
    abstract getEmailServices(): EmailService[];
    abstract getEmailFeatures(): EmailFeature[];
    abstract getTemplateOptions(): TemplateOption[];
    protected getBaseEmailSchema(): ParameterSchema;
    protected setupEmailClient(context: PluginContext, config: any): Promise<void>;
    protected generateEmailServiceEnvVars(service: EmailService): Record<string, string>;
    getDynamicQuestions(context: PluginContext): any[];
    validateConfiguration(config: Record<string, any>): ValidationResult;
}
