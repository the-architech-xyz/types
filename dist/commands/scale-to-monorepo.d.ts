/**
 * Scale to Monorepo Command
 *
 * Migrates single-app projects to scalable monorepo structure
 * while preserving all existing functionality.
 */
export interface ScaleOptions {
    packageManager?: string;
    yes?: boolean;
}
export interface ScaleConfig {
    projectPath: string;
    projectName: string;
    packageManager: string;
    useDefaults: boolean;
    hasComponents: boolean;
    hasDatabase: boolean;
    hasAuth: boolean;
    hasConfig: boolean;
}
export declare function scaleToMonorepoCommand(options?: ScaleOptions): Promise<void>;
