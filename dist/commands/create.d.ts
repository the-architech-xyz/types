/**
 * Create Command - The Heart of The Architech
 *
 * Orchestrates specialized AI agents to generate complete, production-ready
 * applications in minutes instead of weeks.
 */
export interface CreateOptions {
    template?: string;
    packageManager?: string;
    noGit?: boolean;
    noInstall?: boolean;
    yes?: boolean;
}
export interface ProjectConfig {
    projectName: string;
    template: string;
    packageManager: string;
    skipGit: boolean;
    skipInstall: boolean;
    useDefaults: boolean;
    modules?: string[];
}
export declare function createCommand(projectName?: string, options?: CreateOptions): Promise<void>;
