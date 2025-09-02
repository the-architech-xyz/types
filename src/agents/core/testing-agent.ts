/**
 * Testing Agent
 * 
 * Handles testing modules (Vitest, Jest, etc.)
 * Responsible for setting up testing frameworks
 */

import { SimpleAgent } from '../base/simple-agent.js';
import { Module, ProjectContext, AgentResult } from '../../types/agent.js';
import { PathHandler } from '../../core/services/path/path-handler.js';

export class TestingAgent extends SimpleAgent {
  constructor(pathHandler: PathHandler) {
    super('testing', pathHandler);
  }

  /**
   * Execute a testing module
   */
  async execute(module: Module, context: ProjectContext): Promise<AgentResult> {
    console.log(`🧪 Testing Agent executing: ${module.id}`);
    
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
    
    // Testing-specific validation
    const testingValidation = this.validateTestingModule(module);
    if (!testingValidation.valid) {
      return {
        success: false,
        files: [],
        errors: testingValidation.errors,
        warnings: []
      };
    }
    
    // Execute the adapter
    return await this.executeAdapter(module, context);
  }

  /**
   * Validate testing-specific parameters
   */
  private validateTestingModule(module: Module): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate testing ID
    const supportedTesting = ['vitest', 'jest', 'cypress', 'playwright'];
    if (!supportedTesting.includes(module.id)) {
      errors.push(`Unsupported testing framework: ${module.id}. Supported: ${supportedTesting.join(', ')}`);
    }
    
    // Validate parameters based on testing framework
    if (module.id === 'vitest') {
      this.validateVitestParameters(module.parameters, errors);
    } else if (module.id === 'jest') {
      this.validateJestParameters(module.parameters, errors);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Vitest specific parameters
   */
  private validateVitestParameters(parameters: Record<string, any>, errors: string[]): void {
    // Vitest specific validations
    if (parameters.coverage !== undefined && typeof parameters.coverage !== 'boolean') {
      errors.push('Vitest coverage parameter must be boolean');
    }
    
    if (parameters.ui !== undefined && typeof parameters.ui !== 'boolean') {
      errors.push('Vitest ui parameter must be boolean');
    }
    
    if (parameters.environment !== undefined) {
      const supportedEnvironments = ['node', 'jsdom', 'happy-dom'];
      if (!supportedEnvironments.includes(parameters.environment)) {
        errors.push(`Unsupported environment: ${parameters.environment}. Supported: ${supportedEnvironments.join(', ')}`);
      }
    }
  }

  /**
   * Validate Jest specific parameters
   */
  private validateJestParameters(parameters: Record<string, any>, errors: string[]): void {
    // Jest specific validations
    if (parameters.coverage !== undefined && typeof parameters.coverage !== 'boolean') {
      errors.push('Jest coverage parameter must be boolean');
    }
    
    if (parameters.watch !== undefined && typeof parameters.watch !== 'boolean') {
      errors.push('Jest watch parameter must be boolean');
    }
  }
}
