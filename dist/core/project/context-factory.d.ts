/**
 * Context Factory
 *
 * Creates and manages execution contexts for agents and plugins.
 * Provides a consistent interface for context creation across the system.
 */
import { AgentContext, ExecutionOptions } from '../../types/agent.js';
import { PackageManager } from '../cli/command-runner.js';
import { StructureInfo } from './structure-service.js';
export declare class ContextFactory {
    /**
     * Creates a context for agent execution
     */
    static createContext(projectName: string, options?: Partial<ExecutionOptions> & {
        packageManager?: PackageManager;
    }, config?: Record<string, any>, dependencies?: string[]): AgentContext;
    /**
     * Creates a context for plugin execution
     */
    static createPluginContext(projectName: string, projectPath: string, pluginId: string, pluginConfig: Record<string, any>, structure: StructureInfo, options?: Partial<ExecutionOptions>): any;
    /**
     * Creates a context for the traditional create workflow
     */
    static createTraditionalContext(projectName: string, template: string, modules: string[], options?: Partial<ExecutionOptions>): AgentContext;
}
