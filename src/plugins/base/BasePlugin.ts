/**
 * Base Plugin Class
 * 
 * Provides common functionality for all plugins:
 * - Error handling
 * - File operations
 * - Lifecycle management
 * - Path resolution
 * - Logging
 */

import { IPlugin, PluginContext, PluginResult, ValidationResult, PluginMetadata } from '../../types/plugin.js';
import { ValidationError } from '../../types/agent.js';
import { PathResolver } from './PathResolver.js';
import { CommandRunner } from '../../core/cli/command-runner.js';
import { TemplateService, templateService } from '../../core/templates/template-service.js';
import * as fsExtra from 'fs-extra';
import * as path from 'path';

export abstract class BasePlugin implements IPlugin {
  protected pathResolver!: PathResolver;
  protected runner: CommandRunner;
  protected templateService: TemplateService;

  constructor() {
    this.runner = new CommandRunner();
    this.templateService = templateService;
  }

  // ============================================================================
  // ABSTRACT METHODS - TO BE IMPLEMENTED BY SUBCLASSES
  // ============================================================================

  abstract getMetadata(): PluginMetadata;
  abstract install(context: PluginContext): Promise<PluginResult>;
  abstract getParameterSchema(): any;
  abstract generateUnifiedInterface(config: Record<string, any>): any;

  // ============================================================================
  // COMMON ERROR HANDLING
  // ============================================================================

