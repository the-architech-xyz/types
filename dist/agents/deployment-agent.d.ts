/**
 * Deployment Agent - DevOps Automation Specialist
 *
 * Sets up production-ready deployment infrastructure:
 * - Multi-stage Dockerfile optimized for Next.js
 * - GitHub Actions CI/CD workflows
 * - Environment configuration
 * - Docker Compose for local development
 *
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class DeploymentAgent extends AbstractAgent {
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private createDockerfile;
    private createDockerCompose;
    private createGitHubActions;
    private createEnvironmentFiles;
    private createDockerIgnore;
    rollback(context: AgentContext): Promise<void>;
}
