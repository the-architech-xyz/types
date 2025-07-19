/**
 * Main Orchestrator Agent
 * 
 * AI-powered project planning and decision making.
 * Coordinates all specialized agents and manages plugin selection.
 * Handles user interaction and requirements gathering.
 */

import { IAgent, AgentContext, AgentResult, ValidationResult, AgentMetadata, AgentCategory } from '../types/agent.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { Logger } from '../types/agent.js';
import { CommandRunner } from '../utils/command-runner.js';
import { ProjectType, TargetPlatform } from '../types/plugin.js';
import * as path from 'path';
import fsExtra from 'fs-extra';

interface ProjectRequirements {
  name: string;
  description: string;
  type: 'web-app' | 'api' | 'full-stack' | 'monorepo';
  features: string[];
  ui: {
    framework: 'nextjs' | 'react' | 'vue' | 'angular';
    designSystem: 'shadcn-ui' | 'mui' | 'chakra-ui' | 'antd';
    styling: 'tailwind' | 'css-modules' | 'styled-components';
  };
  database: {
    type: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
    orm: 'drizzle' | 'prisma' | 'typeorm';
    provider: 'neon' | 'local' | 'vercel' | 'supabase';
  };
  authentication: {
    providers: ('email' | 'github' | 'google' | 'oauth')[];
    requireEmailVerification: boolean;
  };
  deployment: {
    platform: 'vercel' | 'netlify' | 'railway' | 'aws';
    environment: 'development' | 'staging' | 'production';
  };
  testing: {
    framework: 'jest' | 'vitest' | 'playwright';
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
  private logger: Logger;
  private runner: CommandRunner;

  constructor() {
    this.pluginSystem = PluginSystem.getInstance();
    this.logger = this.pluginSystem.getLogger();
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
    
    // Parse user input for requirements (from config or state)
    const userInput = context.config.userInput || '';
    const requirements = this.parseUserRequirements(userInput, projectName);

    // Validate and enhance requirements
    const enhancedRequirements = await this.enhanceRequirements(requirements, context);

    this.logger.success('Requirements analysis completed');
    return enhancedRequirements;
  }

  private parseUserRequirements(userInput: string, projectName: string): Partial<ProjectRequirements> {
    // AI-powered parsing of natural language requirements
    const requirements: Partial<ProjectRequirements> = {
      name: projectName,
      description: 'Generated by The Architech',
      type: 'web-app',
      features: [],
      ui: {
        framework: 'nextjs',
        designSystem: 'shadcn-ui',
        styling: 'tailwind'
      },
      database: {
        type: 'postgresql',
        orm: 'drizzle',
        provider: 'neon'
      },
      authentication: {
        providers: ['email'],
        requireEmailVerification: true
      },
      deployment: {
        platform: 'vercel',
        environment: 'development'
      },
      testing: {
        framework: 'jest',
        coverage: true
      }
    };

    // Parse user input for specific requirements
    const input = userInput.toLowerCase();
    
    // Framework detection
    if (input.includes('vue')) requirements.ui!.framework = 'vue';
    if (input.includes('angular')) requirements.ui!.framework = 'angular';
    if (input.includes('react') && !input.includes('next')) requirements.ui!.framework = 'react';
    
    // Database detection
    if (input.includes('mysql')) requirements.database!.type = 'mysql';
    if (input.includes('sqlite')) requirements.database!.type = 'sqlite';
    if (input.includes('mongodb')) requirements.database!.type = 'mongodb';
    if (input.includes('prisma')) requirements.database!.orm = 'prisma';
    
    // Authentication detection
    if (input.includes('github')) requirements.authentication!.providers.push('github');
    if (input.includes('google')) requirements.authentication!.providers.push('google');
    if (input.includes('oauth')) requirements.authentication!.providers.push('oauth');
    
    // Deployment detection
    if (input.includes('netlify')) requirements.deployment!.platform = 'netlify';
    if (input.includes('railway')) requirements.deployment!.platform = 'railway';
    if (input.includes('aws')) requirements.deployment!.platform = 'aws';
    
    // Testing detection
    if (input.includes('vitest')) requirements.testing!.framework = 'vitest';
    if (input.includes('playwright')) requirements.testing!.framework = 'playwright';

    return requirements;
  }

  private async enhanceRequirements(
    requirements: Partial<ProjectRequirements>, 
    context: AgentContext
  ): Promise<ProjectRequirements> {
    // AI-powered requirement enhancement
    const enhanced: ProjectRequirements = {
      name: requirements.name || 'my-app',
      description: requirements.description || 'Generated by The Architech',
      type: requirements.type || 'web-app',
      features: requirements.features || [],
      ui: {
        framework: requirements.ui?.framework || 'nextjs',
        designSystem: requirements.ui?.designSystem || 'shadcn-ui',
        styling: requirements.ui?.styling || 'tailwind'
      },
      database: {
        type: requirements.database?.type || 'postgresql',
        orm: requirements.database?.orm || 'drizzle',
        provider: requirements.database?.provider || 'neon'
      },
      authentication: {
        providers: requirements.authentication?.providers || ['email'],
        requireEmailVerification: requirements.authentication?.requireEmailVerification ?? true
      },
      deployment: {
        platform: requirements.deployment?.platform || 'vercel',
        environment: requirements.deployment?.environment || 'development'
      },
      testing: {
        framework: requirements.testing?.framework || 'jest',
        coverage: requirements.testing?.coverage ?? true
      }
    };

    // Add intelligent defaults based on project type
    if (enhanced.type === 'monorepo') {
      enhanced.features.push('monorepo', 'turborepo', 'shared-packages');
    }

    if (enhanced.ui.framework === 'nextjs') {
      enhanced.features.push('app-router', 'server-components', 'typescript');
    }

    return enhanced;
  }

  // ============================================================================
  // ORCHESTRATION PLAN GENERATION
  // ============================================================================

  private async generateOrchestrationPlan(
    requirements: ProjectRequirements, 
    context: AgentContext
  ): Promise<OrchestrationPlan> {
    this.logger.info('Generating orchestration plan...');

    const phases: OrchestrationPhase[] = [];
    const dependencies: string[] = [];
    const conflicts: string[] = [];
    const recommendations: string[] = [];

    // Phase 1: Project Foundation
    phases.push({
      name: 'Project Foundation',
      description: 'Setup project structure and core configuration',
      agents: ['config', 'base-project'],
      plugins: ['nextjs'],
      order: 1,
      dependencies: []
    });

    // Phase 2: Database Layer
    if (requirements.database.orm === 'drizzle') {
      phases.push({
        name: 'Database Layer',
        description: 'Setup database with Drizzle ORM',
        agents: ['db'],
        plugins: ['drizzle'],
        order: 2,
        dependencies: ['Project Foundation']
      });
    }

    // Phase 3: Authentication
    if (requirements.authentication.providers.length > 0) {
      phases.push({
        name: 'Authentication',
        description: 'Setup authentication with Better Auth',
        agents: ['auth'],
        plugins: ['better-auth'],
        order: 3,
        dependencies: ['Database Layer']
      });
    }

    // Phase 4: UI/Design System
    if (requirements.ui.designSystem === 'shadcn-ui') {
      phases.push({
        name: 'UI/Design System',
        description: 'Setup Shadcn/ui design system',
        agents: ['design-system'],
        plugins: ['shadcn-ui'],
        order: 4,
        dependencies: ['Project Foundation']
      });
    }

    // Phase 5: Testing
    phases.push({
      name: 'Testing',
      description: 'Setup testing framework and configuration',
      agents: ['validation'],
      plugins: [],
      order: 5,
      dependencies: ['Project Foundation']
    });

    // Phase 6: Deployment
    phases.push({
      name: 'Deployment',
      description: 'Setup deployment configuration',
      agents: ['deployment'],
      plugins: [],
      order: 6,
      dependencies: ['Project Foundation']
    });

    // Phase 7: Best Practices
    phases.push({
      name: 'Best Practices',
      description: 'Apply code quality and best practices',
      agents: ['best-practices'],
      plugins: [],
      order: 7,
      dependencies: ['Project Foundation']
    });

    // Calculate estimated duration
    const estimatedDuration = phases.reduce((total, phase) => total + 30, 0); // 30 seconds per phase

    // Generate recommendations
    if (requirements.ui.framework === 'nextjs') {
      recommendations.push('Consider using App Router for better performance');
    }
    if (requirements.database.provider === 'neon') {
      recommendations.push('Neon provides excellent PostgreSQL hosting with branching');
    }
    if (requirements.authentication.providers.includes('github')) {
      recommendations.push('GitHub OAuth provides seamless developer experience');
    }

    return {
      phases,
      estimatedDuration,
      dependencies,
      conflicts,
      recommendations
    };
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

    // Execute plugins for this phase
    for (const pluginId of phase.plugins) {
      const plugin = this.pluginSystem.getRegistry().get(pluginId);
      if (plugin) {
        const pluginContext = {
          ...context,
          pluginId,
          pluginConfig: this.getPluginConfig(pluginId, context),
          installedPlugins: [],
          projectType: ProjectType.NEXTJS,
          targetPlatform: [TargetPlatform.WEB]
        };

        const result = await plugin.install(pluginContext);
        
        if (result.success) {
          artifacts.push(...result.artifacts);
          warnings.push(...result.warnings);
        } else {
          warnings.push(`Plugin ${pluginId} failed: ${result.errors.map((e: any) => e.message).join(', ')}`);
        }
      }
    }

    // Execute agents for this phase
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
        case 'db':
          const { DBAgent } = await import('./db-agent.js');
          return new DBAgent();
        case 'auth':
          const { AuthAgent } = await import('./auth-agent.js');
          return new AuthAgent();
        case 'design-system':
        case 'ui':
          const { UIAgent } = await import('./ui-agent.js');
          return new UIAgent();
        case 'validation':
          const { ValidationAgent } = await import('./validation-agent.js');
          return new ValidationAgent();
        case 'deployment':
          const { DeploymentAgent } = await import('./deployment-agent.js');
          return new DeploymentAgent();
        case 'config':
        case 'best-practices':
          // For now, return null for these agents as they're integrated into others
          return null;
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