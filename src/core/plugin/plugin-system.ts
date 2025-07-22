/**
 * Plugin System - Main Integration Layer
 * 
 * Central orchestrator that manages the plugin registry and manager.
 * Registers built-in plugins and provides a unified interface for the CLI.
 */

import { PluginRegistryImpl } from './plugin-registry.js';
import { PluginManagerImpl } from './plugin-manager.js';
import { Logger, LogLevel, LogContext } from '../../types/agent.js';
import { PluginRegistry, PluginManager } from '../../types/plugin.js';
import { ShadcnUIPlugin } from '../../plugins/libraries/ui/shadcn-ui/ShadcnUIPlugin.js';
import { ChakraUIPlugin } from '../../plugins/libraries/ui/chakra-ui/ChakraUIPlugin.js';
import { MuiPlugin } from '../../plugins/libraries/ui/mui/MuiPlugin.js';
import { TamaguiPlugin } from '../../plugins/libraries/ui/tamagui/TamaguiPlugin.js';
import DrizzlePlugin from '../../plugins/libraries/orm/drizzle/index.js';
import { PrismaPlugin } from '../../plugins/libraries/orm/prisma/PrismaPlugin.js';
import { SupabasePlugin } from '../../plugins/infrastructure/database/supabase/SupabasePlugin.js';
import { BetterAuthPlugin } from '../../plugins/libraries/auth/better-auth/BetterAuthPlugin.js';
import { NextAuthPlugin } from '../../plugins/libraries/auth/nextauth/NextAuthPlugin.js';
import { NextJSPlugin } from '../../plugins/libraries/framework/nextjs/NextJSPlugin.js';
import { RailwayPlugin } from '../../plugins/infrastructure/hosting/railway/RailwayPlugin.js';
import { DockerPlugin } from '../../plugins/infrastructure/hosting/docker/DockerPlugin.js';
import { VitestPlugin } from '../../plugins/libraries/testing/vitest/VitestPlugin.js';
import { ResendPlugin } from '../../plugins/services/email/resend/ResendPlugin.js';
import { SendGridPlugin } from '../../plugins/services/email/sendgrid/SendGridPlugin.js';
import { NeonPlugin } from '../../plugins/infrastructure/database/neon/NeonPlugin.js';
import { MongoDBPlugin } from '../../plugins/infrastructure/database/mongodb/MongoDBPlugin.js';
import { MongoosePlugin } from '../../plugins/libraries/orm/mongoose/MongoosePlugin.js';

// Monitoring Plugins
import { SentryPlugin } from '../../plugins/infrastructure/monitoring/sentry/SentryPlugin.js';
import { GoogleAnalyticsPlugin } from '../../plugins/infrastructure/monitoring/google-analytics/GoogleAnalyticsPlugin.js';

// Payment Plugins
import { StripePlugin } from '../../plugins/services/payment/stripe/StripePlugin.js';
import { PayPalPlugin } from '../../plugins/services/payment/paypal/PayPalPlugin.js';

// Blockchain Plugins
import { EthereumPlugin } from '../../plugins/services/blockchain/ethereum/EthereumPlugin.js';

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
    this.registry.register(new ChakraUIPlugin());
    this.registry.register(new MuiPlugin());
    this.registry.register(new TamaguiPlugin());

    // Database Provider Plugins (Infrastructure)
    this.registry.register(new NeonPlugin());
    this.registry.register(new MongoDBPlugin());
    this.registry.register(new SupabasePlugin());
    // TODO: Add more database providers
    // this.registry.register(new TursoPlugin());

    // ORM Libraries
    this.registry.register(new DrizzlePlugin());
    this.registry.register(new MongoosePlugin());
    this.registry.register(new PrismaPlugin());
    // TODO: Add more ORM libraries

    // Auth Plugins
    this.registry.register(new BetterAuthPlugin());
    this.registry.register(new NextAuthPlugin());

    // Deployment Plugins
    this.registry.register(new RailwayPlugin());
    this.registry.register(new DockerPlugin());

    // Email Plugins
    this.registry.register(new ResendPlugin());
    this.registry.register(new SendGridPlugin());

    // Testing Plugins
    this.registry.register(new VitestPlugin());

    // Monitoring Plugins
    this.registry.register(new SentryPlugin());
    this.registry.register(new GoogleAnalyticsPlugin());

    // Payment Plugins
    this.registry.register(new StripePlugin());
    this.registry.register(new PayPalPlugin());

    // Blockchain Plugins
    this.registry.register(new EthereumPlugin());

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