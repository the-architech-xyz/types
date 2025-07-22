/**
 * UI Agent - Design System Orchestrator
 *
 * The brain for UI/design system decisions and plugin orchestration.
 * Handles user interaction, decision making, and coordinates UI plugins through unified interfaces.
 * Pure orchestrator - no direct installation logic.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class UIAgent extends AbstractAgent {
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private selectUIPlugin;
    private selectUIPluginExpertMode;
    private getUIConfig;
    private getUIConfigExpertMode;
    private getPluginConfig;
    rollback(context: AgentContext): Promise<void>;
}
