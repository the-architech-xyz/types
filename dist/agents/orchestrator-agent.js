/**
 * Orchestrator Agent - Main Project Generation Coordinator
 *
 * Coordinates the entire project generation process by:
 * - Analyzing user requirements using intelligent question flow
 * - Selecting appropriate plugins based on recommendations
 * - Orchestrating agent execution
 * - Managing dependencies and conflicts
 */
import { AgentCategory } from '../types/agents.js';
import { PluginSystem } from '../core/plugin/plugin-system.js';
import { CommandRunner } from '../core/cli/command-runner.js';
import { DATABASE_PROVIDERS, ORM_LIBRARIES, AUTH_PROVIDERS, UI_LIBRARIES, DEPLOYMENT_PLATFORMS, TESTING_FRAMEWORKS } from '../types/core.js';
// New question generation system imports
import { ProgressiveFlow, EcommerceStrategy, BlogStrategy, DashboardStrategy } from '../core/questions/index.js';
export class OrchestratorAgent {
    pluginSystem;
    logger;
    runner;
    progressiveFlow;
    constructor() {
        this.pluginSystem = PluginSystem.getInstance();
        this.logger = this.pluginSystem.getLogger();
        this.runner = new CommandRunner();
        this.progressiveFlow = new ProgressiveFlow();
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
            // Step 1: Execute question flow to get user input and configuration
            const userInput = context.state.get('userInput');
            if (!userInput) {
                throw new Error('User input is required for project generation');
            }
            const flowResult = await this.executeQuestionFlow(userInput);
            if (!flowResult.success) {
                throw new Error(`Question flow failed: ${flowResult.errors.join(', ')}`);
            }
            // Step 2: Convert flow result to project requirements
            const requirements = this.convertFlowResultToRequirements(flowResult, userInput);
            // Step 3: Generate orchestration plan
            const plan = await this.generateOrchestrationPlan(requirements, context);
            // Step 4: Validate plan
            const validation = await this.validatePlan(plan, context);
            if (!validation.valid) {
                return this.createErrorResult('Plan validation failed', startTime, validation.errors);
            }
            // Step 5: Execute plan
            const result = await this.executePlan(plan, context);
            return {
                success: true,
                data: {
                    requirements,
                    plan,
                    artifacts: result.artifacts,
                    warnings: result.warnings
                },
                duration: Date.now() - startTime,
                metrics: {
                    executionTime: Date.now() - startTime,
                    memoryUsage: 0,
                    cpuUsage: 0,
                    networkRequests: 0,
                    artifactsGenerated: result.artifacts.length,
                    filesCreated: 0,
                    dependenciesInstalled: 0
                }
            };
        }
        catch (error) {
            return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error', startTime, [], error);
        }
    }
    /**
     * Execute the question flow to gather user input and generate configuration
     */
    async executeQuestionFlow(userInput) {
        // Get the appropriate question strategy based on project type
        const strategy = this.getQuestionStrategy(userInput);
        // Execute the progressive flow
        return await this.progressiveFlow.execute(userInput, strategy);
    }
    /**
     * Convert flow result to project requirements
     */
    convertFlowResultToRequirements(flowResult, userInput) {
        const config = flowResult.configuration;
        const general = config.general || {};
        return {
            name: general.projectName || 'my-project',
            description: general.description || userInput,
            type: 'web-app',
            features: general.features || [],
            ui: {
                framework: 'nextjs',
                designSystem: config.ui?.plugin || 'shadcn-ui',
                styling: 'tailwind'
            },
            database: {
                type: DATABASE_PROVIDERS.NEON,
                orm: ORM_LIBRARIES.DRIZZLE,
                provider: DATABASE_PROVIDERS.NEON
            },
            authentication: {
                providers: [AUTH_PROVIDERS.EMAIL],
                requireEmailVerification: true
            },
            deployment: {
                platform: DEPLOYMENT_PLATFORMS.VERCEL,
                environment: 'development'
            },
            testing: {
                framework: TESTING_FRAMEWORKS.VITEST,
                coverage: true
            }
        };
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
        // Database phase
        if (pluginSelection.database.enabled) {
            phases.push({
                name: 'database-setup',
                description: `Setup database with ${pluginSelection.database.provider} and ${pluginSelection.database.orm}`,
                agents: ['db'],
                plugins: [pluginSelection.database.provider, pluginSelection.database.orm],
                order: 1,
                dependencies: []
            });
        }
        // Authentication phase
        if (pluginSelection.authentication.enabled) {
            phases.push({
                name: 'authentication-setup',
                description: `Setup authentication with ${pluginSelection.authentication.providers.join(', ')}`,
                agents: ['auth'],
                plugins: ['better-auth'],
                order: 2,
                dependencies: ['database-setup']
            });
        }
        // UI phase
        if (pluginSelection.ui.enabled) {
            phases.push({
                name: 'ui-setup',
                description: `Setup ${pluginSelection.ui.library} design system`,
                agents: ['ui'],
                plugins: [this.mapUIPluginToSystem(pluginSelection.ui.library)],
                order: 3,
                dependencies: []
            });
        }
        // Additional database-specific phases
        if (pluginSelection.database.enabled && pluginSelection.database.orm === ORM_LIBRARIES.DRIZZLE) {
            phases.push({
                name: 'drizzle-setup',
                description: 'Setup Drizzle ORM with migrations and schema',
                agents: ['db'],
                plugins: ['drizzle'],
                order: 1.5,
                dependencies: ['database-setup']
            });
        }
        // Additional auth-specific phases
        if (pluginSelection.authentication.enabled && pluginSelection.authentication.providers.includes(AUTH_PROVIDERS.EMAIL)) {
            phases.push({
                name: 'email-auth-setup',
                description: 'Setup email authentication with verification',
                agents: ['auth'],
                plugins: ['better-auth'],
                order: 2.5,
                dependencies: ['authentication-setup']
            });
        }
        // Additional UI-specific phases
        if (pluginSelection.ui.enabled && pluginSelection.ui.library === UI_LIBRARIES.SHADCN_UI) {
            phases.push({
                name: 'shadcn-setup',
                description: 'Setup Shadcn/ui components and styling',
                agents: ['ui'],
                plugins: ['shadcn-ui'],
                order: 3.5,
                dependencies: ['ui-setup']
            });
        }
        // Calculate estimated duration
        const estimatedDuration = phases.reduce((total, phase) => total + 30, 0); // 30 seconds per phase
        // Generate recommendations based on plugin selection
        if (pluginSelection.database.enabled && pluginSelection.database.orm === ORM_LIBRARIES.DRIZZLE) {
            recommendations.push('Drizzle ORM works best with PostgreSQL. Consider using Neon or Supabase.');
        }
        if (pluginSelection.authentication.enabled && pluginSelection.authentication.providers.includes(AUTH_PROVIDERS.EMAIL)) {
            recommendations.push('Better Auth requires a database. Make sure to configure your database connection.');
        }
        if (pluginSelection.ui.enabled && pluginSelection.ui.library === UI_LIBRARIES.SHADCN_UI) {
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
    mapUIPluginToSystem(uiLibrary) {
        switch (uiLibrary) {
            case 'shadcn-ui':
                return 'shadcn-ui';
            case 'chakra-ui':
                return 'chakra-ui';
            case 'mui':
                return 'mui';
            default:
                return 'shadcn-ui';
        }
    }
    /**
     * Get the appropriate question strategy based on project type
     */
    getQuestionStrategy(userInput) {
        const context = this.analyzeProjectContext(userInput);
        switch (context.type) {
            case 'ecommerce':
                return new EcommerceStrategy();
            case 'blog':
                return new BlogStrategy();
            case 'dashboard':
                return new DashboardStrategy();
            default:
                // Default to ecommerce for now, can be enhanced later
                return new EcommerceStrategy();
        }
    }
    /**
     * Analyze user input to determine project context
     */
    analyzeProjectContext(userInput) {
        const lower = userInput.toLowerCase();
        if (lower.includes('ecommerce') || lower.includes('shop') || lower.includes('store')) {
            return { type: 'ecommerce' };
        }
        if (lower.includes('blog') || lower.includes('content')) {
            return { type: 'blog' };
        }
        if (lower.includes('dashboard') || lower.includes('admin')) {
            return { type: 'dashboard' };
        }
        if (lower.includes('api') || lower.includes('backend')) {
            return { type: 'api' };
        }
        if (lower.includes('full') || lower.includes('complete')) {
            return { type: 'fullstack' };
        }
        return { type: 'custom' };
    }
    // ============================================================================
    // PLAN VALIDATION
    // ============================================================================
    async validatePlan(plan, context) {
        const errors = [];
        const warnings = [];
        // Check for plugin conflicts
        const conflicts = this.detectPluginConflicts(plan);
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
    detectPluginConflicts(plan) {
        // Simple conflict detection - can be enhanced
        const conflicts = [];
        const plugins = new Set();
        for (const phase of plan.phases) {
            for (const plugin of phase.plugins) {
                if (plugins.has(plugin)) {
                    conflicts.push({
                        plugin1: plugin,
                        plugin2: plugin,
                        reason: 'Duplicate plugin in different phases'
                    });
                }
                plugins.add(plugin);
            }
        }
        return conflicts;
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