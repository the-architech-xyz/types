/**
 * Structure Service - Centralized Project Structure Management
 *
 * Single source of truth for all project structure decisions.
 * Provides clean, consistent APIs for agents and plugins to get paths and structure info.
 */
import { Logger } from '../../types/agents.js';
export type ProjectStructure = 'single-app' | 'monorepo';
export type UserPreference = 'quick-prototype' | 'scalable-monorepo';
export interface StructureInfo {
    type: ProjectStructure;
    userPreference: UserPreference;
    isMonorepo: boolean;
    isSingleApp: boolean;
    modules: string[];
    template: string;
}
export interface PathInfo {
    root: string;
    src: string;
    app: string;
    components: string;
    lib: string;
    types: string;
    public: string;
    packages: Record<string, string>;
    apps: Record<string, string>;
    config: string;
}
export declare class StructureService {
    private logger?;
    constructor(logger?: Logger);
    /**
     * Detect project structure from existing project
     */
    detectStructure(projectPath: string): Promise<StructureInfo>;
    /**
     * Create structure info from user preference
     */
    createStructureInfo(userPreference: UserPreference, template?: string): StructureInfo;
    /**
     * Validate structure info
     */
    validateStructureInfo(info: StructureInfo): boolean;
    /**
     * Get all paths for a project based on structure
     */
    getPaths(projectPath: string, structure: StructureInfo): PathInfo;
    /**
     * Get path for a specific module/package
     */
    getModulePath(projectPath: string, structure: StructureInfo, moduleName: string): string;
    /**
     * Get path for a specific app
     */
    getAppPath(projectPath: string, structure: StructureInfo, appName?: string): string;
    /**
     * Get unified interface path for a module
     */
    getUnifiedInterfacePath(projectPath: string, structure: StructureInfo, moduleName: string): string;
    /**
     * Transform single app to monorepo structure
     */
    transformToMonorepo(projectPath: string): Promise<void>;
    /**
     * Transform monorepo to single app structure
     */
    transformToSingleApp(projectPath: string): Promise<void>;
    /**
     * Check if a path exists in the project
     */
    pathExists(projectPath: string, structure: StructureInfo, relativePath: string): Promise<boolean>;
    /**
     * Get relative path from project root
     */
    getRelativePath(projectPath: string, fullPath: string): string;
    /**
     * Ensure directory exists for a module
     */
    ensureModuleDirectory(projectPath: string, structure: StructureInfo, moduleName: string): Promise<string>;
    /**
     * Get structure description for display
     */
    getStructureDescription(structure: StructureInfo): string;
}
export declare const structureService: StructureService;
