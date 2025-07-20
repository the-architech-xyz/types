/**
 * Auth Agent - Authentication Orchestrator
 *
 * Pure orchestrator for authentication setup using the Better Auth plugin.
 * Handles user interaction, decision making, and coordinates the Better Auth plugin.
 * No direct installation logic - delegates everything to plugins.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class AuthAgent extends AbstractAgent {
    private pluginSystem;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private getPackagePath;
    private ensurePackageDirectory;
    private validateAuthSetup;
    private executeBetterAuthPlugin;
    private getAuthConfig;
    private getPluginConfig;
    rollback(context: AgentContext): Promise<void>;
}
