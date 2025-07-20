/**
 * DB Agent - Database Orchestrator
 *
 * Pure orchestrator for database setup using unified interfaces.
 * Handles user interaction, decision making, and coordinates database plugins through unified interfaces.
 * No direct installation logic - delegates everything to plugins through adapters.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class DBAgent extends AbstractAgent {
    private pluginSystem;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private getPackagePath;
    private ensurePackageDirectory;
    private getDatabaseConfig;
    private getPluginConfig;
    rollback(context: AgentContext): Promise<void>;
    private executeDatabasePluginUnified;
    private validateDatabaseSetupUnified;
    private selectDatabasePlugin;
    private getAvailableDatabasePlugins;
    private executeDatabasePlugin;
}
