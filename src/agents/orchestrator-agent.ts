/**
 * Orchestrator Agent - Main Project Generation Coordinator
 * 
 * Coordinates the entire project generation process by:
 * - Analyzing user requirements
 * - Selecting appropriate plugins
 * - Orchestrating agent execution
 * - Managing dependencies and conflicts
 */

import { IAgent, AgentMetadata, AgentContext, AgentResult, AgentCategory, ValidationResult, Logger } from '../types/agent.js';
import { PluginSystem } from '../core/plugin/plugin-system.js';
import { PluginSelectionService } from '../core/plugin/plugin-selection-service.js';
import { CommandRunner } from '../core/cli/command-runner.js';
import { PluginSelection } from '../types/plugin-selection.js';
import { 
  DATABASE_PROVIDERS, 
  ORM_LIBRARIES,
  AUTH_PROVIDERS, 
  AUTH_FEATURES,
  UI_LIBRARIES,
  DEPLOYMENT_PLATFORMS,
  EMAIL_SERVICES,
  TESTING_FRAMEWORKS,
  DatabaseProvider,
  ORMLibrary,
  AuthProvider, 
  AuthFeature,
  UILibrary,
  DeploymentPlatform,
  EmailService,
  TestingFramework
} from '../types/shared-config.js';

interface ProjectRequirements {
  name: string;
  description: string;
  type: 'web-app' | 'api' | 'full-stack' | 'monorepo';
  features: string[];
  ui: {
    framework: 'nextjs' | 'react' | 'vue' | 'angular';
    designSystem: string;
    styling: 'tailwind' | 'css-modules' | 'styled-components';
  };
  database: {
    type: DatabaseProvider;
    orm: ORMLibrary;
    provider: DatabaseProvider;
  };
  authentication: {
    providers: AuthProvider[];
    requireEmailVerification: boolean;
  };
  deployment: {
    platform: DeploymentPlatform;
    environment: 'development' | 'staging' | 'production';
  };
  testing: {
    framework: TestingFramework;
    coverage: boolean;
  };
}

interface OrchestrationPlan {
  phases: OrchestrationPhase[];
  estimatedDuration: number;
  dependencies: string[];
  conflicts: string[];
  recommendations: string[];
}

interface OrchestrationPhase {
  name: string;
  description: string;
  agents: string[];
  plugins: string[];
  order: number;
  dependencies: string[];
}

export class OrchestratorAgent implements IAgent {
  private pluginSystem: PluginSystem;
  private pluginSelectionService: PluginSelectionService;
  private logger: Logger;
  private runner: CommandRunner;

  constructor() {
    this.pluginSystem = PluginSystem.getInstance();
    this.logger = this.pluginSystem.getLogger();
    this.pluginSelectionService = new PluginSelectionService(this.pluginSystem);
    this.runner = new CommandRunner();
  }

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  getMetadata(): AgentMetadata {
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

  async execute(context: AgentContext): Promise<AgentResult> {
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
        return this.createErrorResult(
          'Orchestration plan validation failed',
          startTime,
          validation.errors
        );
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

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(
        `Orchestration failed: ${errorMessage}`,
        startTime,
        [],
        error
      );
    }
  }

  // ============================================================================
  // REQUIREMENTS ANALYSIS
  // ============================================================================

  private async analyzeRequirements(context: AgentContext): Promise<ProjectRequirements> {
    this.logger.info('Analyzing project requirements...');

    // Extract requirements from context
    const projectName = context.projectName;
    const projectPath = context.projectPath;
    const userInput = context.config.userInput || '';
    const projectType = context.config.projectType || 'scalable-monorepo';
    
    // Check if we're using a template-based workflow
    const selectedTemplate = context.state.get('selectedTemplate');
    const isTemplateBased = context.state.get('isTemplateBased') || false;
    
    this.logger.info(`DEBUG: useDefaults = ${context.options.useDefaults}`);
    this.logger.info(`DEBUG: projectType = ${projectType}`);
    this.logger.info(`DEBUG: userInput = ${userInput}`);
    this.logger.info(`DEBUG: isTemplateBased = ${isTemplateBased}`);
    
    // Get plugin selection based on workflow type
    let pluginSelection: PluginSelection;
    if (isTemplateBased && selectedTemplate) {
      // Use template-based plugin selection
      this.logger.info(`Using template-based plugin selection: ${selectedTemplate.name}`);
      pluginSelection = selectedTemplate.pluginSelection;
    } else if (context.options.useDefaults) {
      // Use default plugin selection
      this.logger.info('Using default plugin selection');
      pluginSelection = this.getDefaultPluginSelection(projectType);
    } else {
      // Use interactive plugin selection (legacy)
      this.logger.info('Using interactive plugin selection');
      pluginSelection = await this.pluginSelectionService.selectPlugins(userInput);
    }

    // Convert plugin selection to project requirements
    const requirements = this.convertPluginSelectionToRequirements(pluginSelection, projectName, userInput);

    // Store plugin selection in context for later use
    context.state.set('pluginSelection', pluginSelection);

    this.logger.success('Requirements analysis completed');
    return requirements;
  }

