/**
 * Orchestrator Agent - Main Project Generation Coordinator
 *
 * Coordinates the entire project generation process by:
 * - Analyzing user requirements
 * - Selecting appropriate plugins
 * - Orchestrating agent execution
 * - Managing dependencies and conflicts
 */
import { AgentCategory } from '../types/agent.js';
import { PluginSystem } from '../core/plugin/plugin-system.js';
import { PluginSelectionService } from '../core/plugin/plugin-selection-service.js';
import { CommandRunner } from '../core/cli/command-runner.js';
import { DATABASE_PROVIDERS, PLUGIN_TYPES } from '../types/shared-config.js';
export class OrchestratorAgent {
    pluginSystem;
    pluginSelectionService;
    logger;
    runner;
    constructor() {
        this.pluginSystem = PluginSystem.getInstance();
        this.logger = this.pluginSystem.getLogger();
        this.pluginSelectionService = new PluginSelectionService(this.logger);
        this.runner = new CommandRunner();
    }
    // ============================================================================
    // AGENT METADATA
    // ============================================================================
    getMetadata() {
        return {
            name: 'Main Orchestrator',
            version: '1.00',
            description: 'AI-powered project planning and coordination',
            author: 'The Architech Team',
            category: AgentCategory.ADMIN,
            tags: ['ai', 'planning', 'coordination', 'project-management'],
            dependencies: [],
            requirements: []
        };
    }
    getCapabilities() {
        return [];
    }
    // ============================================================================
    // MAIN ORCHESTRATION METHODS
    // ============================================================================
    async execute(context) {
        const startTime = Date.now();
        try {
            this.logger.info('Starting project orchestration...');
            // Step 1: Analyze project requirements
            const requirements = await this.analyzeRequirements(context);
            // Step 2: Generate orchestration plan
            const plan = await this.generateOrchestrationPlan(requirements, context);
            // Step 3: Validate plan feasibility
            const validation = await this.validatePlan(plan, context);
            if (!validation.valid) {
                return this.createErrorResult('Orchestration plan validation failed', startTime, validation.errors);
            }
            // Step 4: Execute orchestration plan
            const executionResult = await this.executePlan(plan, context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                data: {
                    plan,
                    requirements,
                    phases: executionResult.phases
                },
                artifacts: executionResult.artifacts,
                warnings: executionResult.warnings,
                duration
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return this.createErrorResult(`Orchestration failed: ${errorMessage}`, startTime, [], error);
        }
    }
    // ============================================================================
    // REQUIREMENTS ANALYSIS
    // ============================================================================
    async analyzeRequirements(context) {
        this.logger.info('Analyzing project requirements...');
        // Extract requirements from context
        const projectName = context.projectName;
        const projectPath = context.projectPath;
        const userInput = context.config.userInput || '';
        const projectType = context.config.projectType || 'scalable-monorepo';
        // Debug logging
        this.logger.info(`DEBUG: useDefaults = ${context.options.useDefaults}`);
        this.logger.info(`DEBUG: projectType = ${projectType}`);
        this.logger.info(`DEBUG: userInput = ${userInput}`);
        // Use interactive plugin selection if not in --yes mode
        let pluginSelection;
        if (!context.options.useDefaults) {
            this.logger.info('DEBUG: Using interactive plugin selection');
            // Interactive plugin selection
            pluginSelection = await this.pluginSelectionService.selectPlugins(projectType, userInput);
        }
        else {
            this.logger.info('DEBUG: Using default plugin selection');
            // Use default selections for --yes mode
            pluginSelection = this.getDefaultPluginSelection(projectType);
        }
        // Convert plugin selection to project requirements
        const requirements = this.convertPluginSelectionToRequirements(pluginSelection, projectName, userInput);
        // Store plugin selection in context for later use
        context.state.set('pluginSelection', pluginSelection);
        this.logger.success('Requirements analysis completed');
        return requirements;
    }
    getDefaultPluginSelection(projectType) {
        return {
            database: {
                enabled: true,
                type: 'drizzle',
                provider: 'neon',
                features: { migrations: true, seeding: true, backup: false }
            },
            authentication: {
                enabled: true,
                type: 'better-auth',
                providers: ['email'],
                features: { emailVerification: true, passwordReset: true, socialLogin: true, sessionManagement: true }
            },
            ui: {
                enabled: true,
                type: 'shadcn',
                theme: 'system',
                components: ['button', 'input', 'card', 'dialog', 'dropdown-menu', 'form'],
                features: { animations: true, icons: true, responsive: true }
            },
            deployment: {
                enabled: true,
                platform: 'vercel',
                environment: 'production',
                features: { autoDeploy: true, previewDeployments: true, customDomain: false }
            },
            testing: {
                enabled: false,
                framework: 'vitest',
                coverage: true,
                e2e: false
            },
            monitoring: {
                enabled: false,
                service: 'sentry',
                features: { errorTracking: true, performance: true, analytics: false }
            },
            email: {
                enabled: false,
                provider: 'resend',
                features: { transactional: true, marketing: false, templates: true }
            },
            advanced: {
                linting: true,
                formatting: true,
                gitHooks: true,
                bundling: 'vite',
                optimization: true,
                security: true,
                rateLimiting: false
            }
        };
    }
    convertPluginSelectionToRequirements(selection, projectName, userInput) {
        return {
            name: projectName,
            description: userInput || 'Generated by The Architech',
            type: 'web-app',
            features: this.extractFeaturesFromSelection(selection),
            ui: {
                framework: 'nextjs',
                designSystem: selection.ui.enabled ? (selection.ui.type === 'shadcn' ? 'shadcn-ui' : selection.ui.type) : 'none',
                styling: 'tailwind'
            },
            database: {
                type: selection.database.enabled ? selection.database.provider : DATABASE_PROVIDERS.POSTGRESQL,
                orm: selection.database.enabled ? selection.database.type : PLUGIN_TYPES.NONE,
                provider: selection.database.enabled ? selection.database.provider : DATABASE_PROVIDERS.LOCAL
            },
            authentication: {
                providers: selection.authentication.enabled ? selection.authentication.providers : [],
                requireEmailVerification: selection.authentication.enabled &&
                    (selection.authentication.features.emailVerification ?? false)
            },
            deployment: {
                platform: selection.deployment.enabled ? selection.deployment.platform : 'none',
                environment: selection.deployment.enabled ? selection.deployment.environment : 'development'
            },
            testing: {
                framework: selection.testing.enabled ? selection.testing.framework : 'none',
                coverage: selection.testing.enabled && selection.testing.coverage
            }
        };
    }
    extractFeaturesFromSelection(selection) {
        const features = [];
        if (selection.database.enabled)
            features.push('database');
        if (selection.authentication.enabled)
            features.push('authentication');
        if (selection.ui.enabled)
            features.push('ui-components');
        if (selection.deployment.enabled)
            features.push('deployment');
        if (selection.testing.enabled)
            features.push('testing');
        if (selection.monitoring.enabled)
            features.push('monitoring');
        if (selection.email.enabled)
            features.push('email');
        return features;
    }
    // ============================================================================
    // ORCHESTRATION PLAN GENERATION
    // ============================================================================
    async generateOrchestrationPlan(requirements, context) {
        this.logger.info('Generating orchestration plan...');
        // Get plugin selection from context
        const pluginSelection = context.state.get('pluginSelection');
        const phases = [];
        const dependencies = [];
        const conflicts = [];
        const recommendations = [];
        // Phase 1: Project Foundation
        phases.push({
            name: 'Project Foundation',
            description: 'Setup project structure and core configuration',
            agents: ['base-project'],
            plugins: [],
            order: 1,
            dependencies: []
        });
        // Phase 2: Framework Installation
        phases.push({
            name: 'Framework Installation',
            description: 'Install and configure the selected frontend framework',
            agents: ['framework'],
            plugins: ['nextjs'],
            order: 2,
            dependencies: ['Project Foundation']
        });
        // Phase 3: Database Layer
        if (pluginSelection.database.enabled && pluginSelection.database.type !== 'none') {
            phases.push({
                name: 'Database Layer',
                description: `Setup database with ${pluginSelection.database.type}`,
                agents: ['db'],
                plugins: [pluginSelection.database.type],
                order: 3,
                dependencies: ['Project Foundation']
            });
        }
        // Phase 4: Authentication
        if (pluginSelection.authentication.enabled && pluginSelection.authentication.type !== 'none') {
            phases.push({
                name: 'Authentication',
                description: `Setup authentication with ${pluginSelection.authentication.type}`,
                agents: ['auth'],
                plugins: [pluginSelection.authentication.type],
                order: 4,
                dependencies: pluginSelection.database.enabled ? ['Database Layer'] : ['Project Foundation']
            });
        }
        // Phase 5: UI/Design System
        if (pluginSelection.ui.enabled && pluginSelection.ui.type !== 'none') {
            phases.push({
                name: 'UI/Design System',
                description: `Setup ${pluginSelection.ui.type} design system`,
                agents: ['ui'],
                plugins: [this.mapUIPluginToSystem(pluginSelection.ui.type)],
                order: 5,
                dependencies: ['Project Foundation']
            });
        }
        // Calculate estimated duration
        const estimatedDuration = phases.reduce((total, phase) => total + 30, 0); // 30 seconds per phase
        // Generate recommendations based on plugin selection
        if (pluginSelection.database.enabled && pluginSelection.database.type === 'drizzle') {
            recommendations.push('Drizzle ORM works best with PostgreSQL. Consider using Neon or Supabase.');
        }
        if (pluginSelection.authentication.enabled && pluginSelection.authentication.type === 'better-auth') {
            recommendations.push('Better Auth requires a database. Make sure to configure your database connection.');
        }
        if (pluginSelection.ui.enabled && pluginSelection.ui.type === 'shadcn') {
            recommendations.push('Shadcn/ui provides beautiful, accessible components out of the box.');
        }
        return {
            phases,
            estimatedDuration,
            dependencies,
            conflicts,
            recommendations
        };
    }
    mapUIPluginToSystem(uiType) {
        // Map plugin selection UI types to actual plugin system IDs
        const mapping = {
            'shadcn': 'shadcn-ui',
            'radix': 'shadcn-ui', // Radix is included with shadcn-ui
            'none': 'none'
        };
        return mapping[uiType] || 'shadcn-ui';
    }
    // ============================================================================
    // PLAN VALIDATION
    // ============================================================================
    async validatePlan(plan, context) {
        this.logger.info('Validating orchestration plan...');
        const errors = [];
        const warnings = [];
        // Validate plugin compatibility
        const allPlugins = plan.phases.flatMap(phase => phase.plugins);
        const uniquePlugins = [...new Set(allPlugins)];
        for (const pluginId of uniquePlugins) {
            const plugin = this.pluginSystem.getRegistry().get(pluginId);
            if (!plugin) {
                errors.push({
                    field: 'plugins',
                    message: `Plugin not found: ${pluginId}`,
                    code: 'PLUGIN_NOT_FOUND',
                    severity: 'error'
                });
            }
        }
        // Check for plugin conflicts
        const conflicts = await this.pluginSystem.checkConflicts(uniquePlugins);
        if (conflicts.length > 0) {
            for (const conflict of conflicts) {
                warnings.push(`Plugin conflict: ${conflict.plugin1} vs ${conflict.plugin2} - ${conflict.reason}`);
            }
        }
        // Validate dependencies
        for (const phase of plan.phases) {
            for (const dependency of phase.dependencies) {
                const dependencyPhase = plan.phases.find(p => p.name === dependency);
                if (!dependencyPhase) {
                    errors.push({
                        field: 'dependencies',
                        message: `Phase dependency not found: ${dependency}`,
                        code: 'DEPENDENCY_NOT_FOUND',
                        severity: 'error'
                    });
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
    // PLAN EXECUTION
    // ============================================================================
    async executePlan(plan, context) {
        this.logger.info('Executing orchestration plan...');
        const artifacts = [];
        const warnings = [];
        const phases = [];
        // Execute phases in order
        const sortedPhases = plan.phases.sort((a, b) => a.order - b.order);
        for (const phase of sortedPhases) {
            this.logger.info(`Executing phase: ${phase.name}`);
            try {
                const phaseResult = await this.executePhase(phase, context);
                artifacts.push(...phaseResult.artifacts);
                warnings.push(...phaseResult.warnings);
                phases.push({
                    name: phase.name,
                    status: 'completed',
                    duration: phaseResult.duration,
                    artifacts: phaseResult.artifacts.length
                });
                this.logger.success(`Phase completed: ${phase.name}`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(`Phase failed: ${phase.name} - ${errorMessage}`);
                phases.push({
                    name: phase.name,
                    status: 'failed',
                    error: errorMessage
                });
                warnings.push(`Phase ${phase.name} failed: ${errorMessage}`);
            }
        }
        return {
            artifacts,
            warnings,
            phases
        };
    }
    async executePhase(phase, context) {
        const startTime = Date.now();
        const artifacts = [];
        const warnings = [];
        // Execute agents for this phase (agents will handle plugin execution)
        for (const agentId of phase.agents) {
            try {
                this.logger.info(`Executing agent: ${agentId}`);
                // Import and execute the appropriate agent
                const agent = await this.getAgent(agentId);
                if (agent) {
                    const agentResult = await agent.execute(context);
                    if (agentResult.success) {
                        artifacts.push(...(agentResult.artifacts || []));
                        if (agentResult.warnings) {
                            warnings.push(...agentResult.warnings);
                        }
                        this.logger.success(`Agent ${agentId} completed successfully`);
                    }
                    else {
                        warnings.push(`Agent ${agentId} failed: ${agentResult.errors?.map((e) => e.message).join(', ') || 'Unknown error'}`);
                    }
                }
                else {
                    warnings.push(`Agent ${agentId} not found`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                warnings.push(`Agent ${agentId} execution failed: ${errorMessage}`);
            }
        }
        const duration = Date.now() - startTime;
        return {
            artifacts,
            warnings,
            duration
        };
    }
    // ============================================================================
    // AGENT MANAGEMENT
    // ============================================================================
    async getAgent(agentId) {
        try {
            switch (agentId) {
                case 'base-project':
                    const { BaseProjectAgent } = await import('./base-project-agent.js');
                    return new BaseProjectAgent();
                case 'framework':
                    const { FrameworkAgent } = await import('./framework-agent.js');
                    return new FrameworkAgent();
                case 'db':
                    const { DBAgent } = await import('./db-agent.js');
                    return new DBAgent();
                case 'auth':
                    const { AuthAgent } = await import('./auth-agent.js');
                    return new AuthAgent();
                case 'ui':
                    const { UIAgent } = await import('./ui-agent.js');
                    return new UIAgent();
                case 'deployment':
                    const { DeploymentAgent } = await import('./deployment-agent.js');
                    return new DeploymentAgent();
                case 'testing':
                    const { TestingAgent } = await import('./testing-agent.js');
                    return new TestingAgent();
                case 'email':
                    const { EmailAgent } = await import('./email-agent.js');
                    return new EmailAgent();
                case 'monitoring':
                    const { MonitoringAgent } = await import('./monitoring-agent.js');
                    return new MonitoringAgent();
                default:
                    this.logger.warn(`Unknown agent: ${agentId}`);
                    return null;
            }
        }
        catch (error) {
            this.logger.error(`Failed to load agent ${agentId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        }
    }
    // ============================================================================
    // HELPER METHODS
    // ============================================================================
    getPluginConfig(pluginId, context) {
        // Return appropriate configuration for each plugin
        switch (pluginId) {
            case 'nextjs':
                return {
                    appRouter: true,
                    strictMode: true,
                    typescript: true
                };
            case 'shadcn-ui':
                return {
                    components: ['button', 'input', 'card', 'dialog'],
                    includeExamples: true,
                    useTypeScript: true
                };
            case 'drizzle':
                return {
                    provider: 'neon',
                    connectionString: 'NEON_DATABASE_URL_PLACEHOLDER'
                };
            case 'better-auth':
                return {
                    providers: ['email'],
                    requireEmailVerification: true,
                    sessionDuration: 604800
                };
            default:
                return {};
        }
    }
    createErrorResult(message, startTime, errors = [], originalError) {
        return {
            success: false,
            errors: [
                {
                    code: 'ORCHESTRATION_ERROR',
                    message,
                    details: originalError,
                    recoverable: false,
                    timestamp: new Date()
                },
                ...errors
            ],
            duration: Date.now() - startTime
        };
    }
}
//# sourceMappingURL=orchestrator-agent.js.map