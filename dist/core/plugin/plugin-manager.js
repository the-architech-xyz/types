/**
 * Plugin Manager Implementation
 *
 * Handles plugin lifecycle operations, dependency resolution, and batch operations.
 * Orchestrates the installation, configuration, and management of plugins.
 */
export class PluginManagerImpl {
    registry;
    logger;
    pluginConfigs = new Map();
    constructor(registry, logger) {
        this.registry = registry;
        this.logger = logger;
    }
    // ============================================================================
    // PLUGIN LIFECYCLE
    // ============================================================================
    async installPlugin(pluginId, context) {
        const startTime = Date.now();
        try {
            this.logger.info(`Installing plugin: ${pluginId}`);
            const plugin = this.registry.get(pluginId);
            if (!plugin) {
                return this.createErrorResult(`Plugin ${pluginId} not found`, startTime);
            }
            // Validate plugin
            const validation = await plugin.validate(context);
            if (!validation.valid) {
                return this.createErrorResult(`Plugin validation failed: ${validation.errors.map(e => e.message).join(', ')}`, startTime, validation.errors);
            }
            // Install plugin
            const result = await plugin.install(context);
            // Store configuration
            this.pluginConfigs.set(pluginId, plugin.getDefaultConfig());
            this.logger.info(`Successfully installed plugin: ${pluginId}`);
            return {
                ...result,
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            this.logger.error(`Failed to install plugin ${pluginId}`, error);
            return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error', startTime, [], error);
        }
    }
    async uninstallPlugin(pluginId, context) {
        const startTime = Date.now();
        try {
            this.logger.info(`Uninstalling plugin: ${pluginId}`);
            const plugin = this.registry.get(pluginId);
            if (!plugin) {
                return this.createErrorResult(`Plugin ${pluginId} not found`, startTime);
            }
            // Uninstall plugin
            const result = await plugin.uninstall(context);
            // Remove configuration
            this.pluginConfigs.delete(pluginId);
            this.logger.info(`Successfully uninstalled plugin: ${pluginId}`);
            return {
                ...result,
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            this.logger.error(`Failed to uninstall plugin ${pluginId}`, error);
            return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error', startTime, [], error);
        }
    }
    async updatePlugin(pluginId, context) {
        const startTime = Date.now();
        try {
            this.logger.info(`Updating plugin: ${pluginId}`);
            const plugin = this.registry.get(pluginId);
            if (!plugin) {
                return this.createErrorResult(`Plugin ${pluginId} not found`, startTime);
            }
            // Update plugin
            const result = await plugin.update(context);
            this.logger.info(`Successfully updated plugin: ${pluginId}`);
            return {
                ...result,
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            this.logger.error(`Failed to update plugin ${pluginId}`, error);
            return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error', startTime, [], error);
        }
    }
    // ============================================================================
    // BATCH OPERATIONS
    // ============================================================================
    async installPlugins(pluginIds, context) {
        this.logger.info(`Installing ${pluginIds.length} plugins: ${pluginIds.join(', ')}`);
        // Resolve dependencies and order
        const resolution = await this.resolveDependencies(pluginIds);
        if (resolution.conflicts.length > 0) {
            const errorResults = pluginIds.map(pluginId => this.createErrorResult(`Plugin conflicts detected: ${resolution.conflicts.map(c => `${c.plugin1} vs ${c.plugin2}`).join(', ')}`, Date.now()));
            return errorResults;
        }
        // Install plugins in dependency order
        const results = [];
        for (const pluginId of resolution.order) {
            const result = await this.installPlugin(pluginId, context);
            results.push(result);
            if (!result.success) {
                this.logger.error(`Failed to install plugin ${pluginId}, stopping batch installation`);
                break;
            }
        }
        return results;
    }
    async uninstallPlugins(pluginIds, context) {
        this.logger.info(`Uninstalling ${pluginIds.length} plugins: ${pluginIds.join(', ')}`);
        const results = [];
        for (const pluginId of pluginIds) {
            const result = await this.uninstallPlugin(pluginId, context);
            results.push(result);
        }
        return results;
    }
    // ============================================================================
    // DISCOVERY AND VALIDATION
    // ============================================================================
    async discoverPlugins() {
        // In a real implementation, this would scan for plugins in:
        // - Local plugins directory
        // - NPM registry
        // - Plugin marketplace
        // - Custom plugin sources
        this.logger.info('Discovering available plugins');
        return this.registry.getAll();
    }
    async validatePlugin(plugin) {
        try {
            const metadata = plugin.getMetadata();
            // Basic metadata validation
            const errors = [];
            const warnings = [];
            if (!metadata.id || !metadata.name || !metadata.version) {
                errors.push({
                    field: 'metadata',
                    message: 'Plugin metadata is incomplete',
                    code: 'INCOMPLETE_METADATA',
                    severity: 'error'
                });
            }
            // Validate compatibility matrix
            const compatibility = plugin.getCompatibility();
            if (!compatibility.frameworks || compatibility.frameworks.length === 0) {
                warnings.push('Plugin has no framework compatibility specified');
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [{
                        field: 'validation',
                        message: error instanceof Error ? error.message : 'Unknown validation error',
                        code: 'VALIDATION_ERROR',
                        severity: 'error'
                    }],
                warnings: []
            };
        }
    }
    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    getPluginConfig(pluginId) {
        return this.pluginConfigs.get(pluginId) || {};
    }
    setPluginConfig(pluginId, config) {
        this.pluginConfigs.set(pluginId, config);
        this.logger.info(`Updated configuration for plugin: ${pluginId}`);
    }
    // ============================================================================
    // DEPENDENCY RESOLUTION
    // ============================================================================
    async resolveDependencies(pluginIds) {
        const plugins = [...pluginIds];
        const order = [];
        const conflicts = [];
        const missing = [];
        // Check for missing plugins
        for (const pluginId of pluginIds) {
            if (!this.registry.get(pluginId)) {
                missing.push(pluginId);
            }
        }
        // Check for conflicts
        for (let i = 0; i < pluginIds.length; i++) {
            for (let j = i + 1; j < pluginIds.length; j++) {
                const pluginId1 = pluginIds[i];
                const pluginId2 = pluginIds[j];
                if (!pluginId1 || !pluginId2)
                    continue;
                const plugin1 = this.registry.get(pluginId1);
                const plugin2 = this.registry.get(pluginId2);
                if (plugin1 && plugin2) {
                    const conflicts1 = plugin1.getConflicts();
                    const conflicts2 = plugin2.getConflicts();
                    if (conflicts1.includes(pluginId2) || conflicts2.includes(pluginId1)) {
                        conflicts.push({
                            plugin1: pluginId1,
                            plugin2: pluginId2,
                            reason: 'Direct conflict between plugins',
                            severity: 'error'
                        });
                    }
                }
            }
        }
        // Simple topological sort for dependencies
        const visited = new Set();
        const visiting = new Set();
        const visit = (pluginId) => {
            if (visiting.has(pluginId)) {
                return false; // Circular dependency
            }
            if (visited.has(pluginId)) {
                return true;
            }
            visiting.add(pluginId);
            const plugin = this.registry.get(pluginId);
            if (plugin) {
                for (const dependency of plugin.getDependencies()) {
                    if (!visit(dependency)) {
                        return false;
                    }
                }
            }
            visiting.delete(pluginId);
            visited.add(pluginId);
            order.push(pluginId);
            return true;
        };
        for (const pluginId of pluginIds) {
            if (!visit(pluginId)) {
                conflicts.push({
                    plugin1: pluginId,
                    plugin2: pluginId,
                    reason: 'Circular dependency detected',
                    severity: 'error'
                });
            }
        }
        return {
            plugins,
            order,
            conflicts,
            missing
        };
    }
    async checkConflicts(pluginIds) {
        const conflicts = [];
        for (let i = 0; i < pluginIds.length; i++) {
            for (let j = i + 1; j < pluginIds.length; j++) {
                const pluginId1 = pluginIds[i];
                const pluginId2 = pluginIds[j];
                if (!pluginId1 || !pluginId2)
                    continue;
                const plugin1 = this.registry.get(pluginId1);
                const plugin2 = this.registry.get(pluginId2);
                if (plugin1 && plugin2) {
                    const conflicts1 = plugin1.getConflicts();
                    const conflicts2 = plugin2.getConflicts();
                    if (conflicts1.includes(pluginId2) || conflicts2.includes(pluginId1)) {
                        conflicts.push({
                            plugin1: pluginId1,
                            plugin2: pluginId2,
                            reason: 'Direct conflict between plugins',
                            severity: 'error'
                        });
                    }
                }
            }
        }
        return conflicts;
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    createErrorResult(message, startTime, errors = [], originalError) {
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [
                {
                    code: 'PLUGIN_ERROR',
                    message,
                    details: originalError,
                    severity: 'error'
                },
                ...errors
            ],
            warnings: [],
            duration: Date.now() - startTime
        };
    }
}
//# sourceMappingURL=plugin-manager.js.map