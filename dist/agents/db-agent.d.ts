/**
 * DB Agent - Database Package Generator
 *
 * Sets up the packages/db database layer with:
 * - Drizzle ORM configuration
 * - Neon PostgreSQL integration
 * - Database schema definitions
 * - Migration scripts and utilities
 *
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class DBAgent extends AbstractAgent {
    private templateService;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private getDatabaseConfig;
    private updatePackageJson;
    private createESLintConfig;
    private createDrizzleConfig;
    private createDatabaseSchema;
    private createDatabaseConnection;
    private createMigrationUtils;
    private createEnvConfig;
    private displayDatabaseSetupInstructions;
    rollback(context: AgentContext): Promise<void>;
}
