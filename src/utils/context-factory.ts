/**
 * Context Factory
 * 
 * Creates and validates AgentContext objects with proper defaults
 * and environment information.
 */

import * as path from 'path';
import * as os from 'os';
import { 
  AgentContext, 
  ExecutionOptions, 
  EnvironmentInfo
} from '../types/agent.js';
import { CommandRunner } from './command-runner.js';
import { AgentLogger as Logger } from './logger.js';

export class ContextFactory {
  /**
   * Creates a new AgentContext with proper defaults and validation
   */
  static createContext(
    projectName: string,
    options: Partial<ExecutionOptions> & { packageManager?: string } = {},
    config: Record<string, any> = {},
    dependencies: string[] = []
  ): AgentContext {
    const projectPath = path.resolve(process.cwd(), projectName);
    
    // Build execution options with defaults
    const executionOptions: ExecutionOptions = {
      skipGit: false,
      skipInstall: false,
      useDefaults: false,
      verbose: false,
      dryRun: false,
      force: false,
      timeout: 300000, // 5 minutes
      ...options
    };

    // Create logger
    const logger = new Logger(executionOptions.verbose);

    // Create command runner
    const runner = new CommandRunner((options.packageManager as any) || 'auto', {
      verbose: executionOptions.verbose
    });

    // Build environment info
    const environment: EnvironmentInfo = {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      cwd: process.cwd(),
      env: Object.fromEntries(
        Object.entries(process.env).filter(([_, value]) => value !== undefined)
      ) as Record<string, string>
    };

    // Create context
    const context: AgentContext = {
      projectName,
      projectPath,
      packageManager: runner.getPackageManager(),
      options: executionOptions,
      config,
      runner,
      logger,
      state: new Map(),
      dependencies,
      environment
    };

    return context;
  }

  /**
   * Creates a context for the architech monorepo workflow
   */
  static createArchitechContext(
    projectName: string,
    selectedModules: string[],
    options: Partial<ExecutionOptions> = {}
  ): AgentContext {
    const config = {
      selectedModules,
      isMonorepo: true,
      structure: 'turborepo'
    };

    return this.createContext(projectName, options, config, selectedModules);
  }

  /**
   * Creates a context for the traditional create workflow
   */
  static createTraditionalContext(
    projectName: string,
    template: string,
    modules: string[],
    options: Partial<ExecutionOptions> = {}
  ): AgentContext {
    const config = {
      template,
      modules,
      isMonorepo: false,
      structure: 'single-app'
    };

    return this.createContext(projectName, options, config, modules);
  }

  /**
   * Validates a context and returns validation errors
   */
  static validateContext(context: AgentContext): string[] {
    const errors: string[] = [];

    // Required fields
    if (!context.projectName) {
      errors.push('Project name is required');
    }

    if (!context.projectPath) {
      errors.push('Project path is required');
    }

    if (!context.packageManager) {
      errors.push('Package manager is required');
    }

    // Validate project name format
    if (context.projectName && !/^[a-zA-Z0-9-_]+$/.test(context.projectName)) {
      errors.push('Project name can only contain letters, numbers, hyphens, and underscores');
    }

    // Validate package manager
    const validPackageManagers = ['npm', 'yarn', 'pnpm', 'bun'];
    if (context.packageManager && !validPackageManagers.includes(context.packageManager)) {
      errors.push(`Invalid package manager: ${context.packageManager}`);
    }

    // Validate options
    if (context.options.timeout && context.options.timeout < 0) {
      errors.push('Timeout must be a positive number');
    }

    return errors;
  }

  /**
   * Creates a child context with updated configuration
   */
  static createChildContext(
    parentContext: AgentContext,
    updates: Partial<AgentContext>
  ): AgentContext {
    return {
      ...parentContext,
      ...updates,
      state: new Map(parentContext.state), // Clone state
      config: { ...parentContext.config, ...updates.config }
    };
  }

  /**
   * Updates context state immutably
   */
  static updateContextState(
    context: AgentContext,
    key: string,
    value: any
  ): AgentContext {
    const newState = new Map(context.state);
    newState.set(key, value);

    return {
      ...context,
      state: newState
    };
  }
} 