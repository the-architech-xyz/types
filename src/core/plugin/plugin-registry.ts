/**
 * Plugin Registry Implementation
 * 
 * Central registry for managing all available plugins.
 * Provides discovery, compatibility checking, and plugin lifecycle management.
 */

import {
  IPlugin,
  PluginRegistry,
  PluginCategory,
  ProjectType,
  TargetPlatform,
  CompatibilityMatrix,
  ValidationResult
} from '../types/plugin.js';
import { Logger } from '../types/agent.js';

export class PluginRegistryImpl implements PluginRegistry {
  private plugins: Map<string, IPlugin> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  // ============================================================================
  // PLUGIN REGISTRATION
  // ============================================================================

  register(plugin: IPlugin): void {
    const metadata = plugin.getMetadata();
    
    if (this.plugins.has(metadata.id)) {
      this.logger.warn(`Plugin ${metadata.id} is already registered, overwriting`);
    }
    
    this.plugins.set(metadata.id, plugin);
    this.logger.info(`Registered plugin: ${metadata.name} (${metadata.id})`, {
      category: metadata.category,
      version: metadata.version
    });
  }

  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      const metadata = plugin.getMetadata();
      this.plugins.delete(pluginId);
      this.logger.info(`Unregistered plugin: ${metadata.name} (${pluginId})`);
    } else {
      this.logger.warn(`Plugin ${pluginId} not found for unregistration`);
    }
  }

  get(pluginId: string): IPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAll(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  getByCategory(category: PluginCategory): IPlugin[] {
    return this.getAll().filter(plugin => 
      plugin.getMetadata().category === category
    );
  }

  // ============================================================================
  // COMPATIBILITY CHECKING
  // ============================================================================

  getCompatible(projectType: ProjectType, platforms: TargetPlatform[]): IPlugin[] {
    return this.getAll().filter(plugin => {
      const compatibility = plugin.getCompatibility();
      
      // Check framework compatibility
      if (!compatibility.frameworks.includes(projectType)) {
        return false;
      }
      
      // Check platform compatibility
      const hasPlatformMatch = platforms.some(platform => 
        compatibility.platforms.includes(platform)
      );
      
      if (!hasPlatformMatch) {
        return false;
      }
      
      return true;
    });
  }

  validateCompatibility(pluginIds: string[]): ValidationResult {
    const errors: any[] = [];
    const warnings: string[] = [];

    // Check if all plugins exist
    for (const pluginId of pluginIds) {
      if (!this.plugins.has(pluginId)) {
        errors.push({
          field: 'pluginId',
          message: `Plugin ${pluginId} not found`,
          code: 'PLUGIN_NOT_FOUND',
          severity: 'error'
        });
      }
    }

    // Check for conflicts between plugins
    for (let i = 0; i < pluginIds.length; i++) {
      for (let j = i + 1; j < pluginIds.length; j++) {
        const pluginId1 = pluginIds[i];
        const pluginId2 = pluginIds[j];
        
        if (!pluginId1 || !pluginId2) continue;
        
        const plugin1 = this.plugins.get(pluginId1);
        const plugin2 = this.plugins.get(pluginId2);
        
        if (plugin1 && plugin2) {
          const conflicts1 = plugin1.getConflicts();
          const conflicts2 = plugin2.getConflicts();
          
          if (conflicts1.includes(pluginId2) || conflicts2.includes(pluginId1)) {
            errors.push({
              field: 'conflicts',
              message: `Plugins ${pluginId1} and ${pluginId2} are incompatible`,
              code: 'PLUGIN_CONFLICT',
              severity: 'error'
            });
          }
        }
      }
    }

    // Check dependencies
    for (const pluginId of pluginIds) {
      const plugin = this.plugins.get(pluginId);
      if (plugin) {
        const dependencies = plugin.getDependencies();
        for (const dependency of dependencies) {
          if (!pluginIds.includes(dependency)) {
            warnings.push(`Plugin ${pluginId} recommends dependency ${dependency}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getPluginCount(): number {
    return this.plugins.size;
  }

  getCategories(): PluginCategory[] {
    const categories = new Set<PluginCategory>();
    for (const plugin of this.plugins.values()) {
      categories.add(plugin.getMetadata().category);
    }
    return Array.from(categories);
  }

  searchPlugins(query: string): IPlugin[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(plugin => {
      const metadata = plugin.getMetadata();
      return (
        metadata.name.toLowerCase().includes(lowerQuery) ||
        metadata.description.toLowerCase().includes(lowerQuery) ||
        metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }

  getPluginsByTag(tag: string): IPlugin[] {
    return this.getAll().filter(plugin => 
      plugin.getMetadata().tags.includes(tag)
    );
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  getStatistics(): PluginRegistryStats {
    const stats: PluginRegistryStats = {
      total: this.plugins.size,
      byCategory: {} as Record<PluginCategory, number>,
      byAuthor: {},
      byLicense: {}
    };

    for (const plugin of this.plugins.values()) {
      const metadata = plugin.getMetadata();
      
      // Count by category
      stats.byCategory[metadata.category] = (stats.byCategory[metadata.category] || 0) + 1;
      
      // Count by author
      stats.byAuthor[metadata.author] = (stats.byAuthor[metadata.author] || 0) + 1;
      
      // Count by license
      stats.byLicense[metadata.license] = (stats.byLicense[metadata.license] || 0) + 1;
    }

    return stats;
  }
}

export interface PluginRegistryStats {
  total: number;
  byCategory: Record<PluginCategory, number>;
  byAuthor: Record<string, number>;
  byLicense: Record<string, number>;
} 