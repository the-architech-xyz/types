/**
 * Database Agent
 * 
 * Handles database modules (Drizzle, Prisma, etc.)
 * Responsible for setting up database connections and schemas
 */

import { SimpleAgent } from '../base/simple-agent.js';
import { Module, ProjectContext, AgentResult } from '../../types/agent.js';
import { PathHandler } from '../../core/services/path/path-handler.js';

export class DatabaseAgent extends SimpleAgent {
  constructor(pathHandler: PathHandler) {
    super('database', pathHandler);
  }

  /**
   * Execute a database module
   */
  async execute(module: Module, context: ProjectContext): Promise<AgentResult> {
    console.log(`🗄️ Database Agent executing: ${module.id}`);
    
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
    
    // Database-specific validation
    const databaseValidation = this.validateDatabaseModule(module);
    if (!databaseValidation.valid) {
      return {
        success: false,
        files: [],
        errors: databaseValidation.errors,
        warnings: []
      };
    }
    
    // Execute the adapter
    return await this.executeAdapter(module, context);
  }

  /**
   * Validate database-specific parameters
   */
  private validateDatabaseModule(module: Module): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate database ID
    const supportedDatabases = ['drizzle', 'prisma', 'typeorm', 'sequelize', 'simple-db'];
    if (!supportedDatabases.includes(module.id)) {
      errors.push(`Unsupported database: ${module.id}. Supported: ${supportedDatabases.join(', ')}`);
    }
    
    // Validate parameters based on database
    if (module.id === 'drizzle') {
      this.validateDrizzleParameters(module.parameters, errors);
    } else if (module.id === 'prisma') {
      this.validatePrismaParameters(module.parameters, errors);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate Drizzle specific parameters
   */
  private validateDrizzleParameters(parameters: Record<string, any>, errors: string[]): void {
    // Drizzle specific validations
    if (parameters.databaseType !== undefined) {
      const supportedTypes = ['postgresql', 'mysql', 'sqlite'];
      if (!supportedTypes.includes(parameters.databaseType)) {
        errors.push(`Unsupported database type: ${parameters.databaseType}. Supported: ${supportedTypes.join(', ')}`);
      }
    }
    
    if (parameters.includeMigrations !== undefined && typeof parameters.includeMigrations !== 'boolean') {
      errors.push('Drizzle includeMigrations parameter must be boolean');
    }
  }

  /**
   * Validate Prisma specific parameters
   */
  private validatePrismaParameters(parameters: Record<string, any>, errors: string[]): void {
    // Prisma specific validations
    if (parameters.provider !== undefined) {
      const supportedProviders = ['postgresql', 'mysql', 'sqlite', 'mongodb'];
      if (!supportedProviders.includes(parameters.provider)) {
        errors.push(`Unsupported Prisma provider: ${parameters.provider}. Supported: ${supportedProviders.join(', ')}`);
      }
    }
    
    if (parameters.generateClient !== undefined && typeof parameters.generateClient !== 'boolean') {
      errors.push('Prisma generateClient parameter must be boolean');
    }
  }
}
