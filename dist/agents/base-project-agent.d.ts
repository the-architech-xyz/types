/**
 * Base Project Agent - Foundation Builder
 *
 * Responsible for creating the core project structure using framework-specific
 * generators like create-next-app, create-react-app, etc.
 *
 * Enhanced to integrate with the plugin system for modularity.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class BaseProjectAgent extends AbstractAgent {
    private pluginSystem;
    private templateService;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    validate(context: AgentContext): Promise<ValidationResult>;
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    private executeNextJSPlugin;
    private enhanceFrameworkSetup;
    private createPerformanceOptimizations;
    private createSEOOptimizations;
    private createAccessibilityFeatures;
    private createDevUtilities;
    private createNextJSProject;
    private manualNextJSSetup;
    private createReactViteProject;
    private createNuxtProject;
    private verifyProjectStructure;
    rollback(context: AgentContext): Promise<void>;
}
