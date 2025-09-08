/**
 * Orchestrator Agent
 *
 * Main orchestrator that coordinates all agents
 * Reads YAML recipe and delegates to appropriate agents
 */
import { Recipe, ExecutionResult } from '../types/recipe.js';
import { ProjectManager } from '../core/services/project/project-manager.js';
export declare class OrchestratorAgent {
    private projectManager;
    private pathHandler;
    private decentralizedPathHandler;
    private adapterLoader;
    private agents;
    private integrationRegistry;
    private integrationExecutor?;
    constructor(projectManager: ProjectManager);
    /**
     * Initialize all agents
     */
    private initializeAgents;
    /**
     * Reconfigure all agents with the decentralized path handler
     */
    private reconfigureAgents;
    /**
     * Execute a complete recipe
     */
    executeRecipe(recipe: Recipe): Promise<ExecutionResult>;
    /**
     * Get available agents
     */
    getAvailableAgents(): string[];
    /**
     * Get agent by category
     */
    getAgent(category: string): any;
    /**
     * Create architech.json configuration file
     */
    private createArchitechConfig;
    /**
     * Execute integration features
     */
    private executeIntegrationAdapters;
    /**
     * Install dependencies (delegated to project manager)
     */
    private installDependencies;
}
