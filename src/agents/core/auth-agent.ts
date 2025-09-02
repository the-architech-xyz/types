/**
 * Auth Agent
 * 
 * Handles authentication modules (Better Auth, NextAuth, etc.)
 * Responsible for setting up authentication systems
 */

import { SimpleAgent } from '../base/simple-agent.js';
import { Module, ProjectContext, AgentResult } from '../../types/agent.js';
import { PathHandler } from '../../core/services/path/path-handler.js';

export class AuthAgent extends SimpleAgent {
  constructor(pathHandler: PathHandler) {
    super('auth', pathHandler);
  }

  /**
   * Execute an auth module
   */
  async execute(module: Module, context: ProjectContext): Promise<AgentResult> {
    console.log(`🔐 Auth Agent executing: ${module.id}`);
    
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
    
    // Auth-specific validation
    const authValidation = this.validateAuthModule(module);
    if (!authValidation.valid) {
      return {
        success: false,
        files: [],
        errors: authValidation.errors,
        warnings: []
      };
    }
    
    // Execute the adapter
    return await this.executeAdapter(module, context);
  }

  /**
   * Validate auth-specific parameters
   */
  private validateAuthModule(module: Module): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate auth ID
    const supportedAuth = ['better-auth', 'nextauth', 'auth0', 'firebase-auth'];
    if (!supportedAuth.includes(module.id)) {
      errors.push(`Unsupported auth provider: ${module.id}. Supported: ${supportedAuth.join(', ')}`);
    }
    
    // Validate parameters based on auth provider
    if (module.id === 'better-auth') {
      this.validateBetterAuthParameters(module.parameters, errors);
    } else if (module.id === 'nextauth') {
      this.validateNextAuthParameters(module.parameters, errors);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Better Auth specific parameters
   */
  private validateBetterAuthParameters(parameters: Record<string, any>, errors: string[]): void {
    // Better Auth specific validations
    if (parameters.providers !== undefined) {
      if (!Array.isArray(parameters.providers)) {
        errors.push('Better Auth providers parameter must be an array');
      } else {
        const supportedProviders = ['github', 'google', 'discord', 'email'];
        const invalidProviders = parameters.providers.filter((p: string) => !supportedProviders.includes(p));
        if (invalidProviders.length > 0) {
          errors.push(`Unsupported providers: ${invalidProviders.join(', ')}. Supported: ${supportedProviders.join(', ')}`);
        }
      }
    }
    
    if (parameters.sessionStrategy !== undefined) {
      const supportedStrategies = ['jwt', 'database'];
      if (!supportedStrategies.includes(parameters.sessionStrategy)) {
        errors.push(`Unsupported session strategy: ${parameters.sessionStrategy}. Supported: ${supportedStrategies.join(', ')}`);
      }
    }
  }

  /**
   * Validate NextAuth specific parameters
   */
  private validateNextAuthParameters(parameters: Record<string, any>, errors: string[]): void {
    // NextAuth specific validations
    if (parameters.providers !== undefined) {
      if (!Array.isArray(parameters.providers)) {
        errors.push('NextAuth providers parameter must be an array');
      }
    }
    
    if (parameters.database !== undefined && typeof parameters.database !== 'boolean') {
      errors.push('NextAuth database parameter must be boolean');
    }
  }
}
