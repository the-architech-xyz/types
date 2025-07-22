/**
 * Deployment Agent - Deployment Orchestrator
 *
 * Pure orchestrator for deployment setup using unified interfaces.
 * Handles user interaction, decision making, and coordinates deployment plugins through unified interfaces.
 * No direct installation logic - delegates everything to plugins through adapters.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class DeploymentAgent extends AbstractAgent {
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    private executeDeploymentPluginUnified;
    private validateDeploymentSetupUnified;
    private selectDeploymentPlugin;
    validate(context: AgentContext): Promise<ValidationResult>;
    private getDeploymentConfig;
    private getPluginConfig;
    rollback(context: AgentContext): Promise<void>;
}
