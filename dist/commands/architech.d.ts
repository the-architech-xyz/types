/**
 * Architech Command - Enterprise Monorepo Generator
 *
 * Creates enterprise-grade monorepo structures with:
 * - Turborepo workspace configuration
 * - Specialized package agents
 * - Shared dependencies and tooling
 * - Production-ready setup
 */
interface ArchitechOptions {
    packageManager?: string;
    noGit?: boolean;
    noInstall?: boolean;
    yes?: boolean;
    modules?: string;
}
export declare function architechCommand(projectName?: string, options?: ArchitechOptions): Promise<void>;
export {};
