/**
 * Plugin Manager Implementation
 *
 * Handles plugin lifecycle operations, dependency resolution, and batch operations.
 * Orchestrates the installation, configuration, and management of plugins.
 */
import { IPlugin, PluginManager, PluginContext, PluginResult, ValidationResult, DependencyResolution, ConflictInfo, PluginRegistry } from '../../types/plugin.js';
import { Logger } from '../../types/agent.js';
export declare class PluginManagerImpl implements PluginManager {
    private registry;
    private logger;
    private pluginConfigs;
    constructor(registry: PluginRegistry, logger: Logger);
    installPlugin(pluginId: string, context: PluginContext): Promise<PluginResult>;
    uninstallPlugin(pluginId: string, context: PluginContext): Promise<PluginResult>;
    updatePlugin(pluginId: string, context: PluginContext): Promise<PluginResult>;
    installPlugins(pluginIds: string[], context: PluginContext): Promise<PluginResult[]>;
    uninstallPlugins(pluginIds: string[], context: PluginContext): Promise<PluginResult[]>;
    discoverPlugins(): Promise<IPlugin[]>;
    validatePlugin(plugin: IPlugin): Promise<ValidationResult>;
    getPluginConfig(pluginId: string): Record<string, any>;
    setPluginConfig(pluginId: string, config: Record<string, any>): void;
    resolveDependencies(pluginIds: string[]): Promise<DependencyResolution>;
    checkConflicts(pluginIds: string[]): Promise<ConflictInfo[]>;
    private createErrorResult;
}
