/**
 * Framework Agent - Framework Orchestrator
 *
 * Handles framework selection and installation (Next.js, React, Vue, etc.).
 * This agent is responsible for setting up the core application framework.
 */
import { AbstractAgent } from './base/abstract-agent.js';
import { AgentCategory, CapabilityCategory } from '../types/agent.js';
import { PluginSystem } from '../core/plugin/plugin-system.js';
import { CommandRunner } from '../core/cli/command-runner.js';
import { templateService } from '../core/templates/template-service.js';
import { ProjectType, TargetPlatform } from '../types/plugin.js';
export class FrameworkAgent extends AbstractAgent {
    pluginSystem;
    runner;
    templateService;
    constructor() {
        super();
        this.pluginSystem = PluginSystem.getInstance();
        this.runner = new CommandRunner();
        this.templateService = templateService;
    }
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getAgentMetadata() {
        return {
            name: 'Framework Agent',
            version: '1.0.0',
            description: 'Handles framework selection and installation',
            author: 'The Architech Team',
            category: AgentCategory.FRAMEWORK,
            tags: ['framework', 'nextjs', 'react', 'vue', 'installation'],
            dependencies: ['base-project'],
            requirements: []
        };
    }
    getAgentCapabilities() {
        return [
            {
                name: 'Framework Selection',
                description: 'Selects and configures the appropriate framework',
                category: CapabilityCategory.FRAMEWORK,
                requirements: [],
                conflicts: []
            },
            {
                name: 'Framework Installation',
                description: 'Installs and configures the selected framework',
                category: CapabilityCategory.FRAMEWORK,
                requirements: [],
                conflicts: []
            }
        ];
    }
    // ============================================================================
    // CORE EXECUTION
    // ============================================================================
    async executeInternal(context) {
        const startTime = Date.now();
        try {
            context.logger.info('Starting framework setup...');
            // Get plugin selection from context
            const pluginSelection = context.state.get('pluginSelection');
            // Determine framework type
            const frameworkType = this.determineFrameworkType(context, pluginSelection);
            // Execute framework plugin
            const result = await this.executeFrameworkPlugin(frameworkType, context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                data: {
                    framework: frameworkType,
                    projectPath: context.projectPath
                },
                artifacts: result.artifacts || [],
                warnings: result.warnings || [],
                duration
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return this.createErrorResult('FRAMEWORK_SETUP_FAILED', `Framework setup failed: ${errorMessage}`, [], startTime, error);
        }
    }
    // ============================================================================
    // FRAMEWORK DETERMINATION
    // ============================================================================
    determineFrameworkType(context, pluginSelection) {
        // For now, default to Next.js
        // In the future, this could be determined by user input or AI analysis
        return 'nextjs';
    }
    // ============================================================================
    // FRAMEWORK PLUGIN EXECUTION
    // ============================================================================
    async executeFrameworkPlugin(frameworkType, context) {
        context.logger.info(`Executing ${frameworkType} framework plugin...`);
        // Get the framework plugin
        const plugin = this.pluginSystem.getRegistry().get(frameworkType);
        if (!plugin) {
            throw new Error(`Framework plugin not found: ${frameworkType}`);
        }
        // Prepare plugin context
        const pluginContext = {
            ...context,
            pluginId: frameworkType,
            pluginConfig: {
                projectName: context.projectName,
                projectType: ProjectType.NEXTJS,
                targetPlatform: [TargetPlatform.WEB],
                ...context.config
            },
            installedPlugins: [],
            projectType: ProjectType.NEXTJS,
            targetPlatform: [TargetPlatform.WEB]
        };
        // Validate plugin
        const validation = await plugin.validate(pluginContext);
        if (!validation.valid) {
            throw new Error(`${frameworkType} plugin validation failed: ${validation.errors.map((e) => e.message).join(', ')}`);
        }
        // Execute plugin
        const result = await plugin.install(pluginContext);
        if (!result.success) {
            throw new Error(`${frameworkType} plugin execution failed: ${result.errors.map((e) => e.message).join(', ')}`);
        }
        context.logger.success(`${frameworkType} framework setup completed`);
        return result;
    }
}
//# sourceMappingURL=framework-agent.js.map