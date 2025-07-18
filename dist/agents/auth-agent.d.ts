/**
 * Auth Agent - Authentication Package Generator
 *
 * Sets up the packages/auth authentication layer with:
 * - Better Auth configuration
 * - Database integration with Drizzle
 * - Social login providers
 * - Session management utilities
 *
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class AuthAgent extends AbstractAgent {
    private templateService;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private getAuthConfig;
    private updatePackageJson;
    private createESLintConfig;
    private createAuthConfig;
    private createAuthUtils;
    private createAuthMiddleware;
    private createIndex;
    private updateEnvConfig;
    private displayAuthSetupInstructions;
    rollback(context: AgentContext): Promise<void>;
}
