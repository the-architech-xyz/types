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
import { PathResolver } from './PathResolver.js';
import { CommandRunner } from '../../core/cli/command-runner.js';
import { templateService } from '../../core/templates/template-service.js';
import * as fsExtra from 'fs-extra';
export class BasePlugin {
    pathResolver;
    runner;
    templateService;
    constructor() {
        this.runner = new CommandRunner();
        this.templateService = templateService;
    }
    // ============================================================================
    // COMMON ERROR HANDLING
    // ============================================================================
    createErrorResult(message, errors = [], startTime = Date.now()) {
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
    createSuccessResult(artifacts = [], dependencies = [], scripts = [], configs = [], warnings = [], startTime = Date.now()) {
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
    handleError(error, context) {
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
    async generateFile(filePath, content) {
        try {
            // Initialize path resolver if not already done
            if (!this.pathResolver) {
                throw new Error('PathResolver not initialized. Call initializePathResolver() first.');
            }
            // Ensure directory exists
            await this.pathResolver.ensureDirectory(filePath);
            // Write file
            await fsExtra.writeFile(filePath, content, 'utf8');
        }
        catch (error) {
            throw new Error(`Failed to generate file ${filePath}: ${error}`);
        }
    }
    async generateFileFromTemplate(templatePath, outputPath, variables = {}) {
        try {
            const content = await this.templateService.render(templatePath, variables);
            await this.generateFile(outputPath, content);
        }
        catch (error) {
            throw new Error(`Failed to generate file from template ${templatePath}: ${error}`);
        }
    }
    async copyFile(sourcePath, targetPath) {
        try {
            await this.pathResolver.ensureDirectory(targetPath);
            await fsExtra.copy(sourcePath, targetPath);
        }
        catch (error) {
            throw new Error(`Failed to copy file from ${sourcePath} to ${targetPath}: ${error}`);
        }
    }
    async ensureDirectory(dirPath) {
        try {
            await fsExtra.ensureDir(dirPath);
        }
        catch (error) {
            throw new Error(`Failed to create directory ${dirPath}: ${error}`);
        }
    }
    async fileExists(filePath) {
        try {
            return await fsExtra.pathExists(filePath);
        }
        catch (error) {
            return false;
        }
    }
    // ============================================================================
    // COMMON DEPENDENCY MANAGEMENT
    // ============================================================================
    async installDependencies(dependencies, devDependencies = []) {
        try {
            if (dependencies.length > 0) {
                await this.runner.install(dependencies, false, this.pathResolver['context'].projectPath);
            }
            if (devDependencies.length > 0) {
                await this.runner.install(devDependencies, true, this.pathResolver['context'].projectPath);
            }
        }
        catch (error) {
            throw new Error(`Failed to install dependencies: ${error}`);
        }
    }
    async addScripts(scripts) {
        try {
            const packageJsonPath = this.pathResolver.getPackageJsonPath();
            const packageJson = await fsExtra.readJson(packageJsonPath);
            packageJson.scripts = {
                ...packageJson.scripts,
                ...scripts
            };
            await fsExtra.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        }
        catch (error) {
            throw new Error(`Failed to add scripts: ${error}`);
        }
    }
    // ============================================================================
    // COMMON VALIDATION
    // ============================================================================
    validateRequiredConfig(config, required) {
        const errors = [];
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
    validateStringField(config, field, pattern, minLength, maxLength) {
        const errors = [];
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
    async executeLifecycle(context) {
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
        }
        catch (error) {
            return this.createErrorResult('Plugin lifecycle failed', [error], startTime);
        }
    }
    async validateInstallation(context) {
        // Override in subclasses if needed
        // Default implementation does nothing
    }
    // ============================================================================
    // COMMON UTILITIES
    // ============================================================================
    getModuleName() {
        if (!this.pathResolver) {
            throw new Error('PathResolver not initialized');
        }
        // Extract module name from plugin ID
        const pluginId = this.pathResolver['context'].pluginId;
        if (pluginId.includes('drizzle') || pluginId.includes('prisma'))
            return 'db';
        if (pluginId.includes('auth') || pluginId.includes('nextauth'))
            return 'auth';
        if (pluginId.includes('ui') || pluginId.includes('shadcn'))
            return 'ui';
        if (pluginId.includes('deploy') || pluginId.includes('vercel'))
            return 'deployment';
        if (pluginId.includes('test') || pluginId.includes('vitest'))
            return 'testing';
        if (pluginId.includes('email') || pluginId.includes('resend'))
            return 'email';
        if (pluginId.includes('monitor') || pluginId.includes('sentry'))
            return 'monitoring';
        if (pluginId.includes('payment') || pluginId.includes('stripe'))
            return 'payment';
        if (pluginId.includes('blockchain') || pluginId.includes('ethereum'))
            return 'blockchain';
        return 'custom';
    }
    async validate(context) {
        // Default validation - override in subclasses if needed
        return {
            valid: true,
            errors: [],
            warnings: []
        };
    }
    async uninstall(context) {
        // Default uninstall - override in subclasses if needed
        return this.createSuccessResult();
    }
    async update(context) {
        // Default update - override in subclasses if needed
        return this.createSuccessResult();
    }
    getCompatibility() {
        // Default compatibility - override in subclasses if needed
        return {
            frameworks: [],
            platforms: [],
            nodeVersions: [],
            packageManagers: [],
            conflicts: []
        };
    }
    getDependencies() {
        // Default dependencies - override in subclasses if needed
        return [];
    }
    getConflicts() {
        // Default conflicts - override in subclasses if needed
        return [];
    }
    getRequirements() {
        // Default requirements - override in subclasses if needed
        return [];
    }
    getDefaultConfig() {
        // Default config - override in subclasses if needed
        return {};
    }
    getConfigSchema() {
        // Default schema - override in subclasses if needed
        return {
            type: 'object',
            properties: {},
            required: []
        };
    }
}
//# sourceMappingURL=BasePlugin.js.map