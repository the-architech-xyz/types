/**
 * Orchestrator Agent - Main Project Generation Coordinator
 *
 * Coordinates the entire project generation process by:
 * - Analyzing user requirements using intelligent question flow
 * - Selecting appropriate plugins based on recommendations
 * - Orchestrating agent execution
 * - Managing dependencies and conflicts
 */
import { IAgent, AgentMetadata, AgentContext, AgentResult } from '../types/agents.js';
export declare class OrchestratorAgent implements IAgent {
    private pluginSystem;
    private logger;
    private runner;
    private progressiveFlow;
    constructor();
    getMetadata(): AgentMetadata;
    getCapabilities(): never[];
    execute(context: AgentContext): Promise<AgentResult>;
    /**
     * Execute the question flow to gather user input and generate configuration
     */
    private executeQuestionFlow;
    /**
     * Convert flow result to project requirements
     */
    private convertFlowResultToRequirements;
    private generateOrchestrationPlan;
    private mapUIPluginToSystem;
    /**
     * Get the appropriate question strategy based on project type
     */
    private getQuestionStrategy;
    /**
     * Analyze user input to determine project context
     */
    private analyzeProjectContext;
    private validatePlan;
    private detectPluginConflicts;
    private executePlan;
    private executePhase;
    private getAgent;
    private getPluginConfig;
    private createErrorResult;
}
