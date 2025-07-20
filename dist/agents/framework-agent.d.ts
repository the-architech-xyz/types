/**
 * Framework Agent - Framework Installer
 *
 * Responsible for installing and configuring the chosen framework.
 * Context-aware: knows if it's working in monorepo (apps/web/) or single-app (root).
 * Pure orchestrator - delegates all technology implementation to plugins.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class FrameworkAgent extends AbstractAgent {
    private pluginSystem;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    validate(context: AgentContext): Promise<ValidationResult>;
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    private getInstallPath;
    private executeFrameworkPlugin;
    private postProcessSingleApp;
    private getProjectType;
    private getPluginConfig;
}
