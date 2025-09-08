/**
 * Blueprint Executor - Clean Implementation
 * 
 * Executes blueprints using the new three-layer architecture:
 * Layer 1: File Modification Engine (primitives)
 * Layer 2: Blueprint Orchestrator (translation)
 * Layer 3: Blueprint Executor (orchestration)
 */

import { Blueprint, BlueprintAction, BlueprintExecutionResult } from '../../../types/adapter.js';
import { ProjectContext } from '../../../types/agent.js';
import { CommandRunner } from '../../cli/command-runner.js';
import { logger } from '../../utils/logger.js';
import { BlueprintOrchestrator } from '../blueprint-orchestrator/index.js';
import { FileModificationEngine } from '../file-engine/file-modification-engine.js';

export class BlueprintExecutor {
  private commandRunner: CommandRunner;
  private orchestrator: BlueprintOrchestrator;
  private currentAction: BlueprintAction | null = null;

  constructor(projectRoot: string, engine?: FileModificationEngine) {
    this.commandRunner = new CommandRunner();
    this.orchestrator = new BlueprintOrchestrator(projectRoot, engine);
  }

  /**
   * Execute a blueprint
   */
  async executeBlueprint(blueprint: Blueprint, context: ProjectContext): Promise<BlueprintExecutionResult> {
    console.log(`🎯 Executing blueprint: ${blueprint.name}`);
    
    const files: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (let i = 0; i < blueprint.actions.length; i++) {
      const action = blueprint.actions[i];
      
      if (!action) {
        errors.push(`Action at index ${i} is undefined`);
        continue;
      }
      
      console.log(`  📋 [${i + 1}/${blueprint.actions.length}] ${action.type}`);
      console.log(`  🔍 Action path: ${action.path}`);
      console.log(`  🔍 Action condition: ${action.condition}`);
      
      // Check action condition before processing
      if (action.condition) {
        const shouldExecute = this.evaluateCondition(action.condition, context);
        console.log(`  🔍 Action condition evaluation: ${action.condition} = ${shouldExecute}`);
        if (!shouldExecute) {
          console.log(`  ⏭️ Skipping action due to condition: ${action.condition}`);
          continue;
        }
      }
      
      // Set current action for context-aware processing
      this.currentAction = action;
      
      try {
        // Use orchestrator for all semantic actions
        const result = await this.orchestrator.executeSemanticAction(action, context);
        
        if (result.success) {
          files.push(...result.files);
          warnings.push(...result.warnings);
        } else {
          errors.push(...result.errors);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Action ${i + 1} failed: ${errorMessage}`);
      }
    }
    
    const success = errors.length === 0;
    
    // Flush all changes to disk
    if (success) {
      await this.orchestrator.flushToDisk();
    }
    
    return {
      success,
      files,
      errors,
      warnings
    };
  }

  /**
   * Process template variables in content
   */
  private processTemplate(template: string, context: ProjectContext): string {
    let processed = template;
    
    // 1. Process path variables first (from decentralized path handler)
    if (context.pathHandler && typeof context.pathHandler.resolveTemplate === 'function') {
      processed = context.pathHandler.resolveTemplate(processed);
    }
    
    // 2. Process other template variables
    processed = processed.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const keys = variable.trim().split('.');
      let value: any = context;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return match; // Return original if not found
        }
      }
      
      return String(value || '');
    });
    
    return processed;
  }

  /**
   * Evaluate condition for conditional actions
   */
  private evaluateCondition(condition: string, context: ProjectContext): boolean {
    try {
      // Simple condition evaluation - can be enhanced
      const processedCondition = this.processTemplate(condition, context);
      
      // For now, just check if the condition evaluates to a truthy value
      // This is a simplified implementation
      return Boolean(processedCondition);
    } catch (error) {
      console.warn(`Failed to evaluate condition: ${condition}`, error);
      return false;
    }
  }
}
