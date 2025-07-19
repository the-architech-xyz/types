/**
 * Configuration Manager
 *
 * Centralizes all project configuration handling, making the CLI
 * framework-agnostic and structure-agnostic.
 */
import { Logger } from '../types/agent.js';
import { ProjectStructure, StructureConfig } from './project-structure-manager.js';
export interface ProjectConfiguration {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
    structure: ProjectStructure;
    framework: string;
    packageManager: string;
    workspaces?: string[];
    features: string[];
    modules: string[];
    frameworkConfig: Record<string, any>;
    scripts: Record<string, string>;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    typescript: boolean;
    eslint: boolean;
    prettier: boolean;
    tailwind: boolean;
    deployment: {
        platform?: string;
        useDocker: boolean;
        useCI: boolean;
    };
    metadata: Record<string, any>;
}
export interface ConfigurationOptions {
    skipGit: boolean;
    skipInstall: boolean;
    useDefaults: boolean;
    verbose: boolean;
    dryRun?: boolean;
    force?: boolean;
}
export declare class ConfigurationManager {
    private logger?;
    constructor(logger?: Logger);
    /**
     * Create project configuration from user input
     */
    createConfiguration(projectName: string, framework: string, structure: ProjectStructure, options: ConfigurationOptions, userInput?: string): ProjectConfiguration;
    /**
     * Get structure configuration for project structure manager
     */
    getStructureConfig(config: ProjectConfiguration): StructureConfig;
    /**
     * Get template data for rendering
     */
    getTemplateData(config: ProjectConfiguration): Record<string, any>;
    /**
     * Validate configuration
     */
    validateConfiguration(config: ProjectConfiguration): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Save configuration to file
     */
    saveConfiguration(projectPath: string, config: ProjectConfiguration): Promise<void>;
    /**
     * Load configuration from file
     */
    loadConfiguration(projectPath: string): Promise<ProjectConfiguration | null>;
    /**
     * Get default features for framework
     */
    private getDefaultFeatures;
    /**
     * Get default modules for structure
     */
    private getDefaultModules;
    /**
     * Get framework-specific configuration
     */
    private getFrameworkConfig;
    /**
     * Get default scripts for structure
     */
    private getDefaultScripts;
    /**
     * Get default dependencies for framework
     */
    private getDefaultDependencies;
    /**
     * Get default dev dependencies for framework
     */
    private getDefaultDevDependencies;
    /**
     * Validate framework
     */
    private isValidFramework;
    /**
     * Validate structure
     */
    private isValidStructure;
    /**
     * Validate package manager
     */
    private isValidPackageManager;
}
