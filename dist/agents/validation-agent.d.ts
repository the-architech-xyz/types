/**
 * Validation Agent - Post-Generation Quality Checker
 *
 * Validates the generated project structure and configuration:
 * - Checks TypeScript compilation
 * - Validates workspace dependencies
 * - Tests import paths
 * - Verifies configuration files
 * - Provides detailed feedback
 *
 * Enhanced to integrate with the plugin system for modularity.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class ValidationAgent extends AbstractAgent {
    private templateService;
    private pluginSystem;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    private executeValidationPlugins;
    private enhanceValidationPackage;
    private createEnhancedValidationUtils;
    private createHealthChecks;
    private createAIFeatures;
    private createDevUtilities;
    validate(context: AgentContext): Promise<ValidationResult>;
    rollback(context: AgentContext): Promise<void>;
    private runValidationChecks;
    private validateProjectStructure;
    private validateDependencies;
    private validateConfiguration;
    private validateImportPaths;
    private validateTypeScript;
    private findTypeScriptFiles;
    private extractImports;
    private isPathAliasConfigured;
    private displayValidationResults;
    private getNextSteps;
}
