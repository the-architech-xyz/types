/**
 * Plugin System - Main Integration Layer
 * 
 * Central orchestrator that manages the plugin registry and manager.
 * Registers built-in plugins and provides a unified interface for the CLI.
 */

import { PluginRegistryImpl } from './plugin-registry.js';
import { PluginManagerImpl } from './plugin-manager.js';
import { Logger, LogLevel, LogContext } from '../types/agent.js';
import { PluginRegistry, PluginManager } from '../types/plugin.js';
import { ShadcnUIPlugin } from '../plugins/ui/shadcn-ui-plugin.js';
import { DrizzlePlugin } from '../plugins/db/drizzle-plugin.js';
import { BetterAuthPlugin } from '../plugins/auth/better-auth-plugin.js';
import { NextJSPlugin } from '../plugins/framework/nextjs-plugin.js';

// Simple logger implementation for the plugin system
class SimpleLogger implements Logger {
  info(message: string, data?: any): void {
    console.log(`[INFO] ${message}`, data || '');
  }
  
  warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data || '');
  }
  
  error(message: string, error?: Error, data?: any): void {
    console.error(`[ERROR] ${message}`, error || '', data || '');
  }
  
  debug(message: string, data?: any): void {
    console.debug(`[DEBUG] ${message}`, data || '');
  }

  success(message: string, data?: any): void {
    console.log(`[SUCCESS] ${message}`, data || '');
  }

  log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`);
  }
}

export class PluginSystem {
  private registry: PluginRegistry;
  private manager: PluginManager;
  private logger: Logger;
  private static instance: PluginSystem | null = null;

  constructor() {
    this.logger = new SimpleLogger();
    this.registry = new PluginRegistryImpl(this.logger);
    this.manager = new PluginManagerImpl(this.registry, this.logger);
    
    // Register built-in plugins
    this.registerBuiltInPlugins();
  }

  // Singleton pattern for global access
  static getInstance(): PluginSystem {
    if (!PluginSystem.instance) {
      PluginSystem.instance = new PluginSystem();
    }
    return PluginSystem.instance;
  }

  // ============================================================================
  // PLUGIN REGISTRATION
  // ============================================================================

  private registerBuiltInPlugins(): void {
    this.logger.info('Registering built-in plugins...');

    // Framework Plugins
    this.registry.register(new NextJSPlugin());

    // UI Plugins
    this.registry.register(new ShadcnUIPlugin());
    // TODO: Add more UI plugins
    // this.registry.register(new MuiPlugin());
    // this.registry.register(new ChakraUIPlugin());
    // this.registry.register(new AntdPlugin());

    // Database Plugins
    this.registry.register(new DrizzlePlugin());
    // TODO: Add more database plugins
    // this.registry.register(new PrismaPlugin());
    // this.registry.register(new TypeORMPlugin());

    // Auth Plugins
    this.registry.register(new BetterAuthPlugin());
    // TODO: Add more auth plugins
    // this.registry.register(new NextAuthPlugin());
    // this.registry.register(new SupabaseAuthPlugin());

    // Feature Plugins
    // TODO: Add feature plugins
    // this.registry.register(new PaymentPlugin());
    // this.registry.register(new EmailPlugin());
    // this.registry.register(new AnalyticsPlugin());

    this.logger.info(`Registered ${(this.registry as any).getPluginCount()} plugins`);
  }

  // ============================================================================
  // PUBLIC INTERFACE
  // ============================================================================

  getRegistry(): PluginRegistry {
    return this.registry;
  }

  getManager(): PluginManager {
    return this.manager;
  }

  getLogger(): Logger {
    return this.logger;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getPluginCount(): number {
    return (this.registry as any).getPluginCount();
  }

  getAvailableCategories(): string[] {
    return (this.registry as any).getCategories().map((cat: any) => cat.toString());
  }

  getPluginsByCategory(category: string): any[] {
    // Convert string to enum if needed
    const categoryEnum = category.toUpperCase().replace('-', '_') as any;
    return this.registry.getByCategory(categoryEnum);
  }

  searchPlugins(query: string): any[] {
    return (this.registry as any).searchPlugins(query);
  }

  // ============================================================================
  // PLUGIN MANAGEMENT
  // ============================================================================

  async installPlugin(pluginId: string, context: any): Promise<any> {
    return this.manager.installPlugin(pluginId, context);
  }

  async uninstallPlugin(pluginId: string, context: any): Promise<any> {
    return this.manager.uninstallPlugin(pluginId, context);
  }

  async updatePlugin(pluginId: string, context: any): Promise<any> {
    return this.manager.updatePlugin(pluginId, context);
  }

  async installPlugins(pluginIds: string[], context: any): Promise<any[]> {
    return this.manager.installPlugins(pluginIds, context);
  }

  // ============================================================================
  // COMPATIBILITY CHECKING
  // ============================================================================

  validateCompatibility(pluginIds: string[]): any {
    return this.registry.validateCompatibility(pluginIds);
  }

  async checkConflicts(pluginIds: string[]): Promise<any[]> {
    return this.manager.checkConflicts(pluginIds);
  }

  async resolveDependencies(pluginIds: string[]): Promise<any> {
    return this.manager.resolveDependencies(pluginIds);
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  getStatistics(): any {
    return (this.registry as any).getStatistics();
  }

  // ============================================================================
  // DEBUGGING
  // ============================================================================

  debugPlugins(): void {
    this.logger.info('=== Plugin System Debug Info ===');
    this.logger.info(`Total plugins: ${this.getPluginCount()}`);
    this.logger.info(`Categories: ${this.getAvailableCategories().join(', ')}`);
    
    const stats = this.getStatistics();
    this.logger.info('Plugins by category:', stats.byCategory);
    this.logger.info('Plugins by author:', stats.byAuthor);
    this.logger.info('Plugins by license:', stats.byLicense);
  }

  listAllPlugins(): void {
    this.logger.info('=== All Registered Plugins ===');
    const plugins = this.registry.getAll();
    
    for (const plugin of plugins) {
      const metadata = plugin.getMetadata();
      this.logger.info(`${metadata.name} (${metadata.id}) - ${metadata.category}`);
      this.logger.info(`  Description: ${metadata.description}`);
      this.logger.info(`  Version: ${metadata.version}`);
      this.logger.info(`  Author: ${metadata.author}`);
      this.logger.info(`  Tags: ${metadata.tags.join(', ')}`);
      this.logger.info(`  Dependencies: ${plugin.getDependencies().join(', ')}`);
      this.logger.info(`  Conflicts: ${plugin.getConflicts().join(', ')}`);
      this.logger.info('---');
    }
  }
} 