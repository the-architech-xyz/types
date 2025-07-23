/**
 * Plugin System - Core Module
 *
 * Consolidated plugin system that includes:
 * - Plugin registry and management
 * - Plugin selection and configuration
 * - Plugin lifecycle operations
 * - Compatibility checking
 */
export { PluginSystem } from './plugin-system.js';
export { PluginRegistryImpl } from './plugin-registry.js';
export { PluginManagerImpl } from './plugin-manager.js';
export { PluginAdapter } from './plugin-adapter.js';
export type { IPlugin, PluginRegistry, PluginManager, PluginCategory, PluginContext, PluginResult, ValidationResult } from '../../types/plugins.js';
