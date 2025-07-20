/**
 * Project Structure Manager
 *
 * Abstracts project structure handling to make the CLI framework-agnostic
 * and structure-agnostic. Supports both single-app and monorepo structures.
 */
import { Logger } from '../../types/agent.js';
import { TemplateService } from '../templates/template-service.js';
export type ProjectStructure = 'single-app' | 'monorepo';
export interface StructureConfig {
    type: ProjectStructure;
    framework: string;
    packages?: string[];
    apps?: string[];
    rootConfig?: boolean;
    sharedConfig?: boolean;
}
export interface DirectoryStructure {
    root: string[];
    apps: Record<string, string[]>;
    packages: Record<string, string[]>;
    shared: string[];
}
export interface FileStructure {
    root: string[];
    apps: Record<string, string[]>;
    packages: Record<string, string[]>;
    shared: string[];
}
export declare class ProjectStructureManager {
    private logger?;
    private templateService;
    constructor(templateService: TemplateService, logger?: Logger);
    /**
     * Create project structure based on configuration
     */
    createStructure(projectPath: string, config: StructureConfig, templateData: Record<string, any>): Promise<void>;
    /**
     * Get directory structure based on configuration
     */
    private getDirectoryStructure;
    /**
     * Get file structure based on configuration
     */
    private getFileStructure;
    /**
     * Create directories recursively
     */
    private createDirectories;
    /**
     * Create files using templates
     */
    private createFiles;
    /**
     * Create root-level files
     */
    private createRootFiles;
    /**
     * Create app-specific files
     */
    private createAppFiles;
    /**
     * Create framework-specific app files
     */
    private createFrameworkAppFiles;
    /**
     * Create framework-specific app files for single-app structure
     */
    private createSingleAppFrameworkFiles;
    /**
     * Create package-specific files
     */
    private createPackageFiles;
    /**
     * Create shared files
     */
    private createSharedFiles;
    /**
     * Get package-specific dependencies
     */
    private getPackageDependencies;
    /**
     * Validate project structure
     */
    validateStructure(projectPath: string, config: StructureConfig): Promise<boolean>;
}
