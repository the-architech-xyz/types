/**
 * Config Agent - Root Configuration Generator
 *
 * Sets up shared configurations directly in the project root:
 * - ESLint rules for TypeScript and React
 * - Prettier formatting configuration
 * - TypeScript base configuration
 * - Shared development tools
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, ValidationResult, AgentMetadata, AgentCapability } from '../types/agent.js';
export declare class ConfigAgent extends AbstractAgent {
    private templateService;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private createESLintConfig;
    private createPrettierConfig;
    private createTypeScriptConfig;
    private createVSCodeConfig;
    private createGitHubWorkflows;
}
