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
    // PLUGIN INTERFACE IMPLEMENTATIONS
    // ============================================================================
    /**
     * Validate configuration based on parameter schema
     */
    validateConfiguration(config) {
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
    getDynamicQuestions(context) {
        return [];
    }
    // ============================================================================
    // PATH RESOLVER INITIALIZATION
    // ============================================================================
    /**
     * Initialize the path resolver with the given context
     * This must be called before any file operations
     */
    initializePathResolver(context) {
        this.pathResolver = new PathResolver(context);
    }
    /**
     * Ensure path resolver is initialized
     */
    ensurePathResolverInitialized() {
        if (!this.pathResolver) {
            throw new Error('PathResolver not initialized. Call initializePathResolver() first.');
        }
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
    // ============================================================================
    // COMMON FILE OPERATIONS
    // ============================================================================
    async generateFile(filePath, content) {
        try {
            this.ensurePathResolverInitialized();
            await this.pathResolver.ensureDirectory(filePath);
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
            this.ensurePathResolverInitialized();
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
            this.ensurePathResolverInitialized();
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
            this.ensurePathResolverInitialized();
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
    // IPlugin INTERFACE IMPLEMENTATIONS
    // ============================================================================
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