/**
 * New Command - Project Generation
 *
 * Handles the creation of new projects with intelligent plugin selection
 * and configuration.
 */
export interface NewOptions {
    packageManager?: string;
    noGit?: boolean;
    noInstall?: boolean;
    yes?: boolean;
    projectType?: 'quick-prototype' | 'scalable-monorepo';
}
export interface NewConfig {
    projectName: string;
    projectType: 'quick-prototype' | 'scalable-monorepo';
    packageManager: string;
    skipGit: boolean;
    skipInstall: boolean;
    useDefaults: boolean;
    userInput?: string;
    template: string;
}
export declare function newCommand(projectName?: string, options?: NewOptions): Promise<void>;
