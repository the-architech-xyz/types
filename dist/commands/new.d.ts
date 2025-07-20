/**
 * New Command - Unified Project Generation
 *
 * Single entry point for project generation with guided decision making:
 * - Quick Prototype (Single App) - Start fast and simple
 * - Scalable Application (Monorepo) - Build serious projects that will grow
 *
 * The secret: Same underlying architecture, different surface structure
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
