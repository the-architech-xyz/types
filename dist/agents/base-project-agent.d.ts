/**
 * Base Project Agent - Structure Creator
 *
 * Responsible for creating the core project structure (monorepo or single-app).
 * Pure structure creator - no framework installation, just structure setup.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class BaseProjectAgent extends AbstractAgent {
    private templateService;
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    validate(context: AgentContext): Promise<ValidationResult>;
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    private createMonorepoStructure;
    private createRootConfigurations;
    private createPackageConfigurations;
    private createSingleAppStructure;
    private createProjectConfiguration;
}
