/**
 * Plugin Validation Utilities
 * 
 * Provides standardized validation logic for plugins to ensure
 * consistent behavior and better error handling.
 */

import fsExtra from 'fs-extra';
import path from 'path';
import { ValidationResult, ValidationError } from '../../types/agent.js';
import { PluginContext } from '../../types/plugin.js';

export class PluginValidationUtils {
  
  /**
   * Standard validation for plugin installation context
   */
  static async validateInstallationContext(context: PluginContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      // Check if project directory exists
      if (!await fsExtra.pathExists(context.projectPath)) {
        errors.push({
          field: 'projectPath',
          message: `Project directory does not exist: ${context.projectPath}`,
          code: 'PROJECT_DIRECTORY_NOT_FOUND',
          severity: 'error'
        });
      }

      // Check if project directory is writable
      if (await fsExtra.pathExists(context.projectPath)) {
        try {
          const testFile = path.join(context.projectPath, '.write-test');
          await fsExtra.writeFile(testFile, 'test');
          await fsExtra.remove(testFile);
        } catch {
          errors.push({
            field: 'projectPath',
            message: `Project directory is not writable: ${context.projectPath}`,
            code: 'PROJECT_DIRECTORY_NOT_WRITABLE',
            severity: 'error'
          });
        }
      }

      // Check if package.json exists (for most plugins)
      const packageJsonPath = path.join(context.projectPath, 'package.json');
      if (!await fsExtra.pathExists(packageJsonPath)) {
        warnings.push('package.json not found - will be created during installation');
      }

      // Validate plugin configuration
      if (context.pluginConfig && typeof context.pluginConfig === 'object') {
        const configValidation = this.validatePluginConfig(context.pluginConfig);
        errors.push(...configValidation.errors);
        warnings.push(...configValidation.warnings);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: 'validation',
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'VALIDATION_ERROR',
          severity: 'error'
        }],
        warnings: []
      };
    }
  }

  /**
   * Validate plugin configuration object
   */
  static validatePluginConfig(config: Record<string, any>): { errors: ValidationError[]; warnings: string[] } {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Check for required fields
    if (config.required) {
      for (const field of config.required) {
        if (config[field] === undefined || config[field] === null) {
          errors.push({
            field: `config.${field}`,
            message: `Required configuration field "${field}" is missing`,
            code: 'MISSING_REQUIRED_CONFIG',
            severity: 'error'
          });
        }
      }
    }

    // Validate string fields
    if (config.stringFields) {
      for (const field of config.stringFields) {
        if (config[field] !== undefined && typeof config[field] !== 'string') {
          errors.push({
            field: `config.${field}`,
            message: `Configuration field "${field}" must be a string`,
            code: 'INVALID_CONFIG_TYPE',
            severity: 'error'
          });
        }
      }
    }

    // Validate boolean fields
    if (config.booleanFields) {
      for (const field of config.booleanFields) {
        if (config[field] !== undefined && typeof config[field] !== 'boolean') {
          errors.push({
            field: `config.${field}`,
            message: `Configuration field "${field}" must be a boolean`,
            code: 'INVALID_CONFIG_TYPE',
            severity: 'error'
          });
        }
      }
    }

    // Validate URL fields
    if (config.urlFields) {
      for (const field of config.urlFields) {
        if (config[field] && !this.isValidUrl(config[field])) {
          errors.push({
            field: `config.${field}`,
            message: `Configuration field "${field}" must be a valid URL`,
            code: 'INVALID_URL',
            severity: 'error'
          });
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate environment variables
   */
  static async validateEnvironmentVariables(
    projectPath: string, 
    requiredVars: string[]
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      const envFiles = ['.env', '.env.local', '.env.example'];
      let envContent = '';

      // Try to read environment files
      for (const envFile of envFiles) {
        const envPath = path.join(projectPath, envFile);
        if (await fsExtra.pathExists(envPath)) {
          envContent = await fsExtra.readFile(envPath, 'utf-8');
          break;
        }
      }

      // Check for required environment variables
      for (const varName of requiredVars) {
        if (!envContent.includes(varName)) {
          warnings.push(`Environment variable ${varName} not found in environment files`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: 'environment',
          message: `Failed to validate environment variables: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'ENV_VALIDATION_ERROR',
          severity: 'error'
        }],
        warnings: []
      };
    }
  }

  /**
   * Validate dependencies in package.json
   */
  static async validateDependencies(
    projectPath: string, 
    requiredDeps: string[]
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      if (!await fsExtra.pathExists(packageJsonPath)) {
        warnings.push('package.json not found - dependencies will be installed during plugin execution');
        return { valid: true, errors, warnings };
      }

      const packageJson = await fsExtra.readJson(packageJsonPath);
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      for (const dep of requiredDeps) {
        if (!allDeps[dep]) {
          warnings.push(`Required dependency ${dep} not found in package.json - will be installed`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: 'dependencies',
          message: `Failed to validate dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'DEPENDENCY_VALIDATION_ERROR',
          severity: 'error'
        }],
        warnings: []
      };
    }
  }

  /**
   * Validate Node.js version compatibility
   */
  static validateNodeVersion(minVersion: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      const currentVersion = process.version;
      const versionParts = currentVersion.slice(1).split('.');
      const currentMajor = parseInt(versionParts[0] || '0');
      const requiredMajor = parseInt(minVersion.split('.')[0] || '0');

      if (currentMajor < requiredMajor) {
        errors.push({
          field: 'nodeVersion',
          message: `Node.js ${minVersion} or higher is required. Current version: ${currentVersion}`,
          code: 'NODE_VERSION_TOO_OLD',
          severity: 'error'
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: 'nodeVersion',
          message: `Failed to validate Node.js version: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'NODE_VERSION_VALIDATION_ERROR',
          severity: 'error'
        }],
        warnings: []
      };
    }
  }

  /**
   * Validate file existence (for post-installation validation)
   */
  static async validateGeneratedFiles(
    projectPath: string, 
    requiredFiles: string[]
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      for (const file of requiredFiles) {
        const filePath = path.join(projectPath, file);
        if (!await fsExtra.pathExists(filePath)) {
          errors.push({
            field: 'generatedFiles',
            message: `Required file not found: ${file}`,
            code: 'MISSING_GENERATED_FILE',
            severity: 'error'
          });
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: 'generatedFiles',
          message: `Failed to validate generated files: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'FILE_VALIDATION_ERROR',
          severity: 'error'
        }],
        warnings: []
      };
    }
  }

  /**
   * Helper method to validate URLs
   */
  private static isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a standardized error result
   */
  static createErrorResult(
    message: string, 
    field: string = 'validation', 
    code: string = 'VALIDATION_ERROR'
  ): ValidationResult {
    return {
      valid: false,
      errors: [{
        field,
        message,
        code,
        severity: 'error'
      }],
      warnings: []
    };
  }

  /**
   * Create a standardized success result with warnings
   */
  static createSuccessResult(warnings: string[] = []): ValidationResult {
    return {
      valid: true,
      errors: [],
      warnings
    };
  }
} 