/**
 * Plugin Adapter - Bridge between Plugins and Agents
 *
 * Provides compatibility layer to use new plugin system with existing agents
 * while maintaining backward compatibility and enabling gradual migration.
 */
import { AgentContext, AgentResult } from '../types/agent.js';
import { PluginSystem } from './plugin-system.js';
export declare class PluginAdapter {
    private pluginSystem;
    constructor(pluginSystem?: PluginSystem);
    executePluginAsAgent(pluginId: string, context: AgentContext): Promise<AgentResult>;
    private convertToPluginContext;
    private detectProjectType;
    private detectTargetPlatform;
    private convertToAgentResult;
    private convertArtifact;
    private convertError;
    private createErrorResult;
    getAvailablePlugins(category?: string): any[];
    getPluginsByCategory(category: string): any[];
    searchPlugins(query: string): any[];
    validatePluginCompatibility(pluginIds: string[]): any;
    checkPluginConflicts(pluginIds: string[]): Promise<any[]>;
    resolvePluginDependencies(pluginIds: string[]): Promise<any>;
    installPlugin(pluginId: string, context: AgentContext): Promise<AgentResult>;
    uninstallPlugin(pluginId: string, context: AgentContext): Promise<AgentResult>;
    updatePlugin(pluginId: string, context: AgentContext): Promise<AgentResult>;
    installPlugins(pluginIds: string[], context: AgentContext): Promise<AgentResult[]>;
    debugPluginSystem(): void;
    listAllPlugins(): void;
    getPluginStatistics(): any;
}
