/**
 * Abstract Base Agent Class
 *
 * Provides a foundation for all Architech agents with common functionality:
 * - Lifecycle management
 * - Error handling
 * - Performance monitoring
 * - State management
 * - Logging
 * - Question generation support
 * - Standardized plugin execution
 */
import { IAgent, AgentContext, AgentResult, ValidationResult, AgentMetadata, AgentCapability, AgentState, PerformanceMetrics, Artifact } from '../../types/agents.js';
import { PluginSystem } from '../../core/plugin/plugin-system.js';
import { PluginResult } from '../../types/plugins.js';
import { ProgressiveFlow, BaseQuestionStrategy, FlowResult, ProjectType as QuestionProjectType } from '../../core/questions/index.js';
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
    protected pluginSystem: PluginSystem;
    protected progressiveFlow: ProgressiveFlow;
    constructor();
    execute(context: AgentContext): Promise<AgentResult>;
    protected abstract executeInternal(context: AgentContext): Promise<AgentResult>;
    protected abstract getAgentMetadata(): AgentMetadata;
    protected abstract getAgentCapabilities(): AgentCapability[];
    /**
     * Execute the question flow to gather user input and generate configuration
     */
    protected executeQuestionFlow(userInput: string): Promise<FlowResult>;
    /**
     * Get the appropriate question strategy based on project type
     */
    protected getQuestionStrategy(userInput: string): BaseQuestionStrategy;
    /**
     * Analyze user input to determine project context
     */
    protected analyzeProjectContext(userInput: string): {
        type: QuestionProjectType;
    };
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
