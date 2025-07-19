/**
 * Plugin Adapter - Bridge between Plugins and Agents
 *
 * Provides compatibility layer to use new plugin system with existing agents
 * while maintaining backward compatibility and enabling gradual migration.
 */
import { ProjectType, TargetPlatform } from '../types/plugin.js';
import { PluginSystem } from './plugin-system.js';
export class PluginAdapter {
    pluginSystem;
    constructor(pluginSystem) {
        this.pluginSystem = pluginSystem || PluginSystem.getInstance();
    }
    // ============================================================================
    // PLUGIN EXECUTION AS AGENT
    // ============================================================================
    async executePluginAsAgent(pluginId, context) {
        const startTime = Date.now();
        try {
            const plugin = this.pluginSystem.getRegistry().get(pluginId);
            if (!plugin) {
                return this.createErrorResult(`Plugin ${pluginId} not found`, startTime);
            }
            // Convert AgentContext to PluginContext
            const pluginContext = this.convertToPluginContext(context, pluginId);
            // Execute plugin
            const result = await plugin.install(pluginContext);
            // Convert PluginResult to AgentResult
            return this.convertToAgentResult(result, startTime);
        }
        catch (error) {
            return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error', startTime, [], error);
        }
    }
    // ============================================================================
    // CONTEXT CONVERSION
    // ============================================================================
    convertToPluginContext(agentContext, pluginId) {
        return {
            ...agentContext,
            pluginId,
            pluginConfig: agentContext.config || {},
            installedPlugins: agentContext.dependencies || [],
            projectType: this.detectProjectType(agentContext),
            targetPlatform: this.detectTargetPlatform(agentContext)
        };
    }
    detectProjectType(context) {
        // Detect project type based on context
        if (context.config?.framework === 'nextjs') {
            return ProjectType.NEXTJS;
        }
        if (context.config?.framework === 'react') {
            return ProjectType.REACT;
        }
        if (context.config?.framework === 'vue') {
            return ProjectType.VUE;
        }
        if (context.config?.framework === 'nuxt') {
            return ProjectType.NUXT;
        }
        if (context.config?.framework === 'svelte') {
            return ProjectType.SVELTE;
        }
        if (context.config?.framework === 'angular') {
            return ProjectType.ANGULAR;
        }
        // Default to Next.js for now
        return ProjectType.NEXTJS;
    }
    detectTargetPlatform(context) {
        // Detect target platform based on context
        const platforms = [];
        if (context.config?.platform?.includes('web')) {
            platforms.push(TargetPlatform.WEB);
        }
        if (context.config?.platform?.includes('mobile')) {
            platforms.push(TargetPlatform.MOBILE);
        }
        if (context.config?.platform?.includes('desktop')) {
            platforms.push(TargetPlatform.DESKTOP);
        }
        if (context.config?.platform?.includes('server')) {
            platforms.push(TargetPlatform.SERVER);
        }
        if (context.config?.platform?.includes('cli')) {
            platforms.push(TargetPlatform.CLI);
        }
        // Default to web if no platform specified
        if (platforms.length === 0) {
            platforms.push(TargetPlatform.WEB);
        }
        return platforms;
    }
    // ============================================================================
    // RESULT CONVERSION
    // ============================================================================
    convertToAgentResult(pluginResult, startTime) {
        return {
            success: pluginResult.success,
            artifacts: pluginResult.artifacts.map(this.convertArtifact),
            errors: pluginResult.errors.map(this.convertError),
            warnings: pluginResult.warnings,
            duration: Date.now() - startTime,
            data: {
                dependencies: pluginResult.dependencies,
                scripts: pluginResult.scripts,
                configs: pluginResult.configs
            }
        };
    }
    convertArtifact(artifact) {
        const result = {
            type: artifact.type,
            path: artifact.path
        };
        if (artifact.content) {
            result.content = artifact.content;
        }
        if (artifact.template || artifact.variables || artifact.permissions) {
            result.metadata = {
                template: artifact.template,
                variables: artifact.variables,
                permissions: artifact.permissions
            };
        }
        return result;
    }
    convertError(error) {
        return {
            code: error.code,
            message: error.message,
            details: error.details,
            recoverable: error.severity === 'warning',
            timestamp: new Date()
        };
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    createErrorResult(message, startTime, errors = [], originalError) {
        return {
            success: false,
            errors: [
                {
                    code: 'PLUGIN_ERROR',
                    message,
                    details: originalError,
                    recoverable: false,
                    timestamp: new Date()
                },
                ...errors
            ],
            warnings: [],
            duration: Date.now() - startTime
        };
    }
    // ============================================================================
    // PLUGIN DISCOVERY
    // ============================================================================
    getAvailablePlugins(category) {
        if (category) {
            return this.pluginSystem.getPluginsByCategory(category);
        }
        return this.pluginSystem.getRegistry().getAll();
    }
    getPluginsByCategory(category) {
        return this.pluginSystem.getPluginsByCategory(category);
    }
    searchPlugins(query) {
        return this.pluginSystem.searchPlugins(query);
    }
    // ============================================================================
    // COMPATIBILITY CHECKING
    // ============================================================================
    validatePluginCompatibility(pluginIds) {
        return this.pluginSystem.validateCompatibility(pluginIds);
    }
    async checkPluginConflicts(pluginIds) {
        return this.pluginSystem.checkConflicts(pluginIds);
    }
    async resolvePluginDependencies(pluginIds) {
        return this.pluginSystem.resolveDependencies(pluginIds);
    }
    // ============================================================================
    // PLUGIN MANAGEMENT
    // ============================================================================
    async installPlugin(pluginId, context) {
        const pluginContext = this.convertToPluginContext(context, pluginId);
        const result = await this.pluginSystem.installPlugin(pluginId, pluginContext);
        return this.convertToAgentResult(result, Date.now());
    }
    async uninstallPlugin(pluginId, context) {
        const pluginContext = this.convertToPluginContext(context, pluginId);
        const result = await this.pluginSystem.uninstallPlugin(pluginId, pluginContext);
        return this.convertToAgentResult(result, Date.now());
    }
    async updatePlugin(pluginId, context) {
        const pluginContext = this.convertToPluginContext(context, pluginId);
        const result = await this.pluginSystem.updatePlugin(pluginId, pluginContext);
        return this.convertToAgentResult(result, Date.now());
    }
    // ============================================================================
    // BATCH OPERATIONS
    // ============================================================================
    async installPlugins(pluginIds, context) {
        const pluginContext = this.convertToPluginContext(context, 'batch');
        const results = await this.pluginSystem.installPlugins(pluginIds, pluginContext);
        return results.map((result, index) => ({
            ...this.convertToAgentResult(result, Date.now()),
            data: { pluginId: pluginIds[index] }
        }));
    }
    // ============================================================================
    // DEBUGGING
    // ============================================================================
    debugPluginSystem() {
        this.pluginSystem.debugPlugins();
    }
    listAllPlugins() {
        this.pluginSystem.listAllPlugins();
    }
    getPluginStatistics() {
        return this.pluginSystem.getStatistics();
    }
}
//# sourceMappingURL=plugin-adapter.js.map