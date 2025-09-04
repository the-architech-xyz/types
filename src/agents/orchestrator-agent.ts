/**
 * Orchestrator Agent
 * 
 * Main orchestrator that coordinates all agents
 * Reads YAML recipe and delegates to appropriate agents
 */

import { Recipe, Module, ExecutionResult } from '../types/recipe.js';
import { ProjectManager } from '../core/services/project/project-manager.js';
import { PathHandler } from '../core/services/path/path-handler.js';
import * as path from 'path';
import { FrameworkAgent } from './core/framework-agent.js';
import { DatabaseAgent } from './core/database-agent.js';
import { AuthAgent } from './core/auth-agent.js';
import { UIAgent } from './core/ui-agent.js';
import { TestingAgent } from './core/testing-agent.js';
import { DeploymentAgent } from './core/deployment-agent.js';
import { StateAgent } from './core/state-agent.js';
import { PaymentAgent } from './core/payment-agent.js';
import { EmailAgent } from './core/email-agent.js';
import { ObservabilityAgent } from './core/observability-agent.js';
import { ContentAgent } from './core/content-agent.js';
import { BlockchainAgent } from './core/blockchain-agent.js';

export class OrchestratorAgent {
  private projectManager: ProjectManager;
  private pathHandler: PathHandler;
  private agents: Map<string, any>;

  constructor(projectManager: ProjectManager) {
    this.projectManager = projectManager;
    this.pathHandler = projectManager.getPathHandler();
    this.agents = new Map();
    
    // Initialize agents
    this.initializeAgents();
  }

  /**
   * Initialize all agents
   */
  private initializeAgents(): void {
    this.agents.set('framework', new FrameworkAgent(this.pathHandler));
    this.agents.set('database', new DatabaseAgent(this.pathHandler));
    this.agents.set('auth', new AuthAgent(this.pathHandler));
    this.agents.set('ui', new UIAgent(this.pathHandler));
    this.agents.set('testing', new TestingAgent(this.pathHandler));
    this.agents.set('deployment', new DeploymentAgent(this.pathHandler));
    this.agents.set('state', new StateAgent(this.pathHandler));
    this.agents.set('payment', new PaymentAgent(this.pathHandler));
    this.agents.set('email', new EmailAgent(this.pathHandler));
    this.agents.set('observability', new ObservabilityAgent(this.pathHandler));
    this.agents.set('content', new ContentAgent(this.pathHandler));
    this.agents.set('blockchain', new BlockchainAgent(this.pathHandler));
  }

  /**
   * Execute a complete recipe
   */
  async executeRecipe(recipe: Recipe): Promise<ExecutionResult> {
    console.log(`🎯 Orchestrator Agent executing recipe: ${recipe.project.name}`);
    
    const results: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // 1. Only create the project directory structure
      // Framework modules will handle all project setup
      await this.projectManager.initializeProject();
      console.log('📋 Project directory created - framework modules will handle setup');
      
      // 2. Execute modules sequentially
      for (let i = 0; i < recipe.modules.length; i++) {
        const module = recipe.modules[i];
        
        if (!module) {
          errors.push(`Module at index ${i} is undefined`);
          break;
        }
        
        console.log(`🚀 [${i + 1}/${recipe.modules.length}] Executing module: ${module.id} (${module.category})`);
        
        try {
          // Get the appropriate agent
          const agent = this.agents.get(module.category);
          if (!agent) {
            const error = `No agent found for category: ${module.category}`;
            errors.push(error);
            console.error(`❌ ${error}`);
            break;
          }
          
          // Create project context
          const context = {
            project: {
              ...recipe.project,
              path: this.pathHandler.getProjectRoot()
            },
            module: module
          };
          
          // Execute the module with the agent
          const moduleResult = await agent.execute(module, context);
          
          if (moduleResult.success) {
            results.push(...moduleResult.files);
            warnings.push(...moduleResult.warnings);
            console.log(`✅ Module ${module.id} completed successfully`);
          } else {
            errors.push(...moduleResult.errors);
            console.error(`❌ Module ${module.id} failed: ${moduleResult.errors.join(', ')}`);
            // Stop on first failure
            break;
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Module ${module.id}: ${errorMessage}`);
          console.error(`❌ Module ${module.id} failed: ${errorMessage}`);
          // Stop on first failure
          break;
        }
      }
      
      const success = errors.length === 0;
      
      if (success) {
        console.log(`🎉 Recipe orchestrated successfully! ${results.length} files created`);
        
        // Create architech.json file
        await this.createArchitechConfig(recipe);
        
        // Final step: Install all dependencies
        if (!recipe.options?.skipInstall) {
          console.log('📦 Installing dependencies...');
          await this.installDependencies();
        }
      } else {
        console.error(`💥 Recipe orchestration failed with ${errors.length} errors`);
      }
      
      return {
        success,
        modulesExecuted: success ? recipe.modules.length : 0,
        errors,
        warnings
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`💥 Orchestration failed: ${errorMessage}`);
      
      return {
        success: false,
        modulesExecuted: 0,
        errors: [errorMessage],
        warnings: []
      };
    }
  }

  /**
   * Get available agents
   */
  getAvailableAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Get agent by category
   */
  getAgent(category: string): any {
    return this.agents.get(category);
  }

  /**
   * Create architech.json configuration file
   */
  private async createArchitechConfig(recipe: Recipe): Promise<void> {
    try {
      const config = {
        version: '1.0',
        project: {
          name: recipe.project.name,
          framework: recipe.project.framework,
          description: recipe.project.description,
          path: recipe.project.path
        },
        modules: recipe.modules.map(module => ({
          id: module.id,
          category: module.category,
          version: module.version,
          parameters: module.parameters,
          features: module.features || []
        })),
        options: recipe.options || {}
      };

      const configPath = path.join(this.pathHandler.getProjectRoot(), 'architech.json');
      const fs = await import('fs/promises');
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      console.log('📋 Created architech.json configuration file');
    } catch (error) {
      console.error('❌ Failed to create architech.json:', error);
    }
  }

  /**
   * Install dependencies (delegated to project manager)
   */
  private async installDependencies(): Promise<void> {
    // This will be implemented by the project manager
    // For now, we'll just log that it would happen
    console.log('📦 Dependencies installation would happen here');
  }
}
