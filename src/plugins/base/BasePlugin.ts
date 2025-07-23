/**
 * Base Plugin Class - Single Base Class for All Plugins
 * 
 * Provides common functionality for all plugins:
 * - Error handling
 * - File operations
 * - Lifecycle management
 * - Path resolution
 * - Logging
 * - Parameter schema management
 * - Configuration validation
 */

import { IPlugin, PluginContext, PluginResult, ValidationResult, PluginMetadata, ParameterSchema } from '../../types/plugins.js';
import { ValidationError } from '../../types/agents.js';
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
  abstract getParameterSchema(): ParameterSchema;
  abstract generateUnifiedInterface(config: Record<string, any>): any;

  // ============================================================================
  // PLUGIN INTERFACE IMPLEMENTATIONS
  // ============================================================================

  /**
   * Validate configuration based on parameter schema
   */
  validateConfiguration(config: Record<string, any>): ValidationResult {
    const schema = this.getParameterSchema();
    const required = schema.parameters
      .filter(param => param.required)
      .map(param => param.id);
    
    return this.validateRequiredConfig(config, required);
  }

  /**
   * Get dynamic questions - plugins should not generate questions
   * This method returns an empty array by default since agents handle questions
   */
  getDynamicQuestions(context: any): any[] {
    return [];
  }

  // ============================================================================
  // PATH RESOLVER INITIALIZATION
  // ============================================================================

  /**
   * Initialize the path resolver with the given context
   * This must be called before any file operations
   */
  protected initializePathResolver(context: PluginContext): void {
    this.pathResolver = new PathResolver(context);
  }

  /**
   * Ensure path resolver is initialized
   */
  protected ensurePathResolverInitialized(): void {
    if (!this.pathResolver) {
      throw new Error('PathResolver not initialized. Call initializePathResolver() first.');
    }
  }

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

  // ============================================================================
  // COMMON FILE OPERATIONS
  // ============================================================================

  protected async generateFile(filePath: string, content: string): Promise<void> {
    try {
      this.ensurePathResolverInitialized();
      await this.pathResolver.ensureDirectory(filePath);
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
      this.ensurePathResolverInitialized();
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
      this.ensurePathResolverInitialized();
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
      this.ensurePathResolverInitialized();
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
  // IPlugin INTERFACE IMPLEMENTATIONS
  // ============================================================================

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