  protected createErrorResult(
    message: string, 
    errors: any[] = [], 
    startTime: number = Date.now()
  ): PluginResult {
    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors: errors.map(error => ({
        code: 'PLUGIN_ERROR',
        message: error.message || error,
        details: error,
        severity: 'error'
      })),
      warnings: [],
      duration: Date.now() - startTime
    };
  }

  protected createSuccessResult(
    artifacts: any[] = [],
    dependencies: any[] = [],
    scripts: any[] = [],
    configs: any[] = [],
    warnings: string[] = [],
    startTime: number = Date.now()
  ): PluginResult {
    return {
      success: true,
      artifacts,
      dependencies,
      scripts,
      configs,
      errors: [],
      warnings,
      duration: Date.now() - startTime
    };
  }

  protected handleError(error: any, context: string): ValidationError {
    return {
      field: context,
      message: error.message || `Error in ${context}`,
      code: 'PLUGIN_ERROR',
      severity: 'error'
    };
  }

  // ============================================================================
  // COMMON FILE OPERATIONS
  // ============================================================================

  protected async generateFile(filePath: string, content: string): Promise<void> {
    try {
      // Initialize path resolver if not already done
      if (!this.pathResolver) {
        throw new Error('PathResolver not initialized. Call initializePathResolver() first.');
      }

      // Ensure directory exists
      await this.pathResolver.ensureDirectory(filePath);
      
      // Write file
      await fsExtra.writeFile(filePath, content, 'utf8');
    } catch (error) {
      throw new Error(`Failed to generate file ${filePath}: ${error}`);
    }
  }

  protected async generateFileFromTemplate(
    templatePath: string, 
    outputPath: string, 
    variables: Record<string, any> = {}
  ): Promise<void> {
    try {
      const content = await this.templateService.render(templatePath, variables);
      await this.generateFile(outputPath, content);
    } catch (error) {
      throw new Error(`Failed to generate file from template ${templatePath}: ${error}`);
    }
  }

  protected async copyFile(sourcePath: string, targetPath: string): Promise<void> {
    try {
      await this.pathResolver.ensureDirectory(targetPath);
      await fsExtra.copy(sourcePath, targetPath);
    } catch (error) {
      throw new Error(`Failed to copy file from ${sourcePath} to ${targetPath}: ${error}`);
    }
  }

  protected async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fsExtra.ensureDir(dirPath);
    } catch (error) {
      throw new Error(`Failed to create directory ${dirPath}: ${error}`);
    }
  }

  protected async fileExists(filePath: string): Promise<boolean> {
    try {
      return await fsExtra.pathExists(filePath);
    } catch (error) {
      return false;
    }
  }

  // ============================================================================
  // COMMON DEPENDENCY MANAGEMENT
  // ============================================================================

  protected async installDependencies(dependencies: string[], devDependencies: string[] = []): Promise<void> {
    try {
      if (dependencies.length > 0) {
        await this.runner.install(dependencies, false, this.pathResolver['context'].projectPath);
      }
      
      if (devDependencies.length > 0) {
        await this.runner.install(devDependencies, true, this.pathResolver['context'].projectPath);
      }
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error}`);
    }
  }

  protected async addScripts(scripts: Record<string, string>): Promise<void> {
    try {
      const packageJsonPath = this.pathResolver.getPackageJsonPath();
      const packageJson = await fsExtra.readJson(packageJsonPath);
      
      packageJson.scripts = {
        ...packageJson.scripts,
        ...scripts
      };
      
      await fsExtra.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to add scripts: ${error}`);
    }
  }

  // ============================================================================
  // COMMON VALIDATION
  // ============================================================================

  protected validateRequiredConfig(
    config: Record<string, any>, 
    required: string[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    
    for (const field of required) {
      if (!config[field]) {
        errors.push({
          field,
          message: `${field} is required`,
          code: 'MISSING_FIELD',
          severity: 'error'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  protected validateStringField(
    config: Record<string, any>,
    field: string,
    pattern?: RegExp,
    minLength?: number,
    maxLength?: number
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const value = config[field];

    if (!value) {
      errors.push({
        field,
        message: `${field} is required`,
        code: 'MISSING_FIELD',
        severity: 'error'
      });
      return { valid: false, errors, warnings: [] };
    }

    if (typeof value !== 'string') {
      errors.push({
        field,
        message: `${field} must be a string`,
        code: 'INVALID_TYPE',
        severity: 'error'
      });
      return { valid: false, errors, warnings: [] };
    }

    if (minLength && value.length < minLength) {
      errors.push({
        field,
        message: `${field} must be at least ${minLength} characters`,
        code: 'MIN_LENGTH',
        severity: 'error'
      });
    }

    if (maxLength && value.length > maxLength) {
      errors.push({
        field,
        message: `${field} must be at most ${maxLength} characters`,
        code: 'MAX_LENGTH',
        severity: 'error'
      });
    }

    if (pattern && !pattern.test(value)) {
      errors.push({
        field,
        message: `${field} format is invalid`,
        code: 'INVALID_FORMAT',
        severity: 'error'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  // ============================================================================
  // COMMON LIFECYCLE MANAGEMENT
  // ============================================================================

  protected async executeLifecycle(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      // Initialize path resolver
      this.pathResolver = new PathResolver(context);
      
      // Validate context
      const validation = await this.validate(context);
      if (!validation.valid) {
        return this.createErrorResult('Plugin validation failed', validation.errors, startTime);
      }

      // Execute plugin-specific installation
      const result = await this.install(context);
      
      // Validate installation
      if (result.success) {
        await this.validateInstallation(context);
      }

      return result;
    } catch (error) {
      return this.createErrorResult('Plugin lifecycle failed', [error], startTime);
    }
  }

  protected async validateInstallation(context: PluginContext): Promise<void> {
    // Override in subclasses if needed
    // Default implementation does nothing
  }

  // ============================================================================
  // COMMON UTILITIES
  // ============================================================================

  protected getModuleName(): string {
    if (!this.pathResolver) {
      throw new Error('PathResolver not initialized');
    }
    
    // Extract module name from plugin ID
    const pluginId = this.pathResolver['context'].pluginId;
    
    if (pluginId.includes('drizzle') || pluginId.includes('prisma')) return 'db';
    if (pluginId.includes('auth') || pluginId.includes('nextauth')) return 'auth';
    if (pluginId.includes('ui') || pluginId.includes('shadcn')) return 'ui';
    if (pluginId.includes('deploy') || pluginId.includes('vercel')) return 'deployment';
    if (pluginId.includes('test') || pluginId.includes('vitest')) return 'testing';
    if (pluginId.includes('email') || pluginId.includes('resend')) return 'email';
    if (pluginId.includes('monitor') || pluginId.includes('sentry')) return 'monitoring';
    if (pluginId.includes('payment') || pluginId.includes('stripe')) return 'payment';
    if (pluginId.includes('blockchain') || pluginId.includes('ethereum')) return 'blockchain';
    
    return 'custom';
  }

  public async validate(context: PluginContext): Promise<ValidationResult> {
    // Default validation - override in subclasses if needed
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    // Default uninstall - override in subclasses if needed
    return this.createSuccessResult();
  }

  async update(context: PluginContext): Promise<PluginResult> {
    // Default update - override in subclasses if needed
    return this.createSuccessResult();
  }

  getCompatibility(): any {
    // Default compatibility - override in subclasses if needed
    return {
      frameworks: [],
      platforms: [],
      nodeVersions: [],
      packageManagers: [],
      conflicts: []
    };
  }

  getDependencies(): string[] {
    // Default dependencies - override in subclasses if needed
    return [];
  }

  getConflicts(): string[] {
    // Default conflicts - override in subclasses if needed
    return [];
  }

  getRequirements(): any[] {
    // Default requirements - override in subclasses if needed
    return [];
  }

  getDefaultConfig(): Record<string, any> {
    // Default config - override in subclasses if needed
    return {};
  }

  getConfigSchema(): any {
    // Default schema - override in subclasses if needed
    return {
      type: 'object',
      properties: {},
      required: []
    };
  }
} 