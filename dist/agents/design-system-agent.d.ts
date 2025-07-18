/**
 * Design System Agent - UI/UX Architect
 *
 * Installs and configures design system components:
 * - Shadcn/ui components (with refined automation from Phase 0 learnings)
 * - Tailwind CSS utilities
 * - Icon libraries
 * - Typography system
 *
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentContext, AgentResult, AgentMetadata, AgentCapability, ValidationResult } from '../types/agent.js';
export declare class DesignSystemAgent extends AbstractAgent {
    protected getAgentMetadata(): AgentMetadata;
    protected getAgentCapabilities(): AgentCapability[];
    protected executeInternal(context: AgentContext): Promise<AgentResult>;
    validate(context: AgentContext): Promise<ValidationResult>;
    private installDependencies;
    private createShadcnConfig;
    private installCoreComponents;
    private createUtilsLib;
    private createComponentStructure;
    rollback(context: AgentContext): Promise<void>;
}
