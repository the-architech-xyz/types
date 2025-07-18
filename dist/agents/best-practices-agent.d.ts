/**
 * Best Practices Agent - Code Quality Guardian
 *
 * Installs and configures industry-standard code quality tools:
 * - ESLint with strict rules
 * - Prettier for code formatting
 * - Husky for git hooks
 * - TypeScript strict mode
 * - Import sorting and other optimizations
 *
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class BestPracticesAgent extends AbstractAgent {
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private installDependencies;
    private configurePrettier;
    private configureESLint;
    private configureHusky;
    private configureTypeScript;
    private addNpmScripts;
    rollback(context: AgentContext): Promise<void>;
}
