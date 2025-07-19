/**
 * Create Command - Main project generation command
 *
 * Updated to use the new framework-agnostic and structure-agnostic approach.
 */
import { ProjectStructure } from '../utils/project-structure-manager.js';
export interface CreateOptions {
    template?: string;
    packageManager?: string;
    noGit?: boolean;
    noInstall?: boolean;
    yes?: boolean;
    structure?: 'single-app' | 'monorepo';
}
export interface ProjectConfig {
    projectName: string;
    template: string;
    packageManager: string;
    skipGit: boolean;
    skipInstall: boolean;
    useDefaults: boolean;
    structure: ProjectStructure;
    modules?: string[];
    userInput?: string;
}
export declare function createCommand(projectName?: string, options?: CreateOptions): Promise<void>;
