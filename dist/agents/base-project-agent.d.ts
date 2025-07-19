/**
 * Base Project Agent - Foundation Builder
 *
 * Responsible for creating the core project structure using the new
 * framework-agnostic and structure-agnostic approach.
 *
 * Enhanced to integrate with the plugin system for modularity.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class BaseProjectAgent extends AbstractAgent {
    private pluginSystem;
    private structureManager;
    private configManager;
    constructor(pluginSystem: PluginSystem);
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    validate(context: AgentContext): Promise<ValidationResult>;
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    private createProjectConfiguration;
    private createProjectStructure;
    private validateProjectStructure;
    private saveProjectConfiguration;
    private getPackageDependencies;
}
