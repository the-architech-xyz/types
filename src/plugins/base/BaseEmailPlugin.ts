/**
 * Base Email Plugin Class
 */
import { BasePlugin } from './BasePlugin.js';
import { IUIEmailPlugin, EmailService, EmailFeature, TemplateOption, ParameterSchema } from '../../types/plugin-interfaces.js';
import { DynamicQuestionGenerator } from '../../core/expert/dynamic-question-generator.js';
import { ValidationResult } from '../../types/agent.js';
import { PluginContext } from '../../types/plugin.js';

export abstract class BaseEmailPlugin extends BasePlugin implements IUIEmailPlugin {
    private questionGenerator: DynamicQuestionGenerator;

    constructor() {
        super();
        this.questionGenerator = new DynamicQuestionGenerator();
    }

    // --- Abstract Methods ---
    abstract getEmailServices(): EmailService[];
    abstract getEmailFeatures(): EmailFeature[];
    abstract getTemplateOptions(): TemplateOption[];

    // --- Shared Logic ---
    protected getBaseEmailSchema(): ParameterSchema {
        // Base schema with service selection
        return {} as ParameterSchema;
    }

    protected async setupEmailClient(context: PluginContext, config: any): Promise<void> {
        // Common logic for setting up an email client (e.g., Nodemailer, Resend SDK)
    }

    protected generateEmailServiceEnvVars(service: EmailService): Record<string, string> {
        // Logic for RESEND_API_KEY, SENDGRID_API_KEY etc.
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