  private getDefaultPluginSelection(projectType: 'quick-prototype' | 'scalable-monorepo'): PluginSelection {
    return {
      database: {
        enabled: true,
        provider: DATABASE_PROVIDERS.NEON,
        orm: ORM_LIBRARIES.DRIZZLE,
        features: { migrations: true, seeding: false, studio: true }
      },
      authentication: {
        enabled: true,
        providers: [AUTH_PROVIDERS.EMAIL],
        features: { 
          [AUTH_FEATURES.EMAIL_VERIFICATION]: true, 
          [AUTH_FEATURES.PASSWORD_RESET]: true, 
          [AUTH_FEATURES.SOCIAL_LOGIN]: false, 
          [AUTH_FEATURES.SESSION_MANAGEMENT]: true 
        }
      },
      ui: {
        enabled: true,
        library: UI_LIBRARIES.SHADCN_UI,
        features: { components: true, theming: true, responsive: true }
      },
      deployment: {
        enabled: false,
        platform: DEPLOYMENT_PLATFORMS.VERCEL,
        features: { autoDeploy: true, preview: true, analytics: false }
      },
      testing: {
        enabled: true,
        framework: TESTING_FRAMEWORKS.VITEST,
        features: { unit: true, integration: false, e2e: false, coverage: true }
      },
      email: {
        enabled: false,
        service: EMAIL_SERVICES.RESEND,
        features: { templates: true, tracking: false, analytics: false }
      },
      monitoring: {
        enabled: false,
        services: [],
        features: { errorTracking: false, performanceMonitoring: false, analytics: false }
      },
      payment: {
        enabled: false,
        providers: [],
        features: { subscriptions: false, oneTimePayments: false, invoices: false }
      },
      blockchain: {
        enabled: false,
        networks: [],
        features: { smartContracts: false, nftSupport: false, defiIntegration: false }
      }
    };
  }

  private convertPluginSelectionToRequirements(
    selection: PluginSelection, 
    projectName: string, 
    userInput: string
  ): ProjectRequirements {
    const config = {
      database: {
        provider: selection.database.enabled ? selection.database.provider : DATABASE_PROVIDERS.NEON,
        orm: selection.database.enabled ? selection.database.orm : ORM_LIBRARIES.DRIZZLE,
        features: selection.database.enabled ? selection.database.features : {}
      },
      authentication: {
        providers: selection.authentication.enabled ? selection.authentication.providers : [AUTH_PROVIDERS.EMAIL],
        features: selection.authentication.enabled ? {
          [AUTH_FEATURES.EMAIL_VERIFICATION]: true,
          [AUTH_FEATURES.PASSWORD_RESET]: true,
          [AUTH_FEATURES.SOCIAL_LOGIN]: false,
          [AUTH_FEATURES.SESSION_MANAGEMENT]: true
        } : {}
      },
      ui: {
        library: selection.ui.enabled ? selection.ui.library : UI_LIBRARIES.SHADCN_UI,
        features: selection.ui.enabled ? selection.ui.features : {}
      },
      deployment: {
        platform: selection.deployment.enabled ? selection.deployment.platform : DEPLOYMENT_PLATFORMS.VERCEL,
        features: selection.deployment.enabled ? selection.deployment.features : {}
      },
      testing: {
        framework: selection.testing.enabled ? selection.testing.framework : TESTING_FRAMEWORKS.VITEST,
        features: selection.testing.enabled ? selection.testing.features : {}
      },
      email: {
        service: selection.email.enabled ? selection.email.service : EMAIL_SERVICES.RESEND,
        features: selection.email.enabled ? selection.email.features : {}
      },
      monitoring: {
        services: selection.monitoring.enabled ? selection.monitoring.services : [],
        features: selection.monitoring.enabled ? selection.monitoring.features : {}
      },
      payment: {
        providers: selection.payment.enabled ? selection.payment.providers : [],
        features: selection.payment.enabled ? selection.payment.features : {}
      },
      blockchain: {
        networks: selection.blockchain.enabled ? selection.blockchain.networks : [],
        features: selection.blockchain.enabled ? selection.blockchain.features : {}
      }
    };

    return {
      name: projectName,
      description: userInput || 'Generated by The Architech',
      type: 'web-app',
      features: this.extractFeaturesFromSelection(selection),
      ui: {
        framework: 'nextjs',
        designSystem: selection.ui.enabled ? this.mapUIPluginToSystem(selection.ui.library) : 'none',
        styling: 'tailwind'
      },
      database: {
        type: selection.database.enabled ? selection.database.provider : DATABASE_PROVIDERS.NEON,
        orm: selection.database.enabled ? selection.database.orm : ORM_LIBRARIES.DRIZZLE,
        provider: selection.database.enabled ? selection.database.provider : DATABASE_PROVIDERS.NEON
      },
      authentication: {
        providers: selection.authentication.enabled ? selection.authentication.providers : [AUTH_PROVIDERS.EMAIL],
        requireEmailVerification: selection.authentication.enabled && 
          (selection.authentication.features[AUTH_FEATURES.EMAIL_VERIFICATION] ?? false)
      },
      deployment: {
        platform: selection.deployment.enabled ? selection.deployment.platform : DEPLOYMENT_PLATFORMS.VERCEL,
        environment: 'development'
      },
      testing: {
        framework: selection.testing.enabled ? selection.testing.framework : TESTING_FRAMEWORKS.VITEST,
        coverage: selection.testing.enabled && (selection.testing.features.coverage ?? false)
      }
    };
  }

