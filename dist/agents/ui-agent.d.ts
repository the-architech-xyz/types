/**
 * UI Agent - Design System Orchestrator
 *
 * The brain for UI/design system decisions and plugin orchestration.
 * Handles user interaction, decision making, and coordinates UI plugins through unified interfaces.
 * Pure orchestrator - no direct installation logic.
 */
import { AgentContext, AgentResult, AgentMetadata, ValidationResult, AgentCapability } from '../types/agent.js';
import { AbstractAgent } from './base/abstract-agent.js';
export declare class UIAgent extends AbstractAgent {
    private pluginSystem;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private getPackagePath;
    private ensurePackageDirectory;
    private selectUIPlugin;
    private getAvailableUIPlugins;
    private getUIConfig;
    private executeUIPluginUnified;
    private validateUISetupUnified;
    private getPluginConfig;
    rollback(context: AgentContext): Promise<void>;
}
