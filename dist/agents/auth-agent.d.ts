/**
 * Auth Agent - Authentication Orchestrator
 *
 * Pure orchestrator for authentication setup using unified interfaces.
 * Handles user interaction, decision making, and coordinates auth plugins through unified interfaces.
 * No direct installation logic - delegates everything to plugins through adapters.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class AuthAgent extends AbstractAgent {
    private pluginSystem;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    private executeAuthPluginUnified;
    private validateAuthSetupUnified;
    private selectAuthPlugin;
    validate(context: AgentContext): Promise<ValidationResult>;
    private getPackagePath;
    private ensurePackageDirectory;
    private validateAuthSetup;
    private getAuthConfig;
    private getPluginConfig;
    rollback(context: AgentContext): Promise<void>;
}
