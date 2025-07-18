/**
 * Base Architech Agent - Monorepo Foundation Generator
 *
 * Creates the core Turborepo monorepo structure:
 * - Root configuration (package.json, turbo.json)
 * - Root-level ESLint, TypeScript, and Tailwind configs
 * - apps/web: Next.js 14 application
 * - packages/: Foundation for specialized packages
 * - Workspace configuration and scripts
 *
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class BaseArchitechAgent extends AbstractAgent {
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private createDirectoryStructure;
    private createRootPackageJson;
    private createTurboConfig;
    private createNextJSApp;
    private updateWebAppPackageJson;
    private createWebAppESLintConfig;
    private createPackageDirectories;
    private getPackageDependencies;
    private createPackageTypeScriptConfig;
    private createRootConfigFiles;
    private initializeGit;
    private createReadme;
    rollback(context: AgentContext): Promise<void>;
}
