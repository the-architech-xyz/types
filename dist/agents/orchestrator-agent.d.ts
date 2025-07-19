/**
 * Main Orchestrator Agent
 *
 * AI-powered project planning and decision making.
 * Coordinates all specialized agents and manages plugin selection.
 * Handles user interaction and requirements gathering.
 */
import { IAgent, AgentContext, AgentResult, AgentMetadata } from '../types/agent.js';
export declare class OrchestratorAgent implements IAgent {
    private pluginSystem;
    private logger;
    private runner;
    constructor();
    getMetadata(): AgentMetadata;
    getCapabilities(): never[];
    execute(context: AgentContext): Promise<AgentResult>;
    private analyzeRequirements;
    private parseUserRequirements;
    private enhanceRequirements;
    private generateOrchestrationPlan;
    private validatePlan;
    private executePlan;
    private executePhase;
    private getAgent;
    private getPluginConfig;
    private createErrorResult;
}
