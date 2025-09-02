/**
 * CommandRunner - Package Manager Agnostic Command Execution
 *
 * Validated in Phase 0 Research with 75% success rate across package managers.
 * Provides a unified interface for npm, yarn, pnpm, and bun.
 */
/// <reference types="node" />
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun' | 'auto';
export interface CommandRunnerOptions {
    verbose?: boolean;
    silent?: boolean;
    cwd?: string;
    env?: NodeJS.ProcessEnv;
}
export interface CommandResult {
    stdout: string;
    stderr: string;
    code: number;
}
export interface PackageManagerCommands {
    create: string[];
    install: string[];
    installDev: string[];
    run: string[];
    version: string[];
    init: string[];
    exec: string[];
}
export declare class CommandRunner {
    private verbose;
    private packageManager;
    private commands;
    constructor(packageManager?: PackageManager, options?: CommandRunnerOptions);
    getPackageManager(): PackageManager;
    getCreateCommand(): string[];
    private detectPackageManager;
    private getPackageManagerCommands;
    execCommand(cmdArray: string[], options?: CommandRunnerOptions): Promise<CommandResult>;
    getVersion(): Promise<string>;
    createProject(projectName: string, framework?: string, options?: string[]): Promise<CommandResult>;
    install(packages?: string[], isDev?: boolean, cwd?: string): Promise<CommandResult>;
    installNonInteractive(packages?: string[], isDev?: boolean, cwd?: string): Promise<CommandResult>;
    private getNonInteractiveFlags;
    runScript(scriptName: string, cwd?: string): Promise<CommandResult>;
    exec(toolName: string, args?: string[], cwd?: string): Promise<CommandResult>;
    /**
     * Execute a command non-interactively by providing input via stdin
     * Useful for CLI tools that ask for user input
     */
    execNonInteractive(toolName: string, args?: string[], input?: string[], cwd?: string): Promise<CommandResult>;
    initProject(projectPath: string, framework?: string, options?: Record<string, unknown>): Promise<CommandResult>;
}
export default CommandRunner;
