/**
 * Plugin Registry Implementation
 *
 * Central registry for managing all available plugins.
 * Provides discovery, compatibility checking, and plugin lifecycle management.
 */
import { IPlugin, PluginRegistry, PluginCategory, ValidationResult } from '../../types/plugins.js';
import { Logger } from '../../types/agents.js';
export declare class PluginRegistryImpl implements PluginRegistry {
    private plugins;
    private logger;
    constructor(logger: Logger);
    register(plugin: IPlugin): void;
    unregister(pluginId: string): void;
    get(pluginId: string): IPlugin | undefined;
    getAll(): IPlugin[];
    getByCategory(category: PluginCategory): IPlugin[];
    getCompatible(projectType: any, platforms: any[]): IPlugin[];
    validateCompatibility(pluginIds: string[]): ValidationResult;
    getPluginCount(): number;
    getCategories(): PluginCategory[];
    searchPlugins(query: string): IPlugin[];
    getPluginsByTag(tag: string): IPlugin[];
    getStatistics(): PluginRegistryStats;
}
export interface PluginRegistryStats {
    total: number;
    byCategory: Record<PluginCategory, number>;
    byAuthor: Record<string, number>;
    byLicense: Record<string, number>;
}
