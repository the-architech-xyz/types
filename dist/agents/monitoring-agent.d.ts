/**
 * Monitoring Agent - Monitoring Service Orchestrator
 *
 * Orchestrates monitoring service setup and configuration through unified interfaces.
 * Supports multiple monitoring providers (Sentry, LogRocket, DataDog) with consistent APIs.
 */
import { IAgent, AgentContext, AgentResult, AgentMetadata, AgentCapability } from '../types/agent.js';
export declare class MonitoringAgent implements IAgent {
    private pluginSystem;
    private logger;
    private runner;
    constructor();
    getMetadata(): AgentMetadata;
    getCapabilities(): AgentCapability[];
    execute(context: AgentContext): Promise<AgentResult>;
    private analyzeMonitoringRequirements;
    private selectMonitoringProvider;
    private setupMonitoringService;
    private configureMonitoringFeatures;
    private setupMonitoringUtilities;
    private createMonitoringConfigFiles;
    private createMonitoringEnvTemplate;
    private createMonitoringUtilities;
    private generateMonitoringConfig;
    private generateMonitoringUtilities;
    private createErrorResult;
}
