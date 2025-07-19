/**
 * DB Agent - Database Package Generator
 *
 * Sets up the packages/db database layer with:
 * - Drizzle ORM configuration
 * - Neon PostgreSQL integration
 * - Database schema definitions
 * - Migration scripts and utilities
 *
 * Enhanced to integrate with the Drizzle plugin and orchestrator agent pattern.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class DBAgent extends AbstractAgent {
    private templateService;
    private pluginSystem;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    private executeDrizzlePlugin;
    private writePluginArtifacts;
    private enhanceDatabaseSetup;
    private generateCustomSchema;
    private generateSchemaContent;
    private generateTableDefinition;
    private createEnhancedUtils;
    private createHealthChecks;
    private createSeedingUtils;
    private getDatabaseConfig;
    validate(context: AgentContext): Promise<ValidationResult>;
    rollback(context: AgentContext): Promise<void>;
}
