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
import { TemplateService } from '../../core/templates/template-service.js';
export declare abstract class BasePlugin implements IPlugin {
    protected pathResolver: PathResolver;
    protected runner: CommandRunner;
    protected templateService: TemplateService;
    constructor();
    abstract getMetadata(): PluginMetadata;
    abstract install(context: PluginContext): Promise<PluginResult>;
    abstract getParameterSchema(): any;
    abstract generateUnifiedInterface(config: Record<string, any>): any;
    protected createErrorResult(message: string, errors?: any[], startTime?: number): PluginResult;
    protected createSuccessResult(artifacts?: any[], dependencies?: any[], scripts?: any[], configs?: any[], warnings?: string[], startTime?: number): PluginResult;
    protected handleError(error: any, context: string): ValidationError;
    protected generateFile(filePath: string, content: string): Promise<void>;
    protected generateFileFromTemplate(templatePath: string, outputPath: string, variables?: Record<string, any>): Promise<void>;
    protected copyFile(sourcePath: string, targetPath: string): Promise<void>;
    protected ensureDirectory(dirPath: string): Promise<void>;
    protected fileExists(filePath: string): Promise<boolean>;
    protected installDependencies(dependencies: string[], devDependencies?: string[]): Promise<void>;
    protected addScripts(scripts: Record<string, string>): Promise<void>;
    protected validateRequiredConfig(config: Record<string, any>, required: string[]): ValidationResult;
    protected validateStringField(config: Record<string, any>, field: string, pattern?: RegExp, minLength?: number, maxLength?: number): ValidationResult;
    protected executeLifecycle(context: PluginContext): Promise<PluginResult>;
    protected validateInstallation(context: PluginContext): Promise<void>;
    protected getModuleName(): string;
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
