/**
 * Plugin System - Main Integration Layer
 *
 * Central orchestrator that manages the plugin registry and manager.
 * Registers built-in plugins and provides a unified interface for the CLI.
 */
import { PluginRegistryImpl } from './plugin-registry.js';
import { PluginManagerImpl } from './plugin-manager.js';
import { ShadcnUIPlugin } from '../../plugins/ui/shadcn-ui.js';
import { ChakraUIPlugin } from '../../plugins/ui/chakra-ui.js';
import { MuiPlugin } from '../../plugins/ui/mui.js';
import { TamaguiPlugin } from '../../plugins/ui/tamagui-plugin.js';
import { DrizzlePlugin } from '../../plugins/orm/drizzle/drizzle.plugin.js';
import { PrismaPlugin } from '../../plugins/db/prisma-plugin.js';
import { TypeORMPlugin } from '../../plugins/db/typeorm-plugin.js';
import { SupabasePlugin } from '../../plugins/db/supabase-plugin.js';
import { BetterAuthPlugin } from '../../plugins/auth/better-auth-plugin.js';
import { NextAuthPlugin } from '../../plugins/auth/nextauth-plugin.js';
import { NextJSPlugin } from '../../plugins/framework/nextjs-plugin.js';
import { VercelPlugin } from '../../plugins/deployment/vercel/vercel.plugin.js';
import { RailwayPlugin } from '../../plugins/deployment/railway/railway.plugin.js';
import { DockerPlugin } from '../../plugins/deployment/docker/docker.plugin.js';
import { VitestPlugin } from '../../plugins/testing/vitest/vitest.plugin.js';
import { ResendPlugin } from '../../plugins/email/resend-plugin.js';
import { SendGridPlugin } from '../../plugins/email/sendgrid-plugin.js';
import { NeonPlugin } from '../../plugins/database/neon/neon.plugin.js';
import { MongoDBPlugin } from '../../plugins/database/mongodb/mongodb.plugin.js';
import { MongoosePlugin } from '../../plugins/orm/mongoose/mongoose.plugin.js';
// Monitoring Plugins
import { SentryPlugin } from '../../plugins/monitoring/sentry/sentry.plugin.js';
import { VercelAnalyticsPlugin } from '../../plugins/monitoring/vercel-analytics/vercel-analytics.plugin.js';
import { GoogleAnalyticsPlugin } from '../../plugins/monitoring/google-analytics/google-analytics.plugin.js';
// Payment Plugins
import { StripePlugin } from '../../plugins/payment/stripe/stripe.plugin.js';
import { PayPalPlugin } from '../../plugins/payment/paypal/paypal.plugin.js';
// Blockchain Plugins
import { EthereumPlugin } from '../../plugins/blockchain/ethereum/ethereum.plugin.js';
// Simple logger implementation for the plugin system
class SimpleLogger {
    info(message, data) {
        console.log(`[INFO] ${message}`, data || '');
    }
    warn(message, data) {
        console.warn(`[WARN] ${message}`, data || '');
    }
    error(message, error, data) {
        console.error(`[ERROR] ${message}`, error || '', data || '');
    }
    debug(message, data) {
        console.debug(`[DEBUG] ${message}`, data || '');
    }
    success(message, data) {
        console.log(`[SUCCESS] ${message}`, data || '');
    }
    log(level, message, context) {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`);
    }
}
export class PluginSystem {
    registry;
    manager;
    logger;
    static instance = null;
    constructor() {
        this.logger = new SimpleLogger();
        this.registry = new PluginRegistryImpl(this.logger);
        this.manager = new PluginManagerImpl(this.registry, this.logger);
        // Register built-in plugins
        this.registerBuiltInPlugins();
    }
    // Singleton pattern for global access
    static getInstance() {
        if (!PluginSystem.instance) {
            PluginSystem.instance = new PluginSystem();
        }
        return PluginSystem.instance;
    }
    // ============================================================================
    // PLUGIN REGISTRATION
    // ============================================================================
    registerBuiltInPlugins() {
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
        // ORM Library Plugins (Data Access Layer)
        this.registry.register(new DrizzlePlugin());
        this.registry.register(new PrismaPlugin());
        this.registry.register(new TypeORMPlugin());
        this.registry.register(new MongoosePlugin());
        // TODO: Add more ORM libraries
        // Auth Plugins
        this.registry.register(new BetterAuthPlugin());
        this.registry.register(new NextAuthPlugin());
        // Deployment Plugins
        this.registry.register(new VercelPlugin());
        this.registry.register(new RailwayPlugin());
        this.registry.register(new DockerPlugin());
        // Email Plugins
        this.registry.register(new ResendPlugin());
        this.registry.register(new SendGridPlugin());
        // Testing Plugins
        this.registry.register(new VitestPlugin());
        // Monitoring Plugins
        this.registry.register(new SentryPlugin());
        this.registry.register(new VercelAnalyticsPlugin());
        this.registry.register(new GoogleAnalyticsPlugin());
        // Payment Plugins
        this.registry.register(new StripePlugin());
        this.registry.register(new PayPalPlugin());
        // Blockchain Plugins
        this.registry.register(new EthereumPlugin());
        this.logger.info(`Registered ${this.registry.getPluginCount()} plugins`);
    }
    // ============================================================================
    // PUBLIC INTERFACE
    // ============================================================================
    getRegistry() {
        return this.registry;
    }
    getManager() {
        return this.manager;
    }
    getLogger() {
        return this.logger;
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    getPluginCount() {
        return this.registry.getPluginCount();
    }
    getAvailableCategories() {
        return this.registry.getCategories().map((cat) => cat.toString());
    }
    getPluginsByCategory(category) {
        // Convert string to enum if needed
        const categoryEnum = category.toUpperCase().replace('-', '_');
        return this.registry.getByCategory(categoryEnum);
    }
    searchPlugins(query) {
        return this.registry.searchPlugins(query);
    }
    // ============================================================================
    // PLUGIN MANAGEMENT
    // ============================================================================
    async installPlugin(pluginId, context) {
        return this.manager.installPlugin(pluginId, context);
    }
    async uninstallPlugin(pluginId, context) {
        return this.manager.uninstallPlugin(pluginId, context);
    }
    async updatePlugin(pluginId, context) {
        return this.manager.updatePlugin(pluginId, context);
    }
    async installPlugins(pluginIds, context) {
        return this.manager.installPlugins(pluginIds, context);
    }
    // ============================================================================
    // COMPATIBILITY CHECKING
    // ============================================================================
    validateCompatibility(pluginIds) {
        return this.registry.validateCompatibility(pluginIds);
    }
    async checkConflicts(pluginIds) {
        return this.manager.checkConflicts(pluginIds);
    }
    async resolveDependencies(pluginIds) {
        return this.manager.resolveDependencies(pluginIds);
    }
    // ============================================================================
    // STATISTICS
    // ============================================================================
    getStatistics() {
        return this.registry.getStatistics();
    }
    // ============================================================================
    // DEBUGGING
    // ============================================================================
    debugPlugins() {
        this.logger.info('=== Plugin System Debug Info ===');
        this.logger.info(`Total plugins: ${this.getPluginCount()}`);
        this.logger.info(`Categories: ${this.getAvailableCategories().join(', ')}`);
        const stats = this.getStatistics();
        this.logger.info('Plugins by category:', stats.byCategory);
        this.logger.info('Plugins by author:', stats.byAuthor);
        this.logger.info('Plugins by license:', stats.byLicense);
    }
    listAllPlugins() {
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
//# sourceMappingURL=plugin-system.js.map