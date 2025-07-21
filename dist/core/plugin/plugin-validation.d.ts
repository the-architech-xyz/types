/**
 * Plugin Validation Utilities
 *
 * Provides standardized validation logic for plugins to ensure
 * consistent behavior and better error handling.
 */
import { ValidationResult, ValidationError } from '../../types/agent.js';
import { PluginContext } from '../../types/plugin.js';
export declare class PluginValidationUtils {
    /**
     * Standard validation for plugin installation context
     */
    static validateInstallationContext(context: PluginContext): Promise<ValidationResult>;
    /**
     * Validate plugin configuration object
     */
    static validatePluginConfig(config: Record<string, any>): {
        errors: ValidationError[];
        warnings: string[];
    };
    /**
     * Validate environment variables
     */
    static validateEnvironmentVariables(projectPath: string, requiredVars: string[]): Promise<ValidationResult>;
    /**
     * Validate dependencies in package.json
     */
    static validateDependencies(projectPath: string, requiredDeps: string[]): Promise<ValidationResult>;
    /**
     * Validate Node.js version compatibility
     */
    static validateNodeVersion(minVersion: string): ValidationResult;
    /**
     * Validate file existence (for post-installation validation)
     */
    static validateGeneratedFiles(projectPath: string, requiredFiles: string[]): Promise<ValidationResult>;
    /**
     * Helper method to validate URLs
     */
    private static isValidUrl;
    /**
     * Create a standardized error result
     */
    static createErrorResult(message: string, field?: string, code?: string): ValidationResult;
    /**
     * Create a standardized success result with warnings
     */
    static createSuccessResult(warnings?: string[]): ValidationResult;
}
