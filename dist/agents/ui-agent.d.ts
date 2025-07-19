/**
 * UI Agent - Design System Package Generator
 *
 * Sets up the packages/ui design system with:
 * - Tailwind CSS configuration
 * - Shadcn/ui integration
 * - Shared UI components
 * - Utility functions for styling
 *
 * Enhanced to integrate with the plugin system for modularity.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class UIAgent extends AbstractAgent {
    private templateService;
    private pluginSystem;
    constructor();
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private updatePackageJson;
    private createTailwindConfig;
    private createUtilities;
    private createComponentStructure;
    private createCSSFiles;
    private createIndex;
    private installShadcnComponents;
    private createPlaceholderComponent;
    private executeShadcnPlugin;
    private enhanceUIPackage;
    private createBasicComponents;
    private createDevUtilities;
    private manualSetup;
    rollback(context: AgentContext): Promise<void>;
}
