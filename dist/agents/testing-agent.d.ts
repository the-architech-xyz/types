/**
 * Testing Agent - Testing Framework Orchestrator
 *
 * Pure orchestrator for testing framework setup using unified interfaces.
 * Handles user interaction, decision making, and coordinates testing plugins through unified interfaces.
 * No direct installation logic - delegates everything to plugins through adapters.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class TestingAgent extends AbstractAgent {
    private pluginSystem;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    private executeTestingPluginUnified;
    private validateTestingSetupUnified;
    private selectTestingPlugin;
    validate(context: AgentContext): Promise<ValidationResult>;
    private getTestingConfig;
    private getPluginConfig;
    rollback(context: AgentContext): Promise<void>;
}
