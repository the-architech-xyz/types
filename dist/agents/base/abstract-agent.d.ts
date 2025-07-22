/**
 * Abstract Base Agent Class
 *
 * Provides a foundation for all Architech agents with common functionality:
 * - Lifecycle management
 * - Error handling
 * - Performance monitoring
 * - State management
 * - Logging
 * - Expert mode support
 * - Standardized plugin execution
 */
import { IAgent, AgentContext, AgentResult, ValidationResult, AgentMetadata, AgentCapability, AgentState, PerformanceMetrics, Artifact } from '../../types/agent.js';
import { ExpertModeService } from '../../core/expert/expert-mode-service.js';
import { PluginSystem } from '../../core/plugin/plugin-system.js';
import { PluginResult } from '../../types/plugin.js';
interface Ora {
    start(text?: string): Ora;
    stop(): Ora;
    succeed(text?: string): Ora;
    fail(text?: string): Ora;
    warn(text?: string): Ora;
    info(text?: string): Ora;
    text: string;
    color: string;
}
export declare abstract class AbstractAgent implements IAgent {
    protected spinner: Ora | null;
    protected startTime: number;
    protected currentState: AgentState | undefined;
    protected expertModeService: ExpertModeService;
    protected pluginSystem: PluginSystem;
    constructor();
    execute(context: AgentContext): Promise<AgentResult>;
    protected abstract executeInternal(context: AgentContext): Promise<AgentResult>;
    protected abstract getAgentMetadata(): AgentMetadata;
    protected abstract getAgentCapabilities(): AgentCapability[];
    /**
     * Check if expert mode is enabled for this agent
     */
    protected isExpertMode(context: AgentContext): boolean;
    /**
     * Get expert mode options for this agent
     */
    protected getExpertModeOptions(context: AgentContext): import("../../core/expert/expert-mode-service.js").ExpertModeOptions;
    /**
     * Get expert questions for a specific category
     */
    protected getExpertQuestions(category: string): import("../../types/plugin-selection.js").PluginPrompt[];
    /**
     * Validate expert mode choices
     */
    protected validateExpertChoices(choices: any, category: string): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Get dynamic questions from a specific plugin
     */
    protected getPluginDynamicQuestions(pluginId: string, context: AgentContext): Promise<import("../../types/plugin-selection.js").PluginPrompt[]>;
    /**
     * Get dynamic questions for a category when no specific plugin is selected
     */
    protected getCategoryDynamicQuestions(category: string): import("../../types/plugin-selection.js").PluginPrompt[];
    /**
     * Execute a plugin with standardized error handling and validation
     */
    protected executePlugin(pluginId: string, context: AgentContext, pluginConfig: Record<string, any>, installPath?: string): Promise<PluginResult>;
    /**
     * Validate unified interface files for a module
     */
    protected validateUnifiedInterface(moduleName: string, context: AgentContext, pluginName: string): Promise<void>;
    /**
     * Get selected plugin based on context and user preferences
     */
    protected getSelectedPlugin(context: AgentContext, category: string): string;
    validate(context: AgentContext): Promise<ValidationResult>;
    prepare(context: AgentContext): Promise<void>;
    cleanup(context: AgentContext): Promise<void>;
    rollback(context: AgentContext): Promise<void>;
    retry(context: AgentContext, attempt: number): Promise<AgentResult>;
    getMetadata(): AgentMetadata;
    getCapabilities(): AgentCapability[];
    getState(): AgentState | undefined;
    setState(state: AgentState): void;
    protected updateState(data: Record<string, any>): void;
    protected createSuccessResult(data?: any, artifacts?: Artifact[], nextSteps?: string[]): AgentResult;
    protected createErrorResult(code: string, message: string, errors?: any[], startTime?: number, originalError?: any): AgentResult;
    protected calculateMetrics(startTime: number): PerformanceMetrics;
    protected calculateStateChecksum(state: Partial<AgentState>): string;
    protected isRecoverableError(code: string): boolean;
    protected getErrorSuggestion(code: string): string;
    protected getErrorNextSteps(code: string): string[];
    protected startSpinner(text: string, context: AgentContext): Promise<void>;
    protected stopSpinner(): Promise<void>;
    protected updateSpinner(text: string): void;
    protected succeedSpinner(text: string): void;
    protected failSpinner(text: string): void;
}
export {};
