/**
 * Context Factory
 *
 * Creates and validates AgentContext objects with proper defaults
 * and environment information.
 */
import { AgentContext, ExecutionOptions } from '../../types/agent.js';
export declare class ContextFactory {
    /**
     * Creates a new AgentContext with proper defaults and validation
     */
    static createContext(projectName: string, options?: Partial<ExecutionOptions> & {
        packageManager?: string;
    }, config?: Record<string, any>, dependencies?: string[]): AgentContext;
    /**
     * Creates a context for the architech monorepo workflow
     */
    static createArchitechContext(projectName: string, selectedModules: string[], options?: Partial<ExecutionOptions>): AgentContext;
    /**
     * Creates a context for the traditional create workflow
     */
    static createTraditionalContext(projectName: string, template: string, modules: string[], options?: Partial<ExecutionOptions>): AgentContext;
    /**
     * Validates a context and returns validation errors
     */
    static validateContext(context: AgentContext): string[];
    /**
     * Creates a child context with updated configuration
     */
    static createChildContext(parentContext: AgentContext, updates: Partial<AgentContext>): AgentContext;
    /**
     * Updates context state immutably
     */
    static updateContextState(context: AgentContext, key: string, value: any): AgentContext;
}
