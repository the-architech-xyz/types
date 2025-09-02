/**
 * Framework Agent
 * 
 * Handles framework modules (Next.js, React, Vue, etc.)
 * Responsible for setting up the base framework structure
 */

import { SimpleAgent } from '../base/simple-agent.js';
import { Module, ProjectContext, AgentResult } from '../../types/agent.js';
import { PathHandler } from '../../core/services/path/path-handler.js';

export class FrameworkAgent extends SimpleAgent {
  constructor(pathHandler: PathHandler) {
    super('framework', pathHandler);
  }

  /**
   * Execute a framework module
   */
  async execute(module: Module, context: ProjectContext): Promise<AgentResult> {
    console.log(`🏗️ Framework Agent executing: ${module.id}`);
    
    // Validate module
    const validation = this.validateModule(module);
    if (!validation.valid) {
      return {
        success: false,
        files: [],
        errors: validation.errors,
        warnings: []
      };
    }
    
    // Framework-specific validation
    const frameworkValidation = this.validateFrameworkModule(module);
    if (!frameworkValidation.valid) {
      return {
        success: false,
        files: [],
        errors: frameworkValidation.errors,
        warnings: []
      };
    }
    
    // Execute the adapter
    return await this.executeAdapter(module, context);
  }

  /**
   * Validate framework-specific parameters
   */
  private validateFrameworkModule(module: Module): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate framework ID
    const supportedFrameworks = ['nextjs', 'react', 'vue', 'svelte'];
    if (!supportedFrameworks.includes(module.id)) {
      errors.push(`Unsupported framework: ${module.id}. Supported: ${supportedFrameworks.join(', ')}`);
    }
    
    // Validate parameters based on framework
    if (module.id === 'nextjs') {
      this.validateNextJSParameters(module.parameters, errors);
    } else if (module.id === 'react') {
      this.validateReactParameters(module.parameters, errors);
    } else if (module.id === 'vue') {
      this.validateVueParameters(module.parameters, errors);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Next.js specific parameters
   */
  private validateNextJSParameters(parameters: Record<string, any>, errors: string[]): void {
    // Next.js specific validations
    if (parameters.typescript !== undefined && typeof parameters.typescript !== 'boolean') {
      errors.push('Next.js typescript parameter must be boolean');
    }
    
    if (parameters.tailwind !== undefined && typeof parameters.tailwind !== 'boolean') {
      errors.push('Next.js tailwind parameter must be boolean');
    }
    
    if (parameters.appRouter !== undefined && typeof parameters.appRouter !== 'boolean') {
      errors.push('Next.js appRouter parameter must be boolean');
    }
  }

  /**
   * Validate React specific parameters
   */
  private validateReactParameters(parameters: Record<string, any>, errors: string[]): void {
    // React specific validations
    if (parameters.typescript !== undefined && typeof parameters.typescript !== 'boolean') {
      errors.push('React typescript parameter must be boolean');
    }
    
    if (parameters.vite !== undefined && typeof parameters.vite !== 'boolean') {
      errors.push('React vite parameter must be boolean');
    }
  }

  /**
   * Validate Vue specific parameters
   */
  private validateVueParameters(parameters: Record<string, any>, errors: string[]): void {
    // Vue specific validations
    if (parameters.typescript !== undefined && typeof parameters.typescript !== 'boolean') {
      errors.push('Vue typescript parameter must be boolean');
    }
    
    if (parameters.compositionApi !== undefined && typeof parameters.compositionApi !== 'boolean') {
      errors.push('Vue compositionApi parameter must be boolean');
    }
  }
}
