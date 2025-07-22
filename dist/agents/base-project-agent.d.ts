/**
 * Base Project Agent - Project Foundation Orchestrator
 *
 * Handles the initial project setup and structure creation.
 * This is the first agent that runs in the orchestration process.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability } from '../types/agent.js';
export declare class BaseProjectAgent extends AbstractAgent {
    private runner;
    private templateService;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    private createProjectStructure;
    private createMonorepoStructure;
    private createSingleAppStructure;
    private initializePackageJson;
    private createMonorepoPackageJson;
    private createSingleAppPackageJson;
    private initializeGit;
    private createGitignore;
    private createBasicConfigs;
    private createTypeScriptConfig;
    private createTurboConfig;
    private createESLintConfig;
    private createPrettierConfig;
    private createDocumentation;
    private getMonorepoReadme;
    private getSingleAppReadme;
    private getMonorepoStructure;
    private getSingleAppStructure;
    private getMonorepoScripts;
    private getSingleAppScripts;
}
