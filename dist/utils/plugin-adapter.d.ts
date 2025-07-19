/**
 * Plugin Adapter - Bridge between CLI and Plugin System
 *
 * Provides a unified interface for CLI commands to interact with the plugin system.
 * Handles plugin installation, configuration, and management operations.
 */
import { PluginSystem } from './plugin-system.js';
import { CommandRunner } from './command-runner.js';
import { Logger } from '../types/agent.js';
import { PluginError } from '../types/plugin.js';
export interface AdapterContext {
    projectName: string;
    projectPath: string;
    packageManager: string;
    options: {
        skipGit: boolean;
        skipInstall: boolean;
        useDefaults: boolean;
        verbose: boolean;
    };
    config: Record<string, any>;
    runner: CommandRunner;
    logger: Logger;
    state: Map<string, any>;
    dependencies: string[];
    environment: {
        nodeVersion: string;
        platform: string;
        arch: string;
        cwd: string;
        env: Record<string, string>;
    };
}
export interface AdapterResult {
    success: boolean;
    data?: any;
    errors?: PluginError[];
    warnings?: string[];
    artifacts?: any[];
}
export declare class PluginAdapter {
    private pluginSystem;
    private logger;
    constructor(pluginSystem: PluginSystem);
    installPlugin(pluginId: string, context: AdapterContext): Promise<AdapterResult>;
    uninstallPlugin(pluginId: string, context: AdapterContext): Promise<AdapterResult>;
    configurePlugin(pluginId: string, config: Record<string, any>, context: AdapterContext): Promise<AdapterResult>;
    validatePlugin(pluginId: string, context: AdapterContext): Promise<AdapterResult>;
    installPlugins(pluginIds: string[], context: AdapterContext): Promise<AdapterResult[]>;
    uninstallPlugins(pluginIds: string[], context: AdapterContext): Promise<AdapterResult[]>;
    private convertToPluginContext;
    private validateConfiguration;
    private validateFieldType;
    getPluginInfo(pluginId: string): any;
    listPlugins(): any[];
    searchPlugins(query: string): any[];
    getPluginsByCategory(category: string): any[];
}
