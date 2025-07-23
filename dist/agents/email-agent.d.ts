/**
 * Email Agent - Email Service Orchestrator
 *
 * Orchestrates email service setup and configuration through unified interfaces.
 * Supports multiple email providers (Resend, SendGrid, Mailgun) with consistent APIs.
 */
import { IAgent, AgentContext, AgentResult, AgentMetadata, AgentCapability } from '../types/agents.js';
export declare class EmailAgent implements IAgent {
    private pluginSystem;
    private logger;
    private runner;
    constructor();
    getMetadata(): AgentMetadata;
    getCapabilities(): AgentCapability[];
    execute(context: AgentContext): Promise<AgentResult>;
    private analyzeEmailRequirements;
    private selectEmailProvider;
    private setupEmailService;
    private configureEmailTemplates;
    private setupEmailValidation;
    private setupEmailAnalytics;
    private createEmailConfigFiles;
    private createEmailEnvTemplate;
    private createEmailValidationUtils;
    private createEmailAnalyticsUtils;
    private generateEmailConfig;
    private generateEmailValidationUtils;
    private generateEmailAnalyticsUtils;
    private createErrorResult;
}
