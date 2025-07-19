/**
 * Deployment Agent - DevOps Automation Specialist
 *
 * Sets up production-ready deployment infrastructure:
 * - Multi-stage Dockerfile optimized for Next.js
 * - GitHub Actions CI/CD workflows
 * - Environment configuration
 * - Docker Compose for local development
 *
 * Enhanced to integrate with the plugin system for modularity.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class DeploymentAgent extends AbstractAgent {
    private templateService;
    private pluginSystem;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    private executeDeploymentPlugins;
    private enhanceDeploymentPackage;
    private getDeploymentConfig;
    validate(context: AgentContext): Promise<ValidationResult>;
    private createDockerfile;
    private createDockerCompose;
    private createCICDPipeline;
    private createEnvironmentFiles;
    private createDockerIgnore;
    rollback(context: AgentContext): Promise<void>;
}
