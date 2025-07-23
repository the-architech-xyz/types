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
import { TemplateService } from '../../core/templates/template-service.js';
export declare abstract class BasePlugin implements IPlugin {
    protected pathResolver: PathResolver;
    protected runner: CommandRunner;
    protected templateService: TemplateService;
    constructor();
    abstract getMetadata(): PluginMetadata;
    abstract install(context: PluginContext): Promise<PluginResult>;
    abstract getParameterSchema(): ParameterSchema;
    abstract generateUnifiedInterface(config: Record<string, any>): any;
    /**
     * Validate configuration based on parameter schema
     */
    validateConfiguration(config: Record<string, any>): ValidationResult;
    /**
     * Get dynamic questions - plugins should not generate questions
     * This method returns an empty array by default since agents handle questions
     */
    getDynamicQuestions(context: any): any[];
    /**
     * Initialize the path resolver with the given context
     * This must be called before any file operations
     */
    protected initializePathResolver(context: PluginContext): void;
    /**
     * Ensure path resolver is initialized
     */
    protected ensurePathResolverInitialized(): void;
    protected createErrorResult(message: string, errors?: any[], startTime?: number): PluginResult;
    protected createSuccessResult(artifacts?: any[], dependencies?: any[], scripts?: any[], configs?: any[], warnings?: string[], startTime?: number): PluginResult;
    protected handleError(error: any, context: string): ValidationError;
    protected validateRequiredConfig(config: Record<string, any>, required: string[]): ValidationResult;
    protected generateFile(filePath: string, content: string): Promise<void>;
    protected generateFileFromTemplate(templatePath: string, outputPath: string, variables?: Record<string, any>): Promise<void>;
    protected copyFile(sourcePath: string, targetPath: string): Promise<void>;
    protected ensureDirectory(dirPath: string): Promise<void>;
    protected fileExists(filePath: string): Promise<boolean>;
    protected installDependencies(dependencies: string[], devDependencies?: string[]): Promise<void>;
    protected addScripts(scripts: Record<string, string>): Promise<void>;
    validate(context: PluginContext): Promise<ValidationResult>;
    uninstall(context: PluginContext): Promise<PluginResult>;
    update(context: PluginContext): Promise<PluginResult>;
    getCompatibility(): any;
    getDependencies(): string[];
    getConflicts(): string[];
    getRequirements(): any[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): any;
}
