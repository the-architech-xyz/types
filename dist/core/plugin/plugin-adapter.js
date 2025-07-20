/**
 * Plugin Adapter - Bridge between CLI and Plugin System
 *
 * Provides a unified interface for CLI commands to interact with the plugin system.
 * Handles plugin installation, configuration, and management operations.
 */
import { structureService } from '../project/structure-service.js';
export class PluginAdapter {
    pluginSystem;
    logger;
    constructor(pluginSystem) {
        this.pluginSystem = pluginSystem;
        this.logger = pluginSystem.getLogger();
    }
    // ============================================================================
    // PLUGIN INSTALLATION
    // ============================================================================
    async installPlugin(pluginId, context) {
        try {
            this.logger.info(`Installing plugin: ${pluginId}`);
            // Validate plugin exists
            const plugin = this.pluginSystem.getRegistry().get(pluginId);
            if (!plugin) {
                return {
                    success: false,
                    errors: [{
                            code: 'PLUGIN_NOT_FOUND',
                            message: `Plugin "${pluginId}" not found`,
                            severity: 'error'
                        }]
                };
            }
            // Check compatibility
            const compatibility = this.pluginSystem.validateCompatibility([pluginId]);
            if (!compatibility.compatible) {
                return {
                    success: false,
                    errors: compatibility.errors || [],
                    warnings: compatibility.warnings || []
                };
            }
            // Convert adapter context to plugin context
            const pluginContext = this.convertToPluginContext(context, pluginId);
            // Install plugin
            const result = await this.pluginSystem.installPlugin(pluginId, pluginContext);
            if (result.success) {
                this.logger.success(`Successfully installed plugin: ${pluginId}`);
                return {
                    success: true,
                    data: result.data,
                    warnings: result.warnings,
                    artifacts: result.artifacts
                };
            }
            else {
                return {
                    success: false,
                    errors: result.errors,
                    warnings: result.warnings
                };
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to install plugin ${pluginId}: ${errorMessage}`, error);
            return {
                success: false,
                errors: [{
                        code: 'INSTALLATION_ERROR',
                        message: `Failed to install plugin: ${errorMessage}`,
                        severity: 'error'
                    }]
            };
        }
    }
    // ============================================================================
    // PLUGIN UNINSTALLATION
    // ============================================================================
    async uninstallPlugin(pluginId, context) {
        try {
            this.logger.info(`Uninstalling plugin: ${pluginId}`);
            // Validate plugin exists
            const plugin = this.pluginSystem.getRegistry().get(pluginId);
            if (!plugin) {
                return {
                    success: false,
                    errors: [{
                            code: 'PLUGIN_NOT_FOUND',
                            message: `Plugin "${pluginId}" not found`,
                            severity: 'error'
                        }]
                };
            }
            // Convert adapter context to plugin context
            const pluginContext = this.convertToPluginContext(context, pluginId);
            // Uninstall plugin
            const result = await this.pluginSystem.uninstallPlugin(pluginId, pluginContext);
            if (result.success) {
                this.logger.success(`Successfully uninstalled plugin: ${pluginId}`);
                return {
                    success: true,
                    data: result.data,
                    warnings: result.warnings,
                    artifacts: result.artifacts
                };
            }
            else {
                return {
                    success: false,
                    errors: result.errors,
                    warnings: result.warnings
                };
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to uninstall plugin ${pluginId}: ${errorMessage}`, error);
            return {
                success: false,
                errors: [{
                        code: 'UNINSTALLATION_ERROR',
                        message: `Failed to uninstall plugin: ${errorMessage}`,
                        severity: 'error'
                    }]
            };
        }
    }
    // ============================================================================
    // PLUGIN CONFIGURATION
    // ============================================================================
    async configurePlugin(pluginId, config, context) {
        try {
            this.logger.info(`Configuring plugin: ${pluginId}`);
            // Validate plugin exists
            const plugin = this.pluginSystem.getRegistry().get(pluginId);
            if (!plugin) {
                return {
                    success: false,
                    errors: [{
                            code: 'PLUGIN_NOT_FOUND',
                            message: `Plugin "${pluginId}" not found`,
                            severity: 'error'
                        }]
                };
            }
            // Validate configuration
            const configSchema = plugin.getConfigSchema();
            if (configSchema) {
                const validation = this.validateConfiguration(config, configSchema);
                if (!validation.valid) {
                    return {
                        success: false,
                        errors: validation.errors
                    };
                }
            }
            // Convert adapter context to plugin context
            const pluginContext = this.convertToPluginContext(context, pluginId);
            pluginContext.config = { ...pluginContext.config, ...config };
            // For now, just validate the plugin with new config
            // TODO: Add configure method to plugin interface if needed
            const result = await plugin.validate(pluginContext);
            if (result.valid) {
                this.logger.success(`Successfully configured plugin: ${pluginId}`);
                return {
                    success: true,
                    warnings: result.warnings
                };
            }
            else {
                return {
                    success: false,
                    errors: result.errors,
                    warnings: result.warnings
                };
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to configure plugin ${pluginId}: ${errorMessage}`, error);
            return {
                success: false,
                errors: [{
                        code: 'CONFIGURATION_ERROR',
                        message: `Failed to configure plugin: ${errorMessage}`,
                        severity: 'error'
                    }]
            };
        }
    }
    // ============================================================================
    // PLUGIN VALIDATION
    // ============================================================================
    async validatePlugin(pluginId, context) {
        try {
            this.logger.info(`Validating plugin: ${pluginId}`);
            // Validate plugin exists
            const plugin = this.pluginSystem.getRegistry().get(pluginId);
            if (!plugin) {
                return {
                    success: false,
                    errors: [{
                            code: 'PLUGIN_NOT_FOUND',
                            message: `Plugin "${pluginId}" not found`,
                            severity: 'error'
                        }]
                };
            }
            // Convert adapter context to plugin context
            const pluginContext = this.convertToPluginContext(context, pluginId);
            // Validate plugin
            const result = await plugin.validate(pluginContext);
            if (result.valid) {
                this.logger.success(`Plugin validation passed: ${pluginId}`);
                return {
                    success: true,
                    warnings: result.warnings
                };
            }
            else {
                return {
                    success: false,
                    errors: result.errors,
                    warnings: result.warnings
                };
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to validate plugin ${pluginId}: ${errorMessage}`, error);
            return {
                success: false,
                errors: [{
                        code: 'VALIDATION_ERROR',
                        message: `Failed to validate plugin: ${errorMessage}`,
                        severity: 'error'
                    }]
            };
        }
    }
    // ============================================================================
    // BULK OPERATIONS
    // ============================================================================
    async installPlugins(pluginIds, context) {
        const results = [];
        for (const pluginId of pluginIds) {
            const result = await this.installPlugin(pluginId, context);
            results.push(result);
            // Stop on first failure
            if (!result.success) {
                break;
            }
        }
        return results;
    }
    async uninstallPlugins(pluginIds, context) {
        const results = [];
        for (const pluginId of pluginIds) {
            const result = await this.uninstallPlugin(pluginId, context);
            results.push(result);
        }
        return results;
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    convertToPluginContext(adapterContext, pluginId) {
        return {
            projectName: adapterContext.projectName,
            projectPath: adapterContext.projectPath,
            packageManager: adapterContext.packageManager,
            options: adapterContext.options,
            config: adapterContext.config,
            runner: adapterContext.runner,
            logger: adapterContext.logger,
            state: adapterContext.state,
            dependencies: adapterContext.dependencies,
            environment: adapterContext.environment,
            pluginId,
            pluginConfig: adapterContext.config[pluginId] || {},
            installedPlugins: [],
            projectType: 'nextjs',
            targetPlatform: ['web'],
            // Use the centralized structure service
            projectStructure: structureService.createStructureInfo(adapterContext.config.userPreference || 'quick-prototype', adapterContext.config.template || 'nextjs-14')
        };
    }
    validateConfiguration(config, schema) {
        const errors = [];
        if (!schema.properties) {
            return { valid: true, errors: [] };
        }
        // Check required fields
        const required = schema.required || [];
        for (const field of required) {
            if (config[field] === undefined) {
                errors.push({
                    code: 'MISSING_REQUIRED_FIELD',
                    message: `Required field "${field}" is missing`,
                    severity: 'error'
                });
            }
        }
        // Check field types
        for (const [field, value] of Object.entries(config)) {
            const fieldSchema = schema.properties[field];
            if (fieldSchema && value !== undefined) {
                const typeValidation = this.validateFieldType(field, value, fieldSchema);
                if (!typeValidation.valid && typeValidation.error) {
                    errors.push(typeValidation.error);
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    validateFieldType(field, value, schema) {
        const expectedType = schema.type;
        switch (expectedType) {
            case 'string':
                if (typeof value !== 'string') {
                    return {
                        valid: false,
                        error: {
                            code: 'INVALID_TYPE',
                            message: `Field "${field}" must be a string`,
                            severity: 'error'
                        }
                    };
                }
                break;
            case 'number':
                if (typeof value !== 'number') {
                    return {
                        valid: false,
                        error: {
                            code: 'INVALID_TYPE',
                            message: `Field "${field}" must be a number`,
                            severity: 'error'
                        }
                    };
                }
                break;
            case 'boolean':
                if (typeof value !== 'boolean') {
                    return {
                        valid: false,
                        error: {
                            code: 'INVALID_TYPE',
                            message: `Field "${field}" must be a boolean`,
                            severity: 'error'
                        }
                    };
                }
                break;
            case 'array':
                if (!Array.isArray(value)) {
                    return {
                        valid: false,
                        error: {
                            code: 'INVALID_TYPE',
                            message: `Field "${field}" must be an array`,
                            severity: 'error'
                        }
                    };
                }
                break;
        }
        return { valid: true };
    }
    // ============================================================================
    // PLUGIN INFORMATION
    // ============================================================================
    getPluginInfo(pluginId) {
        const plugin = this.pluginSystem.getRegistry().get(pluginId);
        if (!plugin) {
            return null;
        }
        return {
            metadata: plugin.getMetadata(),
            compatibility: plugin.getCompatibility(),
            dependencies: plugin.getDependencies(),
            conflicts: plugin.getConflicts(),
            requirements: plugin.getRequirements(),
            configSchema: plugin.getConfigSchema()
        };
    }
    listPlugins() {
        return this.pluginSystem.getRegistry().getAll();
    }
    searchPlugins(query) {
        return this.pluginSystem.searchPlugins(query);
    }
    getPluginsByCategory(category) {
        return this.pluginSystem.getPluginsByCategory(category);
    }
}
//# sourceMappingURL=plugin-adapter.js.map