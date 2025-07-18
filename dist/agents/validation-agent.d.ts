/**
 * Validation Agent - Post-Generation Quality Checker
 *
 * Validates the generated project structure and configuration:
 * - Checks TypeScript compilation
 * - Validates workspace dependencies
 * - Tests import paths
 * - Verifies configuration files
 * - Provides detailed feedback
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, ValidationResult, AgentResult, AgentMetadata, AgentCapability } from '../types/agent.js';
export declare class ValidationAgent extends AbstractAgent {
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    rollback(context: AgentContext): Promise<void>;
    private runValidationChecks;
    private validateProjectStructure;
    private validateDependencies;
    private validateConfiguration;
    private validateImportPaths;
    private validateTypeScript;
    private displayValidationResults;
    private getNextSteps;
}
