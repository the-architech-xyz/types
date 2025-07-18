/**
 * Base Project Agent - Foundation Builder
 *
 * Responsible for creating the core project structure using framework-specific
 * generators like create-next-app, create-react-app, etc.
 *
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class BaseProjectAgent extends AbstractAgent {
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private createNextJSProject;
    private createReactViteProject;
    private createNuxtProject;
    private verifyProjectStructure;
    rollback(context: AgentContext): Promise<void>;
}