  private extractFeaturesFromSelection(selection: PluginSelection): string[] {
    const features: string[] = [];

    if (selection.database.enabled) {
      features.push(`database-${selection.database.provider}`);
      features.push(`orm-${selection.database.orm}`);
    }

    if (selection.authentication.enabled) {
      features.push(`auth-${selection.authentication.providers.join('-')}`);
    }

    if (selection.ui.enabled) {
      features.push(`ui-${selection.ui.library}`);
    }

    if (selection.deployment.enabled) {
      features.push(`deploy-${selection.deployment.platform}`);
    }

    if (selection.testing.enabled) {
      features.push(`testing-${selection.testing.framework}`);
    }

    if (selection.email.enabled) {
      features.push(`email-${selection.email.service}`);
    }

    // New categories
    if (selection.monitoring.enabled && selection.monitoring.services.length > 0) {
      features.push(`monitoring-${selection.monitoring.services.join('-')}`);
    }

    if (selection.payment.enabled && selection.payment.providers.length > 0) {
      features.push(`payment-${selection.payment.providers.join('-')}`);
    }

    if (selection.blockchain.enabled && selection.blockchain.networks.length > 0) {
      features.push(`blockchain-${selection.blockchain.networks.join('-')}`);
    }

    return features;
  }

  // ============================================================================
  // ORCHESTRATION PLAN GENERATION
  // ============================================================================

  private async generateOrchestrationPlan(
    requirements: ProjectRequirements, 
    context: AgentContext
  ): Promise<OrchestrationPlan> {
    this.logger.info('Generating orchestration plan...');

    // Get plugin selection from context
    const pluginSelection = context.state.get('pluginSelection') as PluginSelection;
    
    const phases: OrchestrationPhase[] = [];
    const dependencies: string[] = [];
    const conflicts: string[] = [];
    const recommendations: string[] = [];

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
        agents: ['database-agent'],
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
        agents: ['auth-agent'],
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
        agents: ['ui-agent'],
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
        agents: ['database-agent'],
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
        agents: ['auth-agent'],
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
        agents: ['ui-agent'],
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

  private mapUIPluginToSystem(uiLibrary: string): string {
    const mapping: Record<string, string> = {
      [UI_LIBRARIES.SHADCN_UI]: 'shadcn-ui',
      [UI_LIBRARIES.CHAKRA_UI]: 'chakra-ui',
      [UI_LIBRARIES.MATERIAL_UI]: 'mui',
      [UI_LIBRARIES.ANT_DESIGN]: 'antd',
      [UI_LIBRARIES.RADIX_UI]: 'radix',
      [UI_LIBRARIES.MANTINE]: 'mantine',
      [UI_LIBRARIES.HEADLESS_UI]: 'headless-ui',
      [UI_LIBRARIES.ARIANE]: 'ariane',
      [UI_LIBRARIES.NEXT_UI]: 'next-ui',
      [UI_LIBRARIES.DAISY_UI]: 'daisy-ui'
    };
    
    return mapping[uiLibrary] || 'none';
  }

  // ============================================================================
  // PLAN VALIDATION
  // ============================================================================

  private async validatePlan(
    plan: OrchestrationPlan, 
    context: AgentContext
  ): Promise<ValidationResult> {
    this.logger.info('Validating orchestration plan...');

    const errors: any[] = [];
    const warnings: string[] = [];

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

  private async executePlan(
    plan: OrchestrationPlan, 
    context: AgentContext
  ): Promise<{
    artifacts: any[];
    warnings: string[];
    phases: any[];
  }> {
    this.logger.info('Executing orchestration plan...');

    const artifacts: any[] = [];
    const warnings: string[] = [];
    const phases: any[] = [];

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
      } catch (error) {
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

  private async executePhase(
    phase: OrchestrationPhase, 
    context: AgentContext
  ): Promise<{
    artifacts: any[];
    warnings: string[];
    duration: number;
  }> {
    const startTime = Date.now();
    const artifacts: any[] = [];
    const warnings: string[] = [];

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
          } else {
            warnings.push(`Agent ${agentId} failed: ${agentResult.errors?.map((e: any) => e.message).join(', ') || 'Unknown error'}`);
          }
        } else {
          warnings.push(`Agent ${agentId} not found`);
        }
      } catch (error) {
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

  private async getAgent(agentId: string): Promise<IAgent | null> {
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
    } catch (error) {
      this.logger.error(`Failed to load agent ${agentId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getPluginConfig(pluginId: string, context: AgentContext): Record<string, any> {
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

  private createErrorResult(
    message: string,
    startTime: number,
    errors: any[] = [],
    originalError?: any
  ): AgentResult {
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