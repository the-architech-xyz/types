/**
 * Base Project Agent - Foundation Builder
 *
 * Responsible for creating the core project structure using the plugin system.
 * Pure orchestrator - delegates all technology implementation to plugins.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class BaseProjectAgent extends AbstractAgent {
    private pluginSystem;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    validate(context: AgentContext): Promise<ValidationResult>;
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    private executeNextJSPlugin;
    private validateProjectStructure;
    private createProjectConfiguration;
    private getPluginConfig;
}
