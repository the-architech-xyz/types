/**
 * UI Agent - Design System Package Generator
 *
 * Sets up the packages/ui design system with:
 * - Tailwind CSS configuration
 * - Shadcn/ui integration
 * - Shared UI components
 * - Utility functions for styling
 *
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class UIAgent extends AbstractAgent {
    private templateService;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private updatePackageJson;
    private createTailwindConfig;
    private createUtilities;
    private createComponentsConfig;
    private createComponentStructure;
    private createCSSFiles;
    private installShadcnComponents;
    private createPlaceholderComponent;
    private createIndex;
    rollback(context: AgentContext): Promise<void>;
}
