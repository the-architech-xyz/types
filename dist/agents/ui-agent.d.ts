/**
 * UI Agent - Design System Orchestrator
 *
 * The brain for UI/design system decisions and plugin orchestration.
 * Handles user interaction, decision making, and coordinates the Shadcn/ui plugin.
 * Pure orchestrator - no direct installation logic.
 */
import { AgentContext, AgentResult, AgentMetadata, ValidationResult } from '../types/agent.js';
import { AbstractAgent } from './base/abstract-agent.js';
export declare class UIAgent extends AbstractAgent {
    private pluginSystem;
    private templateService;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): never[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private getPackagePath;
    private ensurePackageDirectory;
    private getPluginConfig;
    rollback(context: AgentContext): Promise<void>;
}
