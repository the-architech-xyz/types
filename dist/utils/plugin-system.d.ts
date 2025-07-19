/**
 * Plugin System - Main Integration Layer
 *
 * Central orchestrator that manages the plugin registry and manager.
 * Registers built-in plugins and provides a unified interface for the CLI.
 */
import { Logger } from '../types/agent.js';
import { PluginRegistry, PluginManager } from '../types/plugin.js';
export declare class PluginSystem {
    private registry;
    private manager;
    private logger;
    private static instance;
    constructor();
    static getInstance(): PluginSystem;
    private registerBuiltInPlugins;
    getRegistry(): PluginRegistry;
    getManager(): PluginManager;
    getLogger(): Logger;
    getPluginCount(): number;
    getAvailableCategories(): string[];
    getPluginsByCategory(category: string): any[];
    searchPlugins(query: string): any[];
    installPlugin(pluginId: string, context: any): Promise<any>;
    uninstallPlugin(pluginId: string, context: any): Promise<any>;
    updatePlugin(pluginId: string, context: any): Promise<any>;
    installPlugins(pluginIds: string[], context: any): Promise<any[]>;
    validateCompatibility(pluginIds: string[]): any;
    checkConflicts(pluginIds: string[]): Promise<any[]>;
    resolveDependencies(pluginIds: string[]): Promise<any>;
    getStatistics(): any;
    debugPlugins(): void;
    listAllPlugins(): void;
}
