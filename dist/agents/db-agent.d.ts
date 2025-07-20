/**
 * DB Agent - Database Orchestrator
 *
 * Pure orchestrator for database setup using the Drizzle plugin.
 * Handles user interaction, decision making, and coordinates the Drizzle plugin.
 * No direct installation logic - delegates everything to plugins.
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
    private executeDrizzlePlugin;
    private validateDatabaseSetup;
    private getDatabaseConfig;
    private getPluginConfig;
    rollback(context: AgentContext): Promise<void>;
    private selectDatabasePlugin;
    private getAvailableDatabasePlugins;
    private executeDatabasePlugin;
}
