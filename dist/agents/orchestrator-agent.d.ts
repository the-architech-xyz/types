/**
 * Orchestrator Agent - Main Project Generation Coordinator
 *
 * Coordinates the entire project generation process by:
 * - Analyzing user requirements
 * - Selecting appropriate plugins
 * - Orchestrating agent execution
 * - Managing dependencies and conflicts
 */
import { IAgent, AgentContext, AgentResult, AgentMetadata } from '../types/agent.js';
export declare class OrchestratorAgent implements IAgent {
    private pluginSystem;
    private pluginSelectionService;
    private logger;
    private runner;
    constructor();
    getMetadata(): AgentMetadata;
    getCapabilities(): never[];
    execute(context: AgentContext): Promise<AgentResult>;
    private analyzeRequirements;
    private getDefaultPluginSelection;
    private convertPluginSelectionToRequirements;
    private extractFeaturesFromSelection;
    private generateOrchestrationPlan;
    private mapUIPluginToSystem;
    private validatePlan;
    private executePlan;
    private executePhase;
    private getAgent;
    private getPluginConfig;
    private createErrorResult;
